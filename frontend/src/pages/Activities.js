import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MediaModal from '../components/MediaModal';
import { getImageUrl, isPdfFile, openMediaInNewTab } from '../utils/imageUtils';
import API_BASE from '../config/api';
import { useLanguage } from '../context/LanguageContext';

function Activities() {
  const { currentLanguage, t } = useLanguage();
  const [activities, setActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activeMedia, setActiveMedia] = useState(null);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/activities`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setActivities(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to load activities. Please check your connection and try again.');
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
    fetchActivities();
  }, [fetchActivities]);

  // Modal keyboard handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedActivity) {
        setSelectedActivity(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedActivity]);

  // Filtered activities based on search
  const filteredActivities = useMemo(() => {
    if (!searchTerm.trim()) return activities;
    const term = searchTerm.toLowerCase();
    return activities.filter(act => 
      (act.title && act.title.toLowerCase().includes(term)) ||
      (act.description && act.description.toLowerCase().includes(term))
    );
  }, [activities, searchTerm]);

  const renderActivity = (activity) => (
    <article 
      key={activity.id} 
      className="card activity-card"
      onClick={() => setSelectedActivity(activity)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedActivity(activity); } }}
      tabIndex="0"
      role="button"
      aria-label={`View details of ${activity.title}`}
      style={{ cursor: 'pointer' }}
    >
      {activity.images && activity.images.length > 0 && (
        <div className="card-images-top">
          {activity.images.slice(0, 3).map((img, idx) => {
            const isPdf = isPdfFile(img);
            return (
              <div 
                key={idx}
                className="card-media-item"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMedia({ media: img, title: activity.title });
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
                    alt={`Activity ${idx + 1}`}
                    className="card-image-main"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
              </div>
            );
          })}
          {activity.images.length > 3 && (
            <div 
              className="image-overlay-main"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedActivity(activity);
              }}
            >
              <span>+{activity.images.length - 3}</span>
            </div>
          )}
        </div>
      )}
      
      <header className="card-header">
        <h3 className="card-title">{activity.title}</h3>
        {(activity.date || activity.fromDate) && (
          <time dateTime={activity.fromDate || activity.date} className="date" style={{ color: 'var(--text-muted)' }}>
            {formatDate(activity.date || activity.fromDate)}
          </time>
        )}
      </header>
      
      <div className="card-content">
        <p>{activity.description}</p>
        
        {activity.fromDate && activity.toDate && (
          <div className="activity-dates" style={{ marginTop: 'var(--spacing-sm)', padding: 'var(--spacing-xs) var(--spacing-sm)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xs)', fontSize: '0.85rem' }}>
            <p style={{ margin: '2px 0' }}><strong>From:</strong> {formatDate(activity.fromDate)}</p>
            <p style={{ margin: '2px 0' }}><strong>To:</strong> {formatDate(activity.toDate)}</p>
          </div>
        )}
      </div>

      <footer className="card-footer">
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
          View Details &rarr;
        </span>
      </footer>
    </article>
  );

  return (
    <div>
      <Header />
      
      <main id="main-content" className="container" role="main">
        <section className="section" aria-labelledby="page-title">
          <div className="section-header">
            <div>
              <h1 id="page-title" className="section-title">{t('activitiesTitle')}</h1>
              <p className="section-subtitle">{t('activitiesSub')}</p>
            </div>
            
            {/* Search Input Filter */}
            <div style={{ minWidth: '240px' }}>
              <label htmlFor="search-activities" className="sr-only">Search Activities</label>
              <input 
                id="search-activities"
                type="text" 
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                aria-label="Search activities by title or description"
              />
            </div>
          </div>

          {loading && (
            <div className="card" aria-busy="true">
              <div className="card-content" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                <div className="loading-spinner"></div>
                <p style={{ marginTop: 'var(--spacing-sm)' }}>Loading activities...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="card" role="alert">
              <div className="card-content" style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                <div className="message error">
                  <span>{error}</span>
                </div>
                <button type="button" onClick={fetchActivities} className="btn btn-primary" style={{ marginTop: 'var(--spacing-sm)' }}>
                  Retry
                </button>
              </div>
            </div>
          )}

          {!loading && !error && filteredActivities.length > 0 && (
            <div className="grid grid-2">
              {filteredActivities.map(renderActivity)}
            </div>
          )}

          {!loading && !error && filteredActivities.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xxl)' }}>
              <div className="card-content">
                <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                  {searchTerm ? `No activities match "${searchTerm}".` : 'No activities available at the moment. Please check back later.'}
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

      {/* Activity Details Modal */}
      {selectedActivity && (
        <div 
          className="modal-overlay" 
          onClick={() => setSelectedActivity(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="activity-modal-title"
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button 
              type="button" 
              className="modal-close-btn" 
              onClick={() => setSelectedActivity(null)}
              aria-label="Close dialog"
            >
              &times;
            </button>
            <div className="modal-header">
              <h2 id="activity-modal-title">{selectedActivity.title}</h2>
              {(selectedActivity.date || selectedActivity.fromDate) && (
                <time dateTime={selectedActivity.fromDate || selectedActivity.date} className="date" style={{ color: 'var(--text-muted)' }}>
                  {formatDate(selectedActivity.date || selectedActivity.fromDate)}
                </time>
              )}
            </div>
            <div className="modal-content" style={{ marginTop: 'var(--spacing-md)' }}>
              <p style={{ fontSize: '1rem', lineHeight: '1.7' }}>{selectedActivity.description}</p>
              
              {selectedActivity.fromDate && selectedActivity.toDate && (
                <div className="activity-dates" style={{ margin: 'var(--spacing-md) 0', padding: 'var(--spacing-sm)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                  <p style={{ margin: '4px 0' }}><strong>From Date:</strong> {formatDate(selectedActivity.fromDate)}</p>
                  <p style={{ margin: '4px 0' }}><strong>To Date:</strong> {formatDate(selectedActivity.toDate)}</p>
                </div>
              )}

              {selectedActivity.images && selectedActivity.images.length > 0 && (
                <div className="modal-images" style={{ marginTop: 'var(--spacing-lg)' }}>
                  <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>Media &amp; Documents</h4>
                  {selectedActivity.images.map((img, idx) => {
                    const isPdf = isPdfFile(img);
                    if (isPdf) {
                      return (
                        <div 
                          key={idx} 
                          className="modal-pdf-card"
                          onClick={() => setActiveMedia({ media: img, title: selectedActivity.title })}
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
                            Open PDF
                          </button>
                        </div>
                      );
                    }
                    return (
                      <div 
                        key={idx} 
                        className="modal-image-card"
                        onClick={() => setActiveMedia({ media: img, title: selectedActivity.title })}
                        title="Click to view full image"
                        role="button"
                        tabIndex="0"
                        style={{ cursor: 'pointer', marginBottom: 'var(--spacing-sm)' }}
                      >
                        <img 
                          src={getImageUrl(img)} 
                          alt={`Activity detail ${idx + 1}`}
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
              <button type="button" onClick={() => setSelectedActivity(null)} className="btn btn-secondary">
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

export default Activities;
