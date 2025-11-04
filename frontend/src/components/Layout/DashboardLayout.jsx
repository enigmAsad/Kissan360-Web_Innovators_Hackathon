import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../Sidebar/Sidebar';
import VoiceAssistantWidget from '../VoiceAssistantWidget/VoiceAssistantWidget';
import './DashboardLayout.scss';

const DashboardLayout = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <Outlet />
      </div>
      <VoiceAssistantWidget />
    </div>
  );
};

export default DashboardLayout;

