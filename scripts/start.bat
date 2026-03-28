@echo off
echo ========================================
echo   Cat Desktop Assistant - Starting...
echo ========================================
echo.

:: Start the Python backend
echo [1/2] Starting Python backend...
cd /d "%~dp0..\backend"
start /b python -m uvicorn main:app --host 127.0.0.1 --port 8765

:: Wait for the backend to be ready
echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

:: Start the Electron app
echo [2/2] Starting Electron app...
cd /d "%~dp0.."
npx electron . --dev

echo.
echo [Done] Cat Desktop Assistant has exited.
pause
