@echo off
echo.
echo ============================================
echo    Building Laundry App
echo ============================================
echo.
call mvnw.cmd clean package %*
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Build failed with exit code %ERRORLEVEL%
	pause
    exit /b %ERRORLEVEL%
)
echo.
echo [OK] Build successful. Run run.bat to start the application.
pause