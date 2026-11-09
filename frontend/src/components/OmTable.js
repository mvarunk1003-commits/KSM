import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../utils/imageUtils';
import API_BASE from '../config/api';

const OmTable = ({ data, columns, title, className = '' }) => {
  const [omLogoUrl, setOmLogoUrl] = useState('');

  useEffect(() => {
    const fetchOmLogo = async () => {
      try {
        const response = await fetch(`${API_BASE}/settings`);
        const settings = await response.json();
        if (settings.omLogo) {
          setOmLogoUrl(getImageUrl(settings.omLogo));
        }
      } catch (error) {
        console.error('Error fetching Om logo:', error);
      }
    };

    fetchOmLogo();
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className={`om-table-container ${className}`} role="region" aria-label={title}>
        <div className="om-table-header" style={{ padding: 'var(--spacing-md)', borderBottom: '1px solid var(--border-light)' }}>
          <h3 style={{ margin: 0, color: 'var(--primary)' }}>{title}</h3>
        </div>
        <div className="om-table-content" style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p style={{ margin: 0 }}>No records available at present.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`om-table-container ${className}`} role="region" aria-label={title} style={{ position: 'relative' }}>
      <div className="om-table-header" style={{ padding: 'var(--spacing-md)', borderBottom: '1px solid var(--border-light)' }}>
        <h3 style={{ margin: 0, color: 'var(--primary)' }}>{title}</h3>
      </div>
      <div className="om-table-content" style={{ overflowX: 'auto' }}>
        <table className="om-table" aria-label={title}>
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={index} scope="col">{column.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <td key={colIndex}>
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {omLogoUrl && (
        <div 
          className="om-table-background"
          aria-hidden="true"
          style={{
            backgroundImage: `url(${omLogoUrl})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            opacity: 0.08,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '180px',
            height: '180px',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />
      )}
    </div>
  );
};

export default OmTable;
