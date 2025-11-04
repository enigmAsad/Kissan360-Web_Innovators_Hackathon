import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import EmptyState from '../../components/EmptyState/EmptyState';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import './SmartAdvice.scss';
import { toast } from 'react-toastify';

const SmartAdvice = () => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [city, setCity] = useState('');
  const [rainExpected, setRainExpected] = useState(false);
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(false);

  const pakistanCities = [
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
    'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
  ];

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await api.get('/market/items');
        setItems(res.data);
      } catch (err) {
        console.error('Failed to fetch items:', err);
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    const loadRegion = async () => {
      if (!city) {
        try {
          const res = await api.get('/profile/region');
          if (res.data.region) {
            setCity(res.data.region);
          }
        } catch (err) {
          console.error('Failed to load region:', err);
        }
      }
    };
    loadRegion();
  }, []);

  const handleGetAdvice = async (e) => {
    e.preventDefault();
    
    if (!selectedItem || !city) {
      toast.warning('Please select both item and city');
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/short-advice?item=${selectedItem}&city=${city}&rainExpected=${rainExpected}`);
      setAdvice(res.data);
      toast.success('Advice generated successfully!');
    } catch (err) {
      console.error('Failed to get advice:', err);
      toast.error('Failed to generate advice');
      setAdvice(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="smart-advice">
      <div className="page-header">
        <h1>Smart Farming Advice</h1>
        <p>Get personalized recommendations based on market trends</p>
      </div>

      <div className="advice-form">
        <form onSubmit={handleGetAdvice}>
          <div className="form-group">
            <label>
              <AgricultureIcon />
              Select Crop/Item
            </label>
            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              className="form-select"
              required
            >
              <option value="">Choose an item...</option>
              {items.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name} ({item.category})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              <LocationOnIcon />
              Select City
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="form-select"
              required
            >
              <option value="">Choose a city...</option>
              {pakistanCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rainExpected}
                onChange={(e) => setRainExpected(e.target.checked)}
              />
              <WaterDropIcon />
              Rain Expected
            </label>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            <LightbulbIcon />
            {loading ? 'Generating...' : 'Get Advice'}
          </button>
        </form>
      </div>

      {loading ? (
        <LoadingSpinner message="Generating personalized advice..." />
      ) : advice ? (
        <div className="advice-result">
          <div className="result-header">
            <LightbulbIcon />
            <h2>Recommendations for {advice.item.name} in {advice.city}</h2>
          </div>

          <div className="advice-list">
            {advice.advice && advice.advice.length > 0 ? (
              advice.advice.map((tip, index) => (
                <div key={index} className="advice-item">
                  <CheckCircleIcon />
                  <p>{tip}</p>
                </div>
              ))
            ) : (
              <p className="no-advice">No specific advice available at the moment.</p>
            )}
          </div>
        </div>
      ) : (
        !loading && (
          <EmptyState
            icon={<LightbulbIcon />}
            message="Fill in the form above to get personalized farming recommendations based on recent price trends"
          />
        )
      )}
    </div>
  );
};

export default SmartAdvice;

