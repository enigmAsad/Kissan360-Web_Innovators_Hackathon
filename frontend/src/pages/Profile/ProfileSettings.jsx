import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SaveIcon from '@mui/icons-material/Save';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import './ProfileSettings.scss';
import { toast } from 'react-toastify';

const ProfileSettings = () => {
  const { user } = useAuth();
  const [region, setRegion] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const pakistanCities = [
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
    'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
    'Hyderabad', 'Sukkur', 'Larkana', 'Mirpur Khas', 'Nawabshah',
  ];

  useEffect(() => {
    fetchRegion();
  }, []);

  const fetchRegion = async () => {
    setLoading(true);
    try {
      const res = await api.get('/profile/region');
      setRegion(res.data.region || '');
    } catch (err) {
      console.error('Failed to fetch region:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRegion = async (e) => {
    e.preventDefault();
    
    if (!region) {
      toast.warning('Please select a region');
      return;
    }

    setSaving(true);
    try {
      await api.put('/profile/region', { region });
      toast.success('Region preference saved successfully!');
    } catch (err) {
      console.error('Failed to save region:', err);
      toast.error('Failed to save region preference');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  return (
    <div className="profile-settings">
      <div className="page-header">
        <h1>Profile Settings</h1>
        <p>Manage your account information and preferences</p>
      </div>

      <div className="profile-content">
        <div className="user-info-card">
          <div className="card-header">
            <h2>User Information</h2>
          </div>

          <div className="info-grid">
            <div className="info-item">
              <div className="info-icon">
                <PersonIcon />
              </div>
              <div className="info-details">
                <span className="info-label">Name</span>
                <span className="info-value">{user?.name || 'Not available'}</span>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <EmailIcon />
              </div>
              <div className="info-details">
                <span className="info-label">Email</span>
                <span className="info-value">{user?.email || 'Not available'}</span>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <BadgeIcon />
              </div>
              <div className="info-details">
                <span className="info-label">Role</span>
                <span className="info-value role-badge">Farmer</span>
              </div>
            </div>
          </div>
        </div>

        <div className="region-preference-card">
          <div className="card-header">
            <h2>Region Preference</h2>
            <p>Set your preferred region for market prices and recommendations</p>
          </div>

          <form onSubmit={handleSaveRegion}>
            <div className="form-group">
              <label>
                <LocationOnIcon />
                Preferred City/Region
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="region-select"
                required
              >
                <option value="">Select your city...</option>
                {pakistanCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="save-btn" disabled={saving}>
              <SaveIcon />
              {saving ? 'Saving...' : 'Save Preference'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;

