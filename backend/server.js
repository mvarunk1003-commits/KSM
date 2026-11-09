/**
 * =============================================================================
 * Kolar Sringeri SriShankara Mutt — Backend API Engine
 * Powered by PostgreSQL with AWS Private PEM Key & EC2 / RDS Support
 * Region: ap-south-1 (Mumbai) | AWS Account: 2777-3120-8394
 * =============================================================================
 */

const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
require('dotenv').config();

const db = require('./config/db');
const dbService = require('./services/db-service');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend Dev and Production
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsers & File Upload
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  useTempFiles: false
}));

// Static Assets Directory for uploads and media
let assetsDir = process.env.ASSETS_DIR || path.join(__dirname, 'public/assets');
if (!process.env.ASSETS_DIR && fs.existsSync(path.join(__dirname, '../frontend/public/assets'))) {
  assetsDir = path.join(__dirname, '../frontend/public/assets');
}
try {
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
} catch (err) {
  console.warn('Assets directory notice:', err.message);
}
app.use('/assets', express.static(assetsDir));

// Helper: Handle file uploads to assets directory
function handleUploadedFiles(req) {
  const uploadedFilenames = [];
  if (req.files) {
    const files = Array.isArray(req.files.images) 
      ? req.files.images 
      : Object.values(req.files);

    files.forEach(file => {
      if (file && file.name) {
        const ext = path.extname(file.name);
        const filename = `${Date.now()}_${Math.floor(Math.random() * 1000)}${ext}`;
        const targetPath = path.join(assetsDir, filename);
        file.mv(targetPath, (err) => {
          if (err) console.error('Error saving uploaded file:', err);
        });
        uploadedFilenames.push(`/assets/${filename}`);
      }
    });
  }
  return uploadedFilenames;
}

// =============================================================================
// HEALTH CHECK ENDPOINT
// =============================================================================
app.get('/api/health', async (req, res) => {
  const dbHealth = await db.testConnection();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ksm-temple-backend',
    region: process.env.AWS_REGION || 'ap-south-1',
    awsAccountId: '2777-3120-8394',
    database: {
      connected: dbHealth.success,
      type: 'PostgreSQL',
      details: dbHealth.info || dbHealth.error
    }
  });
});

// =============================================================================
// AUTHENTICATION & ADMIN PROFILE ROUTES
// =============================================================================
const handleLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password required' });
    }

    const admin = await dbService.getAdminByUsername(username);
    if (admin && admin.password === password) {
      res.json({
        success: true,
        message: 'Login successful',
        admin: {
          id: admin.id,
          username: admin.username,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      });
    } else {
      res.status(401).json({ success: false, error: 'Invalid credentials. Please verify your username and password.' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Internal server error during authentication' });
  }
};

app.post('/api/admin/login', handleLogin);
app.post('/api/auth/login', handleLogin);

const handleProfile = async (req, res) => {
  try {
    const admins = await dbService.getAdmins();
    const admin = admins[0];
    if (admin) {
      res.json({
        id: admin.id,
        username: admin.username,
        name: admin.name,
        email: admin.email,
        role: admin.role
      });
    } else {
      res.status(404).json({ error: 'Admin profile not found' });
    }
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch admin profile' });
  }
};

app.get('/api/admin/profile', handleProfile);
app.get('/api/auth/profile', handleProfile);

const handleUpdateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const admins = await dbService.getAdmins();
    if (admins.length > 0) {
      const updated = await dbService.updateAdmin(admins[0].id, { name, email });
      res.json({ success: true, message: 'Profile updated successfully', admin: updated });
    } else {
      res.status(404).json({ error: 'Admin not found' });
    }
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

app.post('/api/admin/update-profile', handleUpdateProfile);
app.post('/api/auth/update-profile', handleUpdateProfile);

const handleChangePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admins = await dbService.getAdmins();
    if (admins.length > 0 && admins[0].password === currentPassword) {
      await dbService.updateAdmin(admins[0].id, { newPassword });
      res.json({ success: true, message: 'Password changed successfully' });
    } else {
      res.status(401).json({ error: 'Current password is incorrect' });
    }
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

app.post('/api/admin/change-password', handleChangePassword);
app.post('/api/auth/change-password', handleChangePassword);

// Multi-admin Management
app.get('/api/admins', async (req, res) => {
  try {
    const admins = await dbService.getAdmins();
    res.json(admins);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
});

app.post('/api/admins', async (req, res) => {
  try {
    const newAdmin = await dbService.createAdmin(req.body);
    res.json(newAdmin);
  } catch (e) {
    res.status(500).json({ error: 'Failed to create admin' });
  }
});

app.put('/api/admins/:id', async (req, res) => {
  try {
    const updated = await dbService.updateAdmin(req.params.id, req.body);
    if (updated) res.json(updated);
    else res.status(404).json({ error: 'Admin not found' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update admin' });
  }
});

app.delete('/api/admins/:id', async (req, res) => {
  try {
    await dbService.deleteAdmin(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete admin' });
  }
});

// =============================================================================
// ACTIVITIES ROUTES
// =============================================================================
app.get('/api/activities', async (req, res) => {
  try {
    const activities = await dbService.getActivities();
    res.json(activities);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

app.post('/api/activities', async (req, res) => {
  try {
    const uploadedImages = handleUploadedFiles(req);
    const activityData = {
      ...req.body,
      images: uploadedImages.length > 0 ? uploadedImages : (req.body.images || [])
    };
    const created = await dbService.createActivity(activityData);
    res.json(created);
  } catch (e) {
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

app.put('/api/activities/:id', async (req, res) => {
  try {
    const uploadedImages = handleUploadedFiles(req);
    const updateData = { ...req.body };
    if (uploadedImages.length > 0) {
      updateData.images = uploadedImages;
    }
    const updated = await dbService.updateActivity(req.params.id, updateData);
    if (updated) res.json(updated);
    else res.status(404).json({ error: 'Activity not found' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

app.delete('/api/activities/:id', async (req, res) => {
  try {
    await dbService.deleteActivity(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

// =============================================================================
// ANNOUNCEMENTS ROUTES
// =============================================================================
app.get('/api/announcements', async (req, res) => {
  try {
    const announcements = await dbService.getAnnouncements();
    res.json(announcements);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

app.post('/api/announcements', async (req, res) => {
  try {
    const uploadedImages = handleUploadedFiles(req);
    const announcementData = {
      ...req.body,
      images: uploadedImages.length > 0 ? uploadedImages : (req.body.images || [])
    };
    const created = await dbService.createAnnouncement(announcementData);
    res.json(created);
  } catch (e) {
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

app.put('/api/announcements/:id', async (req, res) => {
  try {
    const uploadedImages = handleUploadedFiles(req);
    const updateData = { ...req.body };
    if (uploadedImages.length > 0) {
      updateData.images = uploadedImages;
    }
    const updated = await dbService.updateAnnouncement(req.params.id, updateData);
    if (updated) res.json(updated);
    else res.status(404).json({ error: 'Announcement not found' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update announcement' });
  }
});

app.delete('/api/announcements/:id', async (req, res) => {
  try {
    await dbService.deleteAnnouncement(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
});

// =============================================================================
// BANNER IMAGES ROUTES
// =============================================================================
app.get('/api/banner-images', async (req, res) => {
  try {
    const banners = await dbService.getBannerImages();
    res.json(banners);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch banner images' });
  }
});

app.post('/api/banner-images', async (req, res) => {
  try {
    const uploadedImages = handleUploadedFiles(req);
    const bannerData = {
      ...req.body,
      images: uploadedImages.length > 0 ? uploadedImages : (req.body.images || [])
    };
    const created = await dbService.createBannerImage(bannerData);
    res.json(created);
  } catch (e) {
    res.status(500).json({ error: 'Failed to create banner' });
  }
});

app.put('/api/banner-images/:id', async (req, res) => {
  try {
    const uploadedImages = handleUploadedFiles(req);
    const updateData = { ...req.body };
    if (uploadedImages.length > 0) {
      updateData.images = uploadedImages;
    }
    const updated = await dbService.updateBannerImage(req.params.id, updateData);
    if (updated) res.json(updated);
    else res.status(404).json({ error: 'Banner not found' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update banner' });
  }
});

app.delete('/api/banner-images/:id', async (req, res) => {
  try {
    await dbService.deleteBannerImage(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete banner' });
  }
});

// =============================================================================
// CONTACT ROUTES
// =============================================================================
app.get('/api/contact', async (req, res) => {
  try {
    const messages = await dbService.getContactMessages();
    res.json(messages);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch contact messages' });
  }
});

app.post('/api/contact', async (req, res) => {
  try {
    const created = await dbService.createContactMessage(req.body);
    res.json({ success: true, message: 'Message submitted successfully', data: created });
  } catch (e) {
    res.status(500).json({ error: 'Failed to submit contact message' });
  }
});

app.delete('/api/contact/:id', async (req, res) => {
  try {
    await dbService.deleteContactMessage(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// =============================================================================
// DONATIONS ROUTES
// =============================================================================
app.get('/api/donations', async (req, res) => {
  try {
    const donations = await dbService.getDonations();
    res.json(donations);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch donations' });
  }
});

app.post('/api/donations', async (req, res) => {
  try {
    const created = await dbService.createDonation(req.body);
    res.json(created);
  } catch (e) {
    res.status(500).json({ error: 'Failed to record donation' });
  }
});

app.put('/api/donations/:id', async (req, res) => {
  try {
    const updated = await dbService.updateDonation(req.params.id, req.body);
    if (updated) res.json(updated);
    else res.status(404).json({ error: 'Donation not found' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update donation' });
  }
});

app.delete('/api/donations/:id', async (req, res) => {
  try {
    await dbService.deleteDonation(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete donation' });
  }
});

// =============================================================================
// EXPENSES ROUTES
// =============================================================================
app.get('/api/expenses', async (req, res) => {
  try {
    const expenses = await dbService.getExpenses();
    res.json(expenses);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const created = await dbService.createExpense(req.body);
    res.json(created);
  } catch (e) {
    res.status(500).json({ error: 'Failed to record expense' });
  }
});

app.put('/api/expenses/:id', async (req, res) => {
  try {
    const updated = await dbService.updateExpense(req.params.id, req.body);
    if (updated) res.json(updated);
    else res.status(404).json({ error: 'Expense not found' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    await dbService.deleteExpense(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// =============================================================================
// INCOME ROUTES
// =============================================================================
app.get('/api/income', async (req, res) => {
  try {
    const income = await dbService.getIncome();
    res.json(income);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch income' });
  }
});

app.post('/api/income', async (req, res) => {
  try {
    const created = await dbService.createIncome(req.body);
    res.json(created);
  } catch (e) {
    res.status(500).json({ error: 'Failed to record income' });
  }
});

app.put('/api/income/:id', async (req, res) => {
  try {
    const updated = await dbService.updateIncome(req.params.id, req.body);
    if (updated) res.json(updated);
    else res.status(404).json({ error: 'Income not found' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update income' });
  }
});

app.delete('/api/income/:id', async (req, res) => {
  try {
    await dbService.deleteIncome(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete income' });
  }
});

// =============================================================================
// SETTINGS ROUTES
// =============================================================================
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await dbService.getSettings();
    res.json(settings);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const updated = await dbService.updateSettings(req.body);
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

app.put('/api/settings/background', async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.files) {
      if (req.files.heroBackground) {
        const file = req.files.heroBackground;
        const filename = `hero_${Date.now()}${path.extname(file.name)}`;
        const targetPath = path.join(assetsDir, filename);
        await file.mv(targetPath);
        updateData.heroBackground = `/assets/${filename}`;
      }
      if (req.files.omLogo) {
        const file = req.files.omLogo;
        const filename = `logo_${Date.now()}${path.extname(file.name)}`;
        const targetPath = path.join(assetsDir, filename);
        await file.mv(targetPath);
        updateData.omLogo = `/assets/${filename}`;
      }
    }

    const updated = await dbService.updateSettings(updateData);
    res.json(updated);
  } catch (e) {
    console.error('Settings background update error:', e);
    res.status(500).json({ error: 'Failed to update settings background' });
  }
});

// =============================================================================
// EXCEL IMPORT / EXPORT & TEMPLATES
// =============================================================================
app.post('/api/upload-excel', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No Excel file uploaded' });
    }

    const file = req.files.file;
    const type = req.body.type || 'donation';

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return res.status(400).json({ error: 'Please upload a valid Excel spreadsheet (.xlsx or .xls)' });
    }

    const workbook = XLSX.read(file.data, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    if (!rows || rows.length === 0) {
      return res.status(400).json({ error: 'Uploaded Excel file is empty' });
    }

    const processedRecords = [];

    for (const row of rows) {
      let parsedDate = new Date().toISOString().split('T')[0];
      const rawDate = row.date || row.Date;
      if (rawDate) {
        const str = rawDate.toString().trim();
        if (str.includes('/')) {
          const parts = str.split('/');
          if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            const d = new Date(year, month, day);
            if (!isNaN(d.getTime())) parsedDate = d.toISOString().split('T')[0];
          }
        } else {
          const d = new Date(str);
          if (!isNaN(d.getTime())) parsedDate = d.toISOString().split('T')[0];
        }
      }

      if (type === 'income') {
        processedRecords.push({
          title: row.title || row.Title || 'Temple Income',
          amount: parseFloat(row.amount || row.Amount) || 0,
          category: row.category || row.Category || 'Donation',
          date: parsedDate,
          description: row.description || row.Description || ''
        });
      } else if (type === 'expense' || type === 'expenses') {
        processedRecords.push({
          title: row.title || row.Title || 'Temple Expense',
          amount: parseFloat(row.amount || row.Amount) || 0,
          category: row.category || row.Category || 'General Expense',
          date: parsedDate,
          description: row.description || row.Description || ''
        });
      } else {
        // Donations
        processedRecords.push({
          donorName: row.donorName || row['Donor Name'] || row.Name || 'Devotee',
          amount: parseFloat(row.amount || row.Amount) || 0,
          purpose: row.purpose || row.Purpose || 'General Donation',
          paymentMethod: row.paymentMethod || row['Payment Method'] || 'CASH',
          phone: (row.phone || row.Phone || '').toString(),
          email: row.email || row.Email || '',
          address: row.address || row.Address || '',
          date: parsedDate,
          status: 'received'
        });
      }
    }

    const inserted = await dbService.bulkInsertRecords(type, processedRecords);

    res.json({
      success: true,
      count: inserted.length,
      message: `Successfully imported ${inserted.length} ${type} records into PostgreSQL!`
    });
  } catch (error) {
    console.error('Excel upload error:', error);
    res.status(500).json({ error: 'Failed to process Excel spreadsheet' });
  }
});

app.get('/api/download-template/:type', (req, res) => {
  try {
    const type = req.params.type;
    const today = new Date().toISOString().split('T')[0];
    let data = [];

    if (type === 'income') {
      data = [
        ['title', 'amount', 'category', 'date', 'description'],
        ['Hundi Collection', 25000, 'Donation', today, 'Special festival collection'],
        ['Kalyana Mantapa Booking', 35000, 'Rent', today, 'Hall booking advance']
      ];
    } else if (type === 'expense' || type === 'expenses') {
      data = [
        ['title', 'amount', 'category', 'date', 'description'],
        ['Electricity Bill', 6500, 'Utilities', today, 'Monthly BESCOM payment'],
        ['Pooja Dravya & Flowers', 4200, 'Pooja', today, 'Daily archana supplies']
      ];
    } else {
      data = [
        ['donorName', 'amount', 'purpose', 'paymentMethod', 'phone', 'email', 'address', 'date'],
        ['Sri Ramachandra Rao', 5000, 'Annadanam', 'UPI', '9880012345', 'devotee@example.com', 'Kolar', today],
        ['Smt. Sharadamma', 2500, 'Navarathri Pooja', 'CASH', '9900054321', '', 'Bangarapet', today]
      ];
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, type.toUpperCase());
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${type}-template.xlsx`);
    res.send(buffer);
  } catch (e) {
    res.status(500).json({ error: 'Failed to generate template' });
  }
});

// =============================================================================
// REPORT GENERATOR
// =============================================================================
app.post('/api/generate-report', async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.body;
    const [donations, income, expenses] = await Promise.all([
      dbService.getDonations(),
      dbService.getIncome(),
      dbService.getExpenses()
    ]);

    // Date filter
    const filterByDate = (items) => {
      if (!startDate && !endDate) return items;
      return items.filter(item => {
        const d = item.date || '';
        if (startDate && d < startDate) return false;
        if (endDate && d > endDate) return false;
        return true;
      });
    };

    const filteredDonations = filterByDate(donations);
    const filteredIncome = filterByDate(income);
    const filteredExpenses = filterByDate(expenses);

    const totalDonations = filteredDonations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
    const totalIncome = filteredIncome.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const grossIncome = totalDonations + totalIncome;
    const netBalance = grossIncome - totalExpenses;

    const reportTitle = reportType === 'income' ? 'Income Ledger' :
                        reportType === 'expenses' ? 'Expenditure Statement' :
                        reportType === 'donations' ? 'Devotee Seva & Donation Register' :
                        'Comprehensive Financial Governance Statement';

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${reportTitle} - Kolar Sringeri SriShankara Mutt</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937; margin: 40px; }
    .header { text-align: center; border-bottom: 3px double #d97706; padding-bottom: 20px; margin-bottom: 30px; }
    .temple-name { font-size: 24px; font-weight: bold; color: #78350f; margin-bottom: 4px; }
    .subtitle { font-size: 14px; color: #92400e; }
    .report-meta { display: flex; justify-content: space-between; margin: 20px 0; font-size: 13px; color: #4b5563; }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
    .summary-card { background: #fef3c7; border: 1px solid #fde68a; padding: 15px; border-radius: 8px; text-align: center; }
    .summary-label { font-size: 12px; color: #92400e; text-transform: uppercase; font-weight: 600; }
    .summary-value { font-size: 20px; font-weight: bold; color: #78350f; margin-top: 5px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
    th { background: #78350f; color: white; padding: 10px; text-align: left; }
    td { padding: 9px 10px; border-bottom: 1px solid #e5e7eb; }
    tr:nth-child(even) { background-color: #fdfbf7; }
    .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 15px; }
    @media print { body { margin: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="temple-name">🏛️ KOLAR SRINGERI SRISHANKARA MUTT</div>
    <div class="subtitle">Branch of Dakshinamnaya Sri Sharada Peetham, Sringeri</div>
    <h2 style="margin: 15px 0 5px 0; color: #1f2937;">${reportTitle}</h2>
  </div>

  <div class="report-meta">
    <div><strong>Generated On:</strong> ${new Date().toLocaleString()}</div>
    <div><strong>Period:</strong> ${startDate || 'All Time'} to ${endDate || 'Present'}</div>
    <div><strong>Database Engine:</strong> PostgreSQL (AWS ap-south-1)</div>
  </div>

  <div class="summary-grid">
    <div class="summary-card">
      <div class="summary-label">Devotee Donations</div>
      <div class="summary-value">₹${totalDonations.toLocaleString('en-IN')}</div>
    </div>
    <div class="summary-card">
      <div class="summary-label">Temple Income</div>
      <div class="summary-value">₹${totalIncome.toLocaleString('en-IN')}</div>
    </div>
    <div class="summary-card">
      <div class="summary-label">Expenditure</div>
      <div class="summary-value">₹${totalExpenses.toLocaleString('en-IN')}</div>
    </div>
    <div class="summary-card" style="background: ${netBalance >= 0 ? '#dcfce7' : '#fee2e2'}; border-color: ${netBalance >= 0 ? '#bbf7d0' : '#fecaca'};">
      <div class="summary-label" style="color: ${netBalance >= 0 ? '#166534' : '#991b1b'};">Net Reserve</div>
      <div class="summary-value" style="color: ${netBalance >= 0 ? '#166534' : '#991b1b'};">₹${netBalance.toLocaleString('en-IN')}</div>
    </div>
  </div>

  ${(reportType === 'financial' || reportType === 'donations') ? `
    <h3 style="color: #78350f; border-bottom: 2px solid #fde68a; padding-bottom: 5px;">Devotee Donations Register</h3>
    <table>
      <thead>
        <tr>
          <th>Receipt #</th>
          <th>Date</th>
          <th>Donor Name</th>
          <th>Purpose</th>
          <th>Payment Mode</th>
          <th>Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${filteredDonations.slice(0, 500).map(d => `
          <tr>
            <td>${d.receiptNumber || '-'}</td>
            <td>${d.date || '-'}</td>
            <td>${d.donorName || '-'}</td>
            <td>${d.purpose || '-'}</td>
            <td>${d.paymentMethod || '-'}</td>
            <td><strong>₹${(parseFloat(d.amount) || 0).toLocaleString('en-IN')}</strong></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : ''}

  ${(reportType === 'financial' || reportType === 'expenses') ? `
    <h3 style="color: #78350f; border-bottom: 2px solid #fde68a; padding-bottom: 5px; margin-top: 30px;">Temple Expenses Ledger</h3>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Title / Payee</th>
          <th>Category</th>
          <th>Description</th>
          <th>Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${filteredExpenses.map(e => `
          <tr>
            <td>${e.date || '-'}</td>
            <td>${e.title || '-'}</td>
            <td>${e.category || '-'}</td>
            <td>${e.description || '-'}</td>
            <td><strong>₹${(parseFloat(e.amount) || 0).toLocaleString('en-IN')}</strong></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : ''}

  <div class="footer">
    <p>Certified Official Financial Record of Kolar Sringeri SriShankara Mutt. Managed via Secure AWS Cloud Infrastructure.</p>
  </div>
</body>
</html>
    `;

    res.json({ success: true, reportContent: html });
  } catch (e) {
    console.error('Report generation error:', e);
    res.status(500).json({ error: 'Failed to generate financial report' });
  }
});

// =============================================================================
// START SERVER
// =============================================================================
async function startServer() {
  console.log('🏛️ Initializing Kolar Sringeri SriShankara Mutt Backend...');
  
  // Test PostgreSQL connection
  const pgTest = await db.testConnection();
  if (pgTest.success) {
    console.log(`🗄️ PostgreSQL Status: ACTIVE & CONNECTED (${pgTest.info.db_name})`);
  } else {
    console.log(`⚠️ PostgreSQL Status: OFFLINE (${pgTest.error}). Using local JSON fallback until PostgreSQL starts.`);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend API Server running on http://0.0.0.0:${PORT}`);
    console.log(`🌐 API Endpoint Base: http://localhost:${PORT}/api`);
    console.log(`🏥 Health Status: http://localhost:${PORT}/api/health`);
  });
}

startServer();

module.exports = app;
