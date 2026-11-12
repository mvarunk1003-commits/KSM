import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BannerCarousel from '../components/BannerCarousel';
import MediaModal from '../components/MediaModal';
import { getImageUrl, isPdfFile, openMediaInNewTab } from '../utils/imageUtils';
import API_BASE from '../config/api';
import { useLanguage } from '../context/LanguageContext';

function Home() {
  const navigate = useNavigate();
  const { currentLanguage, t } = useLanguage();

  const [activities, setActivities] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [bannerImages, setBannerImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeMedia, setActiveMedia] = useState(null);

  // Live Temple Darshan Status Calculator (Dynamic & Localized)
  const darshanStatus = useMemo(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentMins = hours * 60 + minutes;

    // Morning: 08:00 AM (480) - 12:30 PM (750)
    // Evening: 06:00 PM (1080) - 08:30 PM (1230)
    const isMorningOpen = currentMins >= 480 && currentMins <= 750;
    const isEveningOpen = currentMins >= 1080 && currentMins <= 1230;

    if (isMorningOpen || isEveningOpen) {
      return {
        isOpen: true,
        text: t('darshanOpen'),
        subText: isMorningOpen ? t('darshanClosesAt1230') : t('darshanClosesAt830')
      };
    }

    let nextTimeStr = '08:00 AM';
    if (currentMins < 480) {
      nextTimeStr = '08:00 AM';
    } else if (currentMins < 1080) {
      nextTimeStr = '06:00 PM';
    } else {
      nextTimeStr = '08:00 AM';
    }

    return {
      isOpen: false,
      text: `${t('nextDarshanPrefix')}${nextTimeStr}`,
      subText: t('darshanClosed')
    };
  }, [t]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [activitiesRes, announcementsRes, bannerRes] = await Promise.all([
        fetch(`${API_BASE}/activities`),
        fetch(`${API_BASE}/announcements`),
        fetch(`${API_BASE}/banner-images`)
      ]);

      const activitiesData = activitiesRes.ok ? await activitiesRes.json() : [];
      const announcementsData = announcementsRes.ok ? await announcementsRes.json() : [];
      const bannerData = bannerRes.ok ? await bannerRes.json() : [];

      const allImages = bannerData.reduce((acc, banner) => {
        return banner.images ? [...acc, ...banner.images] : acc;
      }, []);

      setActivities(Array.isArray(activitiesData) ? activitiesData : []);
      setAnnouncements(Array.isArray(announcementsData) ? announcementsData : []);
      setBannerImages(allImages);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const handleItemClick = (item, type) => {
    setSelectedItem({ ...item, type });
    setShowModal(true);
  };

  const closeModal = useCallback(() => {
    setShowModal(false);
    setSelectedItem(null);
  }, []);

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showModal) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, closeModal]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const locale = currentLanguage === 'kn' ? 'kn-IN' : currentLanguage === 'te' ? 'te-IN' : 'en-IN';
      return new Date(dateString).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (err) {
      return dateString;
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Card renderer for Activities and Announcements
  const renderCard = (item, type) => (
    <article
      key={item.id}
      className="card card-sacred"
      onClick={() => handleItemClick(item, type)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleItemClick(item, type);
        }
      }}
      tabIndex="0"
      role="button"
      aria-label={`View details of ${item.title}`}
    >
      {item.images && item.images.length > 0 && (
        <div className="card-images-top" aria-hidden="true">
          {item.images.slice(0, 3).map((img, idx) => (
            <img
              key={idx}
              src={getImageUrl(img)}
              alt={`${type} media ${idx + 1}`}
              className="card-image-main"
              loading="lazy"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ))}
          {item.images.length > 3 && (
            <div className="image-overlay-main">
              <span>+{item.images.length - 3}</span>
            </div>
          )}
        </div>
      )}
      <header className="card-header">
        <div className="card-meta-tag">
          {type === 'activity' ? t('activities') : t('announcements')}
        </div>
        <h3 className="card-title">{item.title}</h3>
        {item.date && (
          <time dateTime={item.date} className="date card-date-badge">
            {formatDate(item.date)}
          </time>
        )}
      </header>
      <div className="card-content">
        <p>{item.description}</p>
      </div>
      <footer className="card-footer">
        <span className="card-readmore-link">
          {t('readDetails')}
        </span>
      </footer>
    </article>
  );

  return (
    <div className="page-wrapper">
      <Header />

      <main id="main-content" className="container" role="main">

        {/* Sacred Darshan & Live Timings Bar */}
        <section aria-label="Darshan & Pooja Timings" className="darshan-ticker-card">
          <div className="darshan-ticker-inner">
            <div className={`darshan-status-pill ${darshanStatus.isOpen ? 'open' : 'closed'}`}>
              <span
                className="pulse-indicator"
                style={{ background: darshanStatus.isOpen ? '#2E7D32' : '#C85A17' }}
              ></span>
              <span>
                {darshanStatus.text}
                <small style={{ display: 'block', fontSize: '0.725rem', opacity: 0.85, fontWeight: 500 }}>
                  {darshanStatus.subText}
                </small>
              </span>
            </div>

            <div className="darshan-timings-grid">
              <div className="darshan-timing-col">
                <span className="darshan-label">🌅 {t('morningDarshan')}:</span>
                <span className="darshan-val">{t('morningDarshanTime')}</span>
              </div>
              <div className="darshan-timing-col">
                <span className="darshan-label">🪔 {t('mahamangalarathi')}:</span>
                <span className="darshan-val">{t('mahamangalarathiTime')}</span>
              </div>
              <div className="darshan-timing-col">
                <span className="darshan-label">🌙 {t('eveningDarshan')}:</span>
                <span className="darshan-val">{t('eveningDarshanTime')}</span>
              </div>
            </div>
          </div>
        </section>

        {/* High Resolution Carousel Highlights Section */}
        <section aria-label="Highlights Banner" className="section-carousel-wrapper">
          <BannerCarousel images={bannerImages} />
        </section>

        {/* Quick Sacred Action Links */}
        <section aria-label="Quick Action Services" className="quick-actions-bar">
          <button
            type="button"
            className="quick-action-btn primary"
            onClick={() => navigate('/donation')}
          >
            <div className="btn-text">
              <strong>{t('onlineSeva')}</strong>
              <span>{t('onlineSevaSub')}</span>
            </div>
            <span className="btn-arrow" aria-hidden="true">&rarr;</span>
          </button>

          <button
            type="button"
            className="quick-action-btn"
            onClick={() => navigate('/activities')}
          >
            <div className="btn-text">
              <strong>{t('spiritualActivities')}</strong>
              <span>{t('spiritualActivitiesSub')}</span>
            </div>
            <span className="btn-arrow" aria-hidden="true">&rarr;</span>
          </button>

          <button
            type="button"
            className="quick-action-btn"
            onClick={() => navigate('/announcements')}
          >
            <div className="btn-text">
              <strong>{t('muttAnnouncements')}</strong>
              <span>{t('muttAnnouncementsSub')}</span>
            </div>
            <span className="btn-arrow" aria-hidden="true">&rarr;</span>
          </button>

          <button
            type="button"
            className="quick-action-btn"
            onClick={() => navigate('/contact')}
          >
            <div className="btn-text">
              <strong>{t('visitContact')}</strong>
              <span>{t('visitContactSub')}</span>
            </div>
            <span className="btn-arrow" aria-hidden="true">&rarr;</span>
          </button>
        </section>

        {/* Traditional Sacred Divider */}
        <div className="traditional-divider" aria-hidden="true">
          <span className="divider-line"></span>
          <span className="divider-symbol">{t('sacredShloka')}</span>
          <span className="divider-line"></span>
        </div>

        {loading ? (
          <section className="section" aria-busy="true" aria-label="Loading content">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>{t('loading')}</p>
            </div>
          </section>
        ) : error ? (
          <section className="section" role="alert" aria-label="Error loading content">
            <div className="error-container">
              <h2>{t('error')}</h2>
              <p>{error}</p>
              <button type="button" onClick={fetchData} className="btn btn-primary">
                {t('retry')}
              </button>
            </div>
          </section>
        ) : (
          <>
            {/* Redesigned Sacred Heritage & Lineage Section */}
            <section className="section section-heritage" aria-labelledby="welcome-heading">
              <div className="section-header">
                <div>
                  <h2 id="welcome-heading" className="section-title">
                    {t('heritageTitle')}
                  </h2>
                  <p className="section-subtitle">
                    {t('heritageSubtitle')}
                  </p>
                </div>
              </div>

              {/* Lead Introduction Banner */}
              <div className="heritage-hero-banner">
                <p className="heritage-lead-text">
                  {t('heritageIntro')}
                </p>

                {/* Chronological Milestone Timeline */}
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary)', marginBottom: 'var(--spacing-sm)', fontSize: '1.15rem' }}>
                  {t('milestonesHeading')}
                </h3>
                <div className="heritage-timeline">
                  <div className="timeline-card">
                    <span className="timeline-year-badge">1928</span>
                    <h4 className="timeline-card-title">{t('m1928Title')}</h4>
                    <p className="timeline-card-desc">
                      {t('m1928Desc')}
                    </p>
                  </div>

                  <div className="timeline-card">
                    <span className="timeline-year-badge">1930</span>
                    <h4 className="timeline-card-title">{t('m1930Title')}</h4>
                    <p className="timeline-card-desc">
                      {t('m1930Desc')}
                    </p>
                  </div>

                  <div className="timeline-card">
                    <span className="timeline-year-badge">1965</span>
                    <h4 className="timeline-card-title">{t('m1965Title')}</h4>
                    <p className="timeline-card-desc">
                      {t('m1965Desc')}
                    </p>
                  </div>

                  <div className="timeline-card">
                    <span className="timeline-year-badge">2019</span>
                    <h4 className="timeline-card-title">{t('m2019Title')}</h4>
                    <p className="timeline-card-desc">
                      {t('m2019Desc')}
                    </p>
                  </div>

                  <div className="timeline-card">
                    <span className="timeline-year-badge current">
                      {currentLanguage === 'kn' ? 'ಪ್ರಸ್ತುತ' : currentLanguage === 'sa' ? 'साम्प्रतम्' : currentLanguage === 'te' ? 'ప్రస్తుతం' : 'Present'}
                    </span>
                    <h4 className="timeline-card-title">{t('mPresentTitle')}</h4>
                    <p className="timeline-card-desc">
                      {t('mPresentDesc')}
                    </p>
                  </div>
                </div>

                {/* Regular Weekly Programs & Spiritual Classes */}
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary)', marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-sm)', fontSize: '1.15rem' }}>
                  {t('programsHeading')}
                </h3>
                <div className="sacred-programs-grid">
                  <div className="sacred-program-card">
                    <div className="program-header">
                      <div className="program-icon-title">
                        <span className="program-emoji" aria-hidden="true">📖</span>
                        <h4 className="program-name">{t('discoursesTitle')}</h4>
                      </div>
                      <span className="program-schedule-badge">{t('discoursesSchedule')}</span>
                    </div>
                    <p className="program-desc">
                      {t('discoursesDesc')}
                    </p>
                  </div>

                  <div className="sacred-program-card">
                    <div className="program-header">
                      <div className="program-icon-title">
                        <span className="program-emoji" aria-hidden="true">📿</span>
                        <h4 className="program-name">{t('stotraTitle')}</h4>
                      </div>
                      <span className="program-schedule-badge">{t('stotraSchedule')}</span>
                    </div>
                    <p className="program-desc">
                      {t('stotraDesc')}
                    </p>
                  </div>

                  <div className="sacred-program-card">
                    <div className="program-header">
                      <div className="program-icon-title">
                        <span className="program-emoji" aria-hidden="true">✍️</span>
                        <h4 className="program-name">{t('sanskritTitle')}</h4>
                      </div>
                      <span className="program-schedule-badge">{t('sanskritSchedule')}</span>
                    </div>
                    <p className="program-desc">
                      {t('sanskritDesc')}
                    </p>
                  </div>
                </div>

                {/* Vision of the Srimath */}
                <div className="sacred-vision-card">
                  <div className="vision-text-block">
                    <h3>{t('visionTitle')}</h3>
                    <p>{t('visionDesc')}</p>
                  </div>
                  <div className="vision-badges-group">
                    <span className="vision-pill">{t('vLearning')}</span>
                    <span className="vision-pill">{t('vSanskrit')}</span>
                    <span className="vision-pill">{t('vCulture')}</span>
                    <span className="vision-pill">{t('vDharma')}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 4 Sacred Heritage Pillars */}
            <section aria-label="Core Pillars of the Mutt" className="section section-pillars">
              <div className="grid grid-4">
                <article className="pillar-card">
                  <div className="pillar-num">01</div>
                  <h3 className="pillar-title">{t('p1Title')}</h3>
                  <p className="pillar-desc">
                    {t('p1Desc')}
                  </p>
                </article>

                <article className="pillar-card">
                  <div className="pillar-num">02</div>
                  <h3 className="pillar-title">{t('p2Title')}</h3>
                  <p className="pillar-desc">
                    {t('p2Desc')}
                  </p>
                </article>

                <article className="pillar-card">
                  <div className="pillar-num">03</div>
                  <h3 className="pillar-title">{t('p3Title')}</h3>
                  <p className="pillar-desc">
                    {t('p3Desc')}
                  </p>
                </article>

                <article className="pillar-card">
                  <div className="pillar-num">04</div>
                  <h3 className="pillar-title">{t('p4Title')}</h3>
                  <p className="pillar-desc">
                    {t('p4Desc')}
                  </p>
                </article>
              </div>
            </section>

            {/* Devotee E-Seva & Donation Callout Banner */}
            <section aria-label="Devotee E-Seva Portal" className="seva-callout-banner">
              <div className="seva-callout-info">
                <h3>{t('sevaBannerTitle')}</h3>
                <p>{t('sevaBannerDesc')}</p>
              </div>
              <div className="seva-callout-cta">
                <button
                  type="button"
                  className="btn btn-gold btn-lg"
                  onClick={() => navigate('/donation')}
                >
                  {t('bookSevaBtn')}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-lg"
                  style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.1)' }}
                  onClick={() => navigate('/contact')}
                >
                  {t('contactOfficeBtn')}
                </button>
              </div>
            </section>

            {/* Traditional Sacred Divider */}
            <div className="traditional-divider" aria-hidden="true">
              <span className="divider-line"></span>
              <span className="divider-symbol">{t('sacredShloka')}</span>
              <span className="divider-line"></span>
            </div>

            {/* Recent Activities Section */}
            <section className="section" aria-labelledby="activities-heading">
              <div className="section-header">
                <div>
                  <h2 id="activities-heading" className="section-title">
                    {t('activitiesTitle')}
                  </h2>
                  <p className="section-subtitle">{t('activitiesSub')}</p>
                </div>
                {activities.length > 3 && (
                  <button type="button" onClick={() => navigate('/activities')} className="btn btn-secondary">
                    {t('viewAllActivities')}
                  </button>
                )}
              </div>

              {activities.length > 0 ? (
                <div className="grid grid-3">
                  {activities.slice(0, 3).map((activity) => renderCard(activity, 'activity'))}
                </div>
              ) : (
                <div className="card empty-state-card">
                  <p>{t('noActivities')}</p>
                  <small style={{ color: 'var(--text-muted)' }}>{t('noActivitiesSub')}</small>
                </div>
              )}
            </section>

            {/* Recent Announcements Section */}
            <section className="section" aria-labelledby="announcements-heading">
              <div className="section-header">
                <div>
                  <h2 id="announcements-heading" className="section-title">
                    {t('announcementsTitle')}
                  </h2>
                  <p className="section-subtitle">{t('announcementsSub')}</p>
                </div>
                {announcements.length > 3 && (
                  <button type="button" onClick={() => navigate('/announcements')} className="btn btn-secondary">
                    {t('viewAllAnnouncements')}
                  </button>
                )}
              </div>

              {announcements.length > 0 ? (
                <div className="grid grid-3">
                  {announcements.slice(0, 3).map((announcement) => renderCard(announcement, 'announcement'))}
                </div>
              ) : (
                <div className="card empty-state-card">
                  <p>{t('noAnnouncements')}</p>
                  <small style={{ color: 'var(--text-muted)' }}>{t('noAnnouncementsSub')}</small>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Accessible Detail Modal */}
      {showModal && selectedItem && (
        <div
          className="modal-overlay"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-item-title"
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={closeModal}
              aria-label="Close dialog"
            >
              &times;
            </button>
            <div className="modal-header">
              <h2 id="modal-item-title">{selectedItem.title}</h2>
              {selectedItem.date && (
                <time dateTime={selectedItem.date} className="date" style={{ color: 'var(--text-muted)' }}>
                  {formatDate(selectedItem.date)}
                </time>
              )}
            </div>
            <div className="modal-content" style={{ marginTop: 'var(--spacing-md)' }}>
              <p style={{ fontSize: '1rem', lineHeight: '1.7' }}>{selectedItem.description}</p>

              {selectedItem.images && selectedItem.images.length > 0 && (
                <div className="modal-images" style={{ marginTop: 'var(--spacing-lg)' }}>
                  <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>{t('attachedMedia')}</h4>
                  {selectedItem.images.map((img, idx) => {
                    const isPdf = isPdfFile(img);
                    if (isPdf) {
                      return (
                        <div
                          key={idx}
                          className="modal-pdf-card"
                          onClick={() => setActiveMedia({ media: img, title: selectedItem.title })}
                          role="button"
                          tabIndex="0"
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="modal-pdf-info">
                            <span className="modal-pdf-badge" aria-hidden="true">PDF</span>
                            <div>
                              <div className="modal-pdf-name">{img.split('/').pop()}</div>
                              <div className="modal-pdf-sub">{t('pdfDoc')}</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              openMediaInNewTab(img);
                            }}
                          >
                            {t('openNewTab')}
                          </button>
                        </div>
                      );
                    }
                    return (
                      <div
                        key={idx}
                        className="modal-image-card"
                        onClick={() => setActiveMedia({ media: img, title: selectedItem.title })}
                        title="Click to view full image"
                        role="button"
                        tabIndex="0"
                        style={{ cursor: 'pointer', marginBottom: 'var(--spacing-sm)' }}
                      >
                        <img
                          src={getImageUrl(img)}
                          alt={`${selectedItem.type} document ${idx + 1}`}
                          className="modal-image"
                          style={{ borderRadius: 'var(--radius-sm)', maxHeight: '250px', objectFit: 'contain' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="form-actions">
              <button type="button" onClick={closeModal} className="btn btn-secondary">
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Lightbox */}
      {activeMedia && (
        <MediaModal
          media={activeMedia.media}
          title={activeMedia.title}
          onClose={() => setActiveMedia(null)}
        />
      )}

      <Footer />
    </div>
  );
}

export default Home;
