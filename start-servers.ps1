$BackendDir = "C:\Users\hassk\Downloads\tesst\movie\backend"
$FrontendDir = "C:\Users\hassk\Downloads\tesst\movie\frontend"

Write-Host "Starting Cache Server (Express) on port 3002..."
$crawler = Start-Process -NoNewWindow -FilePath "node" -ArgumentList "crawler/server.js" -WorkingDirectory $BackendDir -PassThru -RedirectStandardOutput "$BackendDir\crawler.log" -RedirectStandardError "$BackendDir\crawler.err"

Start-Sleep 2

Write-Host "Starting Frontend (Next.js) on port 3000..."
$frontend = Start-Process -NoNewWindow -FilePath "npx" -ArgumentList "next dev -p 3000" -WorkingDirectory $FrontendDir -PassThru -RedirectStandardOutput "$FrontendDir\server.log" -RedirectStandardError "$FrontendDir\server.err"

Write-Host "================================================"
Write-Host "  Cache Server: http://localhost:3002"
Write-Host "  Frontend:     http://localhost:3000"
Write-Host "================================================"
Write-Host ""
Write-Host "Cache server auto-crawls on startup and every 60 min"
Write-Host ""
Write-Host "Press any key to stop both servers..."

$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Stop-Process -Id $crawler.Id -Force -ErrorAction SilentlyContinue
Stop-Process -Id $frontend.Id -Force -ErrorAction SilentlyContinue
Write-Host "Servers stopped."
