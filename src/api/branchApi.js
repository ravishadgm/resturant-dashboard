import { apiClient } from './apiClient';

const listRequests = new Map();

const clearListCache = (response) => {
  listRequests.clear();
  return response;
};

const createPayload = (details) => ({
  restaurant_id: Number(details.restaurant_id),
  name: details.name,
  city: details.city,
  email: details.email,
  phone: details.phone,
  latitude: Number(details.latitude),
  longitude: Number(details.longitude),
});

const updatePayload = (details) => ({
  name: details.name,
  city: details.city,
  email: details.email,
  phone: details.phone,
  latitude: Number(details.latitude),
  longitude: Number(details.longitude),
});

export const branchApi = {
  list: ({ page = 1, limit = 10, search = '' } = {}) => {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      search,
    }).toString();

    if (!listRequests.has(query)) {
      const request = apiClient
        .get(`/api/v1/admin/branches?${query}`)
        .finally(() => listRequests.delete(query));
      listRequests.set(query, request);
    }

    return listRequests.get(query);
  },
  create: (details) => apiClient.post('/api/v1/admin/branches', createPayload(details)).then(clearListCache),
  update: (branchId, details) => apiClient
    .put(`/api/v1/admin/branches/${encodeURIComponent(branchId)}`, updatePayload(details))
    .then(clearListCache),
};
