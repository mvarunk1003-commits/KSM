import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  // Read persisted language preference from localStorage, default to Kannada ('kn')
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('ksm_lang');
        if (saved && ['en', 'kn', 'sa', 'te'].includes(saved)) {
          return saved;
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    }
    return 'kn';
  });

  const changeLanguage = (langCode) => {
    if (['en', 'kn', 'sa', 'te'].includes(langCode)) {
      setCurrentLanguage(langCode);
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('ksm_lang', langCode);
        }
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  };

  const translations = {
    // =========================================================================
    // KANNADA (ಕನ್ನಡ) — Primary Official Peetham Language
    // =========================================================================
    kn: {
      // Navigation
      home: 'ಮುಖಪುಟ',
      activities: 'ಕಾರ್ಯಕ್ರಮಗಳು',
      announcements: 'ಘೋಷಣೆಗಳು',
      contact: 'ಸಂಪರ್ಕ',
      adminPanel: 'ನಿರ್ವಾಹಕ ಫಲಕ',
      donationNav: 'ಕಾಣಿಕೆ / ಇ-ಸೇವೆ',

      // Hero / Masthead
      heroTitle: 'ಶ್ರೀ ಕೋಲಾರ ಶೃಂಗೇರಿ ಶಂಕರ ಮಠ',
      heroSubtitle: 'ಕೋಲಾರ ಶೃಂಗೇರಿ ಶ್ರೀಶಂಕರ ಮಠ',
      heroDescription: 'ಆದಿ ಶಂಕರಾಚಾರ್ಯರ ಉಪದೇಶಗಳನ್ನು ಸಂರಕ್ಷಿಸುವ ಮತ್ತು ಪ್ರಸಾರ ಮಾಡುವ ಪವಿತ್ರ ಸಂಸ್ಥೆ. ದಕ್ಷಿಣಾಮ್ನಾಯ ಶೃಂಗೇರಿ ಶ್ರೀಶಾರದಾ ಪೀಠದ ದಿವ್ಯ ಪರಂಪರೆ.',
      topBarWelcome: 'ಕೋಲಾರ ಶೃಂಗೇರಿ ಶ್ರೀಶಂಕರ ಮಠ | ದಕ್ಷಿಣಾಮ್ನಾಯ ಶೃಂಗೇರಿ ಶ್ರೀಶಾರದಾ ಪೀಠಮ್ ಶಾಖಾ ಮಠ',

      // Darshan Timings & Status
      darshanOpen: 'ದರ್ಶನ ಲಭ್ಯವಿದೆ',
      darshanClosed: 'ಪೂಜಾ ವಿಧಿವಿಧಾನಗಳಿಗಾಗಿ ಬಾಗಿಲು ಮುಚ್ಚಿದೆ',
      darshanClosesAt1230: 'ಮಧ್ಯಾಹ್ನ 12:30 ರವರೆಗೆ ದರ್ಶನ',
      darshanClosesAt830: 'ರಾತ್ರಿ 8:30 ರವರೆಗೆ ದರ್ಶನ',
      nextDarshanPrefix: 'ಮುಂದಿನ ದರ್ಶನ: ',
      morningDarshan: 'ಬೆಳಗಿನ ದರ್ಶನ',
      mahamangalarathi: 'ಮಹಾಮಂಗಳಾರತಿ',
      eveningDarshan: 'ಸಂಜೆಯ ದರ್ಶನ',
      morningDarshanTime: '08:00 AM – 12:30 PM',
      mahamangalarathiTime: '12:00 PM & 08:00 PM',
      eveningDarshanTime: '06:00 PM – 08:30 PM',

      // Quick Actions
      onlineSeva: 'ಕಾಣಿಕೆ / ಇ-ಸೇವೆ',
      onlineSevaSub: 'ಆನ್‌ಲೈನ್ ಸೇವಾ ಬುಕಿಂಗ್',
      spiritualActivities: 'ಧಾರ್ಮಿಕ ಕಾರ್ಯಕ್ರಮಗಳು',
      spiritualActivitiesSub: 'ಪೂಜೆಗಳು & ಉತ್ಸವಗಳು',
      muttAnnouncements: 'ವಿಶೇಷ ಪ್ರಕಟಣೆಗಳು',
      muttAnnouncementsSub: 'ಮಠದ ಸುತ್ತೋಲೆಗಳು',
      visitContact: 'ಮಠದ ವಿಳಾಸ & ಸಂಪರ್ಕ',
      visitContactSub: 'ದರ್ಶನಕ್ಕೆ ಭೇಟಿ ನೀಡಿ',

      // Sacred Shloka
      sacredShloka: '॥ ॐ ಶ್ರೀ ಶಾರದಾಂಬಾ ಪ್ರಸನ್ನ ॐ ॥',

      // Heritage Section
      heritageTitle: 'ದಕ್ಷಿಣಾಮ್ನಾಯ ಶೃಂಗೇರಿ ಶ್ರೀಶಾರದಾ ಪೀಠಮ್ ಶಾಖಾ ಮಠ',
      heritageSubtitle: 'ಕೋಲಾರ ಶೃಂಗೇರಿ ಶ್ರೀಶಂಕರ ಮಠ — ದಕ್ಷಿಣಾಮ್ನಾಯ ಶ್ರೀ ಶಾರದಾ ಪೀಠ, ಶೃಂಗೇರಿಯ ಪವಿತ್ರ ಶಾಖಾ ಮಠ',
      heritageIntro: 'ಕೋಲಾರ ಶೃಂಗೇರಿ ಶ್ರೀ ಶಂಕರ ಮಠವು 1928 ರಲ್ಲಿ ಜಗದ್ಗುರು ಶ್ರೀ ಆದಿ ಶಂಕರಾಚಾರ್ಯರ ಪವಿತ್ರ ಪರಂಪರೆಯ ದಿವ್ಯ ಆಶೀರ್ವಾದದೊಂದಿಗೆ ಸ್ಥಾಪಿತವಾಯಿತು. ಸನಾತನ ಧರ್ಮದ ರಕ್ಷಣೆ, ವೈದಿಕ ಜ್ಞಾನದ ಪ್ರಸಾರ ಮತ್ತು ಸಂಸ್ಕೃತ ಸಾಂಸ್ಕೃತಿಕ ಪರಂಪರೆಯನ್ನು ಎತ್ತಿಹಿಡಿಯುವ ಪವಿತ್ರ ಕೇಂದ್ರವಾಗಿ ಮಠವು ಕಂಗೊಳಿಸುತ್ತಿದೆ.',

      // Milestones
      milestonesHeading: '📜 ಪವಿತ್ರ ಇತಿಹಾಸ ಮತ್ತು ಪ್ರಮುಖ ಮೈಲಿಗಲ್ಲುಗಳು',
      m1928Title: 'ಮಠದ ಸಂಸ್ಥಾಪನೆ',
      m1928Desc: 'ಜಗದ್ಗುರು ಶ್ರೀ ಆದಿ ಶಂಕರಾಚಾರ್ಯರ ಅದ್ವೈತ ಪರಂಪರೆಯ ದಿವ್ಯ ಆಶೀರ್ವಾದ ಮತ್ತು ಸಂಕಲ್ಪದೊಂದಿಗೆ ಮಠ ಸ್ಥಾಪನೆಯಾಯಿತು.',
      m1930Title: 'ಶ್ರೀ ಶಂಕರಾಚಾರ್ಯ ಪ್ರತಿಷ್ಠಾಪನೆ',
      m1930Desc: 'ಶ್ರೀ ಶಂಕರಾಚಾರ್ಯರ ಪವಿತ್ರ ಮೂರ್ತಿ ಪ್ರತಿಷ್ಠಾಪನೆಯನ್ನು ನೆರವೇರಿಸಿ ಆಧ್ಯಾತ್ಮಿಕ ಭದ್ರ ಬುನಾದಿಯನ್ನು ಹಾಕಲಾಯಿತು.',
      m1965Title: 'ಶ್ರೀ ಶಾರದಾಂಬಾ ಕುಂಭಾಭಿಷೇಕ',
      m1965Desc: 'ಆವಣಿ ಮಠದ ಪರಮಪೂಜ್ಯ ಶ್ರೀ ಅಭಿನವೋದಂಡ ವಿದ್ಯಾರಣ್ಯಭಾರತೀ ಮಹಾಸ್ವಾಮಿಗಳ ಅಮೃತ ಹಸ್ತದಿಂದ ಶ್ರೀ ಶಾರದಾಂಬೆಯ ಪ್ರತಿಷ್ಠಾ ಕುಂಭಾಭಿಷೇಕ ನೆರವೇರಿತು.',
      m2019Title: 'ಶೃಂಗೇರಿ ಪೀಠದ ಮಾರ್ಗದರ್ಶನ',
      m2019Desc: 'ಮಠವನ್ನು ಔಪಚಾರಿಕವಾಗಿ ದಕ್ಷಿಣಾಮ್ನಾಯ ಶೃಂಗೇರಿ ಶ್ರೀಶಾರದಾ ಪೀಠದ ದಿವ್ಯ ಮಾರ್ಗದರ್ಶನಕ್ಕೆ ತರಲಾಯಿತು.',
      mPresentTitle: 'ಧರ್ಮಾಧಿಕಾರಿಗಳ ನೇತೃತ್ವ',
      mPresentDesc: 'ಪ್ರಸ್ತುತ ಶ್ರೀ ರಾಮಕೃಷ್ಣ ಜೆ. ಎನ್. ಅವರು ಕೋಲಾರ ಶ್ರೀಮಠದ ಧರ್ಮಾಧಿಕಾರಿಗಳಾಗಿ ಶ್ರದ್ಧಾಭಕ್ತಿಗಳಿಂದ ಮುನ್ನಡೆಸುತ್ತಿದ್ದಾರೆ.',

      // Weekly Programs
      programsHeading: '🪔 ಶ್ರೀಮಠದಲ್ಲಿ ನಡೆಯುವ ನಿತ್ಯ & ಸಾಪ್ತಾಹಿಕ ಕಾರ್ಯಕ್ರಮಗಳು',
      discoursesTitle: 'ಧಾರ್ಮಿಕ ಉಪನ್ಯಾಸಗಳು',
      discoursesSchedule: 'ನಿಯಮಿತ ಸತ್ಸಂಗ',
      discoursesDesc: 'ವಿದ್ವಾಂಸರಿಂದ ಧರ್ಮ, ಉಪನಿಷತ್ತುಗಳು ಮತ್ತು ಭಗವದ್ಗೀತೆ, ಅದ್ವೈತ ವೇದಾಂತದ ಕುರಿತು ವಿಶೇಷ ಪ್ರವಚನಗಳು.',
      stotraTitle: 'ಸ್ತೋತ್ರ ಪಾಠ ತರಗತಿಗಳು',
      stotraSchedule: 'ಪ್ರತಿ ಗುರುವಾರ',
      stotraDesc: 'ಶ್ರೀ ಶಂಕರ ಭಗವತ್ಪಾದರ ಸ್ತೋತ್ರಗಳು, ಸೌಂದರ್ಯ ಲಹರಿ ಮತ್ತು ದೇವತಾ ಸ್ತುತಿಗಳ ಶ್ರದ್ಧಾಪೂರ್ವಕ ಕಲಿಕೆ.',
      sanskritTitle: 'ಸಂಸ್ಕೃತ ಶಿಕ್ಷಣ',
      sanskritSchedule: 'ಶನಿವಾರ & ಭಾನುವಾರ ಸಂಜೆ',
      sanskritDesc: 'ಎಲ್ಲಾ ವಯೋಮಾನದವರಿಗೂ ಸರಳ ಸಂಸ್ಕೃತ ಸಂಭಾಷಣೆ, ಸುಭಾಷಿತಗಳು ಮತ್ತು ವ್ಯಾಕರಣ ಶಿಕ್ಷಣ.',

      // Vision
      visionTitle: '🌟 ಶ್ರೀಮಠದ ದೃಷ್ಟಿಕೋನ & ಸಂಕಲ್ಪ',
      visionDesc: 'ಕೋಲಾರ ಶ್ರೀಮಠವು ಸನಾತನ ಧರ್ಮದ ಸಂರಕ್ಷಣೆ, ವೇದಾಧ್ಯಯನ, ಸಂಸ್ಕೃತ ಪ್ರಚಾರ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಧರ್ಮಜಾಗೃತಿಯ ಬೆಳಕಾಗಿ ಸದಾ ಮುಂಚೂಣಿಯಲ್ಲಿದೆ.',
      vLearning: 'ಆಧ್ಯಾತ್ಮಿಕ ಜ್ಞಾನ',
      vSanskrit: 'ಸಂಸ್ಕೃತ ಪ್ರಚಾರ',
      vCulture: 'ಸಾಂಸ್ಕೃತಿಕ ಪುನರುತ್ಥಾನ',
      vDharma: 'ಸನಾತನ ಧರ್ಮ',

      // 4 Pillars
      p1Title: 'ಜಗದ್ಗುರು ಪರಂಪರೆ',
      p1Desc: 'ಜಗದ್ಗುರು ಶ್ರೀ ಆದಿ ಶಂಕರಾಚಾರ್ಯರ ಮತ್ತು ಶೃಂಗೇರಿ ಜಗದ್ಗುರುಗಳ ಪಾವನ ಪರಂಪರೆಯ ಪೂಜ್ಯ ಗೌರವ.',
      p2Title: 'ನಿತ್ಯ ಪೂಜೆ & ಸೇವೆಗಳು',
      p2Desc: 'ದೈನಂದಿನ ವೈದಿಕ ವಿಧಿವಿಧಾನಗಳು, ಪಂಚಾಮೃತ ಅಭಿಷೇಕ, ಚಂದ್ರಮೌಳೀಶ್ವರ ಪೂಜೆ ಮತ್ತು ಮಹಾಮಂಗಳಾರತಿ.',
      p3Title: 'ಅನ್ನದಾನ ಮಹಾದಾನ',
      p3Desc: 'ಮಠಕ್ಕೆ ಆಗಮಿಸುವ ಸದ್ಭಕ್ತರಿಗೆ, ಸಾಧಕರಿಗೆ ಶ್ರದ್ಧೆಯಿಂದ ನಿತ್ಯ ಅನ್ನಪ್ರಸಾದ ವಿನಿಯೋಗ.',
      p4Title: 'ವೇದ & ಸಂಸ್ಕೃತ',
      p4Desc: 'ಸಾಂಪ್ರದಾಯಿಕ ವೇದಾಧ್ಯಯನ, ಸ್ತೋತ್ರ ಪಠಣ ಮತ್ತು ಸಾಂಸ್ಕೃತಿಕ ಪ್ರವಚನಗಳ ಪ್ರೋತ್ಸಾಹ.',

      // Seva Banner
      sevaBannerTitle: '🛕 ಆನ್‌ಲೈನ್ ಸೇವಾ ಸಮರ್ಪಣೆ & ಕಾಣಿಕೆ',
      sevaBannerDesc: 'ದೈನಂದಿನ ಪೂಜೆಗಳು, ವಿಶೇಷ ಅರ್ಚನೆ, ಅಭಿಷೇಕ ಮತ್ತು ಅನ್ನದಾನ ಸೇವೆಗಳಲ್ಲಿ ವಿಶ್ವದ ಯಾವುದೇ ಮೂಲೆಯಿಂದ ಭಾಗವಹಿಸಿ. ತಕ್ಷಣವೇ ಅಧಿಕೃತ ದ್ವಿಭಾಷಾ ಡಿಜಿಟಲ್ ರಶೀದಿಯನ್ನು ಪಡೆಯಿರಿ.',
      bookSevaBtn: 'ಇ-ಸೇವೆ ಸಲ್ಲಿಸಿ →',
      contactOfficeBtn: 'ಮಠದ ಕಚೇರಿ ಸಂಪರ್ಕ',

      // Activities & Announcements
      activitiesTitle: 'ಧಾರ್ಮಿಕ ಕಾರ್ಯಕ್ರಮಗಳು',
      activitiesSub: 'ಮುಂಬರುವ ಉತ್ಸವಗಳು, ಹವನಗಳು ಮತ್ತು ಸಾಂಸ್ಕೃತಿಕ ಆಚರಣೆಗಳು',
      viewAllActivities: 'ಎಲ್ಲಾ ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ವೀಕ್ಷಿಸಿ →',
      noActivities: 'ಪ್ರಸ್ತುತ ಯಾವುದೇ ಕಾರ್ಯಕ್ರಮಗಳು ಯೋಜಿಸಲಾಗಿಲ್ಲ.',
      noActivitiesSub: 'ಮುಂದಿನ ಪೂಜಾ ಕಾರ್ಯಕ್ರಮಗಳ ವಿವರಗಳು ಶೀಘ್ರದಲ್ಲೇ ಪ್ರಕಟವಾಗಲಿವೆ.',

      // Announcements
      announcementsTitle: 'ವಿಶೇಷ ಪ್ರಕಟಣೆಗಳು',
      announcementsSub: 'ಮಠದ ಸುತ್ತೋಲೆಗಳು, ಸೇವಾ ವೇಳಾಪಟ್ಟಿ ಮತ್ತು ಮುಖ್ಯ ಸೂಚನೆಗಳು',
      viewAllAnnouncements: 'ಎಲ್ಲಾ ಪ್ರಕಟಣೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ →',
      noAnnouncements: 'ಪ್ರಸ್ತುತ ಯಾವುದೇ ಹೊಸ ಪ್ರಕಟಣೆಗಳಿಲ್ಲ.',
      noAnnouncementsSub: 'ಹೊಸ ಸುತ್ತೋಲೆಗಳು ಇಲ್ಲಿ ಪ್ರಕಟಗೊಳ್ಳಲಿವೆ.',

      // Common
      readDetails: 'ವಿವರಗಳನ್ನು ಓದಿ →',
      close: 'ಮುಚ್ಚಿ',
      loading: 'ಮಾಹಿತಿ ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
      error: 'ವಿಷಯವನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಸಂಪರ್ಕ ಪರಿಶೀಲಿಸಿ.',
      retry: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
      date: 'ದಿನಾಂಕ',
      title: 'ಶೀರ್ಷಿಕೆ',
      attachedMedia: 'ಲಗತ್ತಿಸಲಾದ ದಾಖಲೆಗಳು & ಚಿತ್ರಗಳು',
      openNewTab: 'ಹೊಸ ಪುಟದಲ್ಲಿ ತೆರೆಯಿರಿ',
      pdfDoc: 'PDF ದಾಖಲೆ',

      // Footer
      quickLinks: 'ತ್ವರಿತ ಲಿಂಕ್‌ಗಳು',
      darshanTimings: 'ದರ್ಶನದ ಸಮಯ',
      contactUs: 'ಸಂಪರ್ಕಿಸಿ',
      footerAbout: 'ಕೋಲಾರ ಶೃಂಗೇರಿ ಶ್ರೀಶಂಕರ ಮಠವು ಜಗದ್ಗುರು ಶ್ರೀ ಆದಿ ಶಂಕರಾಚಾರ್ಯರಿಂದ ಸ್ಥಾಪಿತವಾದ ಅದ್ವೈತ ವೇದಾಂತ ಪರಂಪರೆಯನ್ನು ಎತ್ತಿಹಿಡಿಯುವ ಪವಿತ್ರ ಸಂಸ್ಥೆಯಾಗಿದೆ. ಸನಾತನ ಧರ್ಮ, ವೇದಾಧ್ಯಯನ ಮತ್ತು ಸಮಾಜ ಕಲ್ಯಾಣಕ್ಕೆ ಸಮರ್ಪಿತವಾಗಿದೆ.'
    },

    // =========================================================================
    // ENGLISH
    // =========================================================================
    en: {
      // Navigation
      home: 'Home',
      activities: 'Activities',
      announcements: 'Announcements',
      contact: 'Contact',
      adminPanel: 'Admin Panel',
      donationNav: 'Donation / Seva',

      // Hero / Masthead
      heroTitle: 'Kolar Sringeri SriShankara Mutt',
      heroSubtitle: 'Kolar Sringeri SriShankara Mutt',
      heroDescription: 'A sacred institution dedicated to preserving and propagating the Advaita Vedanta teachings of Adi Shankaracharya and the rich spiritual heritage of Dakshinamnaya Sri Sharada Peetham, Sringeri.',
      topBarWelcome: 'Kolar Sringeri SriShankara Mutt | Branch of Dakshinamnaya Sri Sharada Peetham, Sringeri',

      // Darshan Timings & Status
      darshanOpen: 'Sanctum Open for Darshan',
      darshanClosed: 'Sanctum Closed for Rituals',
      darshanClosesAt1230: 'Open until 12:30 PM',
      darshanClosesAt830: 'Open until 08:30 PM',
      nextDarshanPrefix: 'Next Darshan: ',
      morningDarshan: 'Morning Darshan',
      mahamangalarathi: 'Mahamangalarathi',
      eveningDarshan: 'Evening Darshan',
      morningDarshanTime: '08:00 AM – 12:30 PM',
      mahamangalarathiTime: '12:00 PM & 08:00 PM',
      eveningDarshanTime: '06:00 PM – 08:30 PM',

      // Quick Actions
      onlineSeva: 'Online Seva & Donation',
      onlineSevaSub: 'Digital Devotee Sevas',
      spiritualActivities: 'Spiritual Activities',
      spiritualActivitiesSub: 'Pooja & Utsavas',
      muttAnnouncements: 'Mutt Announcements',
      muttAnnouncementsSub: 'Circulars & Notices',
      visitContact: 'Visit & Contact Us',
      visitContactSub: 'Temple Address & Timings',

      // Sacred Shloka
      sacredShloka: '॥ ॐ Sri Sharadamba Prasanna ॐ ॥',

      // Heritage Section
      heritageTitle: 'Branch of Dakshinamnaya Sri Sharada Peetham, Sringeri',
      heritageSubtitle: 'Kolar Sringeri SriShankara Mutt — Sacred Branch of Dakshinamnaya Sri Sharada Peetham',
      heritageIntro: 'Kolar Sringeri Sri Shankara Math was established in 1928 with the divine blessings of the revered lineage (parampara) of Jagadguru Sri Adi Shankaracharya. Standing as an eternal beacon of Sanatana Dharma, the Srimath fosters spiritual wisdom, Sanskrit education, and cultural revival.',

      // Milestones
      milestonesHeading: '📜 Sacred Historical Milestones & Lineage',
      m1928Title: 'Foundational Inception',
      m1928Desc: 'Established in 1928 with the divine blessings and lineage of Jagadguru Sri Adi Shankaracharya.',
      m1930Title: 'Shankaracharya Pratishthapana',
      m1930Desc: 'The sacred idol of Sri Adi Shankaracharya was consecrated, laying the spiritual bedrock of the Math.',
      m1965Title: 'Sharadamba Kumbhabhisheka',
      m1965Desc: 'Pratishtha Kumbhabhisheka of Sri Sharadamba performed by Paramapujya Sri Abhinavodanda Vidyaranyabharathi Mahaswamiji of Avani Math.',
      m2019Title: 'Sringeri Peetham Guidance',
      m2019Desc: 'Formally brought under the supreme guidance of Dakshinamnaya Sringeri Sri Sharada Peetham.',
      mPresentTitle: 'Dharmadhikari Leadership',
      mPresentDesc: 'Led with deep devotion by Sri Ramakrishna J. N., serving as the Dharmadhikari (Branch Head).',

      // Weekly Programs
      programsHeading: '🪔 Regular Spiritual & Cultural Programs at the Srimath',
      discoursesTitle: 'Spiritual Discourses',
      discoursesSchedule: 'Periodic Satsangs',
      discoursesDesc: 'Enlightening talks by learned Vedic scholars on Dharma, Upanishads, and Advaita Vedanta.',
      stotraTitle: 'Stotra Classes',
      stotraSchedule: 'Every Thursday',
      stotraDesc: 'Structured chanting classes teaching sacred hymns, Soundarya Lahari, and Sri Shankara compositions.',
      sanskritTitle: 'Sanskrit Classes',
      sanskritSchedule: 'Sat & Sun Evening',
      sanskritDesc: 'Everyday spoken Sanskrit, devotional shlokas, and foundational grammar for all age groups.',

      // Vision
      visionTitle: '🌟 Vision & Spiritual Mission',
      visionDesc: 'Kolar Srimath stands as a vibrant sanctuary dedicated to preserving Vedic wisdom, fostering devotion, and nurturing community harmony.',
      vLearning: 'Spiritual Learning',
      vSanskrit: 'Sanskrit Propagation',
      vCulture: 'Cultural Revival',
      vDharma: 'Sanatana Dharma',

      // 4 Pillars
      p1Title: 'Jagadguru Tradition',
      p1Desc: 'Revering the sacred lineage of Jagadguru Sri Adi Shankaracharya and the reigning Sringeri Pontiffs.',
      p2Title: 'Nitya Pooja & Sevas',
      p2Desc: 'Daily Vedic rituals, Panchamrutha Abhisheka, Chandramouleshwara Pooja, and evening Mahamangalarathi.',
      p3Title: 'Annadanam Mahadan',
      p3Desc: 'Nitya Mahaprasadam served with devotion to visiting pilgrims, students, and devotees.',
      p4Title: 'Veda & Samskrita',
      p4Desc: 'Fostering traditional Vedic learning, Sanskrit recitation, and cultural discourses.',

      // Seva Banner
      sevaBannerTitle: '🛕 Online Seva Booking & Devotee Kaanike',
      sevaBannerDesc: 'Participate in daily sanctum rituals, special archana, panchamrutha abhisheka, and sacred Annadanam from anywhere in the world. Receive instant official bilingual digital receipts.',
      bookSevaBtn: 'Book Online Seva →',
      contactOfficeBtn: 'Contact Mutt Office',

      // Activities & Announcements
      activitiesTitle: 'Spiritual Activities',
      activitiesSub: 'Upcoming celebrations, havans, and cultural festivals',
      viewAllActivities: 'View All Activities →',
      noActivities: 'No activities currently scheduled.',
      noActivitiesSub: 'Check back soon for upcoming celebrations and festivals.',

      // Announcements
      announcementsTitle: 'Important Notices',
      announcementsSub: 'Timely circulars, seva schedules, and mutt notifications',
      viewAllAnnouncements: 'View All Announcements →',
      noAnnouncements: 'No active announcements currently.',
      noAnnouncementsSub: 'Important circulars will be published here.',

      // Common
      readDetails: 'Read Details →',
      close: 'Close',
      loading: 'Loading sacred content...',
      error: 'Unable to load content. Please check your connection.',
      retry: 'Retry Connection',
      date: 'Date',
      title: 'Title',
      attachedMedia: 'Attached Media & Documents',
      openNewTab: 'Open in New Tab',
      pdfDoc: 'PDF Document',

      // Footer
      quickLinks: 'Quick Links',
      darshanTimings: 'Darshan Timings',
      contactUs: 'Contact Us',
      footerAbout: 'Kolar Sringeri SriShankara Mutt is a sacred institution adhering to the pure Vedic tradition established by Jagadguru Sri Adi Shankaracharya, dedicated to spiritual wisdom, dharma, and community welfare.'
    },

    // =========================================================================
    // SANSKRIT (संस्कृतम्)
    // =========================================================================
    sa: {
      // Navigation
      home: 'गृहम्',
      activities: 'कार्यक्रमाಃ',
      announcements: 'घोषणाः',
      contact: 'सम्पर्कः',
      adminPanel: 'प्रशासकीयफलकम्',
      donationNav: 'समर्पणम् / ई-सेवा',

      // Hero / Masthead
      heroTitle: 'श्री कोलार शृङ्गेरी शङ्करमठः',
      heroSubtitle: 'कोलार शृङ्गेरी शङ्करमठः',
      heroDescription: 'आदिशङ्कराचार्यस्य अद्वैतवेदान्तोपदेशानां दक्षिणाम्नाय शृङ्गेरी श्रीशारदापीठस्य च दिव्यपरम्परायाः संरक्षणाय समर्पितं पवित्रं संस्थानम्।',
      topBarWelcome: 'श्री कोलार शृङ्गेरी शङ्करमठः | दक्षिणाम्नाय शृङ्गेरी श्रीशारदापीठस्य शाखा',

      // Darshan Timings & Status
      darshanOpen: 'दर्शनं लभ्यते',
      darshanClosed: 'पूजाविधेः कृते पिहितम्',
      darshanClosesAt1230: 'मध्याह्न १२:३० पर्यन्तम्',
      darshanClosesAt830: 'रात्रौ ०८:३० पर्यन्तम्',
      nextDarshanPrefix: 'अग्रिमदर्शनम्: ',
      morningDarshan: 'प्रातः दर्शनम्',
      mahamangalarathi: 'महामङ्गलारती',
      eveningDarshan: 'सायं दर्शनम्',
      morningDarshanTime: '०८:०० AM – १२:३० PM',
      mahamangalarathiTime: '१२:०० PM & ०८:०० PM',
      eveningDarshanTime: '०६:०० PM – ०८:३० PM',

      // Quick Actions
      onlineSeva: 'ई-सेवा तथा समर्पणम्',
      onlineSevaSub: 'आन्तर्जालिकसेवा',
      spiritualActivities: 'धार्मिककार्यक्रमाः',
      spiritualActivitiesSub: 'पूजा उत्सवाश्च',
      muttAnnouncements: 'मठस्य घोषणाः',
      muttAnnouncementsSub: 'विशेषाः सूचकाः',
      visitContact: 'सम्पर्कः तथा वासः',
      visitContactSub: 'मठस्य सङ्केतः',

      // Sacred Shloka
      sacredShloka: '॥ ॐ श्री शारदाम्बा प्रसन्ना ॐ ॥',

      // Heritage Section
      heritageTitle: 'दक्षिणाम्नाय शृङ्गेरी श्रीशारदापीठम् शाखा मठः, कोलारः',
      heritageSubtitle: 'कोलार शृङ्गेरी श्रीशङ्करमठः — दक्षिणाम्नाय श्रीशारदापीठस्य शृङ्गेर्याः पवित्रा शाखा',
      heritageIntro: 'कोलार शृङ्गेरी श्री शङ्कर मठः १९२८ तमे वर्षे जगद्गुरु श्री आदिशङ्कराचार्याणां दिव्यपरम्परया आशीर्वादेन संस्थापितः। सनातनधर्मस्य वैदिकसंस्कृतेः च संरक्षणाय मठः दीपस्तम्भवत् वर्तते।',

      // Milestones
      milestonesHeading: '📜 पवित्राः ऐतिहासिकाः सोपानाः',
      m1928Title: 'मठस्य संस्थापनम्',
      m1928Desc: '१९२८ तमे वर्षे जगद्गुरु श्री आदिशङ्कराचार्यस्य परम्परया आशीर्वादेन स्थापितम्।',
      m1930Title: 'श्रीशङ्कराचार्य प्रतिष्ठापनम्',
      m1930Desc: 'श्रीशङ्कराचार्यस्य पवित्रमूर्तेः प्रतिष्ठापनेन आध्यात्मिकः दृढाधारः निर्मितः।',
      m1965Title: 'श्रीशारदाम्बा कुम्भाभिषेकः',
      m1965Desc: 'अवणिमठस्य परमपूज्यैः श्री अभिनवोदण्डविद्यारण्यभारतीमहास्वामिभिः प्रतिष्ठा कुम्भाभिषेकः कृतः।',
      m2019Title: 'शृङ्गेरीपीठस्य मार्गदर्शनम्',
      m2019Desc: '२०१९ तमे वर्षे दक्षिणाम्नाय शृङ्गेरी शारदापीठस्य साक्षात् दिव्यशासने आनीतम्।',
      mPresentTitle: 'धर्माधिकारिणां नेतृत्वम्',
      mPresentDesc: 'साम्प्रतं श्री रामकृष्ण जे. एन्. महोदयाः मठे धर्माधिकारिरूपेण सेवां कुर्वन्ति।',

      // Weekly Programs
      programsHeading: '🪔 मठे आयोजिताः नित्य-साप्ताहिककार्यक्रमाः',
      discoursesTitle: 'धार्मिकप्रवचनानि',
      discoursesSchedule: 'नियतसत्सङ्गाः',
      discoursesDesc: 'विद्वद्भिः धर्मे उपनिषत्सु अद्वैतवेदान्ते च क्रियमाणाः उपन्यासाः।',
      stotraTitle: 'स्तोत्रपाठाः',
      stotraSchedule: 'प्रतिगुरुवासरम्',
      stotraDesc: 'श्रीमदादिशङ्कराचार्यस्य स्तोत्राणां सौन्दर्यलहर्याः च भक्तिभावपूर्णः अभ्यासः।',
      sanskritTitle: 'संस्कृतकक्षाः',
      sanskritSchedule: 'शनि-रवि सायं',
      sanskritDesc: 'सर्वेषां कृते सम्भाषणसंस्कृतस्य तथा वैदिकवाङ्मयस्य पाठः।',

      // Vision
      visionTitle: '🌟 मठस्य सङ्कल्पः',
      visionDesc: 'मठः सनातनधर्मस्य, वेदानां, संस्कृतस्य च संवर्धने सदा अग्रणी वर्तते।',
      vLearning: 'आध्यात्मिकज्ञानम्',
      vSanskrit: 'संस्कृतप्रसारः',
      vCulture: 'सांस्कृतिकपुनरुत्थानम्',
      vDharma: 'सनातनधर्मः',

      // 4 Pillars
      p1Title: 'जगद्गुरुपरम्परा',
      p1Desc: 'जगद्गुरु श्री आदिशङ्कराचार्याणां तथा शृङ्गेरीपीठाधीशानां परम्परायाः नमनम्।',
      p2Title: 'नित्यपूजा तथा सेवाः',
      p2Desc: 'दैनिकवैदिकविधयः, पञ्चामृताभिषेकः, चन्द्रमौलीश्वरपूजा, महामङ्गलारती च।',
      p3Title: 'अन्नदानं महादानम्',
      p3Desc: 'मठमागतानां भक्तानां विद्यार्थिनां च कृते नित्यमहाप्रसादवितरणम्।',
      p4Title: 'वेदः तथा संस्कृतम्',
      p4Desc: 'पारम्परिकवेदशिक्षणं स्तोत्रपठनं तथा सांस्कृतिकप्रवचनानि।',

      // Seva Banner
      sevaBannerTitle: '🛕 ई-सेवापञ्जीकरणं तथा भक्तसमर्पणम्',
      sevaBannerDesc: 'नित्यपूजासु अन्नदाने च कुत्रापि स्थित्वा भागं गृह्णन्तु। तत्क्षणमेव आधिकारिकं डिजिटल-पावतीपत्रं प्राप्नुवन्तु।',
      bookSevaBtn: 'ई-सेवा समर्प्यताम् →',
      contactOfficeBtn: 'मठकार्यालयसम्पर्कः',

      // Activities & Announcements
      activitiesTitle: 'साम्प्रतिकानि धार्मिककार्याणि',
      activitiesSub: 'आगामिनः उत्सवाः हवनानि च',
      viewAllActivities: 'सर्वाणि कार्याणि पश्यन्तु →',
      noActivities: 'साम्प्रतं कोऽपि कार्यक्रमः नास्ति।',
      noActivitiesSub: 'शीघ्रमेव नूतनविवरणानि प्रकाश्यन्ते।',

      // Announcements
      announcementsTitle: 'महत्वपूर्णाः घोषणाः',
      announcementsSub: 'मठस्य परिपत्राणि सेवासारिण्यश्च',
      viewAllAnnouncements: 'सर्वाः घोषणाः पश्यन्तु →',
      noAnnouncements: 'साम्प्रतं कोऽपि घोषणा नास्ति।',
      noAnnouncementsSub: 'नूतनाः सूचकाः अत्र आगमिष्यन्ति।',

      // Common
      readDetails: 'विवरणं पठन्तु →',
      close: 'पिदधतु',
      loading: 'विषयः आरोप्यते...',
      error: 'विषयं लोड् कर्तुं अशक्यम्।',
      retry: 'पुनः प्रयत्नः',
      date: 'दिनाङ्कः',
      title: 'शीर्षिका',
      attachedMedia: 'संलग्नानि चित्राणि तथा पत्राणि',
      openNewTab: 'नूतने विण्डोमध्ये उद्घाटयतु',
      pdfDoc: 'PDF पत्रम्',

      // Footer
      quickLinks: 'शीघ्रसम्पर्काः',
      darshanTimings: 'दर्शनसमयाः',
      contactUs: 'सम्पर्कं कुर्वन्तु',
      footerAbout: 'कोलार शङ्करमठः श्रीमदादिशङ्कराचार्यैः संस्थापितायाः अद्वैतपरम्परायाः पालने तत्परः पवित्रः मठः वर्तते। धर्मरक्षणाय समाजकल्याणाय च समर्पितः।'
    },

    // =========================================================================
    // TELUGU (తెలుగు)
    // =========================================================================
    te: {
      // Navigation
      home: 'హోమ్',
      activities: 'కార్యక్రమాలు',
      announcements: 'ప్రకటనలు',
      contact: 'సంప్రదింపులు',
      adminPanel: 'అడ్మిన్ ప్యానెల్',
      donationNav: 'కానుక / సేవ',

      // Hero / Masthead
      heroTitle: 'శ్రీ కోలార శృంగేరి శంకర మఠం',
      heroSubtitle: 'కోలార శృంగేరి శంకర మఠం',
      heroDescription: 'ఆది శంకరాచార్యుల అద్వైత వేదాంత ఉపదేశాలు మరియు దక్షిణామ్నాయ శృంగేరి శ్రీ శారదా పీఠం దివ్య పరంపరను పరిరక్షించే పవిత్ర సంస్థ.',
      topBarWelcome: 'శ్రీ కోలార శృంగೇరి శంకర మఠం | దక్షిణామ్నాయ శృంగేరి శ్రీ శారదా పీఠం శాఖా మఠం',

      // Darshan Timings & Status
      darshanOpen: 'దర్శనం అందుబాటులో ఉంది',
      darshanClosed: 'పూజా కార్యక్రమాల కోసం మూసివేయబడింది',
      darshanClosesAt1230: 'మధ్యాహ్నం 12:30 వరకు దర్శనం',
      darshanClosesAt830: 'రాత్రి 08:30 వరకు దర్శనం',
      nextDarshanPrefix: 'తదుపరి దర్శనం: ',
      morningDarshan: 'ఉదయ దర్శనం',
      mahamangalarathi: 'మహా మంగళహారతి',
      eveningDarshan: 'సాయంత్ర దర్శనం',
      morningDarshanTime: '08:00 AM – 12:30 PM',
      mahamangalarathiTime: '12:00 PM & 08:00 PM',
      eveningDarshanTime: '06:00 PM – 08:30 PM',

      // Quick Actions
      onlineSeva: 'ఆన్‌లైన్ సేవ & కానుక',
      onlineSevaSub: 'డిజిటల్ సేవలు',
      spiritualActivities: 'ఆధ్యాత్మిక కార్యక్రమాలు',
      spiritualActivitiesSub: 'పూజలు & ఉత్సవాలు',
      muttAnnouncements: 'మఠం ప్రకటనలు',
      muttAnnouncementsSub: 'సర్క్యులర్లు & నోటీసులు',
      visitContact: 'సందర్శన & సంప్రదింపులు',
      visitContactSub: 'మఠం చిరునామా',

      // Sacred Shloka
      sacredShloka: '॥ ॐ శ్రీ శారదాంబా ప్రసన్న ॐ ॥',

      // Heritage Section
      heritageTitle: 'దక్షిణామ్నాయ శృంగేరి శ్రీ శారదా పీఠం శాఖా మఠం, కోలార',
      heritageSubtitle: 'కోలార శృంగేరి శ్రీశంకర మఠం — దక్షిణామ్నాయ శ్రీ శారదా పీఠం, శృంగేరి పవిత్ర శాఖా మఠం',
      heritageIntro: 'కోలార శృంగేరి శ్రీ శంకర మఠం 1928 లో జగద్గురు శ్రీ ఆది శంకరాచార్యుల పవిత్ర పరంపర దివ్య ఆశీస్సులతో స్థాపించబడింది. సనాతన ధర్మ రక్షణ, వేద విజ్ఞానం మరియు సంస్కృత సంస్కృతికి దివ్య కేంద్రంగా విరాజిల్లుతోంది.',

      // Milestones
      milestonesHeading: '📜 పవిత్ర చరిత్ర మరియు ముఖ్య మైలురాళ్ళు',
      m1928Title: 'మఠం స్థాపన',
      m1928Desc: 'జగద్గురు శ్రీ ఆది శంకరాచార్యుల అద్వైత పరంపర ఆశీస్సులతో 1928 లో స్థాపించబడింది.',
      m1930Title: 'శ్రీ శంకరాచార్య ప్రతిష్ఠాపన',
      m1930Desc: 'శ్రీ ఆది శంకరాచార్యుల పవిత్ర విగ్రహ ప్రతిష్ఠాపన జరిగి ఆధ్యాత్మిక పునాది వేయబడింది.',
      m1965Title: 'శ్రీ శారదాంబ కుంభాభిషేకం',
      m1965Desc: 'అవణి మఠం పూజ్యులు శ్రీ అభినవోదండ విద్యారణ్యభారతీ స్వామివారి చేతుల మీదుగా కుంభాభిషేకం జరిగింది.',
      m2019Title: 'శృంగేరి పీఠం మార్గదర్శకత్వం',
      m2019Desc: '2019 లో శృంగేరి శ్రీ శారదా పీఠం మార్గదర్శకత్వంలోకి అధికారికంగా తీసుకురాబడింది.',
      mPresentTitle: 'ధర్మాధికారి గారి నేతృత్వం',
      mPresentDesc: 'ప్రస్తుతం శ్రీ రామకృష్ణ జె. ఎన్. గారు ధర్మాధికారిగా మఠాన్ని భక్తిశ్రద్ధలతో నడిపిస్తున్నారు.',

      // Weekly Programs
      programsHeading: '🪔 మఠంలో జరిగే నిత్య మరియు వారపు కార్యక్రమాలు',
      discoursesTitle: 'ఆధ్యాత్మిక ప్రవచనాలు',
      discoursesSchedule: 'క్రమం తప్పని సత్సంగాలు',
      discoursesDesc: 'పండితులచే ధర్మం, ఉపనిషత్తులు మరియు అద్వైత వేదాంతంపై ప్రత్యేక ఉపన్యాసాలు.',
      stotraTitle: 'స్తోత్ర పాఠాలు',
      stotraSchedule: 'ప్రతి గురువారం',
      stotraDesc: 'శ్రీ శంకరుల స్తోత్రాలు, సౌందర్య లహరి మరియు భక్తి స్తోత్రాల అభ్యాసం.',
      sanskritTitle: 'సంస్కృత తరగతులు',
      sanskritSchedule: 'శని & ఆదివారం సాయంత్రం',
      sanskritDesc: 'అన్ని వయసుల వారికి సరళ సంస్కృత సంభాషణ మరియు వ్యాకరణ బోధన.',

      // Vision
      visionTitle: '🌟 మఠం లక్ష్యం & సంకల్పం',
      visionDesc: 'వేద విజ్ఞానం, సంస్కృత ప్రచారం, మరియు సనాతన ధర్మ పునరుజ్జీవనానికి మఠం సదా కట్టుబడి ఉంది.',
      vLearning: 'ఆధ్యాత్మిక విజ్ఞానం',
      vSanskrit: 'సంస్కృత ప్రచారం',
      vCulture: 'సాంస్కృతిక పునరుజ్జీవనం',
      vDharma: 'సనాతన ధర్మం',

      // 4 Pillars
      p1Title: 'జగద్గురు పరంపర',
      p1Desc: 'జగద్గురు శ్రీ ఆది శంకరాచార్యులు మరియు శృంగేరి జగద్గురువుల దివ్య పరంపరకు వందనం.',
      p2Title: 'నిత్య పూజలు & సేవలు',
      p2Desc: 'దైనందిన వైదిక పూజలు, పంచామృతాభిషేకం, చంద్రమౌళీశ్వర పూజ మరియు మంగళహారతి.',
      p3Title: 'అన్నదానం మహాదానం',
      p3Desc: 'విచ్చేసే భక్తులకు, విద్యార్థులకు భక్తితో నిత్య అన్నప్రసాద వితరణ.',
      p4Title: 'వేదం & సంస్కృతం',
      p4Desc: 'సాంప్రదాయ వేద విద్య, సంస్కృత శ్లోక పఠనం మరియు ఆధ్యాత్మిక ప్రవచనాలు.',

      // Seva Banner
      sevaBannerTitle: '🛕 ఆన్‌లైన్ సేవా నమోదు & భక్తుల కానుక',
      sevaBannerDesc: 'నిత్య పూజలు, ప్రత్యేక అర్చనలు, అభిషేకాలు మరియు అన్నదాన సేవల్లో ఎక్కడి నుంచైనా పాల్గొనండి. తక్షణ అధికారిక డిజిటల్ రసీదును పొందండి.',
      bookSevaBtn: 'ఆన్‌లైన్ సేవ చేయండి →',
      contactOfficeBtn: 'మఠం కార్యాలయం',

      // Activities & Announcements
      activitiesTitle: 'ఆధ్యాత్మిక కార్యక్రమాలు',
      activitiesSub: 'రాబోయే ఉత్సవాలు, హోమాలు మరియు సాంస్కృతిక వేడుకలు',
      viewAllActivities: 'అన్ని కార్యక్రమాలను చూడండి →',
      noActivities: 'ప్రస్తుతం ఏ కార్యక్రమాలూ షెడ్యూల్ చేయబడలేదు.',
      noActivitiesSub: 'త్వరలోనే వివరాలు ప్రచురించబడతాయి.',

      // Announcements
      announcementsTitle: 'ముఖ్య ప్రకటనలు',
      announcementsSub: 'మఠం సర్క్యులర్లు, సేవా సమయాలు మరియు ముఖ్య సమాచారం',
      viewAllAnnouncements: 'అన్ని ప్రకటనలను చూడండి →',
      noAnnouncements: 'ప్రస్తుతం ఏ ప్రకటనలూ లేవు.',
      noAnnouncementsSub: 'ముఖ్య నవీకరణలు ఇక్కడ ప్రచురించబడతాయి.',

      // Common
      readDetails: 'వివరాలు చదవండి →',
      close: 'మూసివేయి',
      loading: 'సమాచారం లోడ్ అవుతోంది...',
      error: 'సమాచారాన్ని లోడ్ చేయలేకపోయాము.',
      retry: 'మళ్లీ ప్రయత్నించండి',
      date: 'తేదీ',
      title: 'శీర్షిక',
      attachedMedia: 'జతచేసిన పత్రాలు & చిత్రాలు',
      openNewTab: 'కొత్త ట్యాబ్‌లో తెరవండి',
      pdfDoc: 'PDF పత్రం',

      // Footer
      quickLinks: 'త్వరిత లింకులు',
      darshanTimings: 'దర్శన సమయాలు',
      contactUs: 'మమ్మల్ని సంప్రదించండి',
      footerAbout: 'కోలార శృంగేరి శ్రీశంకర మఠం జగద్గురు శ్రీ ఆది శంకరాచార్యుల అద్వైత వేదాంత పరంపరను పరిరక్షించే పవిత్ర సంస్థ. సనాతన ధర్మం, వేద విద్య మరియు సమాజ సేవకు అంకితమైనది.'
    }
  };

  const t = (key) => {
    if (translations[currentLanguage] && translations[currentLanguage][key]) {
      return translations[currentLanguage][key];
    }
    if (translations.kn && translations.kn[key]) {
      return translations.kn[key];
    }
    if (translations.en && translations.en[key]) {
      return translations.en[key];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
