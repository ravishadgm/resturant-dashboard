import { apiClient } from './apiClient';

const listRequests = new Map();

const clearListRequests = (response) => {
  listRequests.clear();
  return response;
};

const createPayload = (details) => ({
  name: details.name,
  email: details.email,
  phone: details.phone,
  password: details.password,
  branch_id: Number(details.branch_id),
});

export const managerApi = {
  list: ({ page = 1, limit = 10, search = '', branchId, scope = 'admin' } = {}) => {
    const queryValues = {
      page: String(page),
      limit: String(limit),
      search,
    };
    if (scope === 'restaurant') queryValues.branch_id = String(branchId);
    const query = new URLSearchParams(queryValues).toString();
    const path = scope === 'restaurant' ? '/api/v1/restaurant/managers' : '/api/v1/admin/managers';
    const requestKey = `${path}?${query}`;

    if (!listRequests.has(requestKey)) {
      const request = apiClient
        .get(requestKey)
        .finally(() => listRequests.delete(requestKey));
      listRequests.set(requestKey, request);
    }

    return listRequests.get(requestKey);
  },
  create: (details) => apiClient
    .post('/api/v1/restaurant/managers', createPayload(details))
    .then(clearListRequests),
};
