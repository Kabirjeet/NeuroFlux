import axios from 'axios';
import { BASE_URL } from './apiPath';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 80000, 
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// REQueST interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("token");
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error)
    }
);

// response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response; 
    },
    (error) => {
        if (error.response) {
            if (error.response.status === 500) {
                console.error('Server error');
            }   else if (error.code === "ECONNABORTED") {
                console.error('Request timeout');
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;