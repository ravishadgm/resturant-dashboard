import { storage } from '../../services/storageService';
import { STORAGE_KEYS, ROLES } from '../../utils/constants';
const accounts = [
  { email:'superadmin@restrodesk.com', password:'Super@123', role:ROLES.SUPER_ADMIN, name:'Super Admin', phone:'+91 98765 43210', image:'' },
  { email:'restaurant@restrodesk.com', password:'Restaurant@123', role:ROLES.RESTAURANT, name:'Restaurant Admin', phone:'+91 98765 12345', image:'' }
];
export const authService = {
  login(email, password) { const profiles = storage.get(STORAGE_KEYS.profiles, {}); const account = accounts.map(a => ({ ...a, ...(profiles[a.role] || {}) })).find(a => a.email.toLowerCase() === email.toLowerCase() && a.password === password); if (!account) throw new Error('The email or password you entered is incorrect.'); storage.set(STORAGE_KEYS.session, account); return account; },
  current() { return storage.get(STORAGE_KEYS.session); },
  logout() { storage.remove(STORAGE_KEYS.session); },
  saveProfile(role, profile) { const profiles = storage.get(STORAGE_KEYS.profiles, {}); profiles[role] = profile; storage.set(STORAGE_KEYS.profiles, profiles); storage.set(STORAGE_KEYS.session, profile); return profile; }
};
