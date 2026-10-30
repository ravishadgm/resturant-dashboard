import { PORTAL } from './portal';
export const ROLES = { SUPER_ADMIN: 'super-admin', RESTAURANT: 'restaurant', MANAGER:'manager', CUSTOMER:'customer' };
export const ROLE_LABELS = { 'super-admin': 'Admin', restaurant: 'Restaurant', manager:'Restaurant Manager', customer:'Customer' };
export const STORAGE_KEYS = {
  session: `restrodesk_${PORTAL}_session`,
  authToken: `restrodesk_${PORTAL}_auth_token`,
  deviceId: `restrodesk_${PORTAL}_device_id`,
  deviceToken: `restrodesk_${PORTAL}_device_token`,
};
