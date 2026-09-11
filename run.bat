@echo off
echo.
echo ============================================
echo    Starting Laundry App
echo ============================================
echo.
echo App:         http://localhost:8080
echo H2 Console:  http://localhost:8080/h2-console
echo Default:     admin / admin
echo.
set "JAR="
for /f "delims=" %%i in ('dir /b /o-d "target\laundry-app-*.jar" 2^>nul') do if not defined JAR set "JAR=target\%%i"
if not defined JAR (
    echo [ERROR] jar not found in target\. Run build.bat first.
    pause
    exit /b 1
)
echo Running:    %JAR%
java -jar "%JAR%" %*
pause