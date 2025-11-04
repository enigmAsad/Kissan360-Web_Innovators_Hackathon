import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sprout, BarChart3, TrendingUp, Wheat, DollarSign, 
  LineChart, Map, Smartphone, Bell, Globe, Target, 
  Eye, Gem, Mail, Phone, MapPin, Facebook, Instagram, 
  Twitter, Linkedin, Star
} from 'lucide-react';
import './LandingPage.scss';

const LandingPage = () => {
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <Sprout className="logo-icon" size={32} strokeWidth={2.5} />
            <span className="logo-text">Kissan360</span>
          </div>
          <div className="nav-links">
            <a onClick={() => scrollToSection('hero')}>Home</a>
            <a onClick={() => scrollToSection('features')}>Features</a>
            <a onClick={() => scrollToSection('about')}>About</a>
            <a onClick={() => scrollToSection('how-it-works')}>How It Works</a>
            <a onClick={() => scrollToSection('contact')}>Contact</a>
          </div>
          <div className="nav-buttons">
            <button className="btn-login" onClick={() => navigate('/login')}>Login</button>
            <button className="btn-signup" onClick={() => navigate('/signup')}>Sign Up</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Empowering Farmers with
              <span className="gradient-text"> Real-Time Market Insights</span>
            </h1>
            <p className="hero-subtitle">
              Access live market prices, track trends, and make informed decisions to maximize your profits. 
              Join thousands of farmers already using Kissan360.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={() => navigate('/signup')}>
                Get Started Free
              </button>
              <button className="btn-secondary" onClick={() => scrollToSection('how-it-works')}>
                Learn More
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Active Farmers</span>
              </div>
              <div className="stat">
                <span className="stat-number">50+</span>
                <span className="stat-label">Crop Types</span>
              </div>
              <div className="stat">
                <span className="stat-number">100+</span>
                <span className="stat-label">Cities Covered</span>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="floating-card card-1">
              <BarChart3 className="card-icon" size={40} strokeWidth={2} />
              <span className="card-text">Live Price Updates</span>
            </div>
            <div className="floating-card card-2">
              <TrendingUp className="card-icon" size={40} strokeWidth={2} />
              <span className="card-text">Market Trends</span>
            </div>
            <div className="floating-card card-3">
              <Wheat className="card-icon" size={40} strokeWidth={2} />
              <span className="card-text">Crop Analytics</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2>Powerful Features for Smart Farming</h2>
          <p>Everything you need to stay ahead in the agricultural market</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <DollarSign className="feature-icon" size={56} strokeWidth={2} />
            <h3>Real-Time Pricing</h3>
            <p>Get instant updates on market prices for vegetables and fruits across multiple cities</p>
          </div>
          <div className="feature-card">
            <LineChart className="feature-icon" size={56} strokeWidth={2} />
            <h3>Price Analytics</h3>
            <p>Track 7-day price trends with beautiful charts and make data-driven decisions</p>
          </div>
          <div className="feature-card">
            <Map className="feature-icon" size={56} strokeWidth={2} />
            <h3>Multi-City Coverage</h3>
            <p>Compare prices across different cities to find the best markets for your produce</p>
          </div>
          <div className="feature-card">
            <Smartphone className="feature-icon" size={56} strokeWidth={2} />
            <h3>Easy to Use</h3>
            <p>Simple, intuitive interface designed specifically for farmers</p>
          </div>
          <div className="feature-card">
            <Bell className="feature-icon" size={56} strokeWidth={2} />
            <h3>Price Alerts</h3>
            <p>Set custom alerts and never miss profitable market opportunities</p>
          </div>
          <div className="feature-card">
            <Globe className="feature-icon" size={56} strokeWidth={2} />
            <h3>Always Updated</h3>
            <p>Admin-verified data ensures accuracy and reliability you can trust</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="about-content">
          <div className="about-text">
            <h2>About Kissan360</h2>
            <p className="about-description">
              Kissan360 is a revolutionary platform designed to bridge the information gap in agricultural markets. 
              We believe that every farmer deserves access to accurate, real-time market data to make informed 
              decisions about their crops.
            </p>
            <p className="about-description">
              Our mission is to empower farmers with technology, helping them maximize profits, reduce losses, 
              and navigate the complex agricultural market with confidence.
            </p>
            <div className="about-values">
              <div className="value-item">
                <Target className="value-icon" size={40} strokeWidth={2} />
                <div>
                  <h4>Our Mission</h4>
                  <p>Democratize agricultural market data for all farmers</p>
                </div>
              </div>
              <div className="value-item">
                <Eye className="value-icon" size={40} strokeWidth={2} />
                <div>
                  <h4>Our Vision</h4>
                  <p>A future where every farmer has equal market opportunities</p>
                </div>
              </div>
              <div className="value-item">
                <Gem className="value-icon" size={40} strokeWidth={2} />
                <div>
                  <h4>Our Values</h4>
                  <p>Transparency, accuracy, and farmer-first approach</p>
                </div>
              </div>
            </div>
          </div>
          <div className="about-image">
            <div className="about-card">
              <Wheat className="about-emoji" size={80} strokeWidth={2} />
              <h3>Built for Farmers</h3>
              <p>By farmers, for farmers</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Get started in three simple steps</p>
        </div>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Create Account</h3>
              <p>Sign up for free in less than a minute. No credit card required.</p>
            </div>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Select Your Crops</h3>
              <p>Choose the vegetables and fruits you grow or want to track.</p>
            </div>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Access Market Data</h3>
              <p>View live prices, trends, and analytics for your selected crops.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2>What Farmers Say</h2>
          <p>Join thousands of satisfied farmers</p>
        </div>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} fill="#f59e0b" color="#f59e0b" />
              ))}
            </div>
            <p className="testimonial-text">
              "Kissan360 has completely changed how I sell my produce. I can now track prices 
              across different cities and choose the best market!"
            </p>
            <div className="testimonial-author">
              <div className="author-avatar">AK</div>
              <div>
                <p className="author-name">Ahmed Khan</p>
                <p className="author-role">Vegetable Farmer, Punjab</p>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} fill="#f59e0b" color="#f59e0b" />
              ))}
            </div>
            <p className="testimonial-text">
              "The price alerts feature is amazing! I never miss out on good market prices anymore. 
              Highly recommend to all farmers."
            </p>
            <div className="testimonial-author">
              <div className="author-avatar">RA</div>
              <div>
                <p className="author-name">Rashid Ali</p>
                <p className="author-role">Fruit Farmer, Sindh</p>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} fill="#f59e0b" color="#f59e0b" />
              ))}
            </div>
            <p className="testimonial-text">
              "Simple to use and very accurate. The trend charts help me plan when to harvest 
              and sell my crops for maximum profit."
            </p>
            <div className="testimonial-author">
              <div className="author-avatar">IS</div>
              <div>
                <p className="author-name">Imran Shah</p>
                <p className="author-role">Mixed Farmer, KPK</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Transform Your Farming Business?</h2>
          <p>Join Kissan360 today and get instant access to real-time market data</p>
          <div className="cta-buttons">
            <button className="btn-cta-primary" onClick={() => navigate('/signup')}>
              Start Free Today
            </button>
            <button className="btn-cta-secondary" onClick={() => navigate('/login')}>
              Already have an account?
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="section-header">
          <h2>Get In Touch</h2>
          <p>Have questions? We'd love to hear from you</p>
        </div>
        <div className="contact-content">
          <div className="contact-info">
            <div className="contact-item">
              <Mail className="contact-icon" size={48} strokeWidth={2} />
              <div>
                <h4>Email</h4>
                <p>support@kissan360.com</p>
              </div>
            </div>
            <div className="contact-item">
              <Phone className="contact-icon" size={48} strokeWidth={2} />
              <div>
                <h4>Phone</h4>
                <p>+92 300 1234567</p>
              </div>
            </div>
            <div className="contact-item">
              <MapPin className="contact-icon" size={48} strokeWidth={2} />
              <div>
                <h4>Address</h4>
                <p>Islamabad, Pakistan</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <Sprout className="logo-icon" size={32} strokeWidth={2.5} />
              <span className="logo-text">Kissan360</span>
            </div>
            <p className="footer-description">
              Empowering farmers with real-time market insights and data-driven decisions.
            </p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a onClick={() => scrollToSection('features')}>Features</a></li>
              <li><a onClick={() => scrollToSection('about')}>About Us</a></li>
              <li><a onClick={() => scrollToSection('how-it-works')}>How It Works</a></li>
              <li><a onClick={() => scrollToSection('contact')}>Contact</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Cookie Policy</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Follow Us</h4>
            <div className="social-links">
              <a href="#" className="social-link">
                <Facebook size={24} strokeWidth={2} />
              </a>
              <a href="#" className="social-link">
                <Instagram size={24} strokeWidth={2} />
              </a>
              <a href="#" className="social-link">
                <Twitter size={24} strokeWidth={2} />
              </a>
              <a href="#" className="social-link">
                <Linkedin size={24} strokeWidth={2} />
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Kissan360. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

