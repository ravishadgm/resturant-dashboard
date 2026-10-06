import { apiClient } from './apiClient';

const listRequests = new Map();

export const branchQueueApi = {
  list: ({ page = 1, limit = 10 } = {}) => {
    const query = new URLSearchParams({ page: String(page), limit: String(limit) });
    const requestKey = '/api/v1/branch/queue?' + query;
    if (!listRequests.has(requestKey)) {
      const request = apiClient.get(requestKey)
        .then(response => {
          if (response?.success === false) throw new Error(response.message || 'Unable to load the queue.');
          return response;
        })
        .finally(() => listRequests.delete(requestKey));
      listRequests.set(requestKey, request);
    }
    return listRequests.get(requestKey);
  },
};
