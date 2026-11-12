import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

function Navbar() {
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const languages = [
    { code: 'kn', name: 'ಕನ್ನಡ', label: 'ಕನ್ನಡ' },
    { code: 'en', name: 'English', label: 'English' },
    { code: 'sa', name: 'संस्कृतम्', label: 'संस्कृतम्' },
    { code: 'te', name: 'తెలుగు', label: 'తెలుగు' }
  ];

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav role="navigation" aria-label="Main Navigation" className="navbar">
      <div className="navbar-container">
        {/* Mobile menu hamburger toggle */}
        <button
          className="mobile-nav-toggle"
          onClick={toggleMobileMenu}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          type="button"
        >
          <span className="hamburger-icon">{mobileMenuOpen ? '✕' : '☰'}</span>
          <span className="mobile-nav-label">Menu</span>
        </button>

        {/* Navigation Links */}
        <ul className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <span>{t('home')}</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/activities"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <span>{t('activities')}</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/announcements"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <span>{t('announcements')}</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/donation"
              className={({ isActive }) => `nav-link nav-link-highlight ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <span>{t('donationNav')}</span>
              <span className="nav-badge" aria-hidden="true">Seva</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/contact"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <span>{t('contact')}</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin"
              className={({ isActive }) => `nav-link nav-link-admin ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <span>{t('adminPanel')}</span>
            </NavLink>
          </li>
        </ul>

        {/* Multilingual Selector */}
        <div className="navbar-actions">
          <div className="language-switcher" role="group" aria-label="Select language">
            {languages.map((lang) => (
              <button
                key={lang.code}
                className={`lang-btn ${currentLanguage === lang.code ? 'active' : ''}`}
                onClick={() => handleLanguageChange(lang.code)}
                title={lang.label}
                aria-label={`Switch to ${lang.label}`}
                aria-pressed={currentLanguage === lang.code}
                type="button"
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
