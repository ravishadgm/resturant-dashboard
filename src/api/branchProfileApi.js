import { apiClient } from './apiClient';
import { storage } from '../services/storageService';
import { STORAGE_KEYS } from '../utils/constants';
import { branchProfilePayload } from '../utils/branchProfile';
const requests = new Map();
export const branchProfileApi = {
  get: () => {
    const token = storage.get(STORAGE_KEYS.authToken);
    if (!requests.has(token)) requests.set(token,apiClient.get('/api/v1/branch/profile').finally(()=>requests.delete(token)));
    return requests.get(token);
  },
  update: form => apiClient.put('/api/v1/branch/profile',branchProfilePayload(form)),
};
