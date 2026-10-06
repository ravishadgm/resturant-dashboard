import { apiClient } from './apiClient';

const path = '/api/v1/branch/tables';
export const TABLE_STATUSES = ['AVAILABLE', 'OCCUPIED', 'DISABLED'];
const checked = response => {
  if (response?.success === false) throw new Error(response.message || 'Unable to update tables.');
  return response;
};
export const branchTableApi = {
  list: ({ page = 1, limit = 10, search = '' } = {}) => {
    const query = new URLSearchParams({ page: String(page), limit: String(limit), ...(search && { search }) });
    return apiClient.get(path + '?' + query).then(checked);
  },
  create: details => apiClient.post(path, {
    table_number: details.table_number.trim(),
    capacity: Number(details.capacity),
    status: details.status,
  }).then(checked),
  updateStatus: (tableId, status) => apiClient.patch(path + '/' + encodeURIComponent(tableId) + '/status', { status }).then(checked),
};
