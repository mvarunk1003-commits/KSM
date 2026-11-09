/**
 * Database Service Layer
 * Connects Express controllers to PostgreSQL with automatic camelCase/snake_case mapping
 * and graceful fallback to JSON storage if PostgreSQL is offline during local work.
 */

const db = require('../config/db');
const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

// Helper to check if Postgres is available
async function canUsePostgres() {
  try {
    const test = await db.testConnection();
    return test.success;
  } catch (e) {
    return false;
  }
}

// Fallback JSON helpers
async function readJsonFile(filename, defaultValue = []) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (e) {
    return defaultValue;
  }
}

async function writeJsonFile(filename, data) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error(`Error saving fallback JSON ${filename}:`, e.message);
  }
}

// =============================================================================
// 1. ADMINS
// =============================================================================

function mapAdminRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    password: row.password,
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    createdAt: row.created_at,
    lastPasswordChange: row.last_password_change,
    lastUpdated: row.last_updated
  };
}

async function getAdmins() {
  if (db.isPgConnected()) {
    try {
      const res = await db.query('SELECT * FROM admins ORDER BY id ASC');
      return res.rows.map(mapAdminRow);
    } catch (e) {
      console.warn('Postgres getAdmins error, using JSON fallback:', e.message);
    }
  }
  return await readJsonFile('admins.json', []);
}

async function getAdminByUsername(username) {
  if (db.isPgConnected()) {
    try {
      const res = await db.query('SELECT * FROM admins WHERE username = $1 LIMIT 1', [username]);
      if (res.rows.length > 0) return mapAdminRow(res.rows[0]);
    } catch (e) {
      console.warn('Postgres getAdminByUsername error:', e.message);
    }
  }
  const admins = await readJsonFile('admins.json', []);
  return admins.find(a => a.username === username) || null;
}

async function createAdmin(adminData) {
  if (db.isPgConnected()) {
    try {
      const res = await db.query(
        `INSERT INTO admins (username, password, name, email, role, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
         RETURNING *`,
        [
          adminData.username,
          adminData.password,
          adminData.name,
          adminData.email || '',
          adminData.role || 'Admin',
          adminData.status || 'active'
        ]
      );
      return mapAdminRow(res.rows[0]);
    } catch (e) {
      console.warn('Postgres createAdmin error:', e.message);
    }
  }
  const admins = await readJsonFile('admins.json', []);
  const newAdmin = {
    id: Date.now(),
    username: adminData.username,
    password: adminData.password,
    name: adminData.name,
    email: adminData.email || '',
    role: adminData.role || 'Admin',
    status: adminData.status || 'active',
    createdAt: new Date().toISOString()
  };
  admins.push(newAdmin);
  await writeJsonFile('admins.json', admins);
  return newAdmin;
}

async function updateAdmin(id, updateData) {
  if (db.isPgConnected()) {
    try {
      const fields = [];
      const values = [];
      let idx = 1;

      if (updateData.name !== undefined) {
        fields.push(`name = $${idx++}`);
        values.push(updateData.name);
      }
      if (updateData.email !== undefined) {
        fields.push(`email = $${idx++}`);
        values.push(updateData.email);
      }
      if (updateData.role !== undefined) {
        fields.push(`role = $${idx++}`);
        values.push(updateData.role);
      }
      if (updateData.status !== undefined) {
        fields.push(`status = $${idx++}`);
        values.push(updateData.status);
      }
      if (updateData.newPassword || updateData.password) {
        fields.push(`password = $${idx++}`);
        values.push(updateData.newPassword || updateData.password);
        fields.push(`last_password_change = CURRENT_TIMESTAMP`);
      }
      fields.push(`last_updated = CURRENT_TIMESTAMP`);

      values.push(id);
      const queryStr = `UPDATE admins SET ${fields.join(', ')} WHERE id::text = $${idx} OR username = $${idx} RETURNING *`;
      const res = await db.query(queryStr, values);
      if (res.rows.length > 0) return mapAdminRow(res.rows[0]);
    } catch (e) {
      console.warn('Postgres updateAdmin error:', e.message);
    }
  }
  const admins = await readJsonFile('admins.json', []);
  const idx = admins.findIndex(a => a.id == id || a.username === id);
  if (idx !== -1) {
    if (updateData.name) admins[idx].name = updateData.name;
    if (updateData.email) admins[idx].email = updateData.email;
    if (updateData.role) admins[idx].role = updateData.role;
    if (updateData.status) admins[idx].status = updateData.status;
    if (updateData.newPassword || updateData.password) {
      admins[idx].password = updateData.newPassword || updateData.password;
      admins[idx].lastPasswordChange = new Date().toISOString();
    }
    admins[idx].lastUpdated = new Date().toISOString();
    await writeJsonFile('admins.json', admins);
    return admins[idx];
  }
  return null;
}

async function deleteAdmin(id) {
  if (db.isPgConnected()) {
    try {
      await db.query('DELETE FROM admins WHERE id::text = $1 OR username = $1', [id.toString()]);
      return true;
    } catch (e) {
      console.warn('Postgres deleteAdmin error:', e.message);
    }
  }
  const admins = await readJsonFile('admins.json', []);
  const filtered = admins.filter(a => a.id != id && a.username !== id);
  await writeJsonFile('admins.json', filtered);
  return true;
}

// =============================================================================
// 2. ACTIVITIES
// =============================================================================

function mapActivityRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    fromDate: row.from_date,
    toDate: row.to_date,
    description: row.description,
    images: Array.isArray(row.images) ? row.images : []
  };
}

async function getActivities() {
  if (db.isPgConnected()) {
    try {
      const res = await db.query('SELECT * FROM activities ORDER BY created_at DESC');
      return res.rows.map(mapActivityRow);
    } catch (e) {
      console.warn('Postgres getActivities error:', e.message);
    }
  }
  return await readJsonFile('activities.json', []);
}

async function createActivity(activity) {
  const id = activity.id ? activity.id.toString() : Date.now().toString();
  const images = Array.isArray(activity.images) ? JSON.stringify(activity.images) : '[]';

  if (db.isPgConnected()) {
    try {
      const res = await db.query(
        `INSERT INTO activities (id, title, date, from_date, to_date, description, images)
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
         RETURNING *`,
        [id, activity.title, activity.date || '', activity.fromDate || activity.date || '', activity.toDate || '', activity.description || '', images]
      );
      return mapActivityRow(res.rows[0]);
    } catch (e) {
      console.warn('Postgres createActivity error:', e.message);
    }
  }
  const items = await readJsonFile('activities.json', []);
  const newItem = { id, ...activity, images: activity.images || [] };
  items.push(newItem);
  await writeJsonFile('activities.json', items);
  return newItem;
}

async function updateActivity(id, activity) {
  const images = Array.isArray(activity.images) ? JSON.stringify(activity.images) : undefined;
  if (db.isPgConnected()) {
    try {
      const res = await db.query(
        `UPDATE activities 
         SET title = COALESCE($1, title),
             date = COALESCE($2, date),
             from_date = COALESCE($3, from_date),
             to_date = COALESCE($4, to_date),
             description = COALESCE($5, description),
             images = COALESCE($6::jsonb, images)
         WHERE id = $7
         RETURNING *`,
        [activity.title, activity.date, activity.fromDate, activity.toDate, activity.description, images, id.toString()]
      );
      if (res.rows.length > 0) return mapActivityRow(res.rows[0]);
    } catch (e) {
      console.warn('Postgres updateActivity error:', e.message);
    }
  }
  const items = await readJsonFile('activities.json', []);
  const idx = items.findIndex(i => i.id == id);
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...activity };
    await writeJsonFile('activities.json', items);
    return items[idx];
  }
  return null;
}

async function deleteActivity(id) {
  if (db.isPgConnected()) {
    try {
      await db.query('DELETE FROM activities WHERE id = $1', [id.toString()]);
      return true;
    } catch (e) {
      console.warn('Postgres deleteActivity error:', e.message);
    }
  }
  const items = await readJsonFile('activities.json', []);
  const filtered = items.filter(i => i.id != id);
  await writeJsonFile('activities.json', filtered);
  return true;
}

// =============================================================================
// 3. ANNOUNCEMENTS
// =============================================================================

function mapAnnouncementRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    fromDate: row.from_date,
    toDate: row.to_date,
    description: row.description,
    images: Array.isArray(row.images) ? row.images : []
  };
}

async function getAnnouncements() {
  if (db.isPgConnected()) {
    try {
      const res = await db.query('SELECT * FROM announcements ORDER BY created_at DESC');
      return res.rows.map(mapAnnouncementRow);
    } catch (e) {
      console.warn('Postgres getAnnouncements error:', e.message);
    }
  }
  return await readJsonFile('announcements.json', []);
}

async function createAnnouncement(announcement) {
  const id = announcement.id ? announcement.id.toString() : Date.now().toString();
  const images = Array.isArray(announcement.images) ? JSON.stringify(announcement.images) : '[]';

  if (db.isPgConnected()) {
    try {
      const res = await db.query(
        `INSERT INTO announcements (id, title, date, from_date, to_date, description, images)
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
         RETURNING *`,
        [id, announcement.title, announcement.date || '', announcement.fromDate || announcement.date || '', announcement.toDate || '', announcement.description || '', images]
      );
      return mapAnnouncementRow(res.rows[0]);
    } catch (e) {
      console.warn('Postgres createAnnouncement error:', e.message);
    }
  }
  const items = await readJsonFile('announcements.json', []);
  const newItem = { id, ...announcement, images: announcement.images || [] };
  items.push(newItem);
  await writeJsonFile('announcements.json', items);
  return newItem;
}

async function updateAnnouncement(id, announcement) {
  const images = Array.isArray(announcement.images) ? JSON.stringify(announcement.images) : undefined;
  if (db.isPgConnected()) {
    try {
      const res = await db.query(
        `UPDATE announcements 
         SET title = COALESCE($1, title),
             date = COALESCE($2, date),
             from_date = COALESCE($3, from_date),
             to_date = COALESCE($4, to_date),
             description = COALESCE($5, description),
             images = COALESCE($6::jsonb, images)
         WHERE id = $7
         RETURNING *`,
        [announcement.title, announcement.date, announcement.fromDate, announcement.toDate, announcement.description, images, id.toString()]
      );
      if (res.rows.length > 0) return mapAnnouncementRow(res.rows[0]);
    } catch (e) {
      console.warn('Postgres updateAnnouncement error:', e.message);
    }
  }
  const items = await readJsonFile('announcements.json', []);
  const idx = items.findIndex(i => i.id == id);
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...announcement };
    await writeJsonFile('announcements.json', items);
    return items[idx];
  }
  return null;
}

async function deleteAnnouncement(id) {
  if (db.isPgConnected()) {
    try {
      await db.query('DELETE FROM announcements WHERE id = $1', [id.toString()]);
      return true;
    } catch (e) {
      console.warn('Postgres deleteAnnouncement error:', e.message);
    }
  }
  const items = await readJsonFile('announcements.json', []);
  const filtered = items.filter(i => i.id != id);
  await writeJsonFile('announcements.json', filtered);
  return true;
}

// =============================================================================
// 4. BANNER IMAGES
// =============================================================================

function mapBannerRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    images: Array.isArray(row.images) ? row.images : [],
    date: row.date
  };
}

async function getBannerImages() {
  if (db.isPgConnected()) {
    try {
      const res = await db.query('SELECT * FROM banner_images ORDER BY created_at DESC');
      return res.rows.map(mapBannerRow);
    } catch (e) {
      console.warn('Postgres getBannerImages error:', e.message);
    }
  }
  return await readJsonFile('banner-images.json', []);
}

async function createBannerImage(banner) {
  const id = banner.id ? banner.id.toString() : Date.now().toString();
  const images = Array.isArray(banner.images) ? JSON.stringify(banner.images) : '[]';

  if (db.isPgConnected()) {
    try {
      const res = await db.query(
        `INSERT INTO banner_images (id, title, description, images, date)
         VALUES ($1, $2, $3, $4::jsonb, $5)
         RETURNING *`,
        [id, banner.title || '', banner.description || '', images, banner.date || '']
      );
      return mapBannerRow(res.rows[0]);
    } catch (e) {
      console.warn('Postgres createBannerImage error:', e.message);
    }
  }
  const items = await readJsonFile('banner-images.json', []);
  const newItem = { id, ...banner, images: banner.images || [] };
  items.push(newItem);
  await writeJsonFile('banner-images.json', items);
  return newItem;
}

async function updateBannerImage(id, banner) {
  const images = Array.isArray(banner.images) ? JSON.stringify(banner.images) : undefined;
  if (db.isPgConnected()) {
    try {
      const res = await db.query(
        `UPDATE banner_images 
         SET title = COALESCE($1, title),
             description = COALESCE($2, description),
             images = COALESCE($3::jsonb, images),
             date = COALESCE($4, date)
         WHERE id = $5
         RETURNING *`,
        [banner.title, banner.description, images, banner.date, id.toString()]
      );
      if (res.rows.length > 0) return mapBannerRow(res.rows[0]);
    } catch (e) {
      console.warn('Postgres updateBannerImage error:', e.message);
    }
  }
  const items = await readJsonFile('banner-images.json', []);
  const idx = items.findIndex(i => i.id == id);
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...banner };
    await writeJsonFile('banner-images.json', items);
    return items[idx];
  }
  return null;
}

async function deleteBannerImage(id) {
  if (db.isPgConnected()) {
    try {
      await db.query('DELETE FROM banner_images WHERE id = $1', [id.toString()]);
      return true;
    } catch (e) {
      console.warn('Postgres deleteBannerImage error:', e.message);
    }
  }
  const items = await readJsonFile('banner-images.json', []);
  const filtered = items.filter(i => i.id != id);
  await writeJsonFile('banner-images.json', filtered);
  return true;
}

// =============================================================================
// 5. CONTACT MESSAGES
// =============================================================================

function mapContactRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    createdAt: row.created_at
  };
}

async function getContactMessages() {
  if (db.isPgConnected()) {
    try {
      const res = await db.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
      return res.rows.map(mapContactRow);
    } catch (e) {
      console.warn('Postgres getContactMessages error:', e.message);
    }
  }
  return await readJsonFile('contact.json', []);
}

async function createContactMessage(contact) {
  const id = contact.id ? contact.id.toString() : Date.now().toString();
  if (db.isPgConnected()) {
    try {
      const res = await db.query(
        `INSERT INTO contact_messages (id, name, email, message, created_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
         RETURNING *`,
        [id, contact.name, contact.email, contact.message]
      );
      return mapContactRow(res.rows[0]);
    } catch (e) {
      console.warn('Postgres createContactMessage error:', e.message);
    }
  }
  const items = await readJsonFile('contact.json', []);
  const newItem = { id, ...contact, createdAt: new Date().toISOString() };
  items.push(newItem);
  await writeJsonFile('contact.json', items);
  return newItem;
}

async function deleteContactMessage(id) {
  if (db.isPgConnected()) {
    try {
      await db.query('DELETE FROM contact_messages WHERE id = $1', [id.toString()]);
      return true;
    } catch (e) {
      console.warn('Postgres deleteContactMessage error:', e.message);
    }
  }
  const items = await readJsonFile('contact.json', []);
  const filtered = items.filter(i => i.id != id);
  await writeJsonFile('contact.json', filtered);
  return true;
}

// =============================================================================
// 6. DONATIONS
// =============================================================================

function mapDonationRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    donorName: row.donor_name,
    amount: parseFloat(row.amount) || 0,
    purpose: row.purpose,
    paymentMethod: row.payment_method,
    phone: row.phone,
    email: row.email,
    address: row.address,
    date: row.date,
    status: row.status,
    receiptNumber: row.receipt_number,
    createdAt: row.created_at
  };
}

async function getDonations() {
  if (db.isPgConnected()) {
    try {
      const res = await db.query('SELECT * FROM donations ORDER BY date DESC, created_at DESC');
      return res.rows.map(mapDonationRow);
    } catch (e) {
      console.warn('Postgres getDonations error:', e.message);
    }
  }
  return await readJsonFile('donations.json', []);
}

async function createDonation(donation) {
  const id = donation.id ? donation.id.toString() : `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const receiptNumber = donation.receiptNumber || `KSM-${Date.now().toString().slice(-7)}`;
  const date = donation.date || new Date().toISOString().split('T')[0];

  if (db.isPgConnected()) {
    try {
      const res = await db.query(
        `INSERT INTO donations (id, donor_name, amount, purpose, payment_method, phone, email, address, date, status, receipt_number, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
         RETURNING *`,
        [
          id,
          donation.donorName || donation.donor_name || 'Anonymous Devotee',
          parseFloat(donation.amount) || 0,
          donation.purpose || 'General Donation',
          donation.paymentMethod || donation.payment_method || 'CASH',
          donation.phone || '',
          donation.email || '',
          donation.address || '',
          date,
          donation.status || 'received',
          receiptNumber
        ]
      );
      return mapDonationRow(res.rows[0]);
    } catch (e) {
      console.warn('Postgres createDonation error:', e.message);
    }
  }
  const items = await readJsonFile('donations.json', []);
  const newItem = {
    id,
    donorName: donation.donorName || 'Anonymous Devotee',
    amount: parseFloat(donation.amount) || 0,
    purpose: donation.purpose || 'General Donation',
    paymentMethod: donation.paymentMethod || 'CASH',
    phone: donation.phone || '',
    email: donation.email || '',
    address: donation.address || '',
    date,
    status: donation.status || 'received',
    receiptNumber,
    createdAt: new Date().toISOString()
  };
  items.push(newItem);
  await writeJsonFile('donations.json', items);
  return newItem;
}

async function updateDonation(id, donation) {
  if (db.isPgConnected()) {
    try {
      const res = await db.query(
        `UPDATE donations
         SET donor_name = COALESCE($1, donor_name),
             amount = COALESCE($2, amount),
             purpose = COALESCE($3, purpose),
             payment_method = COALESCE($4, payment_method),
             phone = COALESCE($5, phone),
             email = COALESCE($6, email),
             address = COALESCE($7, address),
             date = COALESCE($8, date),
             status = COALESCE($9, status),
             receipt_number = COALESCE($10, receipt_number)
         WHERE id = $11
         RETURNING *`,
        [
          donation.donorName,
          donation.amount !== undefined ? parseFloat(donation.amount) : undefined,
          donation.purpose,
          donation.paymentMethod,
          donation.phone,
          donation.email,
          donation.address,
          donation.date,
          donation.status,
          donation.receiptNumber,
          id.toString()
        ]
      );
      if (res.rows.length > 0) return mapDonationRow(res.rows[0]);
    } catch (e) {
      console.warn('Postgres updateDonation error:', e.message);
    }
  }
  const items = await readJsonFile('donations.json', []);
  const idx = items.findIndex(i => i.id == id);
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...donation };
    await writeJsonFile('donations.json', items);
    return items[idx];
  }
  return null;
}

async function deleteDonation(id) {
  if (db.isPgConnected()) {
    try {
      await db.query('DELETE FROM donations WHERE id = $1', [id.toString()]);
      return true;
    } catch (e) {
      console.warn('Postgres deleteDonation error:', e.message);
    }
  }
  const items = await readJsonFile('donations.json', []);
  const filtered = items.filter(i => i.id != id);
  await writeJsonFile('donations.json', filtered);
  return true;
}

// =============================================================================
// 7. EXPENSES
// =============================================================================

function mapExpenseRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    amount: parseFloat(row.amount) || 0,
    category: row.category,
    date: row.date,
    description: row.description,
    createdAt: row.created_at
  };
}

async function getExpenses() {
  if (db.isPgConnected()) {
    try {
      const res = await db.query('SELECT * FROM expenses ORDER BY date DESC, created_at DESC');
      return res.rows.map(mapExpenseRow);
    } catch (e) {
      console.warn('Postgres getExpenses error:', e.message);
    }
  }
  return await readJsonFile('expenses.json', []);
}

async function createExpense(expense) {
  const id = expense.id ? expense.id.toString() : `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const date = expense.date || new Date().toISOString().split('T')[0];

  if (db.isPgConnected()) {
    try {
      const res = await db.query(
        `INSERT INTO expenses (id, title, amount, category, date, description, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
         RETURNING *`,
        [
          id,
          expense.title,
          parseFloat(expense.amount) || 0,
          expense.category || 'General Expense',
          date,
          expense.description || ''
        ]
      );
      return mapExpenseRow(res.rows[0]);
    } catch (e) {
      console.warn('Postgres createExpense error:', e.message);
    }
  }
  const items = await readJsonFile('expenses.json', []);
  const newItem = {
    id,
    title: expense.title,
    amount: parseFloat(expense.amount) || 0,
    category: expense.category || 'General Expense',
    date,
    description: expense.description || '',
    createdAt: new Date().toISOString()
  };
  items.push(newItem);
  await writeJsonFile('expenses.json', items);
  return newItem;
}

async function updateExpense(id, expense) {
  if (db.isPgConnected()) {
    try {
      const res = await db.query(
        `UPDATE expenses
         SET title = COALESCE($1, title),
             amount = COALESCE($2, amount),
             category = COALESCE($3, category),
             date = COALESCE($4, date),
             description = COALESCE($5, description)
         WHERE id = $6
         RETURNING *`,
        [
          expense.title,
          expense.amount !== undefined ? parseFloat(expense.amount) : undefined,
          expense.category,
          expense.date,
          expense.description,
          id.toString()
        ]
      );
      if (res.rows.length > 0) return mapExpenseRow(res.rows[0]);
    } catch (e) {
      console.warn('Postgres updateExpense error:', e.message);
    }
  }
  const items = await readJsonFile('expenses.json', []);
  const idx = items.findIndex(i => i.id == id);
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...expense };
    await writeJsonFile('expenses.json', items);
    return items[idx];
  }
  return null;
}

async function deleteExpense(id) {
  if (db.isPgConnected()) {
    try {
      await db.query('DELETE FROM expenses WHERE id = $1', [id.toString()]);
      return true;
    } catch (e) {
      console.warn('Postgres deleteExpense error:', e.message);
    }
  }
  const items = await readJsonFile('expenses.json', []);
  const filtered = items.filter(i => i.id != id);
  await writeJsonFile('expenses.json', filtered);
  return true;
}

// =============================================================================
// 8. INCOME
// =============================================================================

function mapIncomeRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    amount: parseFloat(row.amount) || 0,
    category: row.category,
    date: row.date,
    description: row.description,
    createdAt: row.created_at
  };
}

async function getIncome() {
  if (db.isPgConnected()) {
    try {
      const res = await db.query('SELECT * FROM income ORDER BY date DESC, created_at DESC');
      return res.rows.map(mapIncomeRow);
    } catch (e) {
      console.warn('Postgres getIncome error:', e.message);
    }
  }
  return await readJsonFile('income.json', []);
}

async function createIncome(item) {
  const id = item.id ? item.id.toString() : `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const date = item.date || new Date().toISOString().split('T')[0];

  if (db.isPgConnected()) {
    try {
      const res = await db.query(
        `INSERT INTO income (id, title, amount, category, date, description, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
         RETURNING *`,
        [
          id,
          item.title,
          parseFloat(item.amount) || 0,
          item.category || 'Donation',
          date,
          item.description || ''
        ]
      );
      return mapIncomeRow(res.rows[0]);
    } catch (e) {
      console.warn('Postgres createIncome error:', e.message);
    }
  }
  const items = await readJsonFile('income.json', []);
  const newItem = {
    id,
    title: item.title,
    amount: parseFloat(item.amount) || 0,
    category: item.category || 'Donation',
    date,
    description: item.description || '',
    createdAt: new Date().toISOString()
  };
  items.push(newItem);
  await writeJsonFile('income.json', items);
  return newItem;
}

async function updateIncome(id, item) {
  if (db.isPgConnected()) {
    try {
      const res = await db.query(
        `UPDATE income
         SET title = COALESCE($1, title),
             amount = COALESCE($2, amount),
             category = COALESCE($3, category),
             date = COALESCE($4, date),
             description = COALESCE($5, description)
         WHERE id = $6
         RETURNING *`,
        [
          item.title,
          item.amount !== undefined ? parseFloat(item.amount) : undefined,
          item.category,
          item.date,
          item.description,
          id.toString()
        ]
      );
      if (res.rows.length > 0) return mapIncomeRow(res.rows[0]);
    } catch (e) {
      console.warn('Postgres updateIncome error:', e.message);
    }
  }
  const items = await readJsonFile('income.json', []);
  const idx = items.findIndex(i => i.id == id);
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...item };
    await writeJsonFile('income.json', items);
    return items[idx];
  }
  return null;
}

async function deleteIncome(id) {
  if (db.isPgConnected()) {
    try {
      await db.query('DELETE FROM income WHERE id = $1', [id.toString()]);
      return true;
    } catch (e) {
      console.warn('Postgres deleteIncome error:', e.message);
    }
  }
  const items = await readJsonFile('income.json', []);
  const filtered = items.filter(i => i.id != id);
  await writeJsonFile('income.json', filtered);
  return true;
}

// =============================================================================
// 9. SETTINGS
// =============================================================================

function mapSettingsRow(row) {
  if (!row) return {};
  return {
    heroBackground: row.hero_background || '/assets/hero_1755600941771.jpg',
    customCSS: row.custom_css || '',
    siteTitle: row.site_title || 'Kolar Sringeri SriShankara Mutt',
    siteSubtitle: row.site_subtitle || 'Spiritual Heritage & Cultural Activities',
    theme: row.theme || 'traditional',
    omLogo: row.om_logo || ''
  };
}

async function getSettings() {
  if (db.isPgConnected()) {
    try {
      const res = await db.query('SELECT * FROM settings WHERE id = 1 LIMIT 1');
      if (res.rows.length > 0) return mapSettingsRow(res.rows[0]);
    } catch (e) {
      console.warn('Postgres getSettings error:', e.message);
    }
  }
  return await readJsonFile('settings.json', {
    heroBackground: '/assets/hero_1755600941771.jpg',
    customCSS: '',
    siteTitle: 'Kolar Sringeri SriShankara Mutt',
    siteSubtitle: 'Spiritual Heritage & Cultural Activities',
    theme: 'traditional'
  });
}

async function updateSettings(settings) {
  if (db.isPgConnected()) {
    try {
      const res = await db.query(
        `INSERT INTO settings (id, hero_background, custom_css, site_title, site_subtitle, theme, om_logo, updated_at)
         VALUES (1, $1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE
         SET hero_background = COALESCE($1, settings.hero_background),
             custom_css = COALESCE($2, settings.custom_css),
             site_title = COALESCE($3, settings.site_title),
             site_subtitle = COALESCE($4, settings.site_subtitle),
             theme = COALESCE($5, settings.theme),
             om_logo = COALESCE($6, settings.om_logo),
             updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [
          settings.heroBackground,
          settings.customCSS,
          settings.siteTitle,
          settings.siteSubtitle,
          settings.theme,
          settings.omLogo
        ]
      );
      if (res.rows.length > 0) return mapSettingsRow(res.rows[0]);
    } catch (e) {
      console.warn('Postgres updateSettings error:', e.message);
    }
  }
  const current = await getSettings();
  const updated = { ...current, ...settings };
  await writeJsonFile('settings.json', updated);
  return updated;
}

// Bulk insert for Excel Import
async function bulkInsertRecords(type, records) {
  const inserted = [];
  for (const record of records) {
    if (type === 'income') {
      inserted.push(await createIncome(record));
    } else if (type === 'expense' || type === 'expenses') {
      inserted.push(await createExpense(record));
    } else if (type === 'donation' || type === 'donations') {
      inserted.push(await createDonation(record));
    }
  }
  return inserted;
}

module.exports = {
  canUsePostgres,
  // Admins
  getAdmins,
  getAdminByUsername,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  // Activities
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  // Announcements
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  // Banner Images
  getBannerImages,
  createBannerImage,
  updateBannerImage,
  deleteBannerImage,
  // Contact
  getContactMessages,
  createContactMessage,
  deleteContactMessage,
  // Donations
  getDonations,
  createDonation,
  updateDonation,
  deleteDonation,
  // Expenses
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  // Income
  getIncome,
  createIncome,
  updateIncome,
  deleteIncome,
  // Settings
  getSettings,
  updateSettings,
  // Bulk
  bulkInsertRecords
};
