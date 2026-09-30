import { apiClient } from './apiClient';

const listRequests = new Map();

export const managerApi = {
  list: ({ page = 1, limit = 10, search = '' } = {}) => {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      search,
    }).toString();

    if (!listRequests.has(query)) {
      const request = apiClient
        .get(`/api/v1/admin/managers?${query}`)
        .finally(() => listRequests.delete(query));
      listRequests.set(query, request);
    }

    return listRequests.get(query);
  },
};
