import React from 'react';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import './WeatherCard.scss';

const WeatherCard = ({ city }) => {
  const getCategoryIcon = () => {
    switch (city.category?.toLowerCase()) {
      case 'heat':
      case 'sunny':
        return <WbSunnyIcon />;
      case 'rain':
      case 'rainy':
        return <ThunderstormIcon />;
      case 'cold':
        return <AcUnitIcon />;
      default:
        return <CloudIcon />;
    }
  };

  const getCategoryColor = () => {
    switch (city.category?.toLowerCase()) {
      case 'heat':
      case 'sunny':
        return '#f59e0b';
      case 'rain':
      case 'rainy':
        return '#3b82f6';
      case 'cold':
        return '#06b6d4';
      default:
        return '#8b5cf6';
    }
  };

  return (
    <div className="weather-card" style={{ '--category-color': getCategoryColor() }}>
      <div className="card-header">
        <h3>{city.city}</h3>
        <div className="weather-icon" style={{ color: getCategoryColor() }}>
          {getCategoryIcon()}
        </div>
      </div>

      <div className="temperature">
        <span className="temp-value">{city.temperature}°C</span>
      </div>

      <div className="condition">{city.condition}</div>

      <div className="weather-stats">
        <div className="stat-item">
          <WaterDropIcon />
          <div>
            <span className="stat-label">Humidity</span>
            <span className="stat-value">{city.humidity}%</span>
          </div>
        </div>
        <div className="stat-item">
          <CloudIcon />
          <div>
            <span className="stat-label">Precipitation</span>
            <span className="stat-value">{city.precipitationChance}%</span>
          </div>
        </div>
      </div>

      {city.category && (
        <div className="category-badge" style={{ background: `${getCategoryColor()}33`, color: getCategoryColor() }}>
          {city.category}
        </div>
      )}
    </div>
  );
};

export default WeatherCard;

