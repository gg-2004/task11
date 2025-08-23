@echo off
echo ========================================
echo Revolt Motors AI Chat - Setup Script
echo ========================================
echo.

echo Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo Node.js is already installed!
    goto :run_app
) else (
    echo Node.js is not installed. Installing now...
    echo.
    echo Please download and install Node.js from: https://nodejs.org/
    echo Choose the LTS version (recommended)
    echo.
    echo After installation, close this window and run this script again.
    echo.
    pause
    exit
)

:run_app
echo.
echo Installing dependencies...
npm install

if %errorlevel% == 0 (
    echo.
    echo Dependencies installed successfully!
    echo.
    echo Starting the application...
    echo.
    echo The app will open at: http://localhost:3000
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    npm start
) else (
    echo.
    echo Failed to install dependencies. Please check your internet connection.
    pause
)

