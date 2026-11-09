import React, { useState, useEffect, useMemo } from 'react';
import { getImageUrl } from '../utils/imageUtils';

const BannerCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoadErrors, setImageLoadErrors] = useState(new Set());

  // Filter out images that failed to load, memoized to satisfy hooks dependencies
  const validImages = useMemo(() => {
    return images ? images.filter((_, index) => !imageLoadErrors.has(index)) : [];
  }, [images, imageLoadErrors]);

  useEffect(() => {
    if (validImages && validImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === validImages.length - 1 ? 0 : prevIndex + 1
        );
      }, 10000); // 10 seconds auto-advance

      return () => clearInterval(interval);
    }
  }, [validImages]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? validImages.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === validImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleImageError = (index) => {
    setImageLoadErrors(prev => new Set([...prev, index]));
  };

  if (!images || images.length === 0 || validImages.length === 0) {
    return (
      <div 
        className="banner-carousel" 
        style={{ 
          height: '360px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
          color: 'white',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow)'
        }}
        role="region"
        aria-label="Welcome Banner"
      >
        <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
          <h2 style={{ marginBottom: 'var(--spacing-xs)', color: '#FFFFFF', fontSize: '2rem' }}>
            ಶ್ರೀ ಕೋಲಾರ ಶೃಂಗೇರಿ ಶಂಕರ ಮಠ
          </h2>
          <p style={{ color: 'var(--accent-light)', fontSize: '1.2rem', fontWeight: 600 }}>
            Kolar Sringeri SriShankara Mutt
          </p>
          <p style={{ marginTop: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)', opacity: 0.9 }}>
            Sacred Spiritual Heritage &bull; Traditional Vedic Seva &bull; Spiritual Enlightenment
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="banner-carousel" 
      role="region" 
      aria-label="Featured Highlights Carousel" 
      aria-roledescription="carousel"
    >
      <div className="carousel-container">
        {validImages.map((image, index) => {
          const imageUrl = getImageUrl(image);
          const isActive = index === currentIndex;
          return (
            <div
              key={index}
              className={`carousel-slide ${isActive ? 'active' : ''}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${index + 1} of ${validImages.length}`}
              aria-hidden={!isActive}
              style={{
                backgroundImage: `url(${imageUrl})`,
              }}
            >
              <img 
                src={imageUrl} 
                alt={`Temple banner slide ${index + 1}`}
                style={{ display: 'none' }}
                onError={() => handleImageError(index)}
              />
            </div>
          );
        })}
        
        {/* Navigation Arrows */}
        {validImages.length > 1 && (
          <>
            <button 
              type="button"
              className="carousel-arrow carousel-prev" 
              onClick={goToPrevious}
              aria-label="Previous Slide"
            >
              &#10094;
            </button>
            <button 
              type="button"
              className="carousel-arrow carousel-next" 
              onClick={goToNext}
              aria-label="Next Slide"
            >
              &#10095;
            </button>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {validImages.length > 1 && (
        <div className="carousel-dots" role="tablist" aria-label="Slide indicators">
          {validImages.map((_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={index === currentIndex}
              aria-label={`Go to slide ${index + 1}`}
              className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}

      {/* Banner Info Overlay */}
      <div className="banner-info">
        <div className="banner-title">Kolar Sringeri SriShankara Mutt</div>
        <div className="banner-subtitle">Sacred Spiritual Heritage &bull; Kolar, Karnataka</div>
      </div>
    </div>
  );
};

export default BannerCarousel;
