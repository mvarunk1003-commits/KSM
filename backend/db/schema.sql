-- =============================================================================
-- Kolar Sringeri SriShankara Mutt — PostgreSQL Database Schema
-- Database schema for Devotee Portal & Administrative ERP
-- Target: AWS EC2 / RDS (Region: ap-south-1, Mumbai)
-- =============================================================================

-- 1. Create Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    role VARCHAR(50) DEFAULT 'Admin',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_password_change TIMESTAMP WITH TIME ZONE,
    last_updated TIMESTAMP WITH TIME ZONE
);

-- 2. Create Activities Table
CREATE TABLE IF NOT EXISTS activities (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date VARCHAR(50),
    from_date VARCHAR(50),
    to_date VARCHAR(50),
    description TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date VARCHAR(50),
    from_date VARCHAR(50),
    to_date VARCHAR(50),
    description TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Banner Images Table
CREATE TABLE IF NOT EXISTS banner_images (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    date VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create Donations Table
CREATE TABLE IF NOT EXISTS donations (
    id VARCHAR(100) PRIMARY KEY,
    donor_name VARCHAR(255),
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    purpose VARCHAR(255) DEFAULT 'General Donation',
    payment_method VARCHAR(100) DEFAULT 'CASH',
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    date VARCHAR(50),
    status VARCHAR(50) DEFAULT 'received',
    receipt_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Create Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    category VARCHAR(100) DEFAULT 'General Expense',
    date VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Create Income Table
CREATE TABLE IF NOT EXISTS income (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    category VARCHAR(100) DEFAULT 'Donation',
    date VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Create Settings Table (Single row configuration)
CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY DEFAULT 1,
    hero_background TEXT,
    custom_css TEXT,
    site_title VARCHAR(255) DEFAULT 'Kolar Sringeri SriShankara Mutt',
    site_subtitle VARCHAR(255) DEFAULT 'Spiritual Heritage & Cultural Activities',
    theme VARCHAR(50) DEFAULT 'traditional',
    om_logo TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create helpful indexes for performance
CREATE INDEX IF NOT EXISTS idx_donations_date ON donations(date);
CREATE INDEX IF NOT EXISTS idx_donations_receipt ON donations(receipt_number);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_income_date ON income(date);
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(date);
CREATE INDEX IF NOT EXISTS idx_announcements_date ON announcements(date);
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
