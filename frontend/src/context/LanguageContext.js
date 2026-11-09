import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const translations = {
    en: {
      // Navigation
      home: 'Home',
      activities: 'Activities',
      announcements: 'Announcements',
      contact: 'Contact',
      adminPanel: 'Admin Panel',
      
      // Hero Section
      heroTitle: 'श्री कौलार शृंगेरी शंकर मठ',
      heroSubtitle: 'Kolar Sringeri Shankara Mutt',
      heroDescription: 'A sacred institution dedicated to preserving and propagating the teachings of Adi Shankaracharya and the rich spiritual heritage of Sanatana Dharma. We welcome devotees and seekers from all walks of life to experience the divine atmosphere and participate in our various spiritual activities, discourses, and cultural programs.',
      heroCTA: 'Explore our spiritual activities, important announcements, and connect with our community',
      
      // Welcome Section
      welcomeTitle: 'स्वागतम् - Welcome',
      welcomeDescription: 'Welcome to the sacred precincts of Kolar Shankara Mutt, a spiritual haven where ancient wisdom meets modern devotion',
      welcomeText1: 'The Kolar Shankara Mutt stands as a beacon of spiritual enlightenment, following the noble traditions established by Adi Shankaracharya. Our institution serves as a center for spiritual learning, cultural preservation, and community service.',
      welcomeText2: 'We invite devotees and seekers from all walks of life to experience the divine atmosphere and participate in our various spiritual activities, discourses, and cultural programs.',
      
      // Activities Section
      activitiesTitle: 'Recent Spiritual Activities',
      activitiesDescription: 'Explore our latest spiritual and cultural events',
      noActivities: 'No activities currently scheduled',
      noActivitiesSub: 'Check back soon for upcoming spiritual events',
      viewAllActivities: 'View All Activities →',
      
      // Announcements Section
      announcementsTitle: 'Important Announcements',
      announcementsDescription: 'Stay updated with important news and information',
      noAnnouncements: 'No announcements currently',
      noAnnouncementsSub: 'Important updates will appear here',
      viewAllAnnouncements: 'View All Announcements →',
      
      // Contact Section
      contactTitle: 'Get in Touch',
      contactDescription: "We'd love to hear from you. Send us a message!",
      visitUs: 'Visit Us',
      callUs: 'Call Us',
      emailUs: 'Email Us',
      address: 'Kolar Shankara Mutt, Kote, Kolar, Karnataka, India',
      phone: '+91 83101 51359',
      phoneHours: 'Mon - Sat, 9AM - 6PM',
      email: 'info@kolarshankaramutt.org',
      emailResponse: "We'll respond within 24 hours",
      fullName: 'Full Name',
      emailAddress: 'Email Address',
      message: 'Message',
      sendMessage: 'Send Message',
      sending: 'Sending...',
      enterName: 'Enter your full name',
      enterEmail: 'Enter your email',
      enterMessage: 'Tell us how we can help you...',
      
      // Footer
      copyright: '© 2024 Kolar Shankara Mutt. All rights reserved.',
      contactInfo: 'Contact: info@kolarshankaramutt.org | Phone: +91 83101 51359',
      
      // Common
      loading: 'Loading sacred content...',
      error: 'Unable to load content. Please check your connection.',
      tryAgain: 'Try Again',
      date: 'Date',
      title: 'Title',
      description: 'Description'
    },
    
    kn: {
      // Navigation
      home: 'ಮುಖಪುಟ',
      activities: 'ಕಾರ್ಯಕ್ರಮಗಳು',
      announcements: 'ಘೋಷಣೆಗಳು',
      contact: 'ಸಂಪರ್ಕ',
      adminPanel: 'ನಿರ್ವಾಹಕ ಫಲಕ',
      
      // Hero Section
      heroTitle: 'ಶ್ರೀ ಕೋಲಾರ ಶೃಂಗೇರಿ ಶಂಕರ ಮಠ',
      heroSubtitle: 'ಕೋಲಾರ ಶೃಂಗೇರಿ ಶಂಕರ ಮಠ',
      heroDescription: 'ಆದಿ ಶಂಕರಾಚಾರ್ಯರ ಉಪದೇಶಗಳನ್ನು ಸಂರಕ್ಷಿಸುವ ಮತ್ತು ಪ್ರಸಾರ ಮಾಡುವ ಪವಿತ್ರ ಸಂಸ್ಥೆ. ಸನಾತನ ಧರ್ಮದ ಸಮೃದ್ಧ ಆಧ್ಯಾತ್ಮಿಕ ಪರಂಪರೆಯನ್ನು ನಾವು ಸ್ವಾಗತಿಸುತ್ತೇವೆ. ಎಲ್ಲಾ ವರ್ಗದ ಭಕ್ತರು ಮತ್ತು ಅನ್ವೇಷಕರನ್ನು ನಮ್ಮ ವಿವಿಧ ಆಧ್ಯಾತ್ಮಿಕ ಚಟುವಟಿಕೆಗಳು, ಭಾಷಣಗಳು ಮತ್ತು ಸಾಂಸ್ಕೃತಿಕ ಕಾರ್ಯಕ್ರಮಗಳಲ್ಲಿ ಭಾಗವಹಿಸಲು ಆಹ್ವಾನಿಸುತ್ತೇವೆ.',
      heroCTA: 'ನಮ್ಮ ಆಧ್ಯಾತ್ಮಿಕ ಚಟುವಟಿಕೆಗಳು, ಮುಖ್ಯ ಘೋಷಣೆಗಳು ಮತ್ತು ಸಮುದಾಯದೊಂದಿಗೆ ಸಂಪರ್ಕಿಸಿ',
      
      // Welcome Section
      welcomeTitle: 'ಸ್ವಾಗತ - ಸ್ವಾಗತ',
      welcomeDescription: 'ಕೋಲಾರ ಶಂಕರ ಮಠದ ಪವಿತ್ರ ಪ್ರದೇಶಗಳಿಗೆ ಸ್ವಾಗತ, ಪ್ರಾಚೀನ ಜ್ಞಾನ ಆಧುನಿಕ ಭಕ್ತಿಯನ್ನು ಭೇಟಿ ಮಾಡುವ ಆಧ್ಯಾತ್ಮಿಕ ಆಶ್ರಯ',
      welcomeText1: 'ಕೋಲಾರ ಶಂಕರ ಮಠವು ಆದಿ ಶಂಕರಾಚಾರ್ಯರಿಂದ ಸ್ಥಾಪಿತವಾದ ಉನ್ನತ ಸಂಪ್ರದಾಯಗಳನ್ನು ಅನುಸರಿಸಿ ಆಧ್ಯಾತ್ಮಿಕ ಜ್ಞಾನೋದಯದ ದೀಪಸ್ತಂಭವಾಗಿ ನಿಂತಿದೆ. ನಮ್ಮ ಸಂಸ್ಥೆಯು ಆಧ್ಯಾತ್ಮಿಕ ಕಲಿಕೆ, ಸಾಂಸ್ಕೃತಿಕ ಸಂರಕ್ಷಣೆ ಮತ್ತು ಸಮುದಾಯ ಸೇವೆಯ ಕೇಂದ್ರವಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ.',
      welcomeText2: 'ಎಲ್ಲಾ ವರ್ಗದ ಭಕ್ತರು ಮತ್ತು ಅನ್ವೇಷಕರನ್ನು ನಮ್ಮ ವಿವಿಧ ಆಧ್ಯಾತ್ಮಿಕ ಚಟುವಟಿಕೆಗಳು, ಭಾಷಣಗಳು ಮತ್ತು ಸಾಂಸ್ಕೃತಿಕ ಕಾರ್ಯಕ್ರಮಗಳಲ್ಲಿ ಭಾಗವಹಿಸಲು ಆಹ್ವಾನಿಸುತ್ತೇವೆ.',
      
      // Activities Section
      activitiesTitle: 'ಇತ್ತೀಚಿನ ಆಧ್ಯಾತ್ಮಿಕ ಚಟುವಟಿಕೆಗಳು',
      activitiesDescription: 'ನಮ್ಮ ಇತ್ತೀಚಿನ ಆಧ್ಯಾತ್ಮಿಕ ಮತ್ತು ಸಾಂಸ್ಕೃತಿಕ ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ಅನ್ವೇಷಿಸಿ',
      noActivities: 'ಇತ್ತೀಚೆಗೆ ಯಾವುದೇ ಚಟುವಟಿಕೆಗಳು ಯೋಜಿಸಲಾಗಿಲ್ಲ',
      noActivitiesSub: 'ಮುಂದಿನ ಆಧ್ಯಾತ್ಮಿಕ ಕಾರ್ಯಕ್ರಮಗಳಿಗಾಗಿ ಶೀಘ್ರದಲ್ಲಿ ಪರಿಶೀಲಿಸಿ',
      viewAllActivities: 'ಎಲ್ಲಾ ಚಟುವಟಿಕೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ →',
      
      // Announcements Section
      announcementsTitle: 'ಮುಖ್ಯ ಘೋಷಣೆಗಳು',
      announcementsDescription: 'ಮುಖ್ಯ ಸುದ್ದಿಗಳು ಮತ್ತು ಮಾಹಿತಿಯೊಂದಿಗೆ ನವೀಕೃತವಾಗಿರಿ',
      noAnnouncements: 'ಇತ್ತೀಚೆಗೆ ಯಾವುದೇ ಘೋಷಣೆಗಳಿಲ್ಲ',
      noAnnouncementsSub: 'ಮುಖ್ಯ ನವೀಕರಣಗಳು ಇಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ',
      viewAllAnnouncements: 'ಎಲ್ಲಾ ಘೋಷಣೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ →',
      
      // Contact Section
      contactTitle: 'ಸಂಪರ್ಕಿಸಿ',
      contactDescription: 'ನಿಮ್ಮಿಂದ ಕೇಳಲು ನಮಗೆ ಇಷ್ಟವಿದೆ. ನಮಗೆ ಸಂದೇಶ ಕಳುಹಿಸಿ!',
      visitUs: 'ನಮ್ಮನ್ನು ಭೇಟಿ ಮಾಡಿ',
      callUs: 'ನಮ್ಮನ್ನು ಕರೆ ಮಾಡಿ',
      emailUs: 'ನಮಗೆ ಇಮೇಲ್ ಮಾಡಿ',
      address: 'ಕೋಲಾರ ಶಂಕರ ಮಠ, ಕೋಟೆ, ಕೋಲಾರ, ಕರ್ನಾಟಕ, ಭಾರತ',
      phone: '+91 83101 51359',
      phoneHours: 'ಸೋಮ - ಶನಿ, ಬೆಳಗ್ಗೆ 9 - ಸಂಜೆ 6',
      email: 'info@kolarshankaramutt.org',
      emailResponse: 'ನಾವು 24 ಗಂಟೆಗಳಲ್ಲಿ ಪ್ರತಿಕ್ರಿಯಿಸುತ್ತೇವೆ',
      fullName: 'ಪೂರ್ಣ ಹೆಸರು',
      emailAddress: 'ಇಮೇಲ್ ವಿಳಾಸ',
      message: 'ಸಂದೇಶ',
      sendMessage: 'ಸಂದೇಶ ಕಳುಹಿಸಿ',
      sending: 'ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...',
      enterName: 'ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ',
      enterEmail: 'ನಿಮ್ಮ ಇಮೇಲ್ ನಮೂದಿಸಿ',
      enterMessage: 'ನಾವು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು ಎಂದು ಹೇಳಿ...',
      
      // Footer
      copyright: '© 2024 ಕೋಲಾರ ಶಂಕರ ಮಠ. ಎಲ್ಲ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದುಕೊಳ್ಳಲಾಗಿದೆ.',
      contactInfo: 'ಸಂಪರ್ಕ: info@kolarshankaramutt.org | ಫೋನ್: +91 83101 51359',
      
      // Common
      loading: 'ಪವಿತ್ರ ವಿಷಯವನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...',
      error: 'ವಿಷಯವನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸಂಪರ್ಕವನ್ನು ಪರಿಶೀಲಿಸಿ.',
      tryAgain: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
      date: 'ದಿನಾಂಕ',
      title: 'ಶೀರ್ಷಿಕೆ',
      description: 'ವಿವರಣೆ'
    },
    
    sa: {
      // Navigation
      home: 'गृहम्',
      activities: 'कार्यक्रमाः',
      announcements: 'घोषणाः',
      contact: 'सम्पर्कः',
      adminPanel: 'प्रशासकीय फलकम्',
      
      // Hero Section
      heroTitle: 'श्री कोलार शृङ्गेरी शङ्कर मठः',
      heroSubtitle: 'कोलार शृङ्गेरी शङ्कर मठः',
      heroDescription: 'आदि शङ्कराचार्यस्य उपदेशानां संरक्षणाय तथा प्रसाराय समर्पितं पवित्रं संस्थानम्। सनातनधर्मस्य समृद्धायाः आध्यात्मिकायाः परम्परायाः संवर्धनाय। सर्वेषां वर्गाणां भक्तानां साधकानां च आह्वानं कुर्मः ये अस्माकं विविधेषु आध्यात्मिकेषु कार्येषु, प्रवचनेषु सांस्कृतिकेषु च कार्यक्रमेषु भागं गृह्णीयुः।',
      heroCTA: 'अस्माकं आध्यात्मिकानि कार्याणि, महत्वपूर्णाः घोषणाः समुदायेन सह सम्पर्कं च अन्वेषयत',
      
      // Welcome Section
      welcomeTitle: 'स्वागतम् - स्वागतम्',
      welcomeDescription: 'कोलार शङ्कर मठस्य पवित्रेषु प्रदेशेषु स्वागतम्, यत्र प्राचीनं ज्ञानं आधुनिकायाः भक्तेः साक्षात्कारं करोति',
      welcomeText1: 'कोलार शङ्कर मठः आदि शङ्कराचार्यैः स्थापितानां उन्नतानां परम्पराणां अनुसरणेन आध्यात्मिकस्य ज्ञानोदयस्य दीपस्तम्भः इव तिष्ठति। अस्माकं संस्था आध्यात्मिकायाः शिक्षायाः, सांस्कृतिकस्य संरक्षणस्य समुदायस्य सेवायाः च केंद्रं भवति।',
      welcomeText2: 'सर्वेषां वर्गाणां भक्तानां साधकानां च आह्वानं कुर्मः ये अस्माकं विविधेषु आध्यात्मिकेषु कार्येषु, प्रवचनेषु सांस्कृतिकेषु च कार्यक्रमेषु भागं गृह्णीयुः।',
      
      // Activities Section
      activitiesTitle: 'साम्प्रतिकानि आध्यात्मिकानि कार्याणि',
      activitiesDescription: 'अस्माकं साम्प्रतिकानि आध्यात्मिकानि सांस्कृतिकानि च कार्याणि अन्वेषयत',
      noActivities: 'साम्प्रतं कोऽपि कार्यक्रमः नियोजितः',
      noActivitiesSub: 'आगामिकेषु आध्यात्मिकेषु कार्येषु शीघ्रं पुनः पश्यत',
      viewAllActivities: 'सर्वाणि कार्याणि पश्यत →',
      
      // Announcements Section
      announcementsTitle: 'महत्वपूर्णाः घोषणाः',
      announcementsDescription: 'महत्वपूर्णैः समाचारैः सूचनाभिः च अद्यतनाः भवत',
      noAnnouncements: 'साम्प्रतं कोऽपि घोषणा नास्ति',
      noAnnouncementsSub: 'महत्वपूर्णाः अद्यतनाः अत्र दृश्यन्ते',
      viewAllAnnouncements: 'सर्वाः घोषणाः पश्यत →',
      
      // Contact Section
      contactTitle: 'सम्पर्कं कुरुत',
      contactDescription: 'भवतः श्रवणाय अस्माकं इच्छा अस्ति। अस्मभ्यं सन्देशं प्रेषयत!',
      visitUs: 'अस्मान् भेटत',
      callUs: 'अस्मान् आह्वयत',
      emailUs: 'अस्मभ्यं ईमेलं कुरुत',
      address: 'कोलार शङ्कर मठः, कोटे, कोलारः, कर्नाटकः, भारतम्',
      phone: '+91 83101 51359',
      phoneHours: 'सोमः - शनिः, प्रातः 9 - सायं 6',
      email: 'info@kolarshankaramutt.org',
      emailResponse: 'अस्माभिः 24 घण्टेषु प्रतिक्रिया दीयते',
      fullName: 'पूर्णं नाम',
      emailAddress: 'ईमेल पता',
      message: 'सन्देशः',
      sendMessage: 'सन्देशं प्रेषयत',
      sending: 'प्रेषणं क्रियते...',
      enterName: 'भवतः पूर्णं नाम प्रवेशयत',
      enterEmail: 'भवतः ईमेल प्रवेशयत',
      enterMessage: 'अस्माभिः कथं साहाय्यं कर्तुं शक्नुमः इति कथयत...',
      
      // Footer
      copyright: '© 2024 कोलार शङ्कर मठः। सर्वे अधिकाराः संरक्षिताः।',
      contactInfo: 'सम्पर्कः info@kolarshankaramutt.org | दूरभाषः +91 83101 51359',
      
      // Common
      loading: 'पवित्रं विषयं लोड् क्रियते...',
      error: 'विषयं लोड् कर्तुं अशक्यम्। कृपया भवतः सम्पर्कं परीक्षयत।',
      tryAgain: 'पुनः प्रयत्नं कुरुत',
      date: 'दिनाङ्कः',
      title: 'शीर्षिका',
      description: 'विवरणम्'
    },
    
    te: {
      // Navigation
      home: 'హోమ్',
      activities: 'కార్యక్రమాలు',
      announcements: 'ప్రకటనలు',
      contact: 'సంప్రదింపులు',
      adminPanel: 'అడ్మిన్ ప్యానెల్',
      
      // Hero Section
      heroTitle: 'శ్రీ కోలార శృంగేరి శంకర మఠం',
      heroSubtitle: 'కోలార శృంగేరి శంకర మఠం',
      heroDescription: 'ఆది శంకరాచార్యుల ఉపదేశాలను సంరక్షించడానికి మరియు వ్యాప్తి చేయడానికి అంకితమైన పవిత్ర సంస్థ. సనాతన ధర్మం యొక్క సమృద్ధమైన ఆధ్యాత్మిక వారసత్వాన్ని మేము స్వాగతం చేస్తున్నాము. అన్ని వర్గాల భక్తులు మరియు అన్వేషకులను మా వివిధ ఆధ్యాత్మిక కార్యక్రమాలు, ఉపన్యాసాలు మరియు సాంస్కృతిక కార్యక్రమాలలో పాల్గొనడానికి ఆహ్వానిస్తున్నాము.',
      heroCTA: 'మా ఆధ్యాత్మిక కార్యక్రమాలు, ముఖ్య ప్రకటనలు మరియు సమాజంతో కనెక్ట్ అవ్వండి',
      
      // Welcome Section
      welcomeTitle: 'స్వాగతం - స్వాగతం',
      welcomeDescription: 'కోలార శంకర మఠం యొక్క పవిత్ర ప్రాంతాలకు స్వాగతం, ప్రాచీన జ్ఞానం ఆధునిక భక్తిని కలుసుకునే ఆధ్యాత్మిక ఆశ్రయం',
      welcomeText1: 'కోలార శంకర మఠం ఆది శంకరాచార్యులచే స్థాపించబడిన ఉన్నత సంప్రదాయాలను అనుసరించి ఆధ్యాత్మిక జ్ఞానోదయం యొక్క దీపస్తంభంగా నిలిచింది. మా సంస్థ ఆధ్యాత్మిక విద్య, సాంస్కృతిక సంరక్షణ మరియు సమాజ సేవ కేంద్రంగా పనిచేస్తుంది.',
      welcomeText2: 'అన్ని వర్గాల భక్తులు మరియు అన్వేషకులను మా వివిధ ఆధ్యాత్మిక కార్యక్రమాలు, ఉపన్యాసాలు మరియు సాంస్కృతిక కార్యక్రమాలలో పాల్గొనడానికి ఆహ్వానిస్తున్నాము.',
      
      // Activities Section
      activitiesTitle: 'ఇటీవలి ఆధ్యాత్మిక కార్యక్రమాలు',
      activitiesDescription: 'మా ఇటీవలి ఆధ్యాత్మిక మరియు సాంస్కృతిక కార్యక్రమాలను అన్వేషించండి',
      noActivities: 'ప్రస్తుతం ఏ కార్యక్రమాలూ షెడ్యూల్ చేయబడలేదు',
      noActivitiesSub: 'రాబోయే ఆధ్యాత్మిక కార్యక్రమాల కోసం త్వరలో తనిఖీ చేయండి',
      viewAllActivities: 'అన్ని కార్యక్రమాలను చూడండి →',
      
      // Announcements Section
      announcementsTitle: 'ముఖ్య ప్రకటనలు',
      announcementsDescription: 'ముఖ్య వార్తలు మరియు సమాచారంతో నవీకృతం అవ్వండి',
      noAnnouncements: 'ప్రస్తుతం ఏ ప్రకటనలూ లేవు',
      noAnnouncementsSub: 'ముఖ్య నవీకరణలు ఇక్కడ కనిపిస్తాయి',
      viewAllAnnouncements: 'అన్ని ప్రకటనలను చూడండి →',
      
      // Contact Section
      contactTitle: 'సంప్రదించండి',
      contactDescription: 'మీ నుండి వినడానికి మాకు ఇష్టం. మాకు సందేశం పంపండి!',
      visitUs: 'మమ్మల్ని సందర్శించండి',
      callUs: 'మమ్మల్ని కాల్ చేయండి',
      emailUs: 'మాకు ఇమెయిల్ చేయండి',
      address: 'కోలార శంకర మఠం, కోట, కోలార్, కర్ణాటక, భారతదేశం',
      phone: '+91 83101 51359',
      phoneHours: 'సోమ - శని, ఉదయం 9 - సాయంత్రం 6',
      email: 'info@kolarshankaramutt.org',
      emailResponse: 'మేము 24 గంటల్లో ప్రతిస్పందిస్తాము',
      fullName: 'పూర్తి పేరు',
      emailAddress: 'ఇమెయిల్ చిరునామా',
      message: 'సందేశం',
      sendMessage: 'సందేశం పంపండి',
      sending: 'పంపుతోంది...',
      enterName: 'మీ పూర్తి పేరును నమోదు చేయండి',
      enterEmail: 'మీ ఇమెయిల్ నమోదు చేయండి',
      enterMessage: 'మేము మీకు ఎలా సహాయం చేయగలమో చెప్పండి...',
      
      // Footer
      copyright: '© 2024 కోలార శంకర మఠం. అన్ని హక్కులు కాపాడబడ్డాయి.',
      contactInfo: 'సంప్రదింపులు: info@kolarshankaramutt.org | ఫోన్: +91 83101 51359',
      
      // Common
      loading: 'పవిత్రమైన విషయాన్ని లోడ్ చేస్తోంది...',
      error: 'విషయాన్ని లోడ్ చేయలేకపోయాము. దయచేసి మీ కనెక్షన్ తనిఖీ చేయండి.',
      tryAgain: 'మళ్లీ ప్రయత్నించండి',
      date: 'తేదీ',
      title: 'శీర్షిక',
      description: 'వివరణ'
    }
  };

  const changeLanguage = (langCode) => {
    setCurrentLanguage(langCode);
  };

  const t = (key) => {
    return translations[currentLanguage][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
