import React, { useEffect, useState } from 'react';
import api from '../../../utils/api';
import { toast } from 'react-toastify';

const DeleteTab = () => {
  const [items, setItems] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [deleting, setDeleting] = useState(null);
  
  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCity, setSelectedCity] = useState('');
  const [deletingPrice, setDeletingPrice] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/market/items?withCities=true');
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const { data } = await api.get('/api/market/cities');
      setCities(Array.isArray(data) ? data : []);
    } catch (e) {
      setCities([]);
    }
  };

  useEffect(() => { 
    fetchItems();
    fetchCities();
  }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesCity = cityFilter === 'All' || (item.cities && item.cities.includes(cityFilter));
    return matchesSearch && matchesCategory && matchesCity;
  });

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Are you sure you want to disable the entire product "${item.name}"? This will disable the item (soft delete).`)) return;
    setDeleting(item._id);
    try {
      await api.delete(`/api/market/items/${item._id}`);
      toast.success('Item disabled successfully');
      fetchItems();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete item');
    } finally {
      setDeleting(null);
    }
  };

  const openDeletePriceModal = (item) => {
    setSelectedItem(item);
    setSelectedCity('');
    setShowDeleteModal(true);
  };

  const handleDeletePrices = async () => {
    if (!selectedCity) {
      toast.error('Please select a city');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete all price data for "${selectedItem.name}" in ${selectedCity}?`)) return;
    
    setDeletingPrice(true);
    try {
      // Delete all prices for this item in this city
      await api.delete(`/api/market/prices/item/${selectedItem._id}/city/${selectedCity}`);
      toast.success(`Price data deleted for ${selectedCity}`);
      setShowDeleteModal(false);
      fetchItems();
      fetchCities();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete price data');
    } finally {
      setDeletingPrice(false);
    }
  };

  return (
    <div className="content-card">
      <h2>Delete Products / Prices</h2>
      <p style={{ color: '#94a3b8', marginBottom: 20 }}>Delete entire products or remove price data for specific cities</p>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
          <label htmlFor="search">Search</label>
          <input
            id="search"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="form-group" style={{ flex: '0 1 180px', marginBottom: 0 }}>
          <label htmlFor="category">Category</label>
          <select id="category" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="All">All</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Fruits">Fruits</option>
          </select>
        </div>
        <div className="form-group" style={{ flex: '0 1 180px', marginBottom: 0 }}>
          <label htmlFor="city">City</label>
          <select id="city" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
            <option value="All">All Cities</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <div style={{ color: '#94a3b8' }}>Loading items…</div>}
      {!loading && filteredItems.length === 0 && (
        <div style={{ color: '#94a3b8' }}>No items found.</div>
      )}

      {/* Item Cards */}
      <div className="features-grid">
        {filteredItems.map(item => (
          <div className="feature-card" key={item._id} style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>
              {item.category === 'Vegetables' ? '🥬' : '🍎'}
            </div>
            <h3 style={{ marginBottom: 6 }}>{item.name}</h3>
            <p style={{ fontSize: 13, marginBottom: 4 }}>{item.category} • {item.unit}</p>
            <p style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{item.description || 'No description'}</p>
            {item.cities && item.cities.length > 0 ? (
              <p style={{ fontSize: 11, color: '#8b5cf6', marginBottom: 16 }}>
                📍 {item.cities.join(', ')}
              </p>
            ) : (
              <p style={{ fontSize: 11, color: '#64748b', marginBottom: 16 }}>
                📍 No prices
              </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                className="logout-btn"
                style={{ width: '100%', padding: '10px 14px', fontSize: 13 }}
                onClick={() => handleDeleteItem(item)}
                disabled={deleting === item._id}
              >
                {deleting === item._id ? 'Deleting…' : '🗑️ Delete Entire Item'}
              </button>
              {item.cities && item.cities.length > 0 && (
                <button
                  className="signup-btn"
                  style={{ 
                    width: '100%', 
                    padding: '10px 14px', 
                    fontSize: 13, 
                    marginBottom: 0,
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)'
                  }}
                  onClick={() => openDeletePriceModal(item)}
                >
                  🏙️ Delete City Prices
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Price Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Delete City Prices: {selectedItem?.name}</h2>
            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>
              Select a city to delete all price data for this product in that city
            </p>

            <div className="form-group">
              <label htmlFor="deleteCity">Select City</label>
              {selectedItem?.cities && selectedItem.cities.length > 0 ? (
                <select
                  id="deleteCity"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  required
                >
                  <option value="">-- Choose City --</option>
                  {selectedItem.cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              ) : (
                <div style={{ 
                  padding: '12px 16px',
                  background: 'rgba(148, 163, 184, 0.1)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: 12,
                  color: '#94a3b8',
                  fontSize: 13
                }}>
                  No cities available for this product
                </div>
              )}
            </div>

            {selectedCity && (
              <div style={{
                padding: '12px 16px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 12,
                color: '#fca5a5',
                fontSize: 13,
                marginTop: 16
              }}>
                ⚠️ Warning: This will delete all price entries for {selectedItem?.name} in {selectedCity}. This action cannot be undone.
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button
                className="logout-btn"
                onClick={handleDeletePrices}
                disabled={deletingPrice || !selectedCity}
                style={{ flex: 1 }}
              >
                {deletingPrice ? 'Deleting…' : 'Delete Prices'}
              </button>
              <button
                type="button"
                className="signup-btn"
                onClick={() => setShowDeleteModal(false)}
                style={{ flex: 1, marginBottom: 0 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteTab;
