import axios from 'axios';

const API_BASE_URL = import.meta.env?.VITE_API_URL || "https://agri-connect-ruwo.onrender.com";

const newRequest = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

newRequest.interceptors.request.use((config) => {
  if (!config.headers) {
    config.headers = {};
  }

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
  }

  return config;
});

export default newRequest;
