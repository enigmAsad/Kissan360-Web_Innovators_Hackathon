import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import WeatherCard from '../../components/WeatherCard/WeatherCard';
import CloudIcon from '@mui/icons-material/Cloud';
import MapIcon from '@mui/icons-material/Map';
import ViewListIcon from '@mui/icons-material/ViewList';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './Weather.scss';
import { toast } from 'react-toastify';

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'map'
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    fetchWeather();
  }, []);

  useEffect(() => {
    if (viewMode === 'map' && weatherData && !map.current) {
      initializeMap();
    }
  }, [viewMode, weatherData]);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/weather/');
      setWeatherData(res.data);
    } catch (err) {
      console.error('Failed to fetch weather:', err);
      toast.error('Failed to load weather data');
    } finally {
      setLoading(false);
    }
  };

  const initializeMap = () => {
    if (!weatherData?.cities || map.current) return;

    // Set Mapbox token from weather data or use a default
    if (weatherData.mapboxToken) {
      mapboxgl.accessToken = weatherData.mapboxToken;
    } else {
      // Use default Mapbox token
      mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [69.3451, 30.3753], // Pakistan center
      zoom: 5,
    });

    // Add markers for each city
    weatherData.cities.forEach((city) => {
      if (city.coordinates) {
        const { latitude, longitude } = city.coordinates;

        // Create custom marker HTML
        const el = document.createElement('div');
        el.className = 'weather-marker';
        el.innerHTML = `
          <div class="marker-content">
            <div class="marker-temp">${city.temperature}°</div>
          </div>
        `;

        // Create popup
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div class="weather-popup">
            <h3>${city.city}</h3>
            <p class="condition">${city.condition}</p>
            <div class="stats">
              <div><strong>Temp:</strong> ${city.temperature}°C</div>
              <div><strong>Humidity:</strong> ${city.humidity}%</div>
              <div><strong>Precipitation:</strong> ${city.precipitationChance}%</div>
            </div>
          </div>
        `);

        // Add marker to map
        new mapboxgl.Marker(el)
          .setLngLat([longitude, latitude])
          .setPopup(popup)
          .addTo(map.current);
      }
    });
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
        <div>
          <h1>Weather Forecast</h1>
          <p>Real-time weather updates across Pakistan</p>
        </div>
        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
            onClick={() => setViewMode('cards')}
          >
            <ViewListIcon />
            Cards
          </button>
          <button
            className={`view-btn ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
          >
            <MapIcon />
            Map
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading weather data..." />
      ) : weatherData ? (
        <>
          {viewMode === 'cards' ? (
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
            </>
          ) : (
            <div className="map-container-wrapper">
              <div ref={mapContainer} className="map-container" />
            </div>
          )}

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
