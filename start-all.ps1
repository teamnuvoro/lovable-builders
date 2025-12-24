# PowerShell script for Windows users
# Start All Development Servers

Write-Host "🚀 Starting Riya AI Development Environment..." -ForegroundColor Green
Write-Host ""

# Function to kill process on a port
function Kill-Port {
    param([int]$Port)
    $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    if ($processes) {
        Write-Host "⚠️  Port $Port is in use. Killing existing process(es)..." -ForegroundColor Yellow
        $processes | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
        Start-Sleep -Seconds 1
    }
}

# Kill processes on ports 8080 and 3000
Write-Host "🧹 Cleaning up ports..."
Kill-Port -Port 8080
Kill-Port -Port 3000
Write-Host "✅ Ports cleared" -ForegroundColor Green
Write-Host ""

# Set environment variables
$env:NODE_ENV = "development"
$env:PORT = "3000"

# Start backend server
Write-Host "📦 Starting backend server on port 3000..." -ForegroundColor Green
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run dev:server
}

# Start frontend server
Write-Host "🎨 Starting frontend server on port 8080..." -ForegroundColor Green
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run dev
}

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "✅ All servers started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Frontend: http://localhost:8080"
Write-Host "📍 Backend:  http://localhost:3000"
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers"
Write-Host ""

# Wait for user to stop
try {
    while ($true) {
        Start-Sleep -Seconds 1
        if ($backendJob.State -eq "Failed" -or $frontendJob.State -eq "Failed") {
            Write-Host "❌ One or more servers failed" -ForegroundColor Red
            break
        }
    }
} finally {
    Write-Host "🛑 Shutting down servers..." -ForegroundColor Yellow
    Stop-Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
    Kill-Port -Port 8080
    Kill-Port -Port 3000
    Write-Host "✅ Servers stopped" -ForegroundColor Green
}

