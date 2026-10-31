import { storage } from "../../services/storageService";
import { STORAGE_KEYS, ROLES } from "../../utils/constants";
import { authApi } from "../../api/authApi";
import { getWebDeviceDetails, saveDeviceToken } from '../../services/deviceService';
import { registerBranchBrowser } from '../../services/firebaseMessaging';

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
      [ROLES.BRANCH]: authApi.branchLogin,
      [ROLES.SUPER_ADMIN]: authApi.adminLogin,
      [ROLES.RESTAURANT]: authApi.restaurantLogin,
      [ROLES.MANAGER]: authApi.managerLogin,
      [ROLES.CUSTOMER]: authApi.customerLogin,
    };
    const loginRequest = loginRequests[role] || authApi.adminLogin;
    if (!getWebDeviceDetails().device_token) {
      try {
        // Sign in is a user action, so the FCM token can be created and sent
        // with this very first login request.
        saveDeviceToken(await registerBranchBrowser());
      } catch {
        // Do not prevent login when notifications are denied or unavailable.
      }
    }
    const response = await loginRequest({ email, password, ...getWebDeviceDetails() });
    const data = response?.data ?? response;
    const token = data?.token;
    if (response?.success === false) throw new Error(response.message || 'Unable to sign in.');
    const apiUser = data?.user ?? data?.branch;

    if (!token || !apiUser) {
      throw new Error("The server returned an invalid login response.");
    }

    const account = {
      ...apiUser,
      role,
      ...(role === ROLES.BRANCH && {branch_id: apiUser.branch_id ?? data?.branch_id ?? data?.branch?.branch_id}),
      name: apiUser.name || apiUser.full_name || apiUser.email || "User",
      image: apiUser.image || apiUser.profile_image || "",
    };

    clearLegacyData();
    storage.set(STORAGE_KEYS.authToken, token);
    storage.set(STORAGE_KEYS.session, account);
    return account;
  },
  current() {
    clearLegacyData();
    const session = storage.get(STORAGE_KEYS.session);
    if (session && session.role !== PORTAL_ROLE) {
      storage.remove(STORAGE_KEYS.session);
      storage.remove(STORAGE_KEYS.authToken);
      return null;
    }
    return session;
  },
  async logout() {
    const user = storage.get(STORAGE_KEYS.session);
    const logoutRequests = {
      [ROLES.BRANCH]: authApi.branchLogout,
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
    }
  },
  async registerCustomer(data) {
    return authApi.customerRegister(data);
  },
};
