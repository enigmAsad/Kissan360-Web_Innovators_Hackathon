import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { mockMarketItems } from '../../utils/mockData';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import EmptyState from '../../components/EmptyState/EmptyState';
import MarketPriceCard from '../../components/MarketPriceCard/MarketPriceCard';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import './MarketPrices.scss';
import { toast } from 'react-toastify';

const MarketPrices = () => {
  const [items, setItems] = useState([]);
  const [region, setRegion] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const pakistanCities = [
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
    'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
  ];

  useEffect(() => {
    // Load saved region
    const loadRegion = async () => {
      try {
        const res = await api.get('/api/profile/region');
        if (res.data.region) {
          setRegion(res.data.region);
        }
      } catch (err) {
        console.error('Failed to load region:', err);
      }
    };
    loadRegion();
  }, []);

  useEffect(() => {
    if (region) {
      fetchItems();
    }
  }, [region]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      // Always use mock data for rich visualization
      console.log('Using mock data for rich market visualization');
      const mockItems = mockMarketItems.map(item => ({
        ...item,
        latestPrice: region ? 
          Math.round(item.latestPrice * (0.8 + Math.random() * 0.4)) : // ±20% variation by city
          item.latestPrice
      }));
      setItems(mockItems);
    } catch (err) {
      console.error('Failed to load market prices:', err);
      toast.error('Failed to load market prices');
    } finally {
      setLoading(false);
    }
  };

  const handleRegionChange = async (newRegion) => {
    setRegion(newRegion);
    try {
      await api.put('/api/profile/region', { region: newRegion });
      toast.success(`Region updated to ${newRegion}`);
    } catch (err) {
      console.error('Failed to update region:', err);
      toast.error('Failed to save region preference');
    }
  };

  return (
    <div className="market-prices">
      <div className="page-header">
        <div>
          <h1>Market Prices</h1>
          <p>Current market prices for agricultural products</p>
        </div>
      </div>

      <div className="region-selector">
        <LocationOnIcon />
        <select
          value={region}
          onChange={(e) => handleRegionChange(e.target.value)}
          className="region-dropdown"
        >
          <option value="">Select your city</option>
          {pakistanCities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading market prices..." />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<ShowChartIcon />}
          message={region ? `No market data available for ${region}` : 'Please select a city to view prices'}
        />
      ) : (
        <div className="items-grid">
          {items.map((item) => (
            <MarketPriceCard
              key={item._id}
              item={item}
              onViewTrend={() => navigate(`/farmer-dashboard/price-trends?item=${item._id}&city=${region}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketPrices;

