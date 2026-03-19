@echo off
echo ================================================
echo  ENN Magazine - Windows First-Time Setup
echo ================================================
echo.

:: Check if npm is available
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm not found. Install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo Installing dependencies...
echo (better-sqlite3 will download a prebuilt binary for Windows)
echo.
npm install

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo --- npm install failed ---
    echo.
    echo better-sqlite3 needs C++ build tools to compile on Windows.
    echo Run this command to install them (takes ~5 mins, needs admin):
    echo.
    echo   npm install --global windows-build-tools
    echo.
    echo Then run: npm install
    pause
    exit /b 1
)

echo.
echo ================================================
echo  Setup complete!
echo  Run:  npm run dev
echo  Open: http://localhost:5173
echo ================================================
pause
