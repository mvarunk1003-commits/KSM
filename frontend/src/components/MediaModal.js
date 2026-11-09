import React, { useState, useEffect } from 'react';
import { getImageUrl, isPdfFile, openMediaInNewTab } from '../utils/imageUtils';

export default function MediaModal({ media, title, onClose }) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!media) return null;

  const url = getImageUrl(media);
  const isPdf = isPdfFile(media);
  const fileName = typeof media === 'string' ? media.split('/').pop() : 'Document';

  const handleZoomIn = (e) => {
    e.stopPropagation();
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = (e) => {
    e.stopPropagation();
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = (e) => {
    e.stopPropagation();
    setZoom(1);
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="media-viewer-overlay" onClick={onClose}>
      <div className="media-viewer-container" onClick={(e) => e.stopPropagation()}>
        <div className="media-viewer-header">
          <div className="media-viewer-title">
            <span className="badge badge-primary" style={{ marginRight: '8px' }}>{isPdf ? 'PDF' : 'IMAGE'}</span>
            <span className="media-viewer-name">{title || fileName}</span>
          </div>
          <div className="media-viewer-actions">
            {!isPdf && (
              <div className="zoom-controls">
                <button 
                  className="btn-icon" 
                  onClick={handleZoomOut} 
                  title="Zoom Out" 
                  disabled={zoom <= 0.5}
                  style={{ fontWeight: 700, fontSize: '1.1rem' }}
                >
                  &minus;
                </button>
                <span className="zoom-level">{Math.round(zoom * 100)}%</span>
                <button 
                  className="btn-icon" 
                  onClick={handleZoomIn} 
                  title="Zoom In" 
                  disabled={zoom >= 3}
                  style={{ fontWeight: 700, fontSize: '1.1rem' }}
                >
                  +
                </button>
                {zoom !== 1 && (
                  <button className="btn-icon-text" onClick={handleResetZoom} title="Reset Zoom">
                    Reset
                  </button>
                )}
              </div>
            )}
            <button 
              className="btn-viewer-action" 
              onClick={() => openMediaInNewTab(media)} 
              title="Open full size in new tab"
            >
              Open in New Tab
            </button>
            <button 
              className="btn-viewer-action" 
              onClick={handleDownload} 
              title="Download file"
            >
              Download
            </button>
            <button 
              className="btn-viewer-close" 
              onClick={onClose} 
              title="Close (Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="media-viewer-body">
          {isPdf ? (
            <div className="media-viewer-pdf">
              <iframe
                src={`${url}#toolbar=1`}
                title={title || "PDF Document"}
                className="pdf-iframe"
              />
              <div className="pdf-fallback-notice">
                <p>If the PDF does not display inside the browser,</p>
                <button 
                  className="btn btn-primary" 
                  onClick={() => openMediaInNewTab(media)}
                >
                  Click Here to Open PDF
                </button>
              </div>
            </div>
          ) : (
            <div className="media-viewer-image-wrapper">
              <img
                src={url}
                alt={title || fileName}
                className="media-viewer-image"
                style={{ transform: `scale(${zoom})` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
