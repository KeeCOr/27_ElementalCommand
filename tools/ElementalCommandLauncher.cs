using System;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Net;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

public static class ElementalCommandLauncher
{
    private const string ResourceName = "ElementalCommand.dist.zip";

    [STAThread]
    public static void Main()
    {
        Console.Title = "Elemental Command";
        string runtimeDir = Path.Combine(Path.GetTempPath(), "ElementalCommand", "runtime-" + Process.GetCurrentProcess().Id);
        HttpListener listener = null;
        try
        {
            ExtractEmbeddedSite(runtimeDir);
            string url;
            listener = StartListener(out url);
            HttpListener activeListener = listener;
            Task.Factory.StartNew(delegate { ServeRequests(activeListener, runtimeDir); }, TaskCreationOptions.LongRunning);

            Console.WriteLine("Elemental Command is running at " + url);
            Console.WriteLine("Keep this window open while playing. Press Enter to close.");
            if (Environment.GetEnvironmentVariable("EC_NO_BROWSER") != "1")
            {
                Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
            }

            int smokeSeconds;
            if (Int32.TryParse(Environment.GetEnvironmentVariable("EC_SMOKE_SECONDS"), out smokeSeconds) && smokeSeconds > 0)
            {
                Thread.Sleep(TimeSpan.FromSeconds(smokeSeconds));
            }
            else
            {
                Console.ReadLine();
            }
        }
        catch (Exception error)
        {
            Console.Error.WriteLine(error);
            if (!Console.IsInputRedirected) Console.ReadLine();
        }
        finally
        {
            if (listener != null) listener.Close();
            TryDeleteDirectory(runtimeDir);
        }
    }

    private static void ExtractEmbeddedSite(string destinationRoot)
    {
        Directory.CreateDirectory(destinationRoot);
        string canonicalRoot = Path.GetFullPath(destinationRoot).TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
        Stream resource = Assembly.GetExecutingAssembly().GetManifestResourceStream(ResourceName);
        if (resource == null) throw new InvalidOperationException("Embedded web build is missing.");
        using (resource)
        using (ZipArchive archive = new ZipArchive(resource, ZipArchiveMode.Read))
        {
            foreach (ZipArchiveEntry entry in archive.Entries)
            {
                string outputPath = Path.GetFullPath(Path.Combine(canonicalRoot, entry.FullName.Replace('/', Path.DirectorySeparatorChar)));
                if (!outputPath.StartsWith(canonicalRoot, StringComparison.OrdinalIgnoreCase))
                    throw new InvalidDataException("Unsafe embedded path: " + entry.FullName);
                if (String.IsNullOrEmpty(entry.Name))
                {
                    Directory.CreateDirectory(outputPath);
                    continue;
                }
                Directory.CreateDirectory(Path.GetDirectoryName(outputPath));
                using (Stream input = entry.Open())
                using (FileStream output = File.Create(outputPath)) input.CopyTo(output);
            }
        }
    }

    private static HttpListener StartListener(out string url)
    {
        for (int port = 53127; port < 53167; port++)
        {
            HttpListener listener = new HttpListener();
            string prefix = "http://127.0.0.1:" + port + "/";
            listener.Prefixes.Add(prefix);
            try { listener.Start(); url = prefix; return listener; }
            catch (HttpListenerException) { listener.Close(); }
        }
        throw new InvalidOperationException("No available local launcher port.");
    }

    private static void ServeRequests(HttpListener listener, string rootDir)
    {
        while (listener.IsListening)
        {
            try
            {
                HttpListenerContext context = listener.GetContext();
                ThreadPool.QueueUserWorkItem(delegate { ServeFile(context, rootDir); });
            }
            catch (ObjectDisposedException) { return; }
            catch (HttpListenerException) { return; }
        }
    }

    private static void ServeFile(HttpListenerContext context, string rootDir)
    {
        try
        {
            string relative = Uri.UnescapeDataString(context.Request.Url.AbsolutePath.TrimStart('/'));
            if (String.IsNullOrWhiteSpace(relative)) relative = "index.html";
            string canonicalRoot = Path.GetFullPath(rootDir).TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
            string filePath = Path.GetFullPath(Path.Combine(canonicalRoot, relative.Replace('/', Path.DirectorySeparatorChar)));
            if (!filePath.StartsWith(canonicalRoot, StringComparison.OrdinalIgnoreCase) || !File.Exists(filePath))
            {
                context.Response.StatusCode = 404;
                WriteText(context, "Not found");
                return;
            }
            byte[] bytes = File.ReadAllBytes(filePath);
            context.Response.StatusCode = 200;
            context.Response.ContentType = ContentTypeFor(filePath);
            context.Response.Headers["Cache-Control"] = "no-store";
            context.Response.ContentLength64 = bytes.Length;
            context.Response.OutputStream.Write(bytes, 0, bytes.Length);
        }
        catch (Exception error)
        {
            context.Response.StatusCode = 500;
            WriteText(context, error.Message);
        }
        finally { context.Response.OutputStream.Close(); }
    }

    private static void WriteText(HttpListenerContext context, string value)
    {
        byte[] bytes = Encoding.UTF8.GetBytes(value);
        context.Response.ContentType = "text/plain; charset=utf-8";
        context.Response.ContentLength64 = bytes.Length;
        context.Response.OutputStream.Write(bytes, 0, bytes.Length);
    }

    private static string ContentTypeFor(string filePath)
    {
        switch (Path.GetExtension(filePath).ToLowerInvariant())
        {
            case ".html": return "text/html; charset=utf-8";
            case ".js": return "text/javascript; charset=utf-8";
            case ".css": return "text/css; charset=utf-8";
            case ".png": return "image/png";
            case ".jpg": case ".jpeg": return "image/jpeg";
            case ".webp": return "image/webp";
            case ".json": return "application/json; charset=utf-8";
            case ".ogg": return "audio/ogg";
            case ".wav": return "audio/wav";
            default: return "application/octet-stream";
        }
    }

    private static void TryDeleteDirectory(string path)
    {
        try { if (Directory.Exists(path)) Directory.Delete(path, true); }
        catch { }
    }
}
