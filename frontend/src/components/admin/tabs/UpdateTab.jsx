import React, { useEffect, useState } from 'react';
import api from '../../../utils/api';
import { toast } from 'react-toastify';

const UpdateTab = () => {
  const [items, setItems] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  
  // Modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Form states
  const [detailsForm, setDetailsForm] = useState({ name: '', category: 'Vegetables', unit: 'kg', description: '' });
  const [priceForm, setPriceForm] = useState({ city: '', date: '', price: '', currency: 'PKR' });
  const [saving, setSaving] = useState(false);

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

  const openDetailsModal = (item) => {
    setSelectedItem(item);
    setDetailsForm({
      name: item.name || '',
      category: item.category || 'Vegetables',
      unit: item.unit || 'kg',
      description: item.description || '',
    });
    setShowDetailsModal(true);
  };

  const openPriceModal = (item) => {
    setSelectedItem(item);
    setPriceForm({ city: '', date: new Date().toISOString().split('T')[0], price: '', currency: 'PKR' });
    setShowPriceModal(true);
  };

  // Get available cities for the selected item
  const getAvailableCities = () => {
    if (!selectedItem || !selectedItem.cities) return [];
    return selectedItem.cities;
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/api/market/items/${selectedItem._id}`, detailsForm);
      toast.success('Item details updated');
      setShowDetailsModal(false);
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handlePriceSubmit = async (e) => {
    e.preventDefault();
    if (!priceForm.city || !priceForm.date || !priceForm.price) {
      toast.error('City, date and price are required');
      return;
    }
    setSaving(true);
    try {
      await api.post('/api/market/prices', {
        item: selectedItem._id,
        city: priceForm.city,
        date: priceForm.date,
        price: Number(priceForm.price),
        currency: priceForm.currency,
      });
      toast.success('Price updated');
      setShowPriceModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update price');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="content-card">
      <h2>Update Products</h2>
      <p style={{ color: '#94a3b8', marginBottom: 20 }}>Select a product card to update details or price</p>

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
            {item.cities && item.cities.length > 0 && (
              <p style={{ fontSize: 11, color: '#8b5cf6', marginBottom: 16 }}>
                📍 {item.cities.join(', ')}
              </p>
            )}
            <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
              <button
                className="signup-btn"
                style={{ padding: '8px 12px', fontSize: 13, marginBottom: 0 }}
                onClick={() => openDetailsModal(item)}
              >
                📝 Update Details
              </button>
              <button
                className="signup-btn"
                style={{ padding: '8px 12px', fontSize: 13, marginBottom: 0, background: 'linear-gradient(135deg, #10b981, #059669)' }}
                onClick={() => openPriceModal(item)}
              >
                💰 Update Price
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Update Details Modal */}
      {showDetailsModal && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Update Details: {selectedItem?.name}</h2>
            <form onSubmit={handleDetailsSubmit} className="signup-form">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  value={detailsForm.name}
                  onChange={(e) => setDetailsForm({ ...detailsForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={detailsForm.category}
                  onChange={(e) => setDetailsForm({ ...detailsForm, category: e.target.value })}
                >
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="unit">Unit</label>
                <select
                  id="unit"
                  name="unit"
                  value={detailsForm.unit}
                  onChange={(e) => setDetailsForm({ ...detailsForm, unit: e.target.value })}
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="dozen">dozen</option>
                  <option value="piece">piece</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <input
                  id="description"
                  name="description"
                  value={detailsForm.description}
                  onChange={(e) => setDetailsForm({ ...detailsForm, description: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" className="signup-btn" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className="logout-btn"
                  onClick={() => setShowDetailsModal(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Price Modal */}
      {showPriceModal && (
        <div className="modal-overlay" onClick={() => setShowPriceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Update Price: {selectedItem?.name}</h2>
            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>
              Only cities where this product has existing price data are shown
            </p>
            <form onSubmit={handlePriceSubmit} className="signup-form">
              <div className="form-group">
                <label htmlFor="priceCity">City</label>
                {getAvailableCities().length > 0 ? (
                  <select
                    id="priceCity"
                    name="city"
                    value={priceForm.city}
                    onChange={(e) => setPriceForm({ ...priceForm, city: e.target.value })}
                    required
                  >
                    <option value="">-- Select City --</option>
                    {getAvailableCities().map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                ) : (
                  <div style={{ 
                    padding: '12px 16px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 12,
                    color: '#fca5a5',
                    fontSize: 13
                  }}>
                    ⚠️ No price data exists for this product yet. Please add prices first using the "Manage Prices" tab.
                  </div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={priceForm.date}
                  onChange={(e) => setPriceForm({ ...priceForm, date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="price">Price</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  id="price"
                  name="price"
                  value={priceForm.price}
                  onChange={(e) => setPriceForm({ ...priceForm, price: e.target.value })}
                  placeholder="e.g., 120"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="currency">Currency</label>
                <select
                  id="currency"
                  name="currency"
                  value={priceForm.currency}
                  onChange={(e) => setPriceForm({ ...priceForm, currency: e.target.value })}
                >
                  <option value="PKR">PKR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button 
                  type="submit" 
                  className="signup-btn" 
                  disabled={saving || getAvailableCities().length === 0}
                >
                  {saving ? 'Saving…' : 'Update Price'}
                </button>
                <button
                  type="button"
                  className="logout-btn"
                  onClick={() => setShowPriceModal(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateTab;
