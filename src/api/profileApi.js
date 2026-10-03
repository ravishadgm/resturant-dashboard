import { apiClient, API_BASE_URL } from './apiClient';
import { storage } from '../services/storageService';
import { STORAGE_KEYS } from '../utils/constants';

const profileRequests = new Map();

export const PROFILE_FIELDS = ['name', 'email', 'phone', 'address', 'description', 'latitude', 'longitude'];
export const profileImageUrl = logo => logo ? new URL(logo, `${API_BASE_URL}/`).href : '';
export const profileApi = {
  get: () => {
    const sessionToken = storage.get(STORAGE_KEYS.authToken);
    if (!profileRequests.has(sessionToken)) {
      const request = apiClient.get('/api/v1/restaurant/profile')
        .finally(() => profileRequests.delete(sessionToken));
      profileRequests.set(sessionToken, request);
    }
    return profileRequests.get(sessionToken);
  },
  update: (details, logo) => {
    const body = new FormData();
    PROFILE_FIELDS.forEach(field => body.append(field, details[field] ?? ''));
    if (logo instanceof File) body.append('logo', logo);
    return apiClient.put('/api/v1/restaurant/profile', body);
  },
};
