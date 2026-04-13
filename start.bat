@echo off
echo Starting the AI SQL Query Generator Services...
echo.

echo [1/2] Starting Node.js Backend API...
start cmd /k "title Backend && cd backend && npm install && npm start"

echo [2/2] Starting React Vite Frontend...
start cmd /k "title Frontend && cd frontend && npm install && npm run dev"

echo.
echo Both services have been launched in separate terminal windows.
echo - Backend will be available on http://localhost:3001
echo - Frontend will automatically open your web browser
pause
