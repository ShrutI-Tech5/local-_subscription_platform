@echo off
echo Starting Flask Backend...
echo.
echo Make sure MongoDB is running first!
echo.
cd /d "%~dp0"
pip install -r backend\requirements.txt
python backend\app.py
