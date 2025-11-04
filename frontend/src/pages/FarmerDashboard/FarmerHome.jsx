import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import StatCard from '../../components/StatCard/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import CloudIcon from '@mui/icons-material/Cloud';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ForumIcon from '@mui/icons-material/Forum';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import './FarmerHome.scss';

const FarmerHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalItems: 0,
    totalPosts: 0,
    weatherUpdated: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [itemsRes, postsRes] = await Promise.all([
          api.get('/api/market/items'),
          api.get('/api/posts/getPost'),
        ]);

        setStats({
          totalItems: itemsRes.data.length || 0,
          totalPosts: postsRes.data.length || 0,
          weatherUpdated: new Date().toLocaleString(),
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const quickActions = [
    {
      icon: <ShowChartIcon />,
      title: 'Market Prices',
      description: 'View current market prices for crops',
      path: '/farmer-dashboard/market-prices',
      color: '#10b981',
    },
    {
      icon: <TrendingUpIcon />,
      title: 'Price Trends',
      description: 'Analyze 7-day price trends',
      path: '/farmer-dashboard/price-trends',
      color: '#3b82f6',
    },
    {
      icon: <CloudIcon />,
      title: 'Weather',
      description: 'Check weather conditions across Pakistan',
      path: '/farmer-dashboard/weather',
      color: '#06b6d4',
    },
    {
      icon: <LightbulbIcon />,
      title: 'Smart Advice',
      description: 'Get personalized farming recommendations',
      path: '/farmer-dashboard/smart-advice',
      color: '#f59e0b',
    },
    {
      icon: <ForumIcon />,
      title: 'Community Forum',
      description: 'Connect with other farmers',
      path: '/farmer-dashboard/forum',
      color: '#8b5cf6',
    },
  ];

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <div className="farmer-home">
      <div className="welcome-section">
        <div className="welcome-text">
          <h1>Welcome back, {user?.name || 'Farmer'}! 🌾</h1>
          <p>Your agricultural dashboard for smart farming decisions</p>
        </div>
        <div className="welcome-icon">
          <AgricultureIcon />
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={<ShowChartIcon />}
          title="Market Items"
          value={stats.totalItems}
          color="#10b981"
          onClick={() => navigate('/farmer-dashboard/market-prices')}
        />
        <StatCard
          icon={<ForumIcon />}
          title="Forum Posts"
          value={stats.totalPosts}
          color="#8b5cf6"
          onClick={() => navigate('/farmer-dashboard/forum')}
        />
        <StatCard
          icon={<CloudIcon />}
          title="Weather Updated"
          value="Live"
          color="#06b6d4"
          onClick={() => navigate('/farmer-dashboard/weather')}
        />
      </div>

      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          {quickActions.map((action, index) => (
            <div
              key={index}
              className="action-card"
              onClick={() => navigate(action.path)}
              style={{ '--action-color': action.color }}
            >
              <div className="action-icon" style={{ color: action.color }}>
                {action.icon}
              </div>
              <h3>{action.title}</h3>
              <p>{action.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FarmerHome;

