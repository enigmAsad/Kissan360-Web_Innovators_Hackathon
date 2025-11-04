import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import './LoadingSpinner.scss';

const LoadingSpinner = ({ size = 40, message = 'Loading...' }) => {
  return (
    <div className="loading-spinner">
      <CircularProgress size={size} style={{ color: '#8b5cf6' }} />
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;

