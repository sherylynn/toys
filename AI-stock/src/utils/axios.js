import axios from 'axios';

const instance = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
instance.interceptors.request.use(
  config => {
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      console.error('请求超时，正在重试...');
      const config = error.config;
      config._retryCount = config._retryCount || 0;
      
      if (config._retryCount < 2) {
        config._retryCount++;
        return new Promise(resolve => {
          setTimeout(() => {
            console.log('重试请求：', config.url);
            resolve(instance(config));
          }, 1000);
        });
      }
    }
    return Promise.reject(error);
  }
);

export default instance;