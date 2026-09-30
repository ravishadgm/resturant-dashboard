import { apiClient } from './apiClient';

const listRequests = new Map();

export const queueApi = {
  list: ({ branchId, page = 1, limit = 10, search = '', history = false } = {}) => {
    const query = new URLSearchParams({
      branch_id: String(branchId),
      page: String(page),
      limit: String(limit),
      search,
    }).toString();
    const path = history ? '/api/v1/admin/history' : '/api/v1/admin/queue';
    const requestKey = `${path}?${query}`;

    if (!listRequests.has(requestKey)) {
      const request = apiClient
        .get(requestKey)
        .finally(() => listRequests.delete(requestKey));
      listRequests.set(requestKey, request);
    }

    return listRequests.get(requestKey);
  },
};
