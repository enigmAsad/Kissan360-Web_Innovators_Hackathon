import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sprout } from 'lucide-react';
import './Login.scss';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'farmer',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password, formData.role);
      toast.success('Login successful!');
      
      setTimeout(() => {
        if (formData.role === 'farmer') {
          navigate('/farmer/dashboard');
        } else {
          navigate('/admin/dashboard');
        }
      }, 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo" onClick={() => navigate('/')}>
            <Sprout className="logo-icon" size={32} strokeWidth={2.5} />
            <span className="logo-text">Kissan360</span>
          </div>
          <div className="nav-buttons">
            <button className="btn-login active" onClick={() => navigate('/login')}>Login</button>
            <button className="btn-signup" onClick={() => navigate('/signup')}>Sign Up</button>
          </div>
        </div>
      </nav>

      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <div className="login-container">
        <div className="login-header">
          <div className="form-logo">
            <Sprout className="form-logo-icon" size={48} strokeWidth={2.5} />
            <h1>Welcome Back</h1>
          </div>
          <p className="subtitle">Sign in to access your dashboard</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Login as</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="farmer">🌾 Farmer</option>
              <option value="admin">👨‍💼 Admin</option>
            </select>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>

          <p className="signup-link">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </form>

        <div className="login-footer">
          <p>Empowering farmers with real-time market insights</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

