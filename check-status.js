// System Status Checker for KSM Temple Management System

const http = require('http');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:5000/api';
const FRONTEND_URL = 'http://localhost:3000';

// Check if backend is running
async function checkBackend() {
  return new Promise((resolve) => {
    const req = http.get(`${API_BASE}/activities`, (res) => {
      if (res.statusCode === 200) {
        resolve({ status: '✅ Running', port: 5000 });
      } else {
        resolve({ status: '⚠️  Responding but with errors', port: 5000 });
      }
    });

    req.on('error', () => {
      resolve({ status: '❌ Not running', port: 5000 });
    });

    req.setTimeout(3000, () => {
      req.destroy();
      resolve({ status: '⏰ Timeout', port: 5000 });
    });
  });
}

// Check if frontend is running
async function checkFrontend() {
  return new Promise((resolve) => {
    const req = http.get(FRONTEND_URL, (res) => {
      if (res.statusCode === 200) {
        resolve({ status: '✅ Running', port: 3000 });
      } else {
        resolve({ status: '⚠️  Responding but with errors', port: 3000 });
      }
    });

    req.on('error', () => {
      resolve({ status: '❌ Not running', port: 3000 });
    });

    req.setTimeout(3000, () => {
      req.destroy();
      resolve({ status: '⏰ Timeout', port: 3000 });
    });
  });
}

// Check data files
function checkDataFiles() {
  const dataDir = path.join(__dirname, 'backend', 'data');
  const requiredFiles = [
    'activities.json',
    'announcements.json', 
    'contact.json',
    'donations.json',
    'income.json',
    'expenses.json',
    'banner-images.json',
    'settings.json',
    'admins.json'
  ];

  const results = [];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(dataDir, file);
    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const isValid = Array.isArray(data) || typeof data === 'object';
        results.push({
          file,
          status: isValid ? '✅ Valid' : '⚠️  Invalid format',
          size: fs.statSync(filePath).size
        });
      } catch (error) {
        results.push({
          file,
          status: '❌ Corrupted',
          size: 0
        });
      }
    } else {
      results.push({
        file,
        status: '❌ Missing',
        size: 0
      });
    }
  });

  return results;
}

// Main status check
async function checkSystemStatus() {
  console.log('🏛️ KSM Temple Management System - Status Check\n');
  
  console.log('📊 Checking Backend Server...');
  const backendStatus = await checkBackend();
  console.log(`   Backend (Port ${backendStatus.port}): ${backendStatus.status}\n`);
  
  console.log('🌐 Checking Frontend Server...');
  const frontendStatus = await checkFrontend();
  console.log(`   Frontend (Port ${frontendStatus.port}): ${frontendStatus.status}\n`);
  
  console.log('📁 Checking Data Files...');
  const dataFiles = checkDataFiles();
  dataFiles.forEach(file => {
    console.log(`   ${file.file}: ${file.status} (${file.size} bytes)`);
  });
  
  console.log('\n📋 Summary:');
  const backendOk = backendStatus.status.includes('✅');
  const frontendOk = frontendStatus.status.includes('✅');
  const dataOk = dataFiles.every(f => f.status.includes('✅'));
  
  if (backendOk && frontendOk && dataOk) {
    console.log('✅ All systems operational!');
    console.log('\n📍 Access Points:');
    console.log('   Frontend: http://localhost:3000');
    console.log('   Backend API: http://localhost:5000');
    console.log('   Admin Panel: http://localhost:3000/admin');
  } else {
    console.log('⚠️  Some issues detected. Please check the details above.');
    if (!backendOk) console.log('   - Backend server needs to be started');
    if (!frontendOk) console.log('   - Frontend server needs to be started');
    if (!dataOk) console.log('   - Run "node optimize.js" in backend directory');
  }
}

// Run status check
checkSystemStatus().catch(console.error);
