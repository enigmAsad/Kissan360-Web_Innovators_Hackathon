import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { mockMarketItems, mockAdviceData } from '../../utils/mockData';
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
        // Always use mock data for rich visualization
        console.log('Using mock data for smart advice items');
        setItems(mockMarketItems);
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
          const res = await api.get('/api/profile/region');
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
      // Always generate rich mock advice for demonstration
      console.log('Generating mock advice for rich visualization');
      
      const selectedItemData = items.find(item => item._id === selectedItem);
      const itemName = selectedItemData ? selectedItemData.name : 'Selected Item';
      
      // Generate dynamic advice based on selections
      const generateAdvice = () => {
        const baseAdvice = [];
        const priceChange = (Math.random() - 0.5) * 30; // Random price change ±15%
        
        // Price-based advice
        if (priceChange > 10) {
          baseAdvice.push(`${itemName} prices rising (+${priceChange.toFixed(1)}%) - consider selling soon`);
          baseAdvice.push(`Market demand for ${itemName} is high in ${city}`);
        } else if (priceChange < -10) {
          baseAdvice.push(`${itemName} prices falling (${priceChange.toFixed(1)}%) - hold if possible`);
          baseAdvice.push(`Consider alternative markets or storage for ${itemName}`);
        } else {
          baseAdvice.push(`${itemName} prices stable in ${city} - good time for steady sales`);
        }
        
        // Rain-specific advice
        if (rainExpected) {
          if (selectedItemData?.category === 'vegetable') {
            baseAdvice.push(`Rain expected - protect ${itemName} crops from excess moisture`);
            baseAdvice.push(`Consider harvesting mature ${itemName} before heavy rain`);
          } else if (selectedItemData?.category === 'fruit') {
            baseAdvice.push(`Rain expected - ensure proper drainage for ${itemName} orchards`);
          }
        } else {
          baseAdvice.push(`No rain expected - maintain irrigation for ${itemName}`);
        }
        
        // General advice
        baseAdvice.push(`Monitor ${city} market demand for ${itemName} regularly`);
        baseAdvice.push(`Quality control is key - ensure ${itemName} meets market standards`);
        
        return baseAdvice.slice(0, 4); // Limit to 4 pieces of advice
      };
      
      const mockResult = {
        item: { 
          id: selectedItem, 
          name: itemName,
          category: selectedItemData?.category || 'crop'
        },
        city: city,
        advice: generateAdvice()
      };
      
      setAdvice(mockResult);
      toast.success('Smart advice generated successfully!');
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
            <h2>Recommendations for {advice.item?.name || 'Selected Item'} in {advice.city}</h2>
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

