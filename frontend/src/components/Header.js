import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import Navbar from './Navbar';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const { t } = useLanguage();

  return (
    <header role="banner" className="site-header">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Top Utility Bar */}
      <div className="header-top-bar">
        <div className="container header-top-content">
          <span className="header-top-welcome">
            ಕೋಲಾರ ಶೃಂಗೇರಿ ಶ್ರೀಶಂಕರ ಮಠ | Kolar Sringeri SriShankara Mutt
          </span>
          <div className="header-top-controls">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Official Temple Masthead Banner */}
      <div className="banner-wrapper">
        <div className="banner-container" aria-label="Temple Header Masthead">
          <h1 className="sr-only">
            {t('heroSubtitle')} - Kolar Sringeri SriShankara Mutt | ಕೋಲಾರ ಶೃಂಗೇರಿ ಶ್ರೀಶಂಕರ ಮಠ
          </h1>
          <img
            src="/assets/banner.png"
            alt="ಕೋಲಾರ ಶೃಂಗೇರಿ ಶ್ರೀಶಂಕರ ಮಠ - ದಕ್ಷಿಣಾಮ್ನಾಯ ಶೃಂಗೇರಿ ಶ್ರೀಶಾರದಾ ಪೀಠಮ್, ಶೃಂಗೇರಿ ಶಾಖಾ ಮಠ"
            className="banner-img"
          />
        </div>
      </div>

      {/* Main Navigation */}
      <Navbar />
    </header>
  );
}
