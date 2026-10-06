import { apiClient } from './apiClient';

export const branchCustomerApi = {
  list: async ({ page = 1, limit = 10, search = '' } = {}) => {
    const query = new URLSearchParams({ page: String(page), limit: String(limit), search });
    const response = await apiClient.get('/api/v1/branch/customers?' + query);
    if (response?.success === false) throw new Error(response.message || 'Unable to load customers.');
    return response;
  },
};
