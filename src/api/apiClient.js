import { storage } from '../services/storageService';
import { STORAGE_KEYS } from '../utils/constants';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://godine.cloud').replace(/\/$/, '');

const getErrorMessage = (payload, status) => {
  if (typeof payload === 'string' && payload.trim()) return payload;
  return payload?.message || payload?.error?.message || payload?.error || `Request failed with status ${status}`;
};

async function request(path, options = {}) {
  const { body, headers, ...requestOptions } = options;
  const token = storage.get(STORAGE_KEYS.authToken);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestOptions,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers,
      },
      ...(body !== undefined && { body: typeof body === 'string' ? body : JSON.stringify(body) }),
    });

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await response.json() : await response.text();

    if (!response.ok) throw new Error(getErrorMessage(payload, response.status));
    return payload;
  } catch (error) {
    if (error instanceof TypeError) throw new Error('Unable to connect to the server. Please try again.');
    throw error;
  }
}

export const apiClient = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};
