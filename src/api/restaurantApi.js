import { apiClient } from './apiClient';

const listRequests = new Map();

const createFormData = (details) => {
  const formData = new FormData();
  const fields = [
    'name',
    'email',
    'phone',
    'password',
    'restaurant_name',
    'restaurant_description',
    'restaurant_phone',
    'restaurant_address',
  ];

  fields.forEach((field) => {
    const value = details[field];
    if (value !== undefined && value !== null && value !== '') formData.append(field, value);
  });

  if (details.logo instanceof File) formData.append('logo', details.logo);
  return formData;
};

const createUpdateFormData = (details) => {
  const formData = new FormData();
  const fields = [
    'name',
    'email',
    'phone',
    'password',
    'restaurant_name',
    'restaurant_description',
    'restaurant_phone',
    'restaurant_address',
    'status',
  ];

  fields.forEach((field) => {
    const value = details[field];
    if (value !== undefined && value !== null && value !== '') formData.append(field, value);
  });

  const description = details.restaurant_description ?? details.description;
  if (description !== undefined && description !== null) formData.append('description', description);
  if (details.logo instanceof File) formData.append('logo', details.logo);
  return formData;
};

export const restaurantApi = {
  list: ({ page = 1, limit = 10, search = '' } = {}) => {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      search,
    }).toString();

    if (!listRequests.has(query)) {
      const request = apiClient
        .get(`/api/v1/admin/restaurants?${query}`)
        .finally(() => listRequests.delete(query));
      listRequests.set(query, request);
    }

    return listRequests.get(query);
  },
  create: (details) => apiClient
    .post('/api/v1/admin/restaurants', createFormData(details))
    .then((response) => {
      listRequests.clear();
      return response;
    }),
  update: (restaurantId, details) => apiClient
    .put(`/api/v1/admin/restaurants/${encodeURIComponent(restaurantId)}`, createUpdateFormData(details))
    .then((response) => {
      listRequests.clear();
      return response;
    }),
};
