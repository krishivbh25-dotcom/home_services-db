import axios from 'axios';

/**
 * Reusable Axios instance with base URL from environment variables
 * and centralized error handling interceptor.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Centralized Response and Error Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract exact backend/MySQL error message returned by Express errorHandler
    const backendMessage = error.response?.data?.error;
    const networkMessage = error.message;
    const finalMessage = backendMessage || networkMessage || 'Internal Server Error';

    // Log centrally in development
    console.error(
      `[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} (${error.response?.status || 'Network'}):`,
      finalMessage
    );

    // Normalize error object for all services
    const normalizedError = new Error(finalMessage);
    normalizedError.status = error.response?.status || 500;
    normalizedError.data = error.response?.data;

    return Promise.reject(normalizedError);
  }
);

export default api;
