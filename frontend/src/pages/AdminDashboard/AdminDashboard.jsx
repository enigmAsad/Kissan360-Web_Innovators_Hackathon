import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.scss';
import { toast } from 'react-toastify';
import DashboardTab from '../../components/admin/tabs/DashboardTab';
import AddTab from '../../components/admin/tabs/AddTab';
import UpdateTab from '../../components/admin/tabs/UpdateTab';
import DeleteTab from '../../components/admin/tabs/DeleteTab';
import ManagePricesTab from '../../components/admin/tabs/ManagePricesTab';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">👨‍💼</span>
            <h1>Kissan360 Admin</h1>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-body">
        <aside className="admin-sidebar">
          <button
            className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="icon">🏠</span>
            <span>Dashboard</span>
          </button>
          <button
            className={`sidebar-link ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            <span className="icon">➕</span>
            <span>Add</span>
          </button>
          <button
            className={`sidebar-link ${activeTab === 'update' ? 'active' : ''}`}
            onClick={() => setActiveTab('update')}
          >
            <span className="icon">✏️</span>
            <span>Update</span>
          </button>
          <button
            className={`sidebar-link ${activeTab === 'prices' ? 'active' : ''}`}
            onClick={() => setActiveTab('prices')}
          >
            <span className="icon">💰</span>
            <span>Price Entry</span>
          </button>
          <button
            className={`sidebar-link ${activeTab === 'delete' ? 'active' : ''}`}
            onClick={() => setActiveTab('delete')}
          >
            <span className="icon">🗑️</span>
            <span>Delete</span>
          </button>
        </aside>

        <main className="admin-content">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'add' && <AddTab />}
          {activeTab === 'update' && <UpdateTab />}
          {activeTab === 'prices' && <ManagePricesTab />}
          {activeTab === 'delete' && <DeleteTab />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

