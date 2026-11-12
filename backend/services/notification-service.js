/**
 * Kolar Sringeri SriShankara Mutt
 * Admin Notification & Approval Service
 * Handles Admin Email alerts, Mobile App notification dispatch, and Token Verification
 */

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const NOTIFICATIONS_FILE = path.join(__dirname, '..', 'data', 'notifications.json');
const SECRET_KEY = process.env.JWT_SECRET || 'ksm_temple_secret_key_2024';

// Helper to read notifications
function getStoredNotifications() {
  try {
    if (!fs.existsSync(NOTIFICATIONS_FILE)) return [];
    const raw = fs.readFileSync(NOTIFICATIONS_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('Error reading notifications file:', err.message);
    return [];
  }
}

// Helper to save notifications
function saveStoredNotifications(list) {
  try {
    const dir = path.dirname(NOTIFICATIONS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving notifications file:', err.message);
  }
}

// Generate secure approval token for a donation
function generateApprovalToken(donationId) {
  return crypto.createHmac('sha256', SECRET_KEY).update(String(donationId)).digest('hex').slice(0, 32);
}

// Verify approval token
function verifyApprovalToken(donationId, token) {
  const expected = generateApprovalToken(donationId);
  return token === expected;
}

// Create Nodemailer Transporter
function getTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  // Default mock transporter (logs to console if SMTP not configured)
  return null;
}

/**
 * Dispatch notification to Admin via Email & Mobile App Queue
 */
async function notifyAdminNewDonation(donation, reqHost) {
  const token = generateApprovalToken(donation.id);
  const serverHost = reqHost || process.env.PUBLIC_HOST || '15.206.128.103';
  const protocol = process.env.NODE_ENV === 'production' && !serverHost.startsWith('localhost') ? 'http' : 'http';
  const approvalUrl = `${protocol}://${serverHost}/api/donations/email-approve?id=${encodeURIComponent(donation.id)}&token=${token}`;
  const adminPortalUrl = `${protocol}://${serverHost}/admin`;

  const isCash = (donation.paymentMethod || '').toLowerCase().includes('cash');
  const paymentModeLabel = isCash ? 'Cash Payment / ನಗದು' : 'UPI Payment';
  const detailHighlight = isCash
    ? `Cash Receipt #${donation.cashReceiptNumber || 'N/A'}, Received By: ${donation.receivedBy || 'Staff'}`
    : `Transaction ID: ${donation.transactionId || 'Pending Devotee Submission'}`;

  const notificationItem = {
    id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    donationId: donation.id,
    type: 'NEW_DONATION_PENDING',
    title: `🔔 New Seva Offering (${paymentModeLabel}): ₹${parseFloat(donation.amount || 0).toLocaleString('en-IN')}`,
    message: `${donation.donorName || 'Devotee'} offered ₹${parseFloat(donation.amount || 0).toLocaleString('en-IN')} for ${donation.purpose || 'General Seva'} via ${paymentModeLabel}. ${detailHighlight}. Awaiting admin verification.`,
    donorName: donation.donorName || 'Devotee',
    amount: parseFloat(donation.amount || 0),
    purpose: donation.purpose || 'General Seva',
    paymentMethod: donation.paymentMethod || (isCash ? 'Cash Payment' : 'UPI Payment'),
    transactionId: donation.transactionId || null,
    cashReceiptNumber: donation.cashReceiptNumber || null,
    receivedBy: donation.receivedBy || null,
    paymentDate: donation.paymentDate || donation.date,
    amountReceived: donation.amountReceived || donation.amount,
    remarks: donation.remarks || null,
    phone: donation.phone || 'N/A',
    email: donation.email || 'N/A',
    approvalToken: token,
    approvalUrl,
    approvalStatus: 'pending',
    read: false,
    createdAt: new Date().toISOString(),
  };

  // 1. Store in notifications list for Mobile App & Admin Portal
  const list = getStoredNotifications();
  list.unshift(notificationItem);
  saveStoredNotifications(list.slice(0, 100)); // Keep latest 100

  // 2. Prepare & Send Admin Email
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@kolarshankaramutt.org';
  const mailSubject = `🔔 [ACTION REQUIRED] Verify ${paymentModeLabel}: ₹${parseFloat(donation.amount || 0).toLocaleString('en-IN')} from ${donation.donorName || 'Devotee'}`;
  
  const modeSpecificRows = isCash ? `
    <tr>
      <td class="label">Cash Receipt Number:</td>
      <td><strong style="color: #8B1E0F; font-size: 1.05rem;">${donation.cashReceiptNumber || 'N/A'}</strong></td>
    </tr>
    <tr>
      <td class="label">Amount Received:</td>
      <td><strong>₹${parseFloat(donation.amountReceived || donation.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
    </tr>
    <tr>
      <td class="label">Received By (Staff / Authority):</td>
      <td><strong>${donation.receivedBy || 'Mutt Office Staff'}</strong></td>
    </tr>
    <tr>
      <td class="label">Payment Date:</td>
      <td>${donation.paymentDate || donation.date || 'N/A'}</td>
    </tr>
    ${donation.remarks ? `
    <tr>
      <td class="label">Remarks / Notes:</td>
      <td>${donation.remarks}</td>
    </tr>` : ''}
  ` : `
    <tr>
      <td class="label">UPI Transaction ID / UTR:</td>
      <td><code style="font-size: 1rem; font-weight: bold; color: #8B1E0F;">${donation.transactionId || 'Awaiting devotee submission'}</code></td>
    </tr>
  `;

  const mailHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #F8F4EE; color: #2A180D; margin: 0; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 2px solid #D4AF37; border-radius: 8px; overflow: hidden; }
      .header { background: #8B1E0F; color: #FFF; padding: 20px; text-align: center; border-bottom: 3px solid #D4AF37; }
      .header h1 { margin: 0 0 6px 0; font-size: 1.25rem; letter-spacing: 1px; color: #FEE7A6; }
      .header p { margin: 0; font-size: 0.85rem; opacity: 0.9; }
      .content { padding: 24px; line-height: 1.6; }
      .alert-badge { display: inline-block; background: #FEF3C7; color: #B45309; padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 0.85rem; margin-bottom: 16px; border: 1px solid #F59E0B; }
      .detail-table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 0.9rem; }
      .detail-table td { padding: 8px 12px; border: 1px solid #EBDDC1; }
      .detail-table td.label { background: #FDF9F2; font-weight: 600; color: #555; width: 35%; }
      .btn-container { text-align: center; margin: 26px 0 16px 0; }
      .approve-btn { background: #16A34A; color: #FFFFFF !important; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; font-size: 1rem; display: inline-block; box-shadow: 0 4px 10px rgba(22, 163, 74, 0.3); }
      .admin-link { display: block; margin-top: 14px; color: #8B1E0F; font-size: 0.85rem; text-decoration: underline; }
      .footer { background: #2A180D; color: #D4AF37; text-align: center; padding: 12px; font-size: 0.78rem; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>॥ ಕೋಲಾರ ಶೃಂಗೇರಿ ಶ್ರೀಶಂಕರ ಮಠ ॥</h1>
        <p>Devotee Seva Offering Verification Request (${paymentModeLabel})</p>
      </div>
      <div class="content">
        <span class="alert-badge">⏳ Pending Admin Verification &amp; Approval</span>
        <p>A devotee has recorded a seva offering through the portal using <strong>${paymentModeLabel}</strong>. Please verify the payment details and approve the offering to generate the official letterhead receipt.</p>
        
        <table class="detail-table">
          <tr>
            <td class="label">Devotee Name:</td>
            <td><strong>${donation.donorName || 'Devotee'}</strong></td>
          </tr>
          <tr>
            <td class="label">Contribution Amount:</td>
            <td><strong style="color: #16A34A; font-size: 1.15rem;">₹${parseFloat(donation.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
          </tr>
          <tr>
            <td class="label">Payment Mode:</td>
            <td><strong style="color: #8B1E0F;">${paymentModeLabel}</strong></td>
          </tr>
          ${modeSpecificRows}
          <tr>
            <td class="label">Seva Purpose:</td>
            <td>${donation.purpose || 'General Seva'}</td>
          </tr>
          <tr>
            <td class="label">Devotee Phone:</td>
            <td>${donation.phone || 'N/A'}</td>
          </tr>
          <tr>
            <td class="label">Devotee Email:</td>
            <td>${donation.email || 'N/A'}</td>
          </tr>
          <tr>
            <td class="label">Submission Date:</td>
            <td>${donation.date || new Date().toISOString().split('T')[0]}</td>
          </tr>
        </table>

        <div class="btn-container">
          <a href="${approvalUrl}" class="approve-btn" target="_blank">
            ✓ Click Here to Verify &amp; Generate Official Receipt
          </a>
          <a href="${adminPortalUrl}" class="admin-link">
            Or Open Admin Dashboard to Review
          </a>
        </div>
        
        <p style="font-size: 0.8rem; color: #666; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
          Note: Until you click the approval link above or approve through the Admin Dashboard / Admin Mobile App, <strong>no receipt is generated or issued to the devotee</strong>.
        </p>
      </div>
      <div class="footer">
        Kolar Sringeri SriShankara Mutt &bull; Kote, Kolar, Karnataka
      </div>
    </div>
  </body>
  </html>
  `;

  const transporter = getTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"KSM Temple Portal" <${process.env.SMTP_USER || 'no-reply@kolarshankaramutt.org'}>`,
        to: adminEmail,
        subject: mailSubject,
        html: mailHtml,
      });
      console.log(`[Notification] Admin email dispatched to ${adminEmail} for donation ${donation.id}`);
    } catch (err) {
      console.warn(`[Notification] Failed to send email via SMTP (${err.message}). Notification saved in queue.`);
    }
  } else {
    console.log(`[Notification] SMTP not configured. Notification queued for Admin. Direct Approval URL: ${approvalUrl}`);
  }

  return notificationItem;
}

module.exports = {
  getStoredNotifications,
  saveStoredNotifications,
  generateApprovalToken,
  verifyApprovalToken,
  notifyAdminNewDonation,
};

