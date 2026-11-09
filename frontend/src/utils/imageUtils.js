import API_BASE from '../config/api';

const ASSET_SERVER_BASE = API_BASE.replace(/\/api\/?$/, '');

// Utility function to get the correct image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it starts with /assets, it's already in the correct format
  if (imagePath.startsWith('/assets')) {
    return `${ASSET_SERVER_BASE}${imagePath}`;
  }
  
  // If it starts with /uploads (old format), convert to /assets
  if (imagePath.startsWith('/uploads')) {
    const filename = imagePath.split('/').pop();
    return `${ASSET_SERVER_BASE}/assets/${filename}`;
  }
  
  // Default case: assume it's a filename and prepend /assets
  return `${ASSET_SERVER_BASE}/assets/${imagePath}`;
};

// Utility function to get image URL for public assets
export const getPublicAssetUrl = (assetPath) => {
  if (!assetPath) return '';
  
  // If it's already a full URL, return as is
  if (assetPath.startsWith('http')) {
    return assetPath;
  }
  
  // Remove leading slash if present
  const cleanPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
  return `${ASSET_SERVER_BASE}/${cleanPath}`;
};

// Check if a file is a PDF
export const isPdfFile = (filePath) => {
  if (!filePath || typeof filePath !== 'string') return false;
  return filePath.toLowerCase().split('?')[0].endsWith('.pdf');
};

// Open any image, file or PDF in a new browser tab
export const openMediaInNewTab = (mediaPath) => {
  if (!mediaPath) return;
  const fullUrl = getImageUrl(mediaPath);
  window.open(fullUrl, '_blank', 'noopener,noreferrer');
};

