import { apiClient } from './apiClient';

const listRequests = new Map();

const clearListRequests = (response) => {
  listRequests.clear();
  return response;
};

const createPayload = (details) => ({
  branch_id: Number(details.branch_id),
  table_number: details.table_number,
  capacity: Number(details.capacity),
  status: details.status,
});

export const tableApi = {
  list: ({ page = 1, limit = 10, search = '', branchId, scope = 'admin' } = {}) => {
    const queryValues = {
      page: String(page),
      limit: String(limit),
      search,
    };
    if (scope === 'restaurant') queryValues.branch_id = String(branchId);
    const query = new URLSearchParams(queryValues).toString();
    const path = scope === 'restaurant' ? '/api/v1/restaurant/tables' : '/api/v1/admin/tables';
    const requestKey = `${path}?${query}`;

    if (!listRequests.has(requestKey)) {
      const request = apiClient
        .get(requestKey)
        .finally(() => listRequests.delete(requestKey));
      listRequests.set(requestKey, request);
    }

    return listRequests.get(requestKey);
  },
  create: (details, scope) => {
    if (scope !== 'restaurant') {
      return Promise.reject(new Error('Table creation is available only in the restaurant portal.'));
    }
    return apiClient.post('/api/v1/restaurant/tables', createPayload(details)).then(clearListRequests);
  },
};
