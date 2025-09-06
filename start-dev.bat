@echo off
echo Starting Group Chat Application...
echo.

echo Installing backend dependencies...
cd backend
call pnpm install
if %errorlevel% neq 0 (
    echo Failed to install backend dependencies
    pause
    exit /b 1
)

echo Installing frontend dependencies...
cd ..\frontend
call pnpm install
if %errorlevel% neq 0 (
    echo Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo Starting backend server...
start "Backend Server" cmd /k "cd ..\backend && pnpm run dev"

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting frontend development server...
start "Frontend Server" cmd /k "cd frontend && pnpm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause > nul
