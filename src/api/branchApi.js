import { apiClient } from './apiClient';
import { storage } from '../services/storageService';
import { ROLES, STORAGE_KEYS } from '../utils/constants';

const listRequests = new Map();

const clearListCache = (response) => {
  listRequests.clear();
  return response;
};

const createPayload = (details, scope) => {
  if (scope === 'admin') return adminPayload(details);
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
  if (scope === 'admin') return adminPayload(details);
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

const adminPayload = (details) => {
  const credentials = storage.get(STORAGE_KEYS.adminCredentials);
  const session = storage.get(STORAGE_KEYS.session);
  if (session?.role !== ROLES.SUPER_ADMIN || !credentials?.email || !credentials?.password) {
    throw new Error('Please log in again to use your admin credentials for this branch.');
  }
  return {
    restaurant_id: Number(details.restaurant_id),
    name: details.name,
    address: details.address,
    city: details.city,
    latitude: Number(details.latitude),
    longitude: Number(details.longitude),
    slot_interval_minutes: Number(details.slot_interval_minutes),
    slot_capacity: Number(details.slot_capacity),
    advance_booking_days: Number(details.advance_booking_days),
    notify_lead_minutes: Number(details.notify_lead_minutes),
    queue_enabled: details.queue_enabled === true || details.queue_enabled === 'true',
    owner_name: session.name || session.full_name,
    owner_email: credentials.email,
    owner_phone: session.phone || session.phone_number || '',
    owner_password: credentials.password,
    rating: Number(details.rating),
    map_url: details.map_url,
  };
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
