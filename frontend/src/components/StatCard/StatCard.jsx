import React from 'react';
import './StatCard.scss';

const StatCard = ({ icon, title, value, color = '#8b5cf6', onClick }) => {
  return (
    <div className="stat-card" style={{ '--card-color': color }} onClick={onClick}>
      <div className="stat-icon" style={{ color }}>
        {icon}
      </div>
      <div className="stat-info">
        <h3 className="stat-value">{value}</h3>
        <p className="stat-title">{title}</p>
      </div>
    </div>
  );
};

export default StatCard;

