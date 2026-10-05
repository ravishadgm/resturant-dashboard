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

const branchRequests = new Map();
const getBranchDashboard = () => {
  const token = storage.get(STORAGE_KEYS.authToken);
  if (!branchRequests.has(token)) {
    branchRequests.set(token, apiClient.get('/api/v1/branch/dashboard').finally(() => branchRequests.delete(token)));
  }
  return branchRequests.get(token);
};

export const dashboardApi = {
  getBranchDashboard,
  getAdminDashboard,
  getRestaurantDashboard,
};
