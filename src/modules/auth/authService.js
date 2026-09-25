import { storage } from "../../services/storageService";
import { STORAGE_KEYS, ROLES } from "../../utils/constants";
const accounts = [
  {
    email: "superadmin@restrodesk.com",
    password: "Super@123",
    role: ROLES.SUPER_ADMIN,
    user_id: "USR-001",
    status: "ACTIVE",
    name: "Super Admin",
    phone: "+91 98765 43210",
    image: "",
  },
  {
    email: "restaurant@restrodesk.com",
    password: "Restaurant@123",
    role: ROLES.RESTAURANT,
    user_id: "USR-101",
    restaurant_id: "REST-001",
    status: "ACTIVE",
    name: "Restaurant Admin",
    phone: "+91 98765 12345",
    image: "",
  },
  {
    email: "manager@restrodesk.com",
    password: "Manager@123",
    role: ROLES.MANAGER,
    name: "Branch Manager",
    phone: "+91 98765 22222",
    branch_id: "BR-001",
    manager_id: "MGR-001",
    status: "ACTIVE",
    image: "",
  },
  {
    email: "customer@restrodesk.com",
    password: "Customer@123",
    role: ROLES.CUSTOMER,
    name: "Demo Customer",
    phone: "+91 98765 33333",
    customer_id: "CUS-001",
    status: "ACTIVE",
    image: "",
  },
];
export const authService = {
  login(email, password) {
    const profiles = storage.get(STORAGE_KEYS.profiles, {});
    const account = [...accounts,...storage.get(STORAGE_KEYS.accounts,[])]
      .map((a) => ({ ...a, ...(profiles[a.role] || {}) }))
      .find(
        (a) =>
          a.email.toLowerCase() === email.toLowerCase() &&
          a.password === password,
      );
    if (!account)
      throw new Error("The email or password you entered is incorrect.");
    storage.set(STORAGE_KEYS.session, account);
    return account;
  },
  current() {
    return storage.get(STORAGE_KEYS.session);
  },
  logout() {
    storage.remove(STORAGE_KEYS.session);
  },
  registerCustomer(data) {
    const custom=storage.get(STORAGE_KEYS.accounts,[]);
    if([...accounts,...custom].some(account=>account.email.toLowerCase()===data.email.toLowerCase())) throw new Error('An account with this email already exists.');
    const account={...data,user_id:`USR-${Date.now().toString().slice(-6)}`,customer_id:`CUS-${Date.now().toString().slice(-6)}`,role:ROLES.CUSTOMER,status:'ACTIVE',created_at:new Date().toISOString(),image:''};
    storage.set(STORAGE_KEYS.accounts,[...custom,account]); return account;
  },
  saveProfile(role, profile) {
    const profiles = storage.get(STORAGE_KEYS.profiles, {});
    profiles[role] = profile;
    storage.set(STORAGE_KEYS.profiles, profiles);
    storage.set(STORAGE_KEYS.session, profile);
    return profile;
  },
};
