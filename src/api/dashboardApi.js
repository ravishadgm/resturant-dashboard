import { apiClient } from './apiClient';
import { storage } from '../services/storageService';
import { STORAGE_KEYS } from '../utils/constants';

let adminDashboardRequest = null;
let adminDashboardToken = null;
let restaurantDashboardRequest = null;
let restaurantDashboardToken = null;

const getAdminDashboard = () => {
  const token = storage.get(STORAGE_KEYS.authToken);

  if (!adminDashboardRequest || token !== adminDashboardToken) {
    adminDashboardToken = token;
    adminDashboardRequest = apiClient
      .get('/api/v1/admin/dashboard')
      .catch((error) => {
        adminDashboardRequest = null;
        throw error;
      });
  }

  return adminDashboardRequest;
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

const getBranchDashboard = (filters = {}, options = {}) => {
  const params = new URLSearchParams();
  for (const key of ['from', 'to']) {
    if (filters[key]) params.set(key, filters[key]);
  }
  const query = params.toString();
  return apiClient.get(`/api/v1/branch/dashboard${query ? '?' + query : ''}`, options);
};

export const dashboardApi = {
  getBranchDashboard,
  getAdminDashboard,
  getRestaurantDashboard,
};
