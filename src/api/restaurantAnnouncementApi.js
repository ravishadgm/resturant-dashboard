import { apiClient } from './apiClient';

const queryString = ({ page = 1, limit = 10 } = {}) => new URLSearchParams({
  page: String(page),
  limit: String(limit),
}).toString();

export const restaurantAnnouncementApi = {
  create: (announcement) => apiClient.post('/api/v1/restaurant/announcements', announcement),
  list: (params) => apiClient.get(`/api/v1/restaurant/announcements?${queryString(params)}`),
  mine: () => apiClient.get('/api/v1/restaurant/announcements/mine'),
};
