import React from 'react';
import './EmptyState.scss';

const EmptyState = ({ icon, message, action }) => {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <p className="empty-message">{message}</p>
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
};

export default EmptyState;

