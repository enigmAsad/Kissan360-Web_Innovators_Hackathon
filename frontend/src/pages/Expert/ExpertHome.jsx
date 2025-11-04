import React, { useEffect, useState } from "react";
import Navbar from "../../components/navbar/Navbar.jsx";
import ExpertSidebar from "../../components/expertSidebar/ExpertSidebar.jsx"
import "./ExpertHome.scss";
import Performance from "../../components/PerformanceReport/PerformanceReport.jsx";
import BlogRecommendation from "../../components/blogRecommendation/BlogRecommendation.jsx";
import ExpertNavbar from "../../components/expertNavbar/ExpertNavbar.jsx";
import RenderAllPosts from "../../components/RenderAllBlogs/RenderAllBlogs.jsx";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Future API integration flag
const USE_BACKEND_API = false;

const ExpertHome = ({ setUserRole }) => {
  const [notifications, setNotifications] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [marketData, setMarketData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data for 7-day price trends
  const generateMockMarketData = () => {
    const items = [
      { id: 1, name: 'Tomato', category: 'vegetable', unit: 'kg', currentPrice: 85 },
      { id: 2, name: 'Potato', category: 'vegetable', unit: 'kg', currentPrice: 45 },
      { id: 3, name: 'Onion', category: 'vegetable', unit: 'kg', currentPrice: 65 },
      { id: 4, name: 'Carrot', category: 'vegetable', unit: 'kg', currentPrice: 55 },
      { id: 5, name: 'Mango', category: 'fruit', unit: 'kg', currentPrice: 180 },
      { id: 6, name: 'Apple', category: 'fruit', unit: 'kg', currentPrice: 250 },
      { id: 7, name: 'Banana', category: 'fruit', unit: 'dozen', currentPrice: 120 },
      { id: 8, name: 'Orange', category: 'fruit', unit: 'kg', currentPrice: 140 },
    ];

    return items.map(item => {
      const basePrice = item.currentPrice;
      const priceHistory = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const variation = (Math.random() - 0.5) * 20;
        const price = Math.max(basePrice + variation, basePrice * 0.7);
        
        priceHistory.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          fullDate: date.toISOString(),
          price: Math.round(price * 100) / 100,
        });
      }

      const trend = priceHistory[6].price > priceHistory[0].price ? 'up' : 'down';
      const percentChange = ((priceHistory[6].price - priceHistory[0].price) / priceHistory[0].price * 100).toFixed(2);

      return {
        ...item,
        priceHistory,
        trend,
        percentChange: Math.abs(percentChange),
        trendDirection: trend,
      };
    });
  };

  useEffect(() => {
    // Future: Replace with actual API call when USE_BACKEND_API is true
    if (USE_BACKEND_API) {
      // TODO: Fetch from backend API
      // fetch('/api/market-prices/analytics')
      //   .then(res => res.json())
      //   .then(data => setMarketData(data));
    } else {
      setMarketData(generateMockMarketData());
    }

    setNotifications([
      { id: 1, message: "New update available for sustainable farming techniques." },
      { id: 2, message: "Check your messages for feedback " }    ]);

    setAppointments([
      { id: 1, date: "2024-11-07", expertName: "Farmer Ramesh" },
      { id: 2, date: "2024-11-14", expertName: "Farmer Sita" },
    ]);
  }, []);


  const filteredMarketData = selectedCategory === 'all' 
    ? marketData 
    : marketData.filter(item => item.category === selectedCategory);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{`${payload[0].payload.date}`}</p>
          <p className="price">{`PKR ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="home">
      <ExpertSidebar setUserRole={setUserRole} />
      <div className="homeContainer">
        <ExpertNavbar/>

        {/* Dashboard Section Navigation */}
        <div className="dashboard-nav">
          <button 
            className={activeSection === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveSection('dashboard')}
          >
            <span className="icon">📊</span> Analytics Dashboard
          </button>
          <button 
            className={activeSection === 'blogs' ? 'active' : ''}
            onClick={() => setActiveSection('blogs')}
          >
            <span className="icon">📝</span> Blog Management
          </button>
          <button 
            className={activeSection === 'performance' ? 'active' : ''}
            onClick={() => setActiveSection('performance')}
          >
            <span className="icon">📈</span> Performance
          </button>
          <button 
            className={activeSection === 'appointments' ? 'active' : ''}
            onClick={() => setActiveSection('appointments')}
          >
            <span className="icon">📅</span> Appointments
          </button>
        </div>

        {/* Analytics Dashboard Section */}
        {activeSection === 'dashboard' && (
          <div className="analytics-section">
            <div className="section-header">
              <h1>Market Price Analytics</h1>
              <p>7-Day Price Trends for Vegetables & Fruits</p>
            </div>

            <div className="filter-controls">
              <button 
                className={selectedCategory === 'all' ? 'active' : ''}
                onClick={() => setSelectedCategory('all')}
              >
                All Items
              </button>
              <button 
                className={selectedCategory === 'vegetable' ? 'active' : ''}
                onClick={() => setSelectedCategory('vegetable')}
              >
                🥕 Vegetables
              </button>
              <button 
                className={selectedCategory === 'fruit' ? 'active' : ''}
                onClick={() => setSelectedCategory('fruit')}
              >
                🍎 Fruits
              </button>
            </div>

            <div className="market-grid">
              {filteredMarketData.map((item) => (
                <div key={item.id} className="market-card">
                  <div className="card-header">
                    <div className="item-info">
                      <h3>{item.name}</h3>
                      <span className="category-badge">{item.category}</span>
                    </div>
                    <div className="price-info">
                      <div className="current-price">
                        PKR {item.priceHistory[6].price}
                        <span className="unit">/{item.unit}</span>
                      </div>
                      <div className={`trend-indicator ${item.trendDirection}`}>
                        <span className="arrow">{item.trendDirection === 'up' ? '↑' : '↓'}</span>
                        {item.percentChange}%
                      </div>
                    </div>
                  </div>

                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={item.priceHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#94a3b8"
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis 
                          stroke="#94a3b8"
                          style={{ fontSize: '12px' }}
                          domain={['dataMin - 5', 'dataMax + 5']}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line 
                          type="monotone" 
                          dataKey="price" 
                          stroke={item.trendDirection === 'up' ? '#10b981' : '#ef4444'}
                          strokeWidth={3}
                          dot={{ fill: '#6366f1', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="card-footer">
                    <span className="date-range">
                      {item.priceHistory[0].date} - {item.priceHistory[6].date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Blog Management Section */}
        {activeSection === 'blogs' && (
          <div className="blogs-section">
            <div className="blog-recommendation">
              <BlogRecommendation/>
            </div>
            <div className="render-all-posts">
              <RenderAllPosts/>
            </div>
          </div>
        )}

        {/* Performance Section */}
        {activeSection === 'performance' && (
          <div className="performance-section">
            <div className="performance">
              <Performance/>
            </div>
          </div>
        )}

        {/* Appointments Section */}
        {activeSection === 'appointments' && (
          <div className="appointments-section">
            <div className="notifications-appointments2">
              <section className="notifications2">
                <h2>Notifications</h2>
                <ul>
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <li key={notification.id}>{notification.message}</li>
                    ))
                  ) : (
                    <li>No notifications available.</li>
                  )}
                </ul>
              </section>

              <section className="appointments2">
                <h2>Upcoming Appointments</h2>
                <ul>
                  {appointments.length > 0 ? (
                    appointments.map((appointment) => (
                      <li key={appointment.id}>
                        {appointment.date} - {appointment.expertName}
                      </li>
                    ))
                  ) : (
                    <li>No appointments scheduled.</li>
                  )}
                </ul>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpertHome;

