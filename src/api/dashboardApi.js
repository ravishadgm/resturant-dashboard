import { apiClient } from './apiClient';
import { storage } from '../services/storageService';
import { STORAGE_KEYS } from '../utils/constants';

let adminDashboardRequest = null;
let adminDashboardToken = null;

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

export const dashboardApi = {
  getAdminDashboard,
};
