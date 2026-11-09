const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// Admin authentication routes
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const adminsPath = path.join(__dirname, '../data/admins.json');
    
    let admins = [];
    try {
      const adminsData = await fs.readFile(adminsPath, 'utf8');
      admins = JSON.parse(adminsData);
    } catch (error) {
      // If file doesn't exist, create default admin
      admins = [{
        id: 1,
        username: 'admin',
        password: 'admin123',
        name: 'Administrator',
        email: 'admin@temple.com'
      }];
      await fs.writeFile(adminsPath, JSON.stringify(admins, null, 2));
    }

    const admin = admins.find(a => a.username === username && a.password === password);
    
    if (admin) {
      res.json({ 
        success: true, 
        message: 'Login successful',
        admin: { id: admin.id, username: admin.username, name: admin.name, email: admin.email }
      });
    } else {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

router.get('/profile', async (req, res) => {
  try {
    const adminsPath = path.join(__dirname, '../data/admins.json');
    const adminsData = await fs.readFile(adminsPath, 'utf8');
    const admins = JSON.parse(adminsData);
    
    // Return first admin profile (assuming single admin system)
    const admin = admins[0];
    if (admin) {
      res.json({ 
        id: admin.id, 
        username: admin.username, 
        name: admin.name, 
        email: admin.email 
      });
    } else {
      res.status(404).json({ error: 'Admin profile not found' });
    }
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.post('/update-profile', async (req, res) => {
  try {
    const { name, email } = req.body;
    const adminsPath = path.join(__dirname, '../data/admins.json');
    
    let admins = [];
    try {
      const adminsData = await fs.readFile(adminsPath, 'utf8');
      admins = JSON.parse(adminsData);
    } catch (error) {
      admins = [{
        id: 1,
        username: 'admin',
        password: 'admin123',
        name: 'Administrator',
        email: 'admin@temple.com'
      }];
    }

    if (admins.length > 0) {
      admins[0].name = name;
      admins[0].email = email;
      await fs.writeFile(adminsPath, JSON.stringify(admins, null, 2));
      res.json({ success: true, message: 'Profile updated successfully' });
    } else {
      res.status(404).json({ error: 'Admin not found' });
    }
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminsPath = path.join(__dirname, '../data/admins.json');
    
    let admins = [];
    try {
      const adminsData = await fs.readFile(adminsPath, 'utf8');
      admins = JSON.parse(adminsData);
    } catch (error) {
      admins = [{
        id: 1,
        username: 'admin',
        password: 'admin123',
        name: 'Administrator',
        email: 'admin@temple.com'
      }];
    }

    if (admins.length > 0 && admins[0].password === currentPassword) {
      admins[0].password = newPassword;
      await fs.writeFile(adminsPath, JSON.stringify(admins, null, 2));
      res.json({ success: true, message: 'Password changed successfully' });
    } else {
      res.status(401).json({ error: 'Current password is incorrect' });
    }
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

module.exports = router;
