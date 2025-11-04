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

  const getWeatherColor = (category, temperature) => {
    switch (category?.toLowerCase()) {
      case 'heat':
        return temperature > 35 ? '#dc2626' : '#ea580c'; // Red for extreme heat, orange for heat
      case 'rain':
      case 'rainy':
        return '#3b82f6'; // Blue for rain
      case 'cold':
        return '#06b6d4'; // Cyan for cold
      case 'cloudy':
        return '#6b7280'; // Gray for cloudy
      case 'sunny':
        return '#f59e0b'; // Amber for sunny
      default:
        return '#8b5cf6'; // Purple default
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
      style: 'mapbox://styles/mapbox/satellite-streets-v12', // Better satellite view
      center: [69.3451, 30.3753], // Pakistan center
      zoom: 5.5,
    });

    map.current.on('load', () => {
      // Add Pakistan boundary layer with weather-based coloring
      map.current.addSource('pakistan-weather', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: weatherData.cities.map((city) => ({
            type: 'Feature',
            properties: {
              city: city.city,
              temperature: city.temperature,
              condition: city.condition,
              category: city.category,
              humidity: city.humidity,
              precipitation: city.precipitationChance,
              color: getWeatherColor(city.category, city.temperature)
            },
            geometry: {
              type: 'Point',
              coordinates: [city.coordinates.longitude, city.coordinates.latitude]
            }
          }))
        }
      });

      // Add heat circles for weather zones
      map.current.addLayer({
        id: 'weather-zones',
        type: 'circle',
        source: 'pakistan-weather',
        paint: {
          'circle-radius': {
            base: 1.75,
            stops: [
              [12, 40],
              [22, 180]
            ]
          },
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.3,
          'circle-stroke-width': 2,
          'circle-stroke-color': ['get', 'color'],
          'circle-stroke-opacity': 0.8
        }
      });

      // Add temperature labels
      map.current.addLayer({
        id: 'temperature-labels',
        type: 'symbol',
        source: 'pakistan-weather',
        layout: {
          'text-field': '{temperature}°C',
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 14,
          'text-offset': [0, 0],
          'text-anchor': 'center'
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 2
        }
      });

      // Add city name labels
      map.current.addLayer({
        id: 'city-labels',
        type: 'symbol',
        source: 'pakistan-weather',
        layout: {
          'text-field': '{city}',
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': 12,
          'text-offset': [0, 2],
          'text-anchor': 'top'
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 1
        }
      });

      // Add click events for popups
      map.current.on('click', 'weather-zones', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const properties = e.features[0].properties;

        // Create popup
        new mapboxgl.Popup({ offset: 25 })
          .setLngLat(coordinates)
          .setHTML(`
            <div class="weather-popup enhanced">
              <div class="popup-header" style="background: ${properties.color}">
                <h3>${properties.city}</h3>
                <div class="temp-display">${properties.temperature}°C</div>
              </div>
              <div class="popup-content">
                <p class="condition">${properties.condition}</p>
                <div class="stats-grid">
                  <div class="stat">
                    <span class="label">Humidity</span>
                    <span class="value">${properties.humidity}%</span>
                  </div>
                  <div class="stat">
                    <span class="label">Precipitation</span>
                    <span class="value">${properties.precipitation}%</span>
                  </div>
                </div>
              </div>
            </div>
          `)
          .addTo(map.current);
      });

      // Change cursor on hover
      map.current.on('mouseenter', 'weather-zones', () => {
        map.current.getCanvas().style.cursor = 'pointer';
      });

      map.current.on('mouseleave', 'weather-zones', () => {
        map.current.getCanvas().style.cursor = '';
      });
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add fullscreen control
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');
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
