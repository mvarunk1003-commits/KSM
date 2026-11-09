@echo off
echo 🏛️ Starting Kolar Sringeri SriShankara Mutt Management System...
echo.

echo 📊 Starting Backend Server...
cd backend
start "Backend Server" cmd /k "node server.js"

echo.
echo ⏳ Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo 🌐 Starting Frontend Server...
cd ../frontend
start "Frontend Server" cmd /k "npm start"

echo.
echo ✅ System is starting up!
echo.
echo 📍 Access Points:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:5000
echo    Admin Panel: http://localhost:3000/admin
echo.
echo 🔑 Default Admin Credentials:
echo    Username: admin
echo    Password: KolarMutt2024!
echo.
echo Press any key to close this window...
pause > nul
