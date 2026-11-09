import React from 'react';
import { generateReceiptLetterheadHtml, openReceiptLetterhead, downloadReceiptLetterheadFile } from '../utils/receiptGenerator';

function ReceiptModal({ donation, onClose }) {
  if (!donation) return null;

  const htmlContent = generateReceiptLetterheadHtml(donation);

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-modal-title"
      style={{ zIndex: 1100 }}
    >
      <div 
        className="modal" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '920px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0 }}
      >
        {/* Modal Top Action Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          borderTopLeftRadius: 'var(--radius-lg)',
          borderTopRightRadius: 'var(--radius-lg)'
        }}>
          <div>
            <h2 id="receipt-modal-title" style={{ fontSize: '1.05rem', margin: 0, color: 'var(--primary)' }}>
              Official Letterhead Receipt
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {donation.receiptNumber || `Receipt #${donation.id || ''}`} &bull; {donation.donorName || 'Devotee'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button 
              type="button" 
              className="btn btn-sm btn-primary"
              onClick={() => openReceiptLetterhead(donation)}
              title="Print letterhead receipt or save as PDF"
            >
              Print / Save PDF
            </button>
            <button 
              type="button" 
              className="btn btn-sm btn-outline"
              onClick={() => downloadReceiptLetterheadFile(donation)}
              title="Download HTML letterhead receipt file"
            >
              Download File
            </button>
            <button 
              type="button" 
              className="modal-close-btn" 
              onClick={onClose}
              aria-label="Close dialog"
              style={{ position: 'static', margin: 0 }}
            >
              &times;
            </button>
          </div>
        </div>

        {/* Live Scrollable Letterhead Preview */}
        <div style={{ flex: 1, overflowY: 'auto', background: '#525659', padding: '16px', display: 'flex', justifyContent: 'center' }}>
          <iframe 
            srcDoc={htmlContent}
            title="Temple Letterhead Receipt Preview"
            style={{
              width: '100%',
              maxWidth: '820px',
              height: '750px',
              border: 'none',
              borderRadius: '4px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              background: '#FFFFFF'
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default ReceiptModal;
