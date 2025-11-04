import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import HomeIcon from '@mui/icons-material/Home';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CloudIcon from '@mui/icons-material/Cloud';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ForumIcon from '@mui/icons-material/Forum';
import ArticleIcon from '@mui/icons-material/Article';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import './Sidebar.scss';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    { path: '/farmer-dashboard', icon: <HomeIcon />, label: 'Dashboard', end: true },
    { path: '/farmer-dashboard/market-prices', icon: <ShowChartIcon />, label: 'Market Prices' },
    { path: '/farmer-dashboard/price-trends', icon: <TrendingUpIcon />, label: 'Price Trends' },
    { path: '/farmer-dashboard/weather', icon: <CloudIcon />, label: 'Weather' },
    { path: '/farmer-dashboard/smart-advice', icon: <LightbulbIcon />, label: 'Smart Advice' },
    { path: '/farmer-dashboard/forum', icon: <ForumIcon />, label: 'Community Forum' },
    { path: '/farmer-dashboard/my-posts', icon: <ArticleIcon />, label: 'My Posts' },
    { path: '/farmer-dashboard/profile', icon: <PersonIcon />, label: 'Profile' },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button className="mobile-toggle" onClick={toggleSidebar}>
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <AgricultureIcon className="logo-icon" />
            <h1>Kissan360</h1>
          </div>
          <p className="tagline">Smart Agriculture Tracker</p>
        </div>

        <div className="user-info">
          <div className="user-avatar">
            <PersonIcon />
          </div>
          <div className="user-details">
            <p className="user-name">{user?.name || 'Farmer'}</p>
            <span className="user-role">Farmer</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogoutIcon />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
    </>
  );
};

export default Sidebar;

