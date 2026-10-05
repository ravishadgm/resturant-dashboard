import { apiClient } from './apiClient';
import { schedulePayload } from '../utils/branchSchedule';
const requests = new Map();
const pathFor = branchId => `/api/v1/restaurant/branches/${encodeURIComponent(branchId)}/schedules`;
export const branchScheduleApi = {
  get: branchId => {
    const path = pathFor(branchId);
    if (!requests.has(path)) requests.set(path, apiClient.get(path).finally(() => requests.delete(path)));
    return requests.get(path);
  },
  save: (branchId, days) => apiClient.post(pathFor(branchId), schedulePayload(days)),
};
