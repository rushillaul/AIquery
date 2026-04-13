Write-Host "Starting the AI SQL Query Generator Services..." -ForegroundColor Cyan

# Start Backend
Write-Host "[1/2] Starting Node.js Backend API..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `"cd backend; npm install; npm start`""

# Start Frontend
Write-Host "[2/2] Starting React Vite Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `"cd frontend; npm install; npm run dev`""

Write-Host "Both services have been launched in separate PowerShell windows." -ForegroundColor Green
Write-Host "- Backend is on http://localhost:3001"
Write-Host "- Frontend will be available locally (check the opened Vite terminal)"
