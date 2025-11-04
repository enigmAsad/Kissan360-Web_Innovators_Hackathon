import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import { mockMarketItems, generateMockTrendData } from '../../utils/mockData';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import EmptyState from '../../components/EmptyState/EmptyState';
import TrendChart from '../../components/TrendChart/TrendChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import './PriceTrends.scss';
import { toast } from 'react-toastify';

const PriceTrends = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(searchParams.get('item') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [priceChange, setPriceChange] = useState(null);

  const pakistanCities = [
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
    'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
  ];

  useEffect(() => {
    const fetchItems = async () => {
      try {
        // Always use mock data for rich visualization
        console.log('Using mock data for rich trend visualization');
        setItems(mockMarketItems);
      } catch (err) {
        console.error('Failed to fetch items:', err);
        toast.error('Failed to load items');
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

  useEffect(() => {
    if (selectedItem && city) {
      fetchTrend();
    }
  }, [selectedItem, city]);

  const fetchTrend = async () => {
    if (!selectedItem || !city) {
      toast.warning('Please select both item and city');
      return;
    }

    setLoading(true);
    try {
      // Always generate mock trend data for rich visualization
      console.log('Generating mock trend data for rich visualization');
      const item = items.find(i => i._id === selectedItem);
      const itemName = item ? item.name : 'Selected Item';
      const basePrice = item ? item.latestPrice || 100 : 100;
      const trendResult = generateMockTrendData(itemName, basePrice);
      trendResult.city = city;
      
      setTrendData(trendResult);
      
      // Calculate price change
      const validPrices = trendResult.data.filter(d => d.price !== null);
      if (validPrices.length >= 2) {
        const firstPrice = validPrices[0].price;
        const lastPrice = validPrices[validPrices.length - 1].price;
        const change = ((lastPrice - firstPrice) / firstPrice) * 100;
        setPriceChange(change);
      } else {
        setPriceChange(null);
      }
    } catch (err) {
      console.error('Failed to fetch trend:', err);
      toast.error('Failed to load price trend');
      setTrendData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (itemId) => {
    setSelectedItem(itemId);
    setSearchParams({ item: itemId, city });
  };

  const handleCityChange = (newCity) => {
    setCity(newCity);
    if (selectedItem) {
      setSearchParams({ item: selectedItem, city: newCity });
    }
  };

  return (
    <div className="price-trends">
      <div className="page-header">
        <h1>Price Trends</h1>
        <p>7-day price trend analysis for market items</p>
      </div>

      <div className="controls">
        <div className="control-group">
          <label>Select Item</label>
          <select
            value={selectedItem}
            onChange={(e) => handleItemChange(e.target.value)}
            className="control-select"
          >
            <option value="">Choose an item...</option>
            {items.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name} ({item.category})
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Select City</label>
          <div className="city-select">
            <LocationOnIcon />
            <select
              value={city}
              onChange={(e) => handleCityChange(e.target.value)}
              className="control-select"
            >
              <option value="">Choose a city...</option>
              {pakistanCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading price trend..." />
      ) : !trendData ? (
        <EmptyState
          icon={<ShowChartIcon />}
          message="Select an item and city to view the 7-day price trend"
        />
      ) : (
        <div className="trend-content">
          <div className="trend-header">
            <h2>{trendData.item.name} - {trendData.city}</h2>
            {priceChange !== null && (
              <div className={`price-change ${priceChange >= 0 ? 'positive' : 'negative'}`}>
                {priceChange >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                <span>{Math.abs(priceChange).toFixed(2)}%</span>
                <span className="change-label">
                  {priceChange >= 0 ? 'Increase' : 'Decrease'}
                </span>
              </div>
            )}
          </div>

          <TrendChart data={trendData.data} itemName={trendData.item.name} />
        </div>
      )}
    </div>
  );
};

export default PriceTrends;

