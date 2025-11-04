import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './FarmerDashboard.scss';
import { toast } from 'react-toastify';

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <div className="farmer-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🌾</span>
            <h1>Kissan360</h1>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-card">
          <h2>Welcome, Farmer! 🎉</h2>
          <p>Your dashboard is ready. More features coming soon!</p>
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">📊</span>
              <h3>Market Prices</h3>
              <p>Real-time commodity prices</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🌤️</span>
              <h3>Weather</h3>
              <p>Local weather updates</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">💬</span>
              <h3>Community</h3>
              <p>Connect with farmers</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📈</span>
              <h3>Trends</h3>
              <p>Price trend analysis</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FarmerDashboard;

