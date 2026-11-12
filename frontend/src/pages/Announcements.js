import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MediaModal from '../components/MediaModal';
import { getImageUrl, isPdfFile, openMediaInNewTab } from '../utils/imageUtils';
import API_BASE from '../config/api';
import { useLanguage } from '../context/LanguageContext';

function Announcements() {
  const { currentLanguage, t } = useLanguage();
  const [announcements, setAnnouncements] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [activeMedia, setActiveMedia] = useState(null);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/announcements`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError('Failed to load announcements. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

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
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Modal keyboard handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedAnnouncement) {
        setSelectedAnnouncement(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAnnouncement]);

  // Filtered announcements
  const filteredAnnouncements = useMemo(() => {
    if (!searchTerm.trim()) return announcements;
    const term = searchTerm.toLowerCase();
    return announcements.filter(ann => 
      (ann.title && ann.title.toLowerCase().includes(term)) ||
      (ann.description && ann.description.toLowerCase().includes(term))
    );
  }, [announcements, searchTerm]);

  const renderAnnouncement = (announcement) => (
    <article 
      key={announcement.id} 
      className="card announcement-card"
      onClick={() => setSelectedAnnouncement(announcement)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedAnnouncement(announcement); } }}
      tabIndex="0"
      role="button"
      aria-label={`View details of ${announcement.title}`}
      style={{ cursor: 'pointer' }}
    >
      {announcement.images && announcement.images.length > 0 && (
        <div className="card-images-top">
          {announcement.images.slice(0, 3).map((img, idx) => {
            const isPdf = isPdfFile(img);
            return (
              <div 
                key={idx}
                className="card-media-item"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMedia({ media: img, title: announcement.title });
                }}
                title={isPdf ? "Click to view PDF" : "Click to view full image"}
                style={{ cursor: 'pointer', flex: 1 }}
              >
                {isPdf ? (
                  <div className="card-pdf-placeholder">
                    <span className="badge badge-primary" style={{ fontSize: '0.85rem' }}>PDF</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Document</span>
                  </div>
                ) : (
                  <img 
                    src={getImageUrl(img)} 
                    alt={`Announcement ${idx + 1}`}
                    className="card-image-main"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
              </div>
            );
          })}
          {announcement.images.length > 3 && (
            <div 
              className="image-overlay-main"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedAnnouncement(announcement);
              }}
            >
              <span>+{announcement.images.length - 3}</span>
            </div>
          )}
        </div>
      )}
      
      <header className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <h3 className="card-title">{announcement.title}</h3>
          <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>Circular</span>
        </div>
        {(announcement.date || announcement.fromDate) && (
          <time dateTime={announcement.fromDate || announcement.date} className="date" style={{ color: 'var(--text-muted)' }}>
            {formatDate(announcement.date || announcement.fromDate)}
          </time>
        )}
      </header>
      
      <div className="card-content">
        <p>{announcement.description}</p>
        
        {announcement.fromDate && announcement.toDate && (
          <div className="announcement-dates" style={{ marginTop: 'var(--spacing-sm)', padding: 'var(--spacing-xs) var(--spacing-sm)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xs)', fontSize: '0.85rem' }}>
            <p style={{ margin: '2px 0' }}><strong>From:</strong> {formatDate(announcement.fromDate)}</p>
            <p style={{ margin: '2px 0' }}><strong>To:</strong> {formatDate(announcement.toDate)}</p>
          </div>
        )}
      </div>

      <footer className="card-footer">
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
          Read Full Notice &rarr;
        </span>
      </footer>
    </article>
  );

  return (
    <div>
      <Header />
      
      <main id="main-content" className="container" role="main">
        <section className="section" aria-labelledby="announcements-title">
          <div className="section-header">
            <div>
              <h1 id="announcements-title" className="section-title">{t('announcementsTitle')}</h1>
              <p className="section-subtitle">{t('announcementsSub')}</p>
            </div>

            {/* Search Input Filter */}
            <div style={{ minWidth: '240px' }}>
              <label htmlFor="search-announcements" className="sr-only">Search Announcements</label>
              <input 
                id="search-announcements"
                type="text" 
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                aria-label="Search announcements by title or content"
              />
            </div>
          </div>

          {loading && (
            <div className="card" aria-busy="true">
              <div className="card-content" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                <div className="loading-spinner"></div>
                <p style={{ marginTop: 'var(--spacing-sm)' }}>Loading announcements...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="card" role="alert">
              <div className="card-content" style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                <div className="message error">
                  <span>{error}</span>
                </div>
                <button type="button" onClick={fetchAnnouncements} className="btn btn-primary" style={{ marginTop: 'var(--spacing-sm)' }}>
                  Retry
                </button>
              </div>
            </div>
          )}

          {!loading && !error && filteredAnnouncements.length > 0 && (
            <div className="grid grid-2">
              {filteredAnnouncements.map(renderAnnouncement)}
            </div>
          )}

          {!loading && !error && filteredAnnouncements.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xxl)' }}>
              <div className="card-content">
                <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                  {searchTerm ? `No announcements match "${searchTerm}".` : 'No announcements available at the moment.'}
                </p>
                {searchTerm && (
                  <button type="button" onClick={() => setSearchTerm('')} className="btn btn-secondary" style={{ marginTop: 'var(--spacing-sm)' }}>
                    Clear Search Filter
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Announcement Details Modal */}
      {selectedAnnouncement && (
        <div 
          className="modal-overlay" 
          onClick={() => setSelectedAnnouncement(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="announcement-modal-title"
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button 
              type="button" 
              className="modal-close-btn" 
              onClick={() => setSelectedAnnouncement(null)}
              aria-label="Close dialog"
            >
              &times;
            </button>
            <div className="modal-header">
              <h2 id="announcement-modal-title">{selectedAnnouncement.title}</h2>
              {(selectedAnnouncement.date || selectedAnnouncement.fromDate) && (
                <time dateTime={selectedAnnouncement.fromDate || selectedAnnouncement.date} className="date" style={{ color: 'var(--text-muted)' }}>
                  {formatDate(selectedAnnouncement.date || selectedAnnouncement.fromDate)}
                </time>
              )}
            </div>
            <div className="modal-content" style={{ marginTop: 'var(--spacing-md)' }}>
              <p style={{ fontSize: '1rem', lineHeight: '1.7' }}>{selectedAnnouncement.description}</p>
              
              {selectedAnnouncement.fromDate && selectedAnnouncement.toDate && (
                <div className="announcement-dates" style={{ margin: 'var(--spacing-md) 0', padding: 'var(--spacing-sm)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                  <p style={{ margin: '4px 0' }}><strong>Effective From:</strong> {formatDate(selectedAnnouncement.fromDate)}</p>
                  <p style={{ margin: '4px 0' }}><strong>Valid Until:</strong> {formatDate(selectedAnnouncement.toDate)}</p>
                </div>
              )}

              {selectedAnnouncement.images && selectedAnnouncement.images.length > 0 && (
                <div className="modal-images" style={{ marginTop: 'var(--spacing-lg)' }}>
                  <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>Notice Attachments</h4>
                  {selectedAnnouncement.images.map((img, idx) => {
                    const isPdf = isPdfFile(img);
                    if (isPdf) {
                      return (
                        <div 
                          key={idx} 
                          className="modal-pdf-card"
                          onClick={() => setActiveMedia({ media: img, title: selectedAnnouncement.title })}
                          role="button"
                          tabIndex="0"
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="modal-pdf-info">
                            <span className="modal-pdf-badge" aria-hidden="true">PDF</span>
                            <div>
                              <div className="modal-pdf-name">{img.split('/').pop()}</div>
                              <div className="modal-pdf-sub">PDF Notice Document &bull; Click to open</div>
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
                            Open PDF
                          </button>
                        </div>
                      );
                    }
                    return (
                      <div 
                        key={idx} 
                        className="modal-image-card"
                        onClick={() => setActiveMedia({ media: img, title: selectedAnnouncement.title })}
                        title="Click to view full image"
                        role="button"
                        tabIndex="0"
                        style={{ cursor: 'pointer', marginBottom: 'var(--spacing-sm)' }}
                      >
                        <img 
                          src={getImageUrl(img)} 
                          alt={`Announcement media ${idx + 1}`}
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
              <button type="button" onClick={() => setSelectedAnnouncement(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Media Viewer */}
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

export default Announcements;
