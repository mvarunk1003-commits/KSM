/**
 * Data Migration Script: JSON Files -> PostgreSQL
 * Migrates existing data from backend/data/*.json to PostgreSQL tables on AWS EC2/RDS.
 */

const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const DATA_DIR = path.join(__dirname, '../data');

function readJson(filename, defVal = []) {
  try {
    const p = path.join(DATA_DIR, filename);
    if (!fs.existsSync(p)) return defVal;
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (err) {
    console.error(`Error reading ${filename}:`, err.message);
    return defVal;
  }
}

async function migrate() {
  console.log('🔄 Starting Data Migration to PostgreSQL...');

  try {
    const conn = await db.testConnection();
    if (!conn.success) {
      console.error('❌ Cannot connect to PostgreSQL:', conn.error);
      process.exit(1);
    }

    // 1. Ensure Schema
    console.log('📋 Ensuring schema exists...');
    const schemaSql = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8');
    await db.query(schemaSql);

    // 2. Migrate Admins
    const admins = readJson('admins.json', []);
    console.log(`👤 Migrating ${admins.length} Admins...`);
    for (const a of admins) {
      await db.query(
        `INSERT INTO admins (username, password, name, email, role, status, created_at, last_password_change, last_updated)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (username) DO UPDATE
         SET password = EXCLUDED.password,
             name = EXCLUDED.name,
             email = EXCLUDED.email,
             role = EXCLUDED.role,
             status = EXCLUDED.status`,
        [
          a.username,
          a.password,
          a.name,
          a.email || '',
          a.role || 'Admin',
          a.status || 'active',
          a.createdAt || new Date().toISOString(),
          a.lastPasswordChange || null,
          a.lastUpdated || null
        ]
      );
    }

    // 3. Migrate Activities
    const activities = readJson('activities.json', []);
    console.log(`🎉 Migrating ${activities.length} Activities...`);
    for (const act of activities) {
      await db.query(
        `INSERT INTO activities (id, title, date, from_date, to_date, description, images)
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
         ON CONFLICT (id) DO UPDATE
         SET title = EXCLUDED.title,
             date = EXCLUDED.date,
             from_date = EXCLUDED.from_date,
             to_date = EXCLUDED.to_date,
             description = EXCLUDED.description,
             images = EXCLUDED.images`,
        [
          act.id.toString(),
          act.title || '',
          act.date || '',
          act.fromDate || act.date || '',
          act.toDate || '',
          act.description || '',
          JSON.stringify(act.images || [])
        ]
      );
    }

    // 4. Migrate Announcements
    const announcements = readJson('announcements.json', []);
    console.log(`📢 Migrating ${announcements.length} Announcements...`);
    for (const ann of announcements) {
      await db.query(
        `INSERT INTO announcements (id, title, date, from_date, to_date, description, images)
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
         ON CONFLICT (id) DO UPDATE
         SET title = EXCLUDED.title,
             date = EXCLUDED.date,
             from_date = EXCLUDED.from_date,
             to_date = EXCLUDED.to_date,
             description = EXCLUDED.description,
             images = EXCLUDED.images`,
        [
          ann.id.toString(),
          ann.title || '',
          ann.date || '',
          ann.fromDate || ann.date || '',
          ann.toDate || '',
          ann.description || '',
          JSON.stringify(ann.images || [])
        ]
      );
    }

    // 5. Migrate Banner Images
    const banners = readJson('banner-images.json', []);
    console.log(`🖼️ Migrating ${banners.length} Banner Images...`);
    for (const b of banners) {
      await db.query(
        `INSERT INTO banner_images (id, title, description, images, date)
         VALUES ($1, $2, $3, $4::jsonb, $5)
         ON CONFLICT (id) DO UPDATE
         SET title = EXCLUDED.title,
             description = EXCLUDED.description,
             images = EXCLUDED.images,
             date = EXCLUDED.date`,
        [
          b.id.toString(),
          b.title || '',
          b.description || '',
          JSON.stringify(b.images || []),
          b.date || ''
        ]
      );
    }

    // 6. Migrate Contact Messages
    const contacts = readJson('contact.json', []);
    console.log(`✉️ Migrating ${contacts.length} Contact Messages...`);
    for (const c of contacts) {
      await db.query(
        `INSERT INTO contact_messages (id, name, email, message, created_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE
         SET name = EXCLUDED.name,
             email = EXCLUDED.email,
             message = EXCLUDED.message`,
        [
          c.id.toString(),
          c.name || '',
          c.email || '',
          c.message || '',
          c.createdAt || new Date().toISOString()
        ]
      );
    }

    // 7. Migrate Donations (Batch insert for speed)
    const donations = readJson('donations.json', []);
    console.log(`💰 Migrating ${donations.length} Devotee Donations...`);
    const batchSize = 100;
    for (let i = 0; i < donations.length; i += batchSize) {
      const batch = donations.slice(i, i + batchSize);
      for (const d of batch) {
        await db.query(
          `INSERT INTO donations (id, donor_name, amount, purpose, payment_method, phone, email, address, date, status, receipt_number, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (id) DO UPDATE
           SET donor_name = EXCLUDED.donor_name,
               amount = EXCLUDED.amount,
               purpose = EXCLUDED.purpose,
               payment_method = EXCLUDED.payment_method,
               phone = EXCLUDED.phone,
               email = EXCLUDED.email,
               address = EXCLUDED.address,
               date = EXCLUDED.date,
               status = EXCLUDED.status,
               receipt_number = EXCLUDED.receipt_number`,
          [
            d.id.toString(),
            d.donorName || 'Anonymous Devotee',
            parseFloat(d.amount) || 0,
            d.purpose || 'General Donation',
            d.paymentMethod || 'CASH',
            d.phone || '',
            d.email || '',
            d.address || '',
            d.date || new Date().toISOString().split('T')[0],
            d.status || 'received',
            d.receiptNumber || `KSM-${Date.now().toString().slice(-7)}`,
            d.createdAt || new Date().toISOString()
          ]
        );
      }
      process.stdout.write(`   Processed ${Math.min(i + batchSize, donations.length)}/${donations.length} donations\r`);
    }
    console.log(`\n✅ Donations migrated!`);

    // 8. Migrate Expenses
    const expenses = readJson('expenses.json', []);
    console.log(`📉 Migrating ${expenses.length} Expenses...`);
    for (let i = 0; i < expenses.length; i += batchSize) {
      const batch = expenses.slice(i, i + batchSize);
      for (const e of batch) {
        await db.query(
          `INSERT INTO expenses (id, title, amount, category, date, description, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO UPDATE
           SET title = EXCLUDED.title,
               amount = EXCLUDED.amount,
               category = EXCLUDED.category,
               date = EXCLUDED.date,
               description = EXCLUDED.description`,
          [
            e.id.toString(),
            e.title || '',
            parseFloat(e.amount) || 0,
            e.category || 'General Expense',
            e.date || new Date().toISOString().split('T')[0],
            e.description || '',
            e.createdAt || new Date().toISOString()
          ]
        );
      }
    }
    console.log(`✅ Expenses migrated!`);

    // 9. Migrate Income
    const income = readJson('income.json', []);
    console.log(`📈 Migrating ${income.length} Income entries...`);
    for (const inc of income) {
      await db.query(
        `INSERT INTO income (id, title, amount, category, date, description, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE
         SET title = EXCLUDED.title,
             amount = EXCLUDED.amount,
             category = EXCLUDED.category,
             date = EXCLUDED.date,
             description = EXCLUDED.description`,
        [
          inc.id.toString(),
          inc.title || '',
          parseFloat(inc.amount) || 0,
          inc.category || 'Donation',
          inc.date || new Date().toISOString().split('T')[0],
          inc.description || '',
          inc.createdAt || new Date().toISOString()
        ]
      );
    }

    // 10. Migrate Settings
    const settings = readJson('settings.json', {
      heroBackground: '/assets/hero_1755600941771.jpg',
      customCSS: '',
      siteTitle: 'Kolar Sringeri SriShankara Mutt',
      siteSubtitle: 'Spiritual Heritage & Cultural Activities',
      theme: 'traditional'
    });
    console.log('⚙️ Migrating Settings...');
    await db.query(
      `INSERT INTO settings (id, hero_background, custom_css, site_title, site_subtitle, theme, om_logo, updated_at)
       VALUES (1, $1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE
       SET hero_background = EXCLUDED.hero_background,
           custom_css = EXCLUDED.custom_css,
           site_title = EXCLUDED.site_title,
           site_subtitle = EXCLUDED.site_subtitle,
           theme = EXCLUDED.theme,
           om_logo = EXCLUDED.om_logo,
           updated_at = CURRENT_TIMESTAMP`,
      [
        settings.heroBackground || '/assets/hero_1755600941771.jpg',
        settings.customCSS || '',
        settings.siteTitle || 'Kolar Sringeri SriShankara Mutt',
        settings.siteSubtitle || 'Spiritual Heritage & Cultural Activities',
        settings.theme || 'traditional',
        settings.omLogo || ''
      ]
    );

    console.log('\n🎉 ALL DATA MIGRATED TO POSTGRESQL SUCCESSFULLY! 🎉');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  migrate();
}

module.exports = migrate;
