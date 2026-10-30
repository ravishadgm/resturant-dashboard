import { apiClient } from './apiClient';

const queryString = ({ page = 1, limit = 10 } = {}) => new URLSearchParams({
  page: String(page),
  limit: String(limit),
}).toString();

export const announcementApi = {
  create: (announcement) => apiClient.post('/api/v1/admin/announcements', announcement),
  list: (params) => apiClient.get(`/api/v1/admin/announcements?${queryString(params)}`),
  mine: (params) => apiClient.get(`/api/v1/admin/announcements/mine?${queryString(params)}`),
};
