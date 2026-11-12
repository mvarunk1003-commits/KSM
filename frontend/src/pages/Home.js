import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BannerCarousel from '../components/BannerCarousel';
import MediaModal from '../components/MediaModal';
import { getImageUrl, isPdfFile, openMediaInNewTab } from '../utils/imageUtils';
import API_BASE from '../config/api';

function Home() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [bannerImages, setBannerImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeMedia, setActiveMedia] = useState(null);

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
      setError('Unable to load content. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

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
      return new Date(dateString).toLocaleDateString('en-IN', {
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

  const renderCard = (item, type) => (
    <article
      key={item.id}
      className="card card-sacred"
      onClick={() => handleItemClick(item, type)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleItemClick(item, type); } }}
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
              onError={(e) => { e.target.style.display = 'none'; }}
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
          {type === 'activity' ? 'ಧಾರ್ಮಿಕ ಕಾರ್ಯಕ್ರಮ' : 'ಪ್ರಕಟಣೆ'}
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
          Read Details &rarr;
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
            <div className="darshan-status-pill">
              <span className="pulse-indicator"></span>
              <span>Sanctum Open for Darshan / ದರ್ಶನ ಲಭ್ಯ</span>
            </div>
            <div className="darshan-timings-grid">
              <div className="darshan-timing-col">
                <span className="darshan-label">Morning Darshan:</span>
                <span className="darshan-val">08:00 AM – 11:00 PM</span>
              </div>
              <div className="darshan-timing-col">
                <span className="darshan-label">Mahamangalarthi:</span>
                <span className="darshan-val">10:30 PM &amp; 8:00 PM</span>
              </div>
              <div className="darshan-timing-col">
                <span className="darshan-label">Evening Darshan:</span>
                <span className="darshan-val">06:00 PM – 8:30 PM</span>
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
              <strong>Online Seva &amp; Donation</strong>
              <span>ಕಾಣಿಕೆ / ಇ-ಸೇವೆ</span>
            </div>
            <span className="btn-arrow" aria-hidden="true">&rarr;</span>
          </button>

          <button
            type="button"
            className="quick-action-btn"
            onClick={() => navigate('/activities')}
          >
            <div className="btn-text">
              <strong>Spiritual Activities</strong>
              <span>ಪೂಜಾ ಕಾರ್ಯಕ್ರಮಗಳು</span>
            </div>
            <span className="btn-arrow" aria-hidden="true">&rarr;</span>
          </button>

          <button
            type="button"
            className="quick-action-btn"
            onClick={() => navigate('/announcements')}
          >
            <div className="btn-text">
              <strong>Mutt Announcements</strong>
              <span>ವಿಶೇಷ ಸೂಚನೆಗಳು</span>
            </div>
            <span className="btn-arrow" aria-hidden="true">&rarr;</span>
          </button>

          <button
            type="button"
            className="quick-action-btn"
            onClick={() => navigate('/contact')}
          >
            <div className="btn-text">
              <strong>Visit &amp; Contact Us</strong>
              <span>ಮಠದ ವಿಳಾಸ &amp; ಸಂಪರ್ಕ</span>
            </div>
            <span className="btn-arrow" aria-hidden="true">&rarr;</span>
          </button>
        </section>

        {/* Traditional Sacred Divider */}
        <div className="traditional-divider" aria-hidden="true">
          <span className="divider-line"></span>
          <span className="divider-symbol">॥ ॐ ಶ್ರೀ ಶಾರದಾಂಬಾ ಪ್ರಸನ್ನ ॐ ॥</span>
          <span className="divider-line"></span>
        </div>

        {loading ? (
          <section className="section" aria-busy="true" aria-label="Loading content">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading sacred content / ಮಾಹಿತಿ ಲೋಡ್ ಆಗುತ್ತಿದೆ...</p>
            </div>
          </section>
        ) : error ? (
          <section className="section" role="alert" aria-label="Error loading content">
            <div className="error-container">
              <h2>Unable to Load Content</h2>
              <p>{error}</p>
              <button type="button" onClick={fetchData} className="btn btn-primary">
                Retry Connection
              </button>
            </div>
          </section>
        ) : (
          <>
            {/* Heritage / Welcome Section with Sringeri Lineage */}
            <section className="section section-heritage" aria-labelledby="welcome-heading">
              <div className="section-header">
                <div>
                  <h2 id="welcome-heading" className="section-title">
                    ದಕ್ಷಿಣಾಮ್ನಾಯ ಶೃಂಗೇರಿ ಶ್ರೀಶಾರದಾ ಪೀಠಮ್ ಶಾಖಾ ಮಠ
                  </h2>
                  <p className="section-subtitle">
                    Kolar Sringeri SriShankara Mutt &bull; Branch of Dakshinamnaya Sringeri Sri Sharada Peetham
                  </p>
                </div>
              </div>
              <div className="heritage-card">
                <div className="heritage-content">
                  <p className="heritage-text">
                    Kolar Sringeri Sri Shankara Math was established in 1928 with the divine blessings of the revered lineage (parampara) of Adi Shankaracharya.

                    In 1930, the sacred Shankaracharya Pratishthapana was performed, laying a strong spiritual foundation for the Math. Later, in 1965, Paramapujya Sri Abhinavodanda Vidyaranyabharathi Mahaswamiji of Avani Math conducted the Pratishtha Kumbhabhisheka of Sri Sharadamba, further sanctifying the premises.

                    In 2019, the Math was formally brought under the guidance of the esteemed Sringeri Sharada Peetham, strengthening its connection with the main spiritual lineage.

                    At present, Sri Ramakrishna J. N. serves as the Dharmadhikari (Branch Head) of the Kolar Srimath.
                  </p>
                  <p className="heritage-text">
                    Activities at the Srimath

                    The Srimath is a vibrant center for Dharmika and cultural activities, dedicated to preserving and propagating Sanatana Dharma.

                    Spiritual Discourses
                    Regular talks by learned scholars on Dharma and Advaita Vedanta are conducted.

                    Stotra Classes (Every Thursday)
                    Focused on teaching the sacred hymns and the philosophy of Sri Shankara.

                    Sanskrit Classes (Every Saturday & Sunday – Evening)
                    Promoting the study and everyday usage of Sanskrit among all age groups.

                    Vision

                    Kolar Srimath continues to stand as a beacon of:

                    Spiritual learning

                    Sanskrit propagation

                    Cultural revival

                    It fosters devotion, awareness, and community engagement while upholding the timeless teachings of Advaita Vedanta.

                  </p>
                </div>
              </div>
            </section>

            {/* 4 Sacred Heritage Pillars */}
            <section aria-label="Core Pillars of the Mutt" className="section section-pillars">
              <div className="grid grid-4">
                <article className="pillar-card">
                  <div className="pillar-num">01</div>
                  <h3 className="pillar-title">Jagadguru Tradition</h3>
                  <p className="pillar-desc">
                    Revering the sacred lineage of Jagadguru Sri Adi Shankaracharya and the reigning Sringeri Pontiffs.
                  </p>
                </article>

                <article className="pillar-card">
                  <div className="pillar-num">02</div>
                  <h3 className="pillar-title">Nitya Pooja &amp; Sevas</h3>
                  <p className="pillar-desc">
                    Daily Vedic rituals, Panchamrutha Abhisheka, Lalitha Sahasranama chanting, and evening Mahamangalarathi.
                  </p>
                </article>

                <article className="pillar-card">
                  <div className="pillar-num">03</div>
                  <h3 className="pillar-title">Annadanam Mahadan</h3>
                  <p className="pillar-desc">
                    Nitya Mahaprasadam served with devotion to visiting pilgrims, students, and devotees.
                  </p>
                </article>

                <article className="pillar-card">
                  <div className="pillar-num">04</div>
                  <h3 className="pillar-title">Veda &amp; Samskrita</h3>
                  <p className="pillar-desc">
                    Fostering traditional Vedic learning, Sanskrit recitation, and cultural discourses.
                  </p>
                </article>
              </div>
            </section>

            {/* Traditional Sacred Divider */}
            <div className="traditional-divider" aria-hidden="true">
              <span className="divider-line"></span>
              <span className="divider-symbol">॥ ॐ ॥</span>
              <span className="divider-line"></span>
            </div>

            {/* Recent Activities Section */}
            <section className="section" aria-labelledby="activities-heading">
              <div className="section-header">
                <div>
                  <h2 id="activities-heading" className="section-title">
                    ಧಾರ್ಮಿಕ ಕಾರ್ಯಕ್ರಮಗಳು / Spiritual Activities
                  </h2>
                  <p className="section-subtitle">Upcoming celebrations, havans, and cultural festivals</p>
                </div>
                {activities.length > 3 && (
                  <button type="button" onClick={() => navigate('/activities')} className="btn btn-secondary">
                    View All Activities &rarr;
                  </button>
                )}
              </div>

              {activities.length > 0 ? (
                <div className="grid grid-3">
                  {activities.slice(0, 3).map(activity => renderCard(activity, 'activity'))}
                </div>
              ) : (
                <div className="card empty-state-card">
                  <p>No recent activities scheduled at this moment. Please check back soon.</p>
                </div>
              )}
            </section>

            {/* Recent Announcements Section */}
            <section className="section" aria-labelledby="announcements-heading">
              <div className="section-header">
                <div>
                  <h2 id="announcements-heading" className="section-title">
                    ವಿಶೇಷ ಪ್ರಕಟಣೆಗಳು / Important Notices
                  </h2>
                  <p className="section-subtitle">Timely circulars, seva schedules, and mutt notifications</p>
                </div>
                {announcements.length > 3 && (
                  <button type="button" onClick={() => navigate('/announcements')} className="btn btn-secondary">
                    View All Announcements &rarr;
                  </button>
                )}
              </div>

              {announcements.length > 0 ? (
                <div className="grid grid-3">
                  {announcements.slice(0, 3).map(announcement => renderCard(announcement, 'announcement'))}
                </div>
              ) : (
                <div className="card empty-state-card">
                  <p>No active announcements currently. Updates will be published here.</p>
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
                  <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>Attached Media &amp; Documents</h4>
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
                              <div className="modal-pdf-sub">PDF Document &bull; Click to view inside reader</div>
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
                            Open in New Tab
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
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="form-actions">
              <button type="button" onClick={closeModal} className="btn btn-secondary">
                Close
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
