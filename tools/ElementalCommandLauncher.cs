using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

public static class ElementalCommandLauncher
{
    public static void Main()
    {
        string baseDir = AppDomain.CurrentDomain.BaseDirectory;
        string distDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "dist");
        if (!Directory.Exists(distDir))
        {
            Console.Error.WriteLine("Cannot find the dist folder next to this launcher.");
            Console.Error.WriteLine(baseDir);
            Console.ReadLine();
            return;
        }

        string url;
        using (HttpListener listener = StartListener(out url))
        {
            Task.Factory.StartNew(() => ServeRequests(listener, distDir));
            Console.WriteLine("Elemental Command is running.");
            Console.WriteLine(url);
            Console.WriteLine("Keep this window open while playing. Press Enter to close.");
            if (Environment.GetEnvironmentVariable("EC_NO_BROWSER") != "1")
            {
                Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
            }
            Console.ReadLine();
        }
    }

    private static HttpListener StartListener(out string url)
    {
        for (int port = 53127; port < 53147; port++)
        {
            HttpListener listener = new HttpListener();
            string prefix = "http://127.0.0.1:" + port + "/";
            listener.Prefixes.Add(prefix);
            try
            {
                listener.Start();
                url = prefix;
                return listener;
            }
            catch (HttpListenerException)
            {
                listener.Close();
            }
        }

        throw new InvalidOperationException("No available local launcher port.");
    }

    private static void ServeRequests(HttpListener listener, string distDir)
    {
        while (listener.IsListening)
        {
            try
            {
                HttpListenerContext context = listener.GetContext();
                ThreadPool.QueueUserWorkItem(state => ServeFile(context, distDir));
            }
            catch (ObjectDisposedException)
            {
                return;
            }
            catch (HttpListenerException)
            {
                return;
            }
        }
    }

    private static void ServeFile(HttpListenerContext context, string distDir)
    {
        try
        {
            string rawPath = Uri.UnescapeDataString(context.Request.Url.AbsolutePath.TrimStart('/'));
            if (string.IsNullOrWhiteSpace(rawPath))
            {
                rawPath = "index.html";
            }

            string fullDist = Path.GetFullPath(distDir);
            string filePath = Path.GetFullPath(Path.Combine(fullDist, rawPath.Replace('/', Path.DirectorySeparatorChar)));
            if (!filePath.StartsWith(fullDist, StringComparison.OrdinalIgnoreCase) || !File.Exists(filePath))
            {
                filePath = Path.Combine(fullDist, "index.html");
            }

            byte[] bytes = File.ReadAllBytes(filePath);
            context.Response.ContentType = ContentTypeFor(filePath);
            context.Response.ContentLength64 = bytes.Length;
            context.Response.OutputStream.Write(bytes, 0, bytes.Length);
        }
        catch (Exception ex)
        {
            byte[] bytes = Encoding.UTF8.GetBytes(ex.Message);
            context.Response.StatusCode = 500;
            context.Response.ContentType = "text/plain; charset=utf-8";
            context.Response.OutputStream.Write(bytes, 0, bytes.Length);
        }
        finally
        {
            context.Response.OutputStream.Close();
        }
    }

    private static string ContentTypeFor(string filePath)
    {
        switch (Path.GetExtension(filePath).ToLowerInvariant())
        {
            case ".html": return "text/html; charset=utf-8";
            case ".js": return "application/javascript; charset=utf-8";
            case ".css": return "text/css; charset=utf-8";
            case ".png": return "image/png";
            case ".jpg": return "image/jpeg";
            case ".jpeg": return "image/jpeg";
            case ".webp": return "image/webp";
            case ".svg": return "image/svg+xml";
            case ".json": return "application/json; charset=utf-8";
            default: return "application/octet-stream";
        }
    }
}
