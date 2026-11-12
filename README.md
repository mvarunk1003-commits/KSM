# 🏛️ Kolar Sringeri SriShankara Mutt — Management & Devotee Portal

> **ದಕ್ಷಿಣಾಮ್ನಾಯ ಶೃಂಗೇರಿ ಶ್ರೀಶಾರದಾ ಪೀಠಮ್ ಶಾಖಾ ಮಠ**  
> Branch of Dakshinamnaya Sri Sharada Peetham, Sringeri  
> Comprehensive high-resolution web portal and ERP management system for temple activities, online sevas, announcements, donations, and financial governance.

---

## 🌟 Key Features

### 🛕 **Public Devotee Experience**
- **High-Resolution Royal Design:** Elegant blend of Vedic heritage and modern frosted-glass aesthetics with `Cinzel`, `Noto Serif Kannada`, and `Plus Jakarta Sans` typography.
- **Live Darshan & Pooja Ticker:** Real-time sanctum status beacon with morning, mangalarathi, and evening timing schedules.
- **Sacred Heritage Pillars:** Dedicated sections honoring the Advaita Vedanta lineage of Jagadguru Sri Adi Shankaracharya, daily Chandramouleshwara and Sri Sharadamba Poojas, Annadanam, and Veda Pathashala initiatives.
- **Online Seva & Donation Engine:** Direct devotee contributions with instant downloadable official bilingual HTML/PDF receipts.
- **Activities & Events Calendar:** Rich media support for Rathotsavas, Havans, and festival circulars.
- **Bilingual & Multilingual Interface:** Native support for Kannada (ಕನ್ನಡ), English, Sanskrit (संस्कृतम्), and Telugu (తెలుగు).
- **Sanctum Dark Mode:** Deep midnight bronze theme (`#120A05`) illuminated by sacred golden embers.

### ⚙️ **Administrative ERP Dashboard (`/admin`)**
- **Financial Accounting:** Dual-ledger tracking for Temple Income, Expenditure, and Devotee Sevas.
- **Excel Batch Import/Export:** Direct import and validation for bank collection registers and financial statements.
- **Report Generator:** One-click generation of Comprehensive Financial Statements, Income Statements, Expense Summaries, and Donation Registers with date-range filters.
- **Content Management:** Create, update, and manage activities, circulars, banner slides, and temple settings.
- **Security & RBAC:** Session-managed admin authentication, password sanitization, and profile management.

---

## 🏗️ System Architecture

```
KSM/
├── backend/
│   ├── data/                 # Persistent JSON database stores
│   │   ├── activities.json
│   │   ├── announcements.json
│   │   ├── banner-images.json
│   │   ├── contact.json
│   │   ├── donations.json
│   │   ├── expenses.json
│   │   ├── income.json
│   │   ├── settings.json
│   │   └── admins.json
│   ├── sample-templates/     # Excel upload template worksheets
│   ├── deep-audit-test.js    # 97-point automated integration & validation suite
│   ├── server.js             # Express API engine (port 5000)
│   └── package.json
├── frontend/
│   ├── public/
│   │   ├── assets/           # High-resolution banners, temple photos, and media
│   │   ├── favicon.png       # Sacred golden Sringeri Peetham seal
│   │   ├── icon-192.png      # 192x192 PWA temple emblem
│   │   ├── icon-512.png      # 512x512 PWA temple emblem
│   │   ├── index.html        # HTML5 semantic entry point with Google Fonts
│   │   └── manifest.json     # PWA configuration
│   ├── src/
│   │   ├── components/       # Reusable UI components (Header, Navbar, Footer, etc.)
│   │   ├── context/          # LanguageContext & ThemeContext
│   │   ├── pages/            # View pages (Home, Activities, Announcements, Donation, etc.)
│   │   ├── utils/            # Image and formatting utilities
│   │   └── styles.css        # Unified Design System tokens & responsive styling
│   └── package.json
├── check-status.js           # Full-stack operational health checker
├── start-system.bat          # Automated Windows startup batch script
└── README.md                 # Primary system manual
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18.0 or higher recommended)
- **npm** (v8.0 or higher)

### 2. Automatic Launch (Windows)
Double-click `start-system.bat` in the root folder. It will:
1. Launch the Backend API server on `http://localhost:5000`.
2. Launch the React Frontend application on `http://localhost:3000`.

### 3. Manual Launch
```bash
# Terminal 1: Start Backend API
cd backend
npm install
node server.js

# Terminal 2: Start Frontend App
cd frontend
npm install
npm start
```

### 4. Access Points
- **Public Portal:** `http://localhost:3000`
- **Backend API:** `http://localhost:5000/api`
- **Admin ERP Dashboard:** `http://localhost:3000/admin`
  - **Default Username:** `admin`
  - **Default Password:** Set via environment or initial seed configuration

---

## 🧪 Testing & Verification

Run the full system status check:
```bash
node check-status.js
```

Execute the 97-point deep data, field, and calculation audit:
```bash
cd backend
node deep-audit-test.js
```

Verify frontend production compilation:
```bash
cd frontend
npm run build
```

---

## 🎨 Asset & Image System
- **Central Storage:** All temple photography, banners, and circulars are stored in [`frontend/public/assets/`](frontend/public/assets/).
- **Official Banner:** Native high-resolution uncropped masthead at [`frontend/public/assets/banner.png`](frontend/public/assets/banner.png) (2113×463).
- **Temple Seal:** Sacred golden Sringeri Sharada Peetham seal at [`frontend/public/assets/temple_seal.png`](frontend/public/assets/temple_seal.png) and [`frontend/public/favicon.png`](frontend/public/favicon.png).

---

## ☁️ Cloud Infrastructure & Production Deployment (AWS ap-south-1)

- **Cloud Provider:** Amazon Web Services (AWS)
- **Region:** Asia Pacific — Mumbai (`ap-south-1`)
- **Database Engine:** PostgreSQL 16 + pgAdmin 4
- **Containerization:** Docker & Docker Compose
- **CI/CD Pipeline:** Jenkinsfile with Private PEM Key SSH Deployment

### 🐳 Quick Start with Docker & PostgreSQL + pgAdmin
```bash
# Start Backend, PostgreSQL 16, and pgAdmin 4 in containers
docker compose up -d

# Run database schema & data migration
docker exec ksm-backend npm run migrate
```

Access points:
- **Backend API:** `http://localhost:5000/api`
- **Health Check:** `http://localhost:5000/api/health`
- **pgAdmin 4 GUI:** `http://localhost:5050` (Configured via `docker-compose.yml` / `.env`)

### 🔑 1-Click AWS EC2 Deployment via Private PEM Key
```powershell
# Windows PowerShell
.\scripts\deploy-ec2.ps1 -PemKeyPath "C:\path\to\your-key.pem" -Ec2Host "<EC2-PUBLIC-IP>"

# Linux / macOS
./scripts/deploy-ec2.sh /path/to/your-key.pem <EC2-PUBLIC-IP>
```
