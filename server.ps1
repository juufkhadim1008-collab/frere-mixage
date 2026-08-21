# Serveur statique HTTP local haute performance en PowerShell natif
$port = 5173
$root = $PSScriptRoot

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
} catch {
    Write-Host "Erreur au démarrage de l'écouteur : $_"
    exit 1
}

Write-Host "Serveur FRÈRE MIXAGE démarré sur http://localhost:$port/"
Write-Host "Dashboard admin disponible sur http://localhost:$port/admin/"
Write-Host "Appuyez sur Ctrl+C pour arrêter le serveur."

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".mjs"  = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".webp" = "image/webp"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".woff" = "font/woff"
    ".woff2"= "font/woff2"
    ".ttf"  = "font/ttf"
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        try {
            $rawPath = $request.Url.AbsolutePath
            if ($rawPath -eq "/admin") {
                $response.StatusCode = 301
                $response.RedirectLocation = "/admin/"
                $response.Close()
                continue
            }

            $urlPath = [System.Uri]::UnescapeDataString($rawPath.TrimStart('/'))
            if ([string]::IsNullOrWhiteSpace($urlPath)) {
                $urlPath = "index.html"
            }

            $filePath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($root, $urlPath.Replace('/', [System.IO.Path]::DirectorySeparatorChar)))
            
            if (Test-Path $filePath -PathType Container) {
                $filePath = [System.IO.Path]::Combine($filePath, "index.html")
            }

            if ($filePath.StartsWith($root) -and (Test-Path $filePath -PathType Leaf)) {
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $contentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
                
                $response.ContentType = $contentType
                $response.Headers.Add("Access-Control-Allow-Origin", "*")
                $response.Headers.Add("Cache-Control", "no-cache")

                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $response.StatusCode = 404
                $buffer = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                $response.ContentLength64 = $buffer.Length
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            }
        } catch {
            # Erreur de connexion ou interruption client
        } finally {
            try { $context.Response.OutputStream.Close() } catch {}
        }
    }
} finally {
    try { $listener.Stop() } catch {}
}
