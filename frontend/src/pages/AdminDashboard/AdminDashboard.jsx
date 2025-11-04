import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../FarmerDashboard/FarmerDashboard.scss';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

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
            <span className="logo-icon">👨‍💼</span>
            <h1>Kissan360 Admin</h1>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-card">
          <h2>Admin Dashboard 🎛️</h2>
          <p>Manage market data and system settings</p>
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">📊</span>
              <h3>Market Data</h3>
              <p>Add/update prices</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🥬</span>
              <h3>Items</h3>
              <p>Manage market items</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">👥</span>
              <h3>Users</h3>
              <p>View farmer accounts</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📈</span>
              <h3>Analytics</h3>
              <p>System insights</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

