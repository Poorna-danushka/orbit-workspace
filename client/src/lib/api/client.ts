import axios from 'axios';
import { API_BASE_URL } from '@/lib/config';
import { registerRequestInterceptor } from './interceptors/request';
import { registerResponseInterceptor } from './interceptors/response';

if (!API_BASE_URL) {
  throw new Error(
    'API configuration is missing. Set NEXT_PUBLIC_SERVER_URL before starting the frontend.',
  );
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30_000,
});

registerRequestInterceptor(api);
registerResponseInterceptor(api);

export default api;
