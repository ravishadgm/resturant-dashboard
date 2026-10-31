import { storage } from "../../services/storageService";
import { STORAGE_KEYS, ROLES } from "../../utils/constants";
import { authApi } from "../../api/authApi";
import { getWebDeviceDetails, saveDeviceToken } from '../../services/deviceService';
import { enablePushNotifications } from '../../services/firebaseMessaging';

import { PORTAL_ROLE } from '../../utils/portal';

const legacyDataKeys = [
  'restrodesk_accounts',
  'restrodesk_managers',
  'restrodesk_settings',
  'restrodesk_restaurants',
  'restrodesk_branches',
  'restrodesk_customers',
  'restrodesk_tables',
  'restrodesk_tokens',
  'restrodesk_queue',
  'restrodesk_profiles',
];

const clearLegacyData = () => legacyDataKeys.forEach(key => storage.remove(key));

export const authService = {
  async login(email, password, role = PORTAL_ROLE) {
    if (role !== PORTAL_ROLE) throw new Error('This account type is not supported by this portal.');
    const loginRequests = {
      [ROLES.SUPER_ADMIN]: authApi.adminLogin,
      [ROLES.RESTAURANT]: authApi.restaurantLogin,
      [ROLES.MANAGER]: authApi.managerLogin,
      [ROLES.CUSTOMER]: authApi.customerLogin,
    };
    const loginRequest = loginRequests[role] || authApi.adminLogin;
    if (!getWebDeviceDetails().device_token) {
      try {
        // Login is the user action that requests permission and obtains an FCM
        // token, so the token can be included in this very first login request.
        saveDeviceToken(await enablePushNotifications());
      } catch {
        // Do not block login if the browser denies notifications or does not
        // support Firebase Messaging.
      }
    }
    const response = await loginRequest({ email, password, ...getWebDeviceDetails() });
    const data = response?.data ?? response;
    const token = data?.token;
    const apiUser = data?.user;

    if (!token || !apiUser) {
      throw new Error("The server returned an invalid login response.");
    }

    const account = {
      ...apiUser,
      role,
      name: apiUser.name || apiUser.full_name || apiUser.email || "User",
      image: apiUser.image || apiUser.profile_image || "",
    };

    clearLegacyData();
    storage.set(STORAGE_KEYS.authToken, token);
    storage.set(STORAGE_KEYS.session, account);
    if (role === ROLES.SUPER_ADMIN) {
      storage.set(STORAGE_KEYS.adminCredentials, { email, password });
    } else {
      storage.remove(STORAGE_KEYS.adminCredentials);
    }
    return account;
  },
  current() {
    clearLegacyData();
    const session = storage.get(STORAGE_KEYS.session);
    if (session && session.role !== PORTAL_ROLE) {
      storage.remove(STORAGE_KEYS.session);
      storage.remove(STORAGE_KEYS.authToken);
      storage.remove(STORAGE_KEYS.adminCredentials);
      return null;
    }
    return session;
  },
  async logout() {
    const user = storage.get(STORAGE_KEYS.session);
    const logoutRequests = {
      [ROLES.SUPER_ADMIN]: authApi.adminLogout,
      [ROLES.RESTAURANT]: authApi.restaurantLogout,
      [ROLES.MANAGER]: authApi.managerLogout,
      [ROLES.CUSTOMER]: authApi.customerLogout,
    };
    const logoutRequest = logoutRequests[user?.role] || authApi.adminLogout;
    try {
      return await logoutRequest();
    } finally {
      storage.remove(STORAGE_KEYS.session);
      storage.remove(STORAGE_KEYS.authToken);
      storage.remove(STORAGE_KEYS.adminCredentials);
    }
  },
  async registerCustomer(data) {
    return authApi.customerRegister(data);
  },
};
