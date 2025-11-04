import React, { useState } from 'react';
import api from '../../../utils/api';
import { toast } from 'react-toastify';

const AddTab = () => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Vegetables',
    unit: 'kg',
    description: '',
    city: '',
    date: '',
    price: '',
    currency: 'PKR',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category.trim()) {
      toast.error('Name and category are required');
      return;
    }

    if (!formData.city.trim() || !formData.date || !formData.price) {
      toast.error('City, date and price are required');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post('/api/market/items', {
        name: formData.name,
        category: formData.category,
        unit: formData.unit,
        description: formData.description,
      });

      const itemId = data?.item?._id;

      if (!itemId) {
        throw new Error('Item ID missing in response');
      }

      await api.post('/api/market/prices', {
        item: itemId,
        city: formData.city,
        date: formData.date,
        price: Number(formData.price),
        currency: formData.currency || 'PKR',
      });

      toast.success('Item and initial price created');
      setFormData({
        name: '',
        category: '',
        unit: 'kg',
        description: '',
        city: '',
        date: '',
        price: '',
        currency: 'PKR',
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create item');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="content-card">
      <h2>Add Product</h2>
      <p style={{ color: '#94a3b8', marginBottom: 20 }}>Create a new market item</p>

      <form onSubmit={handleSubmit} className="signup-form" style={{ maxWidth: 520 }}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Tomato"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select id="category" name="category" value={formData.category} onChange={handleChange}>
            <option value="Vegetables">Vegetables</option>
            <option value="Fruits">Fruits</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="unit">Unit</label>
          <select id="unit" name="unit" value={formData.unit} onChange={handleChange}>
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
            value={formData.description}
            onChange={handleChange}
            placeholder="Optional details"
          />
        </div>

        <div className="form-group">
          <label htmlFor="city">City</label>
          <input
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="e.g., Lahore"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
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
            value={formData.price}
            onChange={handleChange}
            placeholder="e.g., 120"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="currency">Currency</label>
          <select id="currency" name="currency" value={formData.currency} onChange={handleChange}>
            <option value="PKR">PKR</option>
            <option value="USD">USD</option>
          </select>
        </div>

        <button type="submit" className="signup-btn" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Item'}
        </button>
      </form>
    </div>
  );
};

export default AddTab;


