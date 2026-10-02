import { apiClient } from './apiClient';

const listRequests = new Map();

const clearListCache = (response) => {
  listRequests.clear();
  return response;
};

const createPayload = (details, scope) => {
  const payload = {
    restaurant_id: Number(details.restaurant_id),
    name: details.name,
    city: details.city,
    phone: details.phone,
    latitude: Number(details.latitude),
    longitude: Number(details.longitude),
  };
  if (scope === 'restaurant') payload.address = details.address;
  else payload.email = details.email;
  return payload;
};

const updatePayload = (details, scope) => {
  const payload = {
    name: details.name,
    city: details.city,
    phone: details.phone,
    latitude: Number(details.latitude),
    longitude: Number(details.longitude),
  };
  if (scope === 'restaurant') {
    payload.restaurant_id = Number(details.restaurant_id);
    payload.address = details.address;
    if (details.queue_enabled !== undefined && details.queue_enabled !== '') {
      payload.queue_enabled = details.queue_enabled === true || details.queue_enabled === 'true';
    }
  } else {
    payload.email = details.email;
  }
  return payload;
};

export const branchApi = {
  options: ({ scope = 'admin' } = {}) => {
    const path = scope === 'restaurant' ? '/api/v1/restaurant/branches' : '/api/v1/admin/branches';
    return apiClient.get(path);
  },
  list: ({ page = 1, limit = 10, search = '', scope = 'admin' } = {}) => {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      search,
    }).toString();
    const path = scope === 'restaurant' ? '/api/v1/restaurant/branches' : '/api/v1/admin/branches';
    const requestKey = `${path}?${query}`;

    if (!listRequests.has(requestKey)) {
      const request = apiClient
        .get(requestKey)
        .finally(() => listRequests.delete(requestKey));
      listRequests.set(requestKey, request);
    }

    return listRequests.get(requestKey);
  },
  create: (details, scope = 'admin') => {
    const path = scope === 'restaurant' ? '/api/v1/restaurant/branches' : '/api/v1/admin/branches';
    return apiClient.post(path, createPayload(details, scope)).then(clearListCache);
  },
  update: (branchId, details, scope = 'admin') => {
    const path = scope === 'restaurant' ? '/api/v1/restaurant/branches' : '/api/v1/admin/branches';
    return apiClient
      .put(`${path}/${encodeURIComponent(branchId)}`, updatePayload(details, scope))
      .then(clearListCache);
  },
};
