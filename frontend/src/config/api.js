/**
 * Centralized API Configuration for Kolar Sringeri SriShankara Mutt
 * Automatically adapts between:
 * 1. Local Development (localhost:3000 -> localhost:5000)
 * 2. AWS EC2 Production (15.206.128.103)
 * 3. Custom Domain or Environment Variable overrides
 */

const getApiBase = () => {
  // 1. Explicit environment variable takes precedence
  if (process.env.REACT_APP_API_BASE) {
    return process.env.REACT_APP_API_BASE;
  }

  // 2. Browser runtime detection
  if (typeof window !== 'undefined' && window.location) {
    const { hostname } = window.location;

    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }

    // Hosted on AWS EC2 or domain - use relative /api through Nginx reverse proxy
    // This avoids mobile carrier port 5000 blocking and mixed-content issues
    return '/api';
  }

  // 3. Default fallback
  return '/api';
};

export const API_BASE = getApiBase();
export default API_BASE;
