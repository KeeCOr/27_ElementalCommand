$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$version = (Get-Content -LiteralPath (Join-Path $projectRoot 'package.json') -Raw | ConvertFrom-Json).version
$artifactName = "ElementalCommand_v${version}_portable.exe"
$releaseDir = Join-Path $projectRoot 'release'
$buildDir = Join-Path $env:TEMP 'ElementalCommandPortableBuild'
$zipPath = Join-Path $buildDir 'dist.zip'
$outputPath = Join-Path $releaseDir $artifactName
$compiler = 'C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe'

Push-Location $projectRoot
try {
    npm run build
    if (Test-Path -LiteralPath $buildDir) { Remove-Item -LiteralPath $buildDir -Recurse -Force }
    New-Item -ItemType Directory -Path $buildDir | Out-Null
    New-Item -ItemType Directory -Path $releaseDir -Force | Out-Null
    Compress-Archive -Path (Join-Path $projectRoot 'dist\*') -DestinationPath $zipPath -CompressionLevel Optimal
    & $compiler /nologo /target:exe /optimize+ /out:$outputPath "/resource:${zipPath},ElementalCommand.dist.zip" /reference:System.IO.Compression.dll /reference:System.IO.Compression.FileSystem.dll (Join-Path $PSScriptRoot 'ElementalCommandLauncher.cs')
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $outputPath)) { throw 'Portable launcher compilation failed.' }
    Copy-Item -LiteralPath $outputPath -Destination (Join-Path $projectRoot $artifactName) -Force
    Write-Output $outputPath
}
finally {
    Pop-Location
    if (Test-Path -LiteralPath $buildDir) { Remove-Item -LiteralPath $buildDir -Recurse -Force }
}
