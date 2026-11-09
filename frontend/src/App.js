import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import Home from './pages/Home';
import Activities from './pages/Activities';
import Announcements from './pages/Announcements';
import Contact from './pages/Contact';
import Donation from './pages/Donation';
import Admin from './pages/Admin';
import Login from './pages/Login';

function PrivateRoute({ children }) {
  const authData = localStorage.getItem('authData');
  const isAdmin = localStorage.getItem('isAdmin');
  
  console.log('PrivateRoute check:', { authData: !!authData, isAdmin });
  
  if (authData && isAdmin === 'true') {
    try {
      const parsed = JSON.parse(authData);
      const now = Date.now();
      const tokenAge = now - parsed.timestamp;
      
      console.log('Token age:', tokenAge, 'hours:', tokenAge / (1000 * 60 * 60));
      
      // Token expires after 24 hours
      if (tokenAge < 24 * 60 * 60 * 1000) {
        console.log('Authentication valid, rendering admin dashboard');
        return children;
      } else {
        console.log('Token expired, redirecting to login');
        // Token expired, clear storage
        localStorage.removeItem('authData');
        localStorage.removeItem('isAdmin');
        return <Login />;
      }
    } catch (err) {
      console.log('Invalid auth data:', err);
      // Invalid auth data, clear storage
      localStorage.removeItem('authData');
      localStorage.removeItem('isAdmin');
      return <Login />;
    }
  }
  
  console.log('No auth data found, redirecting to login');
  return <Login />;
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/donation" element={<Donation />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
        </Routes>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
