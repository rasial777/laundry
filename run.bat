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
java -jar target\laundry-app-0.0.1-SNAPSHOT.jar %*
pause