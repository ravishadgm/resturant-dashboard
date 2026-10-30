import { storage } from './storageService';
import { STORAGE_KEYS } from '../utils/constants';

const createDeviceId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `web-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export function getWebDeviceDetails() {
  let deviceId = storage.get(STORAGE_KEYS.deviceId);
  if (typeof deviceId !== 'string' || !deviceId) {
    deviceId = createDeviceId();
    storage.set(STORAGE_KEYS.deviceId, deviceId);
  }
  const deviceToken = storage.get(STORAGE_KEYS.deviceToken);
  return { device_type: 'Web', device_id: deviceId, device_token: typeof deviceToken === 'string' ? deviceToken : '' };
}

export const saveDeviceToken = token => storage.set(STORAGE_KEYS.deviceToken, token);
export const clearDeviceToken = () => storage.remove(STORAGE_KEYS.deviceToken);
