$BackendDir = "C:\Users\hassk\Downloads\tesst\movie\backend"
$FrontendDir = "C:\Users\hassk\Downloads\tesst\movie\frontend"

Write-Host "Starting Backend (NestJS) on port 3001..."
$backend = Start-Process -NoNewWindow -FilePath "node" -ArgumentList "dist/main.js" -WorkingDirectory $BackendDir -PassThru -RedirectStandardOutput "$BackendDir\server.log" -RedirectStandardError "$BackendDir\server.err"

Start-Sleep 3

Write-Host "Starting Frontend (Next.js) on port 3000..."
$frontend = Start-Process -NoNewWindow -FilePath "npx" -ArgumentList "next dev -p 3000" -WorkingDirectory $FrontendDir -PassThru -RedirectStandardOutput "$FrontendDir\server.log" -RedirectStandardError "$FrontendDir\server.err"

Write-Host "================================================"
Write-Host "  Backend: http://localhost:3001"
Write-Host "  Frontend: http://localhost:3000"
Write-Host "================================================"
Write-Host ""
Write-Host "Press any key to stop both servers..."
Write-Host ""

$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue
Stop-Process -Id $frontend.Id -Force -ErrorAction SilentlyContinue
Write-Host "Servers stopped."
