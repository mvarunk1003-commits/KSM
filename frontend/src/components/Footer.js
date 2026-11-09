import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer role="contentinfo" className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Column 1: About the Mutt */}
          <div className="footer-col">
            <h3>ಕೋಲಾರ ಶಂಕರ ಮಠ</h3>
            <p>
              Kolar Sringeri SriShankara Mutt is an ancient and sacred institution adhering to the pure Vedic tradition established by Jagadguru Sri Adi Shankaracharya. We are dedicated to spiritual enlightenment, dharma, cultural preservation, and welfare of the community.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-col">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/">{t('home')}</Link></li>
              <li><Link to="/activities">{t('activities')}</Link></li>
              <li><Link to="/announcements">{t('announcements')}</Link></li>
              <li><Link to="/donation">Sevas &amp; Donations</Link></li>
              <li><Link to="/contact">{t('contact')}</Link></li>
              <li><Link to="/admin">{t('adminPanel')}</Link></li>
            </ul>
          </div>

          {/* Column 3: Darshan & Timings */}
          <div className="footer-col">
            <h3>Darshan Timings</h3>
            <p>
              <strong>Morning:</strong> 6:00 AM &ndash; 12:30 PM<br />
              <strong>Evening:</strong> 5:00 PM &ndash; 8:30 PM
            </p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
              <em>Special Poojas and Maha Mangalarathi on Fridays and auspicious festival days.</em>
            </p>
          </div>

          {/* Column 4: Contact Information */}
          <div className="footer-col">
            <h3>Contact Us</h3>
            <address style={{ fontStyle: 'normal' }}>
              <p>
                Kolar Sringeri SriShankara Mutt<br />
                Kote, Kolar, Karnataka &ndash; 563101<br />
                <strong>Phone:</strong> +91 83101 51359<br />
                <strong>Email:</strong> info@kolarshankaramutt.org
              </p>
            </address>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>&copy; {currentYear} Kolar Sringeri SriShankara Mutt. All rights reserved.</p>
          <p>
            <Link to="/admin" style={{ color: 'inherit' }}>Admin Portal</Link> &bull; Built with Devotion
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
