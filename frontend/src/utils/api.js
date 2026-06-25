import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

axios.interceptors.request.use((config) => {
  const url = config.url || '';

  if (url.startsWith('https://transport.koderzgroup.com/api')) {
    config.url = `${API_BASE_URL}${url.replace('https://transport.koderzgroup.com/api', '')}`;
  } else if (url.startsWith('http://transport.koderzgroup.com/api')) {
    config.url = `${API_BASE_URL}${url.replace('http://transport.koderzgroup.com/api', '')}`;
  }

  return config;
});

export { API_BASE_URL };
export default axios;
