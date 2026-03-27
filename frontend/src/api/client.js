import axios from 'axios';

const client = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail = error.response?.data?.detail;
    const message = Array.isArray(detail)
      ? detail.map((e) => e.msg || String(e)).join(', ')
      : detail ?? 'An unexpected error occurred';
    return Promise.reject({ ...error, message });
  }
);

export default client;
