import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    timeout: 30000,
    withCredentials: true
});

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
        return Promise.reject(error);
    }
);

export default api;