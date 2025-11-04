import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import WeatherCard from '../../components/WeatherCard/WeatherCard';
import CloudIcon from '@mui/icons-material/Cloud';
import './Weather.scss';
import { toast } from 'react-toastify';

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const res = await api.get('/weather/');
      setWeatherData(res.data);
    } catch (err) {
      console.error('Failed to fetch weather:', err);
      toast.error('Failed to load weather data');
    } finally {
      setLoading(false);
    }
  };

  const filteredCities = weatherData?.cities?.filter((city) => {
    if (filter === 'all') return true;
    return city.category === filter;
  }) || [];

  const categories = weatherData?.cities
    ? [...new Set(weatherData.cities.map((c) => c.category))].filter(Boolean)
    : [];

  return (
    <div className="weather-page">
      <div className="page-header">
        <h1>Weather Forecast</h1>
        <p>Real-time weather updates across Pakistan</p>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading weather data..." />
      ) : weatherData ? (
        <>
          <div className="filter-section">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Cities
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`filter-btn ${filter === cat ? 'active' : ''}`}
                onClick={() => setFilter(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          <div className="weather-grid">
            {filteredCities.map((city, index) => (
              <WeatherCard key={index} city={city} />
            ))}
          </div>

          {weatherData.generatedAt && (
            <div className="last-updated">
              Last updated: {new Date(weatherData.generatedAt).toLocaleString()}
            </div>
          )}
        </>
      ) : (
        <div className="no-data">
          <CloudIcon />
          <p>No weather data available</p>
        </div>
      )}
    </div>
  );
};

export default Weather;

