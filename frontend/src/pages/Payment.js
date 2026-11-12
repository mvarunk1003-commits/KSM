import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import API_BASE from '../config/api';
import { TEMPLE_INFO, BANK_DETAILS } from '../config/templeConfig';

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData;

  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [acknowledgmentData, setAcknowledgmentData] = useState(null);

  // If no formData was passed, redirect back to donation page
  useEffect(() => {
    if (!formData) {
      navigate('/donation', { replace: true });
    }
  }, [formData, navigate]);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      setError('Please enter the Transaction ID / UTR Number after completing the payment.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const donationPayload = {
        ...formData,
        date: new Date().toISOString().split('T')[0],
        amount: parseFloat(formData.amount),
        transactionId: transactionId.trim(),
        status: 'pending', // Pending verification and approval from admin
      };

      const response = await fetch(`${API_BASE}/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donationPayload),
      });

      if (response.ok) {
        const savedDonation = await response.json();
        setAcknowledgmentData({
          ackNumber: `KSM-ACK-${String(savedDonation.id || Date.now()).slice(-6)}`,
          donorName: formData.donorName,
          amount: parseFloat(formData.amount),
          purpose: formData.purpose,
          paymentMethod: formData.paymentMethod,
          transactionId: transactionId.trim(),
          phone: formData.phone,
          email: formData.email,
          date: new Date().toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Failed to record donation. Please try again.');
      }
    } catch (err) {
      console.error('Error recording donation:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!formData) return null;

  return (
    <div>
      <Header />

      <main id="main-content" className="container" role="main">
        <section className="section" aria-labelledby="payment-page-heading">
          <div className="section-header">
            <div>
              <h1 id="payment-page-heading" className="section-title">
                Complete Your Payment
              </h1>
              <p className="section-subtitle">
                Scan the QR code below to complete your seva contribution of{' '}
                <strong>₹{parseFloat(formData.amount).toLocaleString('en-IN')}</strong>
              </p>
            </div>
          </div>

          <div className="grid grid-2" style={{ alignItems: 'start' }}>
            {/* Left: QR + UPI Details */}
            <article className="card" aria-label="UPI Payment QR Code">
              <header className="card-header">
                <h2 className="card-title">Scan &amp; Pay via UPI</h2>
              </header>
              <div
                className="card-content"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}
              >
                {/* Amount Badge */}
                <div
                  style={{
                    background: 'var(--primary-subtle)',
                    border: '2px solid var(--primary)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 24px',
                    textAlign: 'center',
                    width: '100%',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: 1 }}>
                    AMOUNT TO PAY
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: 1 }}>
                    ₹{parseFloat(formData.amount).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{formData.purpose}</div>
                </div>

                {/* QR Code Image */}
                <div
                  style={{
                    border: '3px solid var(--primary)',
                    borderRadius: '12px',
                    padding: '12px',
                    background: '#fff',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
                  }}
                >
                  <img
                    src={BANK_DETAILS.qrImage}
                    alt={`UPI Payment QR Code for ${TEMPLE_INFO.name}`}
                    style={{ width: '220px', height: '220px', display: 'block', objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  {/* Fallback if QR image missing */}
                  <div
                    style={{
                      display: 'none',
                      width: '220px',
                      height: '220px',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      background: '#f9f9f9',
                      borderRadius: '8px',
                      color: '#888',
                      fontSize: '0.85rem',
                      textAlign: 'center',
                      gap: '8px',
                    }}
                  >
                    <span style={{ fontSize: '2rem' }}>📷</span>
                    <span>QR Code<br />Not Available</span>
                  </div>
                </div>

                {/* Bank / Transfer Details */}
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Bank Transfer Details / ಬ್ಯಾಂಕ್ ವಿವರ
                  </div>
                  <div
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '12px 16px',
                      fontSize: '0.88rem',
                      lineHeight: 1.9,
                      color: 'var(--text-primary)',
                    }}
                  >
                    <div><strong>ಖಾತೆ ಹೆಸರು:</strong> {BANK_DETAILS.accountName}</div>
                    <div><strong>ಖಾತೆ ಸಂಖ್ಯೆ:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)', letterSpacing: 1 }}>{BANK_DETAILS.accountNumber}</span></div>
                    <div><strong>IFSC:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{BANK_DETAILS.ifsc}</span></div>
                    <div><strong>ಬ್ಯಾಂಕ್:</strong> {BANK_DETAILS.bankName}, {BANK_DETAILS.branch}</div>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                    Accepted: {BANK_DETAILS.acceptedModes}
                  </div>
                </div>

                {/* Donation Summary */}
                <div
                  style={{
                    width: '100%',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 16px',
                    fontSize: '0.85rem',
                    lineHeight: 1.9,
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: '4px', color: 'var(--primary)' }}>
                    Donation Summary
                  </div>
                  <div><strong>Name:</strong> {formData.donorName}</div>
                  <div><strong>Purpose:</strong> {formData.purpose}</div>
                  <div><strong>Payment Mode:</strong> {formData.paymentMethod}</div>
                </div>
              </div>
            </article>

            {/* Right: Transaction ID Entry */}
            <article className="card" aria-label="Enter transaction ID">
              <header className="card-header">
                <h2 className="card-title">Confirm Payment</h2>
              </header>
              <div className="card-content">
                {/* Steps */}
                <ol
                  style={{
                    paddingLeft: '1.25rem',
                    lineHeight: 2.2,
                    color: 'var(--text-secondary)',
                    marginBottom: '24px',
                    fontSize: '0.9rem',
                  }}
                >
                  <li>Open your UPI app (GPay, PhonePe, Paytm, BHIM)</li>
                  <li>Scan the QR code <strong>or</strong> transfer to {BANK_DETAILS.bankName} A/C <code>{BANK_DETAILS.accountNumber}</code></li>
                  <li>
                    Enter amount <strong>₹{parseFloat(formData.amount).toLocaleString('en-IN')}</strong> and
                    complete payment
                  </li>
                  <li>
                    Copy the <strong>Transaction ID / UTR Number</strong> from your UPI app
                  </li>
                  <li>Paste it below and click <strong>Submit for Verification</strong></li>
                </ol>

                {error && (
                  <div className="message error" role="alert" aria-live="assertive" style={{ marginBottom: '16px' }}>
                    <span>{error}</span>
                  </div>
                )}

                {acknowledgmentData ? (
                  /* Official Offering Submission Acknowledgment — No Delay, No Early Receipt */
                  <div>
                    <div
                      style={{
                        background: '#ffffff',
                        border: '2px solid #D4AF37',
                        borderRadius: 'var(--radius-sm)',
                        padding: '24px 22px',
                        boxShadow: '0 4px 18px rgba(0,0,0,0.08)',
                        marginBottom: '16px'
                      }}
                    >
                      {/* Header Badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div
                          style={{
                            background: '#FEF3C7',
                            color: '#B45309',
                            width: '46px',
                            height: '46px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            border: '1px solid #F59E0B',
                            flexShrink: 0
                          }}
                        >
                          ⏳
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#8B1E0F', fontWeight: 800 }}>
                            Offering Submitted for Verification
                          </h3>
                          <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            ಕಾಣಿಕೆ ವಿವರಗಳನ್ನು ಸ್ವೀಕರಿಸಲಾಗಿದೆ &bull; ಆಡಳಿತ ಮಂಡಳಿಯ ಅನುಮೋದನೆ ಬಾಕಿ ಇದೆ
                          </p>
                        </div>
                      </div>

                      {/* Summary Table */}
                      <div
                        style={{
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '14px 18px',
                          fontSize: '0.88rem',
                          lineHeight: '2',
                          marginBottom: '18px'
                        }}
                      >
                        <div><strong>Acknowledgement Ref:</strong> <span style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 700 }}>{acknowledgmentData.ackNumber}</span></div>
                        <div><strong>Devotee / Contributor:</strong> {acknowledgmentData.donorName}</div>
                        <div><strong>Offering Amount:</strong> <strong style={{ color: '#16A34A', fontSize: '1.1rem' }}>₹{acknowledgmentData.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></div>
                        <div><strong>Transaction ID / UTR:</strong> <code style={{ fontWeight: 700, color: '#8B1E0F', fontSize: '0.95rem' }}>{acknowledgmentData.transactionId}</code></div>
                        <div><strong>Seva Purpose:</strong> {acknowledgmentData.purpose}</div>
                        <div><strong>Payment Mode:</strong> {acknowledgmentData.paymentMethod}</div>
                        <div><strong>Submission Date:</strong> {acknowledgmentData.date}</div>
                        <div>
                          <strong>Verification Status:</strong>{' '}
                          <span style={{ color: '#D97706', fontWeight: 700, background: '#FEF3C7', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                            🟡 Pending Admin Approval
                          </span>
                        </div>
                      </div>

                      {/* Notification Dispatch Notice */}
                      <div
                        style={{
                          background: '#F0FDF4',
                          border: '1px solid #BBF7D0',
                          borderRadius: '6px',
                          padding: '12px 16px',
                          fontSize: '0.85rem',
                          color: '#166534',
                          marginBottom: '16px',
                          lineHeight: '1.6'
                        }}
                      >
                        <strong>🔔 Admin Notification Dispatched:</strong> An instant notification with your transaction details has been transmitted to the Temple Administration via <strong>Admin Email</strong> and the <strong>Admin Mobile App</strong> for prompt verification.
                      </div>

                      {/* Strict Policy on Receipts */}
                      <div
                        style={{
                          padding: '14px 16px',
                          background: '#FFFBEB',
                          borderLeft: '4px solid #D97706',
                          borderRadius: '0 4px 4px 0',
                          fontSize: '0.84rem',
                          color: '#92400E',
                          lineHeight: '1.7',
                          marginBottom: '20px'
                        }}
                      >
                        <strong>🔒 ರಸೀದಿ ಬಿಡುಗಡೆ ಕುರಿತು / Official Receipt Policy:</strong><br />
                        As per Mutt regulations, <strong>no official receipt is generated immediately</strong>. The official letterhead receipt will only be generated once the transaction is verified and approved through:
                        <ul style={{ margin: '6px 0 0 0', paddingLeft: '20px' }}>
                          <li>The Administrator's direct response to the Admin Email alert</li>
                          <li>The Admin Portal approval dashboard</li>
                          <li>The Temple Administrator Mobile App</li>
                        </ul>
                      </div>

                      {/* Manual Action Buttons (No auto-redirect) */}
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => navigate('/')}
                        >
                          ← Return to Home Page / ಮುಖಪುಟಕ್ಕೆ ಹೋಗಿ
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => {
                            setAcknowledgmentData(null);
                            setTransactionId('');
                            navigate('/donation');
                          }}
                        >
                          Offer Another Seva / ಮತ್ತೊಂದು ಕಾಣಿಕೆ
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Transaction ID Form */
                  <form onSubmit={handlePaymentSubmit}>
                    <div className="form-group">
                      <label htmlFor="transaction-id" className="form-label">
                        Transaction ID / UTR Number{' '}
                        <span className="required-indicator" aria-hidden="true">
                          *
                        </span>
                      </label>
                      <input
                        id="transaction-id"
                        type="text"
                        value={transactionId}
                        onChange={(e) => {
                          setTransactionId(e.target.value);
                          if (error) setError('');
                        }}
                        className="form-input"
                        placeholder="e.g. 123456789012 or UTR number"
                        required
                        disabled={loading}
                        style={{ fontFamily: 'monospace', letterSpacing: 1 }}
                      />
                      <p
                        style={{
                          margin: '6px 0 0 0',
                          fontSize: '0.78rem',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        Find this in your UPI app under transaction history after payment.
                      </p>
                    </div>

                    <div className="form-actions" style={{ justifyContent: 'flex-start', marginTop: '20px' }}>
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={loading}
                      >
                        {loading ? 'Submitting Details…' : 'Submit Transaction ID for Verification'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline"
                        disabled={loading}
                        onClick={() => navigate('/donation')}
                        style={{ marginLeft: '10px' }}
                      >
                        ← Back
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </article>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Payment;

