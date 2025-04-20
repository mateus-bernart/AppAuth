import Axios from 'axios';
import {storageGet} from './storage';
import {BASE_URL} from './config';

const axiosInstance = Axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log(BASE_URL);

axiosInstance.interceptors.request.use(
  async function (config) {
    const authToken = await storageGet('AcessToken');
    if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

export default axiosInstance;
