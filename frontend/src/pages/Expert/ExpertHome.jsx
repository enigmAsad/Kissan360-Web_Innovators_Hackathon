import React, { useEffect, useState } from "react";
import Navbar from "../../components/navbar/Navbar.jsx";
import ExpertSidebar from "../../components/expertSidebar/ExpertSidebar.jsx"
import "./ExpertHome.scss";
import Performance from "../../components/PerformanceReport/PerformanceReport.jsx";
import BlogRecommendation from "../../components/blogRecommendation/BlogRecommendation.jsx";
import ExpertNavbar from "../../components/expertNavbar/ExpertNavbar.jsx";
import RenderAllPosts from "../../components/RenderAllBlogs/RenderAllBlogs.jsx";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AddIcon from "@mui/icons-material/AddCircleOutline";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutlineOutlined";
import newRequest from "../../utils/newRequest";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// API integration flag - set to true to use backend APIs
const USE_BACKEND_API = true;

const ExpertHome = ({ setUserRole }) => {
  const [notifications, setNotifications] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [marketData, setMarketData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Lahore');

  // Fetch market items with trends from API
  const fetchMarketData = async () => {
    setLoading(true);
    try {
      // Get all market items with latest prices
      const itemsResponse = await newRequest.get(`/api/market/items?city=${selectedCity}`);
      const items = itemsResponse.data;

      // Fetch 7-day trend for each item
      const itemsWithTrends = await Promise.all(
        items.map(async (item) => {
          try {
            const trendResponse = await newRequest.get(
              `/api/market/items/${item._id}/trend?city=${selectedCity}`
            );
            const trendData = trendResponse.data.data || [];

            // Format price history for chart
            const priceHistory = trendData.map(point => ({
              date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              fullDate: point.date,
              price: point.price,
            }));

            // Calculate trend
            const firstPrice = priceHistory[0]?.price || 0;
            const lastPrice = priceHistory[priceHistory.length - 1]?.price || 0;
            const trend = lastPrice > firstPrice ? 'up' : 'down';
            const percentChange = firstPrice !== 0 
              ? (((lastPrice - firstPrice) / firstPrice) * 100).toFixed(2)
              : 0;

            return {
              id: item._id,
              name: item.name,
              category: item.category,
              unit: item.unit,
              description: item.description || '',
              enabled: item.enabled,
              priceHistory: priceHistory.length > 0 ? priceHistory : [{ date: 'N/A', price: 0 }],
              trend,
              percentChange: Math.abs(percentChange),
              trendDirection: trend,
              latestPrice: item.latestPrice || lastPrice,
            };
          } catch (error) {
            console.error(`Error fetching trend for ${item.name}:`, error);
            return {
              id: item._id,
              name: item.name,
              category: item.category,
              unit: item.unit,
              description: item.description || '',
              enabled: item.enabled,
              priceHistory: [{ date: 'N/A', price: item.latestPrice || 0 }],
              trend: 'neutral',
              percentChange: 0,
              trendDirection: 'neutral',
              latestPrice: item.latestPrice || 0,
            };
          }
        })
      );

      setMarketData(itemsWithTrends);
    } catch (error) {
      console.error('Error fetching market data:', error);
      toast.error('Failed to load market data');
      // Fallback to mock data
      setMarketData(generateMockMarketData());
    } finally {
      setLoading(false);
    }
  };

  // Mock data fallback
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
        latestPrice: priceHistory[6].price,
      };
    });
  };

  useEffect(() => {
    if (USE_BACKEND_API) {
      fetchMarketData();
    } else {
      setMarketData(generateMockMarketData());
    }

    setNotifications([
      { id: 1, message: "New update available for sustainable farming techniques." },
      { id: 2, message: "Check your messages for feedback " }
    ]);

    setAppointments([
      { id: 1, date: "2024-11-07", expertName: "Farmer Ramesh" },
      { id: 2, date: "2024-11-14", expertName: "Farmer Sita" },
    ]);
  }, [selectedCity]);


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

  const [cropForm, setCropForm] = useState({
    name: '',
    category: 'vegetable',
    unit: 'kg',
    description: '',
    enabled: true
  });

  const [priceForm, setPriceForm] = useState({
    city: '',
    date: new Date().toISOString().split('T')[0],
    price: '',
    currency: 'PKR',
    source: ''
  });

  const handleCropFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCropForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePriceFormChange = (e) => {
    const { name, value } = e.target;
    setPriceForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddCrop = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await newRequest.post('/api/market/items', cropForm);
      toast.success(response.data.message || 'Crop added successfully!');
      
      // If price data is provided, add it
      if (priceForm.price && priceForm.city) {
        try {
          await newRequest.post('/api/market/prices', {
            item: response.data.item._id,
            city: priceForm.city,
            date: priceForm.date,
            price: parseFloat(priceForm.price),
            currency: priceForm.currency,
            source: priceForm.source,
          });
          toast.success('Initial price data added!');
        } catch (priceError) {
          console.error('Error adding price:', priceError);
          toast.warning('Crop added but price data failed');
        }
      }

      // Reset forms
      setCropForm({
        name: '',
        category: 'vegetable',
        unit: 'kg',
        description: '',
        enabled: true
      });
      setPriceForm({
        city: '',
        date: new Date().toISOString().split('T')[0],
        price: '',
        currency: 'PKR',
        source: ''
      });

      // Refresh market data
      if (USE_BACKEND_API) {
        fetchMarketData();
      }
    } catch (error) {
      console.error('Error adding crop:', error);
      toast.error(error.response?.data?.message || 'Failed to add crop');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCrop = async (itemId) => {
    // TODO: Implement update modal with form
    toast.info('Update functionality coming soon');
  };

  const handleDeleteCrop = async (itemId, itemName) => {
    if (!window.confirm(`Are you sure you want to delete ${itemName}?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await newRequest.delete(`/api/market/items/${itemId}`);
      toast.success(response.data.message || 'Crop deleted successfully!');
      
      // Refresh market data
      if (USE_BACKEND_API) {
        fetchMarketData();
      }
    } catch (error) {
      console.error('Error deleting crop:', error);
      toast.error(error.response?.data?.message || 'Failed to delete crop');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <ExpertSidebar 
        setUserRole={setUserRole} 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      <div className="homeContainer">
        <ExpertNavbar/>

        {/* Analytics Dashboard Section */}
        {activeSection === 'dashboard' && (
          <div className="analytics-section">
            <div className="section-header">
              <h1>Market Price Analytics</h1>
              <p>7-Day Price Trends for Vegetables & Fruits</p>
              <div className="city-selector">
                <label>Select City:</label>
                <select 
                  value={selectedCity} 
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="city-select"
                >
                  <option value="Lahore">Lahore</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Multan">Multan</option>
                </select>
              </div>
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
              {loading && <div className="loading-overlay">Loading market data...</div>}
              {filteredMarketData.map((item) => (
                <div key={item.id} className="market-card">
                  <div className="card-header">
                    <div className="item-info">
                      <h3>{item.name}</h3>
                      <span className="category-badge">{item.category}</span>
                    </div>
                    <div className="price-info">
                      <div className="current-price">
                        PKR {item.priceHistory[item.priceHistory.length - 1]?.price || item.latestPrice || 0}
                        <span className="unit">/{item.unit}</span>
                      </div>
                      <div className={`trend-indicator ${item.trendDirection}`}>
                        <span className="arrow">{item.trendDirection === 'up' ? '↑' : item.trendDirection === 'down' ? '↓' : '→'}</span>
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

        {/* Add Crop Section */}
        {activeSection === 'addCrop' && (
          <div className="crop-management-section">
            <div className="section-header">
              <h1>Add New Crop</h1>
              <p>Add vegetables or fruits to the market database</p>
            </div>

            <div className="form-container-crop">
              <form onSubmit={handleAddCrop} className="crop-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Crop Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={cropForm.name}
                      onChange={handleCropFormChange}
                      placeholder="e.g., Tomato, Apple"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      name="category"
                      value={cropForm.category}
                      onChange={handleCropFormChange}
                      required
                    >
                      <option value="vegetable">🥕 Vegetable</option>
                      <option value="fruit">🍎 Fruit</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Unit *</label>
                    <input
                      type="text"
                      name="unit"
                      value={cropForm.unit}
                      onChange={handleCropFormChange}
                      placeholder="e.g., kg, dozen"
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={cropForm.description}
                      onChange={handleCropFormChange}
                      placeholder="Add description about the crop..."
                      rows="4"
                    />
                  </div>

                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="enabled"
                        checked={cropForm.enabled}
                        onChange={handleCropFormChange}
                      />
                      <span>Enable this crop in the system</span>
                    </label>
                  </div>
                </div>

                <button type="submit" className="submit-btn">
                  <AddIcon /> Add Crop
                </button>
              </form>

              <div className="price-form-section">
                <h3>Add Initial Price Data</h3>
                <form className="price-form">
                  <div className="form-grid-small">
                    <div className="form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        name="city"
                        value={priceForm.city}
                        onChange={handlePriceFormChange}
                        placeholder="e.g., Lahore"
                      />
                    </div>

                    <div className="form-group">
                      <label>Date *</label>
                      <input
                        type="date"
                        name="date"
                        value={priceForm.date}
                        onChange={handlePriceFormChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Price *</label>
                      <input
                        type="number"
                        name="price"
                        value={priceForm.price}
                        onChange={handlePriceFormChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>

                    <div className="form-group">
                      <label>Source</label>
                      <input
                        type="text"
                        name="source"
                        value={priceForm.source}
                        onChange={handlePriceFormChange}
                        placeholder="e.g., Market Survey"
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Update Crop Section */}
        {activeSection === 'updateCrop' && (
          <div className="crop-management-section">
            <div className="section-header">
              <h1>Update Crop</h1>
              <p>Select and update existing crops in the database</p>
            </div>

            <div className="crop-list-container">
              {loading && <div className="loading-overlay">Loading crops...</div>}
              {marketData.map((item) => (
                <div key={item.id} className="crop-item-card">
                  <div className="crop-item-header">
                    <div>
                      <h3>{item.name}</h3>
                      <span className={`category-badge ${item.category}`}>
                        {item.category}
                      </span>
                    </div>
                    <div className="crop-item-price">
                      PKR {item.priceHistory[item.priceHistory.length - 1]?.price || item.latestPrice || 0} / {item.unit}
                    </div>
                  </div>
                  <div className="crop-item-actions">
                    <button 
                      className="btn-edit"
                      onClick={() => handleUpdateCrop(item.id)}
                      disabled={loading}
                    >
                      <EditIcon /> Edit Details
                    </button>
                    <button 
                      className="btn-price"
                      onClick={() => toast.info('Add price entry functionality coming soon')}
                    >
                      Add Price Entry
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delete Crop Section */}
        {activeSection === 'deleteCrop' && (
          <div className="crop-management-section">
            <div className="section-header">
              <h1>Delete Crop</h1>
              <p>Remove crops from the market database</p>
            </div>

            <div className="crop-list-container">
              {loading && <div className="loading-overlay">Loading crops...</div>}
              {marketData.map((item) => (
                <div key={item.id} className="crop-item-card delete-mode">
                  <div className="crop-item-header">
                    <div>
                      <h3>{item.name}</h3>
                      <span className={`category-badge ${item.category}`}>
                        {item.category}
                      </span>
                    </div>
                    <div className="crop-item-info">
                      <span className="unit">{item.unit}</span>
                      <span className={`status ${item.enabled ? 'active' : 'inactive'}`}>
                        {item.enabled ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="crop-item-description">
                    Current Price: PKR {item.priceHistory[item.priceHistory.length - 1]?.price || item.latestPrice || 0}
                  </div>
                  <div className="crop-item-actions">
                    <button 
                      className="btn-danger"
                      onClick={() => handleDeleteCrop(item.id, item.name)}
                      disabled={loading}
                    >
                      <DeleteIcon /> Delete Crop
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpertHome;

