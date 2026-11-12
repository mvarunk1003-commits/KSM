/**
 * Official Letterhead Receipt Generator
 * Kolar Sringeri SriShankara Mutt
 * Branch of Dakshinamnaya Sringeri Sri Sharada Peetham
 */

import { TEMPLE_INFO, BANK_DETAILS } from '../config/templeConfig';

// Convert integer/float to Indian currency words
export function numberToIndianWords(num) {
  const n = Math.floor(Number(num) || 0);
  if (n === 0) return 'Zero Rupees Only';

  const single = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(v) {
    if (v < 10) return single[v];
    if (v >= 10 && v < 20) return teens[v - 10];
    return tens[Math.floor(v / 10)] + (v % 10 !== 0 ? ' ' + single[v % 10] : '');
  }

  function convertThreeDigits(v) {
    const hundred = Math.floor(v / 100);
    const remainder = v % 100;
    let res = '';
    if (hundred > 0) res += single[hundred] + ' Hundred';
    if (remainder > 0) res += (res ? ' ' : '') + convertTwoDigits(remainder);
    return res;
  }

  let words = '';
  let crore = Math.floor(n / 10000000);
  let remCrore = n % 10000000;
  let lakh = Math.floor(remCrore / 100000);
  let remLakh = remCrore % 100000;
  let thousand = Math.floor(remLakh / 1000);
  let hundreds = remLakh % 1000;

  if (crore > 0) words += convertTwoDigits(crore) + ' Crore ';
  if (lakh > 0) words += convertTwoDigits(lakh) + ' Lakh ';
  if (thousand > 0) words += convertTwoDigits(thousand) + ' Thousand ';
  if (hundreds > 0) words += convertThreeDigits(hundreds);

  return (words.trim() + ' Rupees Only');
}

/**
 * Generates the full HTML markup for the Temple Banner Letterhead Receipt
 */
export function generateReceiptLetterheadHtml(donation) {
  const receiptNo = donation.receiptNumber || `KSM/SEVA/${new Date().getFullYear()}/${String(donation.id || Date.now()).slice(-5)}`;
  const dateStr = donation.date
    ? new Date(donation.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const amountNum = parseFloat(donation.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const amountWords = numberToIndianWords(donation.amount);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Official Seva Receipt - ${receiptNo}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Noto+Serif+Kannada:wght@500;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      background: #F4EFEA;
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #2A180D;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 16px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Print Controls Bar (Screen Only) */
    .screen-controls {
      background: #2A180D;
      color: #F8F4EE;
      width: 100%;
      max-width: 820px;
      padding: 12px 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .screen-controls .brand {
      font-weight: 700;
      font-size: 0.95rem;
      letter-spacing: 0.5px;
      color: #D4AF37;
    }
    .screen-controls .btn-group {
      display: flex;
      gap: 10px;
    }
    .screen-btn {
      background: #D4AF37;
      color: #2A180D;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .screen-btn:hover {
      background: #E5C358;
    }
    .screen-btn.secondary {
      background: rgba(255,255,255,0.15);
      color: #FFFFFF;
      border: 1px solid rgba(255,255,255,0.3);
    }
    .screen-btn.secondary:hover {
      background: rgba(255,255,255,0.25);
    }

    /* Letterhead Sheet (A4 Dimensions) */
    .receipt-sheet {
      width: 100%;
      max-width: 820px;
      background: #FFFFFF;
      border: 2px solid #D4AF37;
      border-radius: 4px;
      box-shadow: 0 10px 30px rgba(42, 24, 13, 0.12);
      position: relative;
      overflow: hidden;
      padding: 0;
    }

    /* Temple Crest & Peetham Inscription */
    .peetham-header {
      padding: 24px 28px 20px 28px;
      background: linear-gradient(180deg, #FFFDF9 0%, #FAF6EE 100%);
      border-top: 4px solid #D4AF37;
      border-bottom: 2px solid #E6D7B8;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }
    .peetham-seal {
      width: 88px;
      height: 88px;
      border-radius: 50%;
      box-shadow: 0 4px 14px rgba(184, 134, 11, 0.25);
      border: 2px solid #D4AF37;
      flex-shrink: 0;
      object-fit: cover;
    }
    .peetham-titles {
      flex: 1;
      text-align: center;
    }
    .peetham-kannada {
      font-family: 'Noto Serif Kannada', serif;
      font-size: 1.15rem;
      font-weight: 700;
      color: #8B1E0F;
      margin-bottom: 2px;
      letter-spacing: 0.3px;
    }
    .peetham-lineage {
      font-family: 'Cinzel', serif;
      font-size: 0.78rem;
      font-weight: 700;
      color: #9C721D;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .peetham-name {
      font-family: 'Cinzel', serif;
      font-size: 1.35rem;
      font-weight: 800;
      color: #2A180D;
      letter-spacing: 0.8px;
      margin-bottom: 4px;
    }
    .peetham-contact {
      font-size: 0.8rem;
      color: #555555;
      line-height: 1.4;
    }
    .peetham-shloka {
      font-family: 'Noto Serif Kannada', serif;
      font-size: 0.85rem;
      font-weight: 700;
      color: #8B1E0F;
      margin-top: 4px;
      letter-spacing: 0.5px;
    }

    /* Receipt Title Ribbon */
    .receipt-title-ribbon {
      background: linear-gradient(90deg, #8B1E0F 0%, #A92614 50%, #8B1E0F 100%);
      color: #FFFFFF;
      text-align: center;
      padding: 10px 16px;
      border-top: 1px solid #D4AF37;
      border-bottom: 1px solid #D4AF37;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .ribbon-title {
      font-family: 'Cinzel', serif;
      font-size: 1.15rem;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: #FEE7A6;
      text-shadow: 0 1px 2px rgba(0,0,0,0.4);
    }
    .ribbon-kannada {
      font-family: 'Noto Serif Kannada', serif;
      font-size: 0.95rem;
      font-weight: 700;
      color: #FFF3D6;
    }

    /* Metadata Bar */
    .receipt-meta-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      padding: 10px 28px;
      background: #FDFBF7;
      border-bottom: 1px solid #EBDDC1;
      font-size: 0.82rem;
    }
    .meta-item {
      display: flex;
      flex-direction: column;
    }
    .meta-label {
      color: #777777;
      font-size: 0.72rem;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    .meta-val {
      font-weight: 700;
      color: #2A180D;
    }

    /* Content Body */
    .receipt-body {
      padding: 24px 28px;
      position: relative;
    }

    /* Traditional Watermark */
    .receipt-watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 280px;
      color: rgba(212, 175, 55, 0.04);
      font-weight: 900;
      pointer-events: none;
      z-index: 0;
      user-select: none;
    }

    /* Devotee & Seva Detail Tables */
    .receipt-section-title {
      font-family: 'Cinzel', serif;
      font-size: 0.85rem;
      font-weight: 700;
      color: #8B1E0F;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .receipt-section-title::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #E6D7B8;
    }

    .detail-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      position: relative;
      z-index: 1;
    }
    .detail-table td {
      padding: 8px 12px;
      font-size: 0.88rem;
      border: 1px solid #EFE4CE;
    }
    .detail-table td.col-label {
      background: #FDF9F2;
      color: #555555;
      font-weight: 600;
      width: 28%;
    }
    .detail-table td.col-val {
      color: #2A180D;
      font-weight: 500;
    }
    .detail-table td.col-val strong {
      color: #1A0F08;
      font-weight: 700;
    }

    /* Grand Amount Display Box */
    .amount-highlight-box {
      margin: 20px 0;
      padding: 16px 20px;
      background: linear-gradient(135deg, #FFFDF8 0%, #FAF3E3 100%);
      border: 2px solid #D4AF37;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 1;
    }
    .amount-left .amount-label {
      font-size: 0.78rem;
      text-transform: uppercase;
      font-weight: 700;
      color: #8B1E0F;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .amount-left .amount-words {
      font-size: 0.95rem;
      font-weight: 700;
      color: #2A180D;
      font-style: italic;
    }
    .amount-right {
      text-align: right;
    }
    .amount-currency {
      font-family: 'Cinzel', serif;
      font-size: 1.85rem;
      font-weight: 800;
      color: #8B1E0F;
      letter-spacing: 0.5px;
    }

    /* Sacred Blessings & Benediction */
    .benediction-box {
      margin: 18px 0;
      padding: 14px 18px;
      background: #FDFBF7;
      border-left: 4px solid #D4AF37;
      border-radius: 0 4px 4px 0;
      font-size: 0.85rem;
      color: #4A3525;
      line-height: 1.6;
      position: relative;
      z-index: 1;
    }
    .benediction-box strong {
      color: #8B1E0F;
    }

    /* Signature & Seal Signoff Section */
    .signoff-section {
      margin-top: 32px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      position: relative;
      z-index: 1;
      padding-top: 12px;
    }
    .signoff-left {
      max-width: 320px;
      font-size: 0.76rem;
      color: #666666;
      line-height: 1.5;
    }
    .signoff-right {
      text-align: center;
      min-width: 220px;
    }
    .signature-line {
      border-top: 1.5px solid #2A180D;
      margin-top: 48px;
      padding-top: 6px;
    }
    .signatory-title {
      font-family: 'Cinzel', serif;
      font-weight: 700;
      font-size: 0.85rem;
      color: #2A180D;
    }
    .signatory-sub {
      font-size: 0.72rem;
      color: #777777;
    }

    /* Letterhead Bottom Footer Ribbon */
    .letterhead-bottom-ribbon {
      background: #1F140D;
      color: #E2D3B8;
      text-align: center;
      padding: 8px 16px;
      font-size: 0.75rem;
      letter-spacing: 0.5px;
      border-top: 2px solid #D4AF37;
      margin-top: 24px;
    }

    /* Print Optimization Rules */
    @media print {
      body {
        background: transparent;
        padding: 0;
      }
      .screen-controls {
        display: none !important;
      }
      .receipt-sheet {
        border: none;
        box-shadow: none;
        max-width: 100%;
        width: 100%;
      }
      @page {
        size: A4 portrait;
        margin: 8mm;
      }
    }
  </style>
</head>
<body>

  <!-- Screen Action Bar (Hidden when Printing) -->
  <div class="screen-controls" role="toolbar" aria-label="Receipt Actions">
    <div class="brand">Kolar Sringeri SriShankara Mutt • Receipt</div>
    <div class="btn-group">
      <button class="screen-btn" onclick="window.print()">
        Print / Save PDF
      </button>
      <button class="screen-btn secondary" onclick="window.close()">
        Close
      </button>
    </div>
  </div>

  <!-- A4 Letterhead Sheet -->
  <div class="receipt-sheet">


    <!-- Official Peetham Heading with Seal -->
    <div class="peetham-header">
      <img 
        src="${TEMPLE_INFO.sealImage}" 
        alt="Sringeri Peetham Sacred Seal" 
        class="peetham-seal"
        onerror="this.style.display='none'"
      />
      <div class="peetham-titles">
        <div class="peetham-kannada">${TEMPLE_INFO.lineageKannada}</div>
        <div class="peetham-lineage">${TEMPLE_INFO.lineage}</div>
        <h1 class="peetham-name">${TEMPLE_INFO.name}</h1>
        <div class="peetham-contact">
          ${TEMPLE_INFO.addressFull} &bull; Helpline: ${TEMPLE_INFO.phone} &bull; Email: ${TEMPLE_INFO.email}
        </div>
        <div class="peetham-shloka">${TEMPLE_INFO.shloka}</div>
      </div>
      <img 
        src="${TEMPLE_INFO.sealImage}" 
        alt="Sringeri Peetham Sacred Seal" 
        class="peetham-seal"
        onerror="this.style.display='none'"
      />
    </div>

    <!-- Official Receipt Title Ribbon -->
    <div class="receipt-title-ribbon">
      <div class="ribbon-kannada">ಕಾಣಿಕೆ ರಸೀದಿ</div>
      <div class="ribbon-title">OFFICIAL SEVA &amp; DONATION RECEIPT</div>
      <div class="ribbon-kannada">ಸೇವೆ</div>
    </div>

    <!-- Metadata Bar -->
    <div class="receipt-meta-bar">
      <div class="meta-item">
        <span class="meta-label">Receipt Number</span>
        <span class="meta-val">${receiptNo}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Date of Offering</span>
        <span class="meta-val">${dateStr}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Financial Year</span>
        <span class="meta-val">${new Date().getFullYear()} &ndash; ${new Date().getFullYear() + 1}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Verification Status</span>
        <span class="meta-val" style="color: #2E7D32;">Confirmed &bull; Approved</span>
      </div>
    </div>

    <!-- Receipt Body Content -->
    <div class="receipt-body">
            <!-- Devotee Information -->
      <div class="receipt-section-title">Devotee Information / ಭಕ್ತರ ವಿವರ</div>
      <table class="detail-table">
        <tbody>
          <tr>
            <td class="col-label">Devotee / Contributor:</td>
            <td class="col-val"><strong>Sri / Smt. ${donation.donorName || 'Devotee'}</strong></td>
          </tr>
          <tr>
            <td class="col-label">Mobile / Phone:</td>
            <td class="col-val">${donation.phone || 'N/A'}</td>
          </tr>
          <tr>
            <td class="col-label">Email Address:</td>
            <td class="col-val">${donation.email || 'N/A'}</td>
          </tr>
          <tr>
            <td class="col-label">Postal Address:</td>
            <td class="col-val">${donation.address || 'Kolar / Karnataka / India'}</td>
          </tr>
        </tbody>
      </table>

      <!-- Seva & Offering Details -->
      <div class="receipt-section-title">Seva Offering Details / ಸೇವಾ ವಿವರ</div>
      <table class="detail-table">
        <tbody>
          <tr>
            <td class="col-label">Seva / Purpose:</td>
            <td class="col-val"><strong>${donation.purpose || 'General Seva & Temple Fund'}</strong></td>
          </tr>
          <tr>
            <td class="col-label">Payment Mode:</td>
            <td class="col-val">${donation.paymentMethod || 'UPI Payment'}</td>
          </tr>
          <tr>
            <td class="col-label">Transaction Reference:</td>
            <td class="col-val">${donation.transactionRef || receiptNo}</td>
          </tr>
          <tr>
            <td class="col-label">Offering Time:</td>
            <td class="col-val">${timeStr} IST</td>
          </tr>
        </tbody>
      </table>

      <!-- Grand Amount Highlight Box -->
      <div class="amount-highlight-box">
        <div class="amount-left">
          <div class="amount-label">Total Contribution Amount</div>
          <div class="amount-words">${amountWords}</div>
        </div>
        <div class="amount-right">
          <div class="amount-currency">&#8377; ${amountNum}</div>
        </div>
      </div>

      <!-- Bank Transfer Details -->
      <div class="receipt-section-title">Bank Transfer Details / ಬ್ಯಾಂಕ್ ವಿವರ</div>
      <table class="detail-table">
        <tbody>
          <tr>
            <td class="col-label">Account Name:</td>
            <td class="col-val"><strong>${BANK_DETAILS.accountName}</strong></td>
          </tr>
          <tr>
            <td class="col-label">Account Number:</td>
            <td class="col-val"><strong>${BANK_DETAILS.accountNumber}</strong></td>
          </tr>
          <tr>
            <td class="col-label">IFSC Code:</td>
            <td class="col-val">${BANK_DETAILS.ifsc}</td>
          </tr>
          <tr>
            <td class="col-label">Bank &amp; Branch:</td>
            <td class="col-val">${BANK_DETAILS.bankName}, ${BANK_DETAILS.branch}</td>
          </tr>
        </tbody>
      </table>

      <!-- Sacred Benediction -->
      <div class="benediction-box">
        <strong>॥ ಆಶೀರ್ವಚನ &bull; Sacred Peetham Benediction ॥</strong><br />
        May the divine grace and supreme blessings of Jagadguru Sri Adi Shankaracharya and Goddess Sri Sharadamba bestow good health, longevity, righteous prosperity, and spiritual peace upon you and your entire family.
      </div>

      <!-- Signoff and Seal -->
      <div class="signoff-section">
        <div class="signoff-left">
          <p><strong>Official Digital Receipt:</strong> This is a computer-verified, system-authenticated record issued under the authority of ${TEMPLE_INFO.name}.</p>
          <p style="margin-top: 4px;">Donations utilized towards religious poojas, Annadanam, and Veda Pathashala activities.</p>
        </div>
        <div class="signoff-right">
          <div class="signature-line">
            <div class="signatory-title">Authorized Signatory / Dharmadhikari</div>
            <div class="signatory-sub">${TEMPLE_INFO.name}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Ribbon -->
    <div class="letterhead-bottom-ribbon">
      ॥ ಶ್ರೀ ಶಾರದಾಂಬಾ ಸನ್ನಿಧಿ &bull; ${TEMPLE_INFO.name} &bull; ${TEMPLE_INFO.website} ॥
    </div>

  </div>

</body>
</html>`;
}

/**
 * Opens a print-ready window with the Letterhead Receipt
 */
export function openReceiptLetterhead(donation) {
  const html = generateReceiptLetterheadHtml(donation);
  const printWindow = window.open('', '_blank', 'width=880,height=960,menubar=no,toolbar=no,location=no');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    // Fallback: direct download if popup blocked
    downloadReceiptLetterheadFile(donation);
  }
}

/**
 * Downloads the Letterhead Receipt as an HTML file
 */
export function downloadReceiptLetterheadFile(donation) {
  const html = generateReceiptLetterheadHtml(donation);
  const receiptNo = donation.receiptNumber || `KSM-SEVA-${donation.id || Date.now()}`;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Receipt-${receiptNo.replace(/[^a-zA-Z0-9_-]/g, '_')}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
