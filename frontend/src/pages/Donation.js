import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ReceiptModal from '../components/ReceiptModal';
import { openReceiptLetterhead, downloadReceiptLetterheadFile } from '../utils/receiptGenerator';
import API_BASE from '../config/api';

function Donation() {
  const [formData, setFormData] = useState({
    donorName: '',
    email: '',
    phone: '',
    address: '',
    amount: '',
    purpose: 'General Donation',
    paymentMethod: 'UPI Payment'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [receiptData, setReceiptData] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const presetAmounts = ['501', '1001', '2501', '5001', '10001'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (error) setError('');
    
    if (name === 'amount') {
      const numValue = value.replace(/[^0-9.]/g, '');
      setFormData(prev => ({ ...prev, [name]: numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectPreset = (amt) => {
    if (error) setError('');
    setFormData(prev => ({ ...prev, amount: amt }));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const generateReceipt = (donationData) => {
    const receiptNumber = `DON-${Date.now()}`;
    const currentDate = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return {
      receiptNumber,
      date: currentDate,
      donorName: donationData.donorName,
      email: donationData.email,
      phone: donationData.phone,
      address: donationData.address,
      amount: donationData.amount,
      purpose: donationData.purpose,
      paymentMethod: donationData.paymentMethod,
      templeName: 'Kolar Sringeri SriShankara Mutt',
      templeAddress: 'Kote, Kolar, Karnataka - 563101',
      templePhone: '+91 83101 51359',
      templeEmail: 'info@kolarshankaramutt.org'
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.donorName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!formData.email.trim() || !validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid donation amount');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const donationData = {
        ...formData,
        date: new Date().toISOString().split('T')[0],
        amount: parseFloat(formData.amount)
      };

      const response = await fetch(`${API_BASE}/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donationData),
      });

      if (response.ok) {
        const savedDonation = await response.json();
        const receipt = generateReceipt(savedDonation);
        setReceiptData(receipt);
        setSuccess(true);
        setShowReceiptModal(true);
        
        // Reset form
        setFormData({
          donorName: '',
          email: '',
          phone: '',
          address: '',
          amount: '',
          purpose: 'General Donation',
          paymentMethod: 'UPI Payment'
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to process donation. Please try again.');
      }
    } catch (err) {
      console.error('Error processing donation:', err);
      setError('Network connection error. Please verify and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      
      <main id="main-content" className="container" role="main">
        <section className="section" aria-labelledby="donation-page-heading">
          <div className="section-header">
            <div>
              <h1 id="donation-page-heading" className="section-title">Online Seva &amp; Donation / ಕಾಣಿಕೆ</h1>
              <p className="section-subtitle">Contribute towards temple sevas, Annadanam, and mutt development</p>
            </div>
          </div>

          <div className="grid grid-2">
            {/* Left Column: Information Card */}
            <article className="card" aria-label="Seva and Donation Information">
              <header className="card-header">
                <h2 className="card-title">Sacred Seva Opportunities</h2>
              </header>
              <div className="card-content">
                <p style={{ lineHeight: '1.8' }}>
                  Devotees can offer their sincere contributions and participate in sacred sevas remotely. All offerings directly support the traditional temple operations, Vedic rituals, educational scholarships, and daily Annadanam.
                </p>
                
                <div style={{ marginTop: 'var(--spacing-lg)' }}>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)', marginBottom: 'var(--spacing-sm)' }}>
                    How Your Seva Contribution Helps:
                  </h3>
                  <ul style={{ paddingLeft: '1.25rem', lineHeight: '2', color: 'var(--text-secondary)' }}>
                    <li><strong>Nitya Pooja &amp; Archana:</strong> Daily Vedic worship and special Friday Alankara.</li>
                    <li><strong>Annadanam Seva:</strong> Providing sacred prasadam to pilgrims and devotees.</li>
                    <li><strong>Veda Pathashala:</strong> Nurturing student scholars in ancient Vedic traditions.</li>
                    <li><strong>Temple Maintenance:</strong> Upkeep, sacred pond care, and campus restoration.</li>
                    <li><strong>Community Welfare:</strong> Charitable and medical support to the needy.</li>
                  </ul>
                </div>

                <div style={{ marginTop: 'var(--spacing-lg)', padding: 'var(--spacing-md)', background: 'var(--primary-subtle)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--primary)' }}>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--primary-dark)', fontWeight: 500 }}>
                    Official receipts are instantly generated upon submission and can be downloaded immediately for your records.
                  </p>
                </div>
              </div>
            </article>

            {/* Right Column: Donation Form */}
            <article className="card" aria-label="Donation submission form">
              <header className="card-header">
                <h2 className="card-title">Devotee Contribution Form</h2>
              </header>
              <div className="card-content">
                {success && (
                  <div className="message success" role="alert" aria-live="polite">
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#1B5E20' }}>
                        Seva offering recorded successfully!
                      </p>
                      <p style={{ margin: '4px 0 10px 0', fontSize: '0.85rem' }}>
                        Official Receipt Number: <strong>{receiptData?.receiptNumber}</strong>
                      </p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button 
                          type="button"
                          onClick={() => setShowReceiptModal(true)} 
                          className="btn btn-sm btn-primary"
                        >
                          View Letterhead Receipt
                        </button>
                        <button 
                          type="button"
                          onClick={() => receiptData && openReceiptLetterhead(receiptData)} 
                          className="btn btn-sm btn-secondary"
                        >
                          Print / Save PDF
                        </button>
                        <button 
                          type="button"
                          onClick={() => receiptData && downloadReceiptLetterheadFile(receiptData)} 
                          className="btn btn-sm btn-outline"
                        >
                          Download File
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="message error" role="alert" aria-live="assertive">
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="donation-form">
                  <fieldset style={{ border: 'none', padding: 0, margin: '0 0 var(--spacing-md) 0' }}>
                    <legend className="sr-only">Personal and Contact Details</legend>
                    
                    <div className="form-group">
                      <label htmlFor="donor-name" className="form-label">
                        Full Name / ಭಕ್ತರ ಹೆಸರು <span className="required-indicator" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="donor-name"
                        type="text"
                        name="donorName"
                        value={formData.donorName}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="e.g. Suresh Kumar"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="donor-email" className="form-label">
                          Email Address <span className="required-indicator" aria-hidden="true">*</span>
                        </label>
                        <input
                          id="donor-email"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="suresh@example.com"
                          required
                          disabled={loading}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="donor-phone" className="form-label">
                          Phone Number
                        </label>
                        <input
                          id="donor-phone"
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="+91 9876543210"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="donor-address" className="form-label">
                        Postal Address
                      </label>
                      <textarea
                        id="donor-address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="form-textarea"
                        rows="2"
                        disabled={loading}
                        placeholder="Residential address / Gothram / Nakshatram (optional)"
                      />
                    </div>
                  </fieldset>

                  <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                    <legend className="sr-only">Contribution Amount and Mode</legend>

                    {/* Preset Amount Badges */}
                    <div className="form-group">
                      <label className="form-label">Quick Select Seva Amount (₹):</label>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        {presetAmounts.map(amt => (
                          <button
                            key={amt}
                            type="button"
                            className={`btn btn-sm ${formData.amount === amt ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => handleSelectPreset(amt)}
                          >
                            ₹{amt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="donation-amount" className="form-label">
                        Contribution Amount (₹) <span className="required-indicator" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="donation-amount"
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                        min="1"
                        disabled={loading}
                        placeholder="Enter custom amount in rupees"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="donation-purpose" className="form-label">
                          Seva Purpose / ಕಾಣಿಕೆ ಉದ್ದೇಶ
                        </label>
                        <select
                          id="donation-purpose"
                          name="purpose"
                          value={formData.purpose}
                          onChange={handleInputChange}
                          className="form-select"
                          disabled={loading}
                        >
                          <option value="General Donation">General Donation / ಸಾಮಾನ್ಯ ಕಾಣಿಕೆ</option>
                          <option value="Annadanam Seva">Annadanam Seva / ಅನ್ನದಾನ ಸೇವೆ</option>
                          <option value="Temple Maintenance">Temple Maintenance / ಜೀರ್ಣೋದ್ಧಾರ</option>
                          <option value="Spiritual Programs">Vedic Rituals &amp; Poojas</option>
                          <option value="Educational Activities">Veda Pathashala Support</option>
                          <option value="Special Ceremonies">Navaratri &amp; Shankara Jayanti</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="donation-payment-method" className="form-label">
                          Payment Mode
                        </label>
                        <select
                          id="donation-payment-method"
                          name="paymentMethod"
                          value={formData.paymentMethod}
                          onChange={handleInputChange}
                          className="form-select"
                          disabled={loading}
                        >
                          <option value="UPI Payment">UPI (GPay / PhonePe / Paytm)</option>
                          <option value="Online Transfer">Net Banking / NEFT / IMPS</option>
                          <option value="Bank Transfer">Direct Bank Deposit</option>
                          <option value="Cheque">Cheque / Demand Draft</option>
                          <option value="Cash">Cash at Mutt Office</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-actions" style={{ justifyContent: 'flex-start' }}>
                      <button 
                        type="submit" 
                        className="btn btn-primary btn-lg"
                        disabled={loading}
                      >
                        {loading ? 'Processing Offering...' : 'Submit Seva Contribution'}
                      </button>
                    </div>
                  </fieldset>
                </form>
              </div>
            </article>
          </div>
        </section>

        {/* Bank & UPI Account Details Section */}
        <section className="section" aria-labelledby="bank-details-heading">
          <div className="section-header">
            <div>
              <h2 id="bank-details-heading" className="section-title">Official Bank &amp; UPI Accounts</h2>
              <p className="section-subtitle">Direct transfer information for devotees</p>
            </div>
          </div>
          
          <div className="grid grid-3">
            <article className="card">
              <header className="card-header">
                <span className="badge badge-primary" style={{ display: 'inline-block', marginBottom: '8px', alignSelf: 'flex-start' }}>Direct Deposit</span>
                <h3 className="card-title">Bank Account Details</h3>
              </header>
              <div className="card-content" style={{ fontSize: '0.9rem', lineHeight: '1.8' }}>
                <p><strong>Account:</strong> Kolar Sringeri SriShankara Mutt</p>
                <p><strong>A/C No:</strong> 1234567890</p>
                <p><strong>IFSC:</strong> SBIN0001234</p>
                <p><strong>Bank:</strong> State Bank of India</p>
                <p><strong>Branch:</strong> Kolar Main Branch</p>
              </div>
            </article>

            <article className="card">
              <header className="card-header">
                <span className="badge badge-primary" style={{ display: 'inline-block', marginBottom: '8px', alignSelf: 'flex-start' }}>Digital UPI</span>
                <h3 className="card-title">UPI Details</h3>
              </header>
              <div className="card-content" style={{ fontSize: '0.9rem', lineHeight: '1.8' }}>
                <p><strong>UPI ID:</strong> kolarshankaramutt@sbi</p>
                <p><strong>Accepted Apps:</strong> GPay, PhonePe, Paytm, BHIM</p>
                <p><strong>Instant Confirmation:</strong> Attach transfer UTR reference in the form above.</p>
              </div>
            </article>

            <article className="card">
              <header className="card-header">
                <span className="badge badge-primary" style={{ display: 'inline-block', marginBottom: '8px', alignSelf: 'flex-start' }}>Office Desk</span>
                <h3 className="card-title">Seva Assistance</h3>
              </header>
              <div className="card-content" style={{ fontSize: '0.9rem', lineHeight: '1.8' }}>
                <p><strong>Phone:</strong> +91 83101 51359</p>
                <p><strong>WhatsApp:</strong> +91 83101 51359</p>
                <p><strong>Email:</strong> donations@kolarshankaramutt.org</p>
                <p><strong>Office Hours:</strong> 9:00 AM &ndash; 6:00 PM</p>
              </div>
            </article>
          </div>
        </section>
      </main>

      <Footer />

      {/* Official Banner Letterhead Receipt Modal */}
      {showReceiptModal && receiptData && (
        <ReceiptModal 
          donation={receiptData} 
          onClose={() => setShowReceiptModal(false)} 
        />
      )}
    </div>
  );
}

export default Donation;
