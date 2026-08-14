@echo off
title Heliosync Healthcare Platform Launcher
echo ========================================================
echo   Starting Heliosync Healthcare Platform (MongoDB)
echo ========================================================

echo 1. Starting MongoDB Replica Set on Port 27018...
start "MongoDB Service" "C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe" --dbpath "%~dp0backend\data\db" --port 27018 --replSet rs0 --bind_ip 127.0.0.1

timeout /t 3 /nobreak >nul

echo 2. Starting Backend Server on Port 5000...
start "Heliosync Backend" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 3 /nobreak >nul

echo 3. Starting Frontend Web App on Port 3000...
start "Heliosync Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo   Heliosync is running!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo ========================================================
pause
