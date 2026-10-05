import { apiClient } from './apiClient';

export const authApi = {
  branchLogin: credentials => apiClient.post('/api/v1/auth/branch/login', credentials),
  branchLogout: () => apiClient.post('/api/v1/auth/branch/logout', {}),
  adminLogin: (credentials) => apiClient.post('/api/v1/auth/admin/login', credentials),
  adminLogout: () => apiClient.post('/api/v1/auth/admin/logout', {}),
  restaurantLogin: (credentials) => apiClient.post('/api/v1/auth/restaurant/login', credentials),
  restaurantLogout: () => apiClient.post('/api/v1/auth/restaurant/logout', {}),
  managerLogin: (credentials) => apiClient.post('/api/v1/auth/manager/login', credentials),
  managerLogout: () => apiClient.post('/api/v1/auth/manager/logout', {}),
  customerLogin: (credentials) => apiClient.post('/api/v1/auth/customer/login', credentials),
  customerRegister: (details) => apiClient.post('/api/v1/auth/customer/register', details),
  customerLogout: () => apiClient.post('/api/v1/auth/customer/logout', {}),
};
