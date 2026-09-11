@echo off
echo.
echo ============================================
echo    Starting Laundry App
echo ============================================
echo.
echo H2 Console: http://localhost:8080/h2-console
echo API:        http://localhost:8080/api/items
echo.
java -jar target\laundry-app-0.0.1-SNAPSHOT.jar %*
pause