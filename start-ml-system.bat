@echo off
echo ==========================================
echo    VoltEdge EV - ML System Launcher
echo ==========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.8 or higher
    pause
    exit /b 1
)

echo [1/4] Checking Python dependencies...
pip show flask >nul 2>&1
if errorlevel 1 (
    echo [INFO] Installing Flask dependencies...
    cd backend
    pip install -r requirements.txt
    cd ..
)

echo [2/4] Checking ML model files...
if not exist "ev_model.pkl" (
    echo [WARNING] ML model not found. Training model...
    python backend/train_model.py
    if errorlevel 1 (
        echo [ERROR] Model training failed
        pause
        exit /b 1
    )
)

echo [3/4] Starting Flask API server...
start "VoltEdge Flask API" python backend/app.py

echo [4/4] Waiting for API to start...
timeout /t 3 /nobreak >nul

echo.
echo ==========================================
echo   ML System Started Successfully!
echo ==========================================
echo.
echo   Flask API:  http://localhost:5000
echo   ML Demo:    http://localhost:5173/ml-demo.html
echo.
echo Starting Vite dev server...
echo.

npm run dev

pause
