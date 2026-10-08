import { apiClient } from './apiClient';
import { storage } from '../services/storageService';
import { STORAGE_KEYS } from '../utils/constants';

let restaurantDashboardRequest = null;
let restaurantDashboardToken = null;

const getAdminDashboard = (filters = {}, options = {}) => {
  const params = new URLSearchParams();
  for (const key of ['from', 'to']) {
    if (filters[key]) params.set(key, filters[key]);
  }
  const query = params.toString();
  return apiClient.get(`/api/v1/admin/dashboard${query ? '?' + query : ''}`, options);
};

const getRestaurantDashboard = () => {
  const token = storage.get(STORAGE_KEYS.authToken);

  if (!restaurantDashboardRequest || token !== restaurantDashboardToken) {
    restaurantDashboardToken = token;
    restaurantDashboardRequest = apiClient
      .get('/api/v1/restaurant/dashboard')
      .catch((error) => {
        restaurantDashboardRequest = null;
        throw error;
      });
  }

  return restaurantDashboardRequest;
};

export const dashboardApi = {
  getAdminDashboard,
  getRestaurantDashboard,
};
