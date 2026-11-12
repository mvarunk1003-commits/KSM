import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import API_BASE from '../config/api';
import { useLanguage } from '../context/LanguageContext';

function Contact() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({ name: '', email: '', message: '' });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      
      <main id="main-content" className="container" role="main">
        <section className="section" aria-labelledby="contact-heading">
          <div className="section-header">
            <div>
              <h1 id="contact-heading" className="section-title">{t('contactTitle') || 'Contact Us'}</h1>
              <p className="section-subtitle">{t('contactDescription') || 'Reach out to the mutt administration for inquiries, pooja bookings, and seva guidance'}</p>
            </div>
          </div>

          <div className="grid grid-2">
            {/* Contact Details Card */}
            <article className="card" aria-label="Contact Information">
              <header className="card-header">
                <h2 className="card-title">Mutt Information</h2>
              </header>
              <div className="card-content">
                <address style={{ fontStyle: 'normal', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '4px' }}>Address</h3>
                    <p style={{ margin: 0 }}>
                      Kolar Sringeri SriShankara Mutt<br />
                      Kote, Kolar, Karnataka &ndash; 563101, India
                    </p>
                  </div>
                  
                  <div>
                    <h3 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '4px' }}>Helpline / Phone</h3>
                    <p style={{ margin: 0 }}>
                      <a href="tel:+918310151359" style={{ fontWeight: 600 }}>+91 83101 51359</a>
                    </p>
                  </div>
                  
                  <div>
                    <h3 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '4px' }}>WhatsApp Support</h3>
                    <p style={{ margin: 0 }}>
                      <a 
                        href="https://wa.me/918310151359" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn btn-sm btn-outline"
                        style={{ display: 'inline-flex', marginTop: '4px' }}
                      >
                        Chat on WhatsApp (+91 83101 51359)
                      </a>
                    </p>
                  </div>
                  
                  <div>
                    <h3 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '4px' }}>Official Email</h3>
                    <p style={{ margin: 0 }}>
                      <a href="mailto:info@kolarshankaramutt.org">info@kolarshankaramutt.org</a>
                    </p>
                  </div>
                  
                  <div>
                    <h3 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '4px' }}>Visiting &amp; Darshan Hours</h3>
                    <p style={{ margin: 0 }}>
                      <strong>Monday &ndash; Sunday:</strong><br />
                      Morning: 6:00 AM &ndash; 12:30 PM<br />
                      Evening: 5:00 PM &ndash; 8:30 PM
                    </p>
                  </div>
                </address>
              </div>
            </article>

            {/* Contact Form Card */}
            <article className="card" aria-label="Send a message to the mutt">
              <header className="card-header">
                <h2 className="card-title">Send a Message</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
                  Fill out this form and our administration will respond promptly.
                </p>
              </header>
              <div className="card-content">
                {success && (
                  <div className="message success" role="alert" aria-live="polite">
                    <span>Thank you! Your message has been sent successfully. Our office will respond shortly.</span>
                  </div>
                )}

                {error && (
                  <div className="message error" role="alert" aria-live="assertive">
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="contact-form" noValidate={false}>
                  <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                    <legend className="sr-only">Contact Details Form</legend>
                    
                    <div className="form-group">
                      <label htmlFor="contact-name" className="form-label">
                        Your Full Name <span className="required-indicator" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="e.g. Ramesh Sharma"
                        required
                        autoComplete="name"
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="contact-email" className="form-label">
                        Email Address <span className="required-indicator" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="e.g. ramesh@example.com"
                        required
                        autoComplete="email"
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="contact-message" className="form-label">
                        Your Message / Inquiry <span className="required-indicator" aria-hidden="true">*</span>
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        className="form-textarea"
                        rows="5"
                        required
                        disabled={loading}
                        placeholder="Please share your message, pooja inquiry, or feedback..."
                      />
                    </div>

                    <div className="form-actions" style={{ justifyContent: 'flex-start' }}>
                      <button 
                        type="submit" 
                        className="btn btn-primary btn-lg"
                        disabled={loading}
                      >
                        {loading ? 'Sending Message...' : 'Send Message'}
                      </button>
                    </div>
                  </fieldset>
                </form>
              </div>
            </article>
          </div>
        </section>

        {/* How to Reach Us Section */}
        <section className="section" aria-labelledby="reach-heading">
          <div className="section-header">
            <div>
              <h2 id="reach-heading" className="section-title">How to Reach Kolar Shankara Mutt</h2>
              <p className="section-subtitle">Convenient transportation options to visit the temple</p>
            </div>
          </div>
          
          <div className="grid grid-3">
            <article className="card">
              <header className="card-header">
                <span className="badge badge-primary" style={{ display: 'inline-block', marginBottom: '8px', alignSelf: 'flex-start' }}>NH 75 Highway</span>
                <h3 className="card-title">By Road</h3>
              </header>
              <div className="card-content">
                <p>
                  Kolar is located approx. 68 km from Bengaluru on NH 75. Frequent KSRTC buses and private cabs connect Kempegowda Bus Station (Majestic) to Kolar Central Bus Stand.
                </p>
              </div>
            </article>

            <article className="card">
              <header className="card-header">
                <span className="badge badge-primary" style={{ display: 'inline-block', marginBottom: '8px', alignSelf: 'flex-start' }}>BWT / KQZ Stations</span>
                <h3 className="card-title">By Train</h3>
              </header>
              <div className="card-content">
                <p>
                  Kolar Railway Station (KQZ) and Bangarapet Junction (BWT, 15 km away) offer regular trains connecting to Bengaluru, Chennai, and other major south Indian junctions.
                </p>
              </div>
            </article>

            <article className="card">
              <header className="card-header">
                <span className="badge badge-primary" style={{ display: 'inline-block', marginBottom: '8px', alignSelf: 'flex-start' }}>BLR International</span>
                <h3 className="card-title">By Air</h3>
              </header>
              <div className="card-content">
                <p>
                  Kempegowda International Airport Bengaluru (BLR) is the closest airport (approx. 75 km away). Direct airport taxis reach Kolar in approximately 90 minutes.
                </p>
              </div>
            </article>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Contact;
