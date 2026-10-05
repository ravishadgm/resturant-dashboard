import { apiClient } from './apiClient';
import { storage } from '../services/storageService';
import { STORAGE_KEYS } from '../utils/constants';
import { schedulePayload } from '../utils/branchSchedule';
const requests = new Map();
export const branchOwnerScheduleApi = {
  save: days => apiClient.post('/api/v1/branch/schedules',schedulePayload(days)),
  get: ({fresh=false}={}) => {
    if (fresh) return apiClient.get('/api/v1/branch/schedules',{cache:'no-store'});
    const token = storage.get(STORAGE_KEYS.authToken);
    if (!requests.has(token)) requests.set(token,apiClient.get('/api/v1/branch/schedules').finally(()=>requests.delete(token)));
    return requests.get(token);
  },
};
