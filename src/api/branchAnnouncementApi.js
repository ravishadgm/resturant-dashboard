import { apiClient } from './apiClient';

const queryString = ({ page = 1, limit = 10 } = {}) => new URLSearchParams({
  page: String(page),
  limit: String(limit),
}).toString();

export const branchAnnouncementApi = {
  create: announcement => apiClient.post('/api/v1/branch/announcements', announcement),
  list: params => apiClient.get(`/api/v1/branch/announcements?${queryString(params)}`),
  mine: () => apiClient.get('/api/v1/branch/announcements/mine'),
};
