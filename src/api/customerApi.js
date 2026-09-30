import { apiClient } from './apiClient';

const listRequests = new Map();

const clearListRequests = (response) => {
  listRequests.clear();
  return response;
};

export const customerApi = {
  list: ({ page = 1, limit = 10, search = '' } = {}) => {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      search,
    }).toString();

    if (!listRequests.has(query)) {
      const request = apiClient
        .get(`/api/v1/admin/customers?${query}`)
        .finally(() => listRequests.delete(query));
      listRequests.set(query, request);
    }

    return listRequests.get(query);
  },
  updateStatus: (customerId, status) => apiClient
    .patch(`/api/v1/admin/customers/${encodeURIComponent(customerId)}/status`, { status })
    .then(clearListRequests),
};
