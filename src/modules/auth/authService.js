import { storage } from "../../services/storageService";
import { STORAGE_KEYS, ROLES } from "../../utils/constants";
import { authApi } from "../../api/authApi";

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
  async login(email, password, role = ROLES.SUPER_ADMIN) {
    const loginRequests = {
      [ROLES.SUPER_ADMIN]: authApi.adminLogin,
      [ROLES.RESTAURANT]: authApi.restaurantLogin,
      [ROLES.MANAGER]: authApi.managerLogin,
      [ROLES.CUSTOMER]: authApi.customerLogin,
    };
    const loginRequest = loginRequests[role] || authApi.adminLogin;
    const response = await loginRequest({ email, password });
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
    return account;
  },
  current() {
    clearLegacyData();
    return storage.get(STORAGE_KEYS.session);
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
    }
  },
  async registerCustomer(data) {
    return authApi.customerRegister(data);
  },
};
