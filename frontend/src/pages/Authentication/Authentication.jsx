import React, { useRef, useState, useEffect } from 'react';
import './Authentication.scss';
import { useNavigate } from 'react-router-dom'; // assuming you're using React Router
import newRequest from '../../utils/newRequest';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Authentication = ({ setUserRole }) => {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  
  // Signup state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState('farmer');
  
  // Signin state
  const [signinEmail, setSigninEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('');
  const [signinRole, setSigninRole] = useState('farmer');

  useEffect(() => {
    const checkToken = async () => {
      try {
        const response = await newRequest.get('/api/auth/validate-token', { 
          withCredentials: true 
        });
        if (response.data && response.data.role) {
          toast.success(response.data.message)
          setUserRole(response.data.role);
          navigate(response.data.role === 'farmer' ? '/farmer_home' : '/expert_home');
        }
      } catch (error) {
        console.log("No valid token found, proceed to login/signup");
      }
    };
    checkToken();
  }, [setUserRole, navigate]);

  const handleRegisterClick = () => {
    containerRef.current.classList.add('active');
  };

  const handleLoginClick = () => {
    containerRef.current.classList.remove('active');
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await newRequest.post('/api/auth/signup', {
        name: signupName,
        email: signupEmail,
        password: signupPassword,
        role: signupRole,
      }, { withCredentials: true });
      toast.success(response.data.message);
      setUserRole(signupRole);
      navigate(signupRole === 'farmer' ? '/farmer_home' : '/expert_home');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
    }
  };

  const handleSignin = async (e) => {
    e.preventDefault();
    try {
      const response = await newRequest.post('/api/auth/signin', {
        email: signinEmail,
        password: signinPassword,
        role: signinRole,
      }, { withCredentials: true });
      toast.success(response.data.message);
      setUserRole(signinRole);
      navigate(signinRole === 'farmer' ? '/farmer_home' : '/expert_home');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signin failed');
    }
  };

  return (
    <div ref={containerRef} className="container" id="container">
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <div className="form-container sign-up">
        <form onSubmit={handleSignup}>
          <h1>Create Account</h1>
          <input 
            type="text" 
            placeholder="Full Name"
            value={signupName}
            onChange={(e) => setSignupName(e.target.value)}
            required 
          />
          <input 
            type="email" 
            placeholder="Email Address"
            value={signupEmail}
            onChange={(e) => setSignupEmail(e.target.value)}
            required 
          />
          <input 
            type="password" 
            placeholder="Password"
            value={signupPassword}
            onChange={(e) => setSignupPassword(e.target.value)} 
            required 
          />
          <select value={signupRole} onChange={(e) => setSignupRole(e.target.value)}>
            <option value="farmer">🌾 Farmer</option>
            <option value="expert">👨‍🌾 Agriculture Expert</option>
          </select>
          <button type="submit">Create Account</button>
        </form>
      </div>
      <div className="form-container sign-in">
        <form onSubmit={handleSignin}>
          <h1>Welcome Back</h1>
          <input 
            type="email" 
            placeholder="Email Address"
            value={signinEmail}
            onChange={(e) => setSigninEmail(e.target.value)}
            required 
          />
          <input 
            type="password" 
            placeholder="Password"
            value={signinPassword}
            onChange={(e) => setSigninPassword(e.target.value)} 
            required 
          />
          <select value={signinRole} onChange={(e) => setSigninRole(e.target.value)}>
            <option value="farmer">🌾 Farmer</option>
            <option value="expert">👨‍🌾 Agriculture Expert</option>
          </select>
          <button type="submit">Sign In</button>
        </form>
      </div>
      <div className="toggle-container">
        <div className="toggle">
          <div className="toggle-panel toggle-left">
            <h1>Welcome Back!</h1>
            <p>Sign in to continue managing your agricultural journey and connect with experts</p>
            <button onClick={handleLoginClick} className="hidden" id="login">
              Sign In
            </button>
          </div>
          <div className="toggle-panel toggle-right">
            <h1>Start Your Journey</h1>
            <p>Join our community of farmers and agricultural experts to revolutionize farming</p>
            <button
              className="hidden"
              id="register"
              onClick={handleRegisterClick}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Authentication;
