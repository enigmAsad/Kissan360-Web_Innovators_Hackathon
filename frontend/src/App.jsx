import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage/LandingPage';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import DashboardLayout from './components/Layout/DashboardLayout';
import FarmerHome from './pages/FarmerDashboard/FarmerHome';
import MarketPrices from './pages/MarketPrices/MarketPrices';
import PriceTrends from './pages/PriceTrends/PriceTrends';
import Weather from './pages/Weather/Weather';
import SmartAdvice from './pages/SmartAdvice/SmartAdvice';
import ForumList from './pages/Forum/ForumList';
import PostDetail from './pages/Forum/PostDetail';
import MyPosts from './pages/MyPosts/MyPosts';
import ProfileSettings from './pages/Profile/ProfileSettings';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './app.css';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    const dashboardPath = user.role === 'admin' ? '/admin-dashboard' : '/farmer-dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app">
        <p>Loading...</p>
      </div>
    );
  }

  if (user) {
    const dashboardPath = user.role === 'admin' ? '/admin-dashboard' : '/farmer-dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

const LandingRoute = ({ children }) => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <Routes>
        <Route
          path="/"
          element={
            <LandingRoute>
              <LandingPage />
            </LandingRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />
        <Route
          path="/farmer-dashboard"
          element={
            <ProtectedRoute allowedRole="farmer">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<FarmerHome />} />
          <Route path="market-prices" element={<MarketPrices />} />
          <Route path="price-trends" element={<PriceTrends />} />
          <Route path="weather" element={<Weather />} />
          <Route path="smart-advice" element={<SmartAdvice />} />
          <Route path="forum" element={<ForumList />} />
          <Route path="forum/:id" element={<PostDetail />} />
          <Route path="my-posts" element={<MyPosts />} />
          <Route path="profile" element={<ProfileSettings />} />
        </Route>
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
