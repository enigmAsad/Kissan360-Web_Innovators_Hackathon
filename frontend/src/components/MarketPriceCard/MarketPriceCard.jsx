import React from 'react';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import AppleIcon from '@mui/icons-material/Apple';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import './MarketPriceCard.scss';

const MarketPriceCard = ({ item, onViewTrend }) => {
  const getCategoryIcon = () => {
    return item.category === 'fruit' ? <AppleIcon /> : <LocalFloristIcon />;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="market-price-card">
      <div className="card-header">
        <div className="category-icon" data-category={item.category}>
          {getCategoryIcon()}
        </div>
        <div className="item-info">
          <h3>{item.name}</h3>
          <span className="category-badge">{item.category}</span>
        </div>
      </div>

      <div className="price-info">
        {item.latestPrice !== undefined && item.latestPrice !== null ? (
          <>
            <div className="price">
              <span className="amount">PKR {item.latestPrice}</span>
              <span className="unit">per {item.unit}</span>
            </div>
            <div className="last-updated">
              Updated: {formatDate(item.lastUpdated)}
            </div>
          </>
        ) : (
          <div className="no-price">Price not available</div>
        )}
      </div>

      {item.description && (
        <p className="description">{item.description}</p>
      )}

      <button className="trend-btn" onClick={onViewTrend}>
        <TrendingUpIcon />
        View Trend
      </button>
    </div>
  );
};

export default MarketPriceCard;

