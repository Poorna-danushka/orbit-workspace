import axios from 'axios';

interface ApiErrorResponse {
  message?: string;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.startsWith('API configuration is missing.')) {
    return error.message;
  }
  if (!axios.isAxiosError<ApiErrorResponse>(error)) return fallback;

  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return 'The server took too long to respond. Please try again.';
    }
    return 'Cannot reach the server. Check that the backend is running and that the frontend API URL and backend CORS origins are configured correctly.';
  }

  return error.response.data?.message || fallback;
}
