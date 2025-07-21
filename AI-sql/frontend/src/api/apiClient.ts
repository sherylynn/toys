
import axios from 'axios';
import { message } from 'antd';

const apiClient = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8080', // Adjust base URL for production
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      switch (status) {
        case 400:
          message.error(data.error || 'Bad Request');
          break;
        case 401:
          message.error(data.error || 'Unauthorized. Please log in again.');
          // Optionally, redirect to login page
          // window.location.href = '/login';
          break;
        case 403:
          message.error(data.error || 'Forbidden. You do not have permission.');
          break;
        case 404:
          message.error(data.error || 'Resource not found.');
          break;
        case 500:
          message.error(data.error || 'Internal Server Error.');
          break;
        default:
          message.error(data.error || `Error: ${status}`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      message.error('No response from server. Please check your network connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      message.error('Request error: ' + error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
