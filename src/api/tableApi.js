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
  list: ({ page = 1, limit = 10, search = '' } = {}) => {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      search,
    }).toString();

    if (!listRequests.has(query)) {
      const request = apiClient
        .get(`/api/v1/admin/tables?${query}`)
        .finally(() => listRequests.delete(query));
      listRequests.set(query, request);
    }

    return listRequests.get(query);
  },
  create: (details) => apiClient
    .post('/api/v1/admin/tables', createPayload(details))
    .then(clearListRequests),
};
