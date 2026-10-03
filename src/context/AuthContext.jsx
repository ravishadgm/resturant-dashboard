import { createContext, useContext, useState } from 'react';
import { authService } from '../modules/auth/authService';
import { storage } from '../services/storageService';
import { STORAGE_KEYS } from '../utils/constants';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(authService.current());
  const login = async (email, password, role) => { const next = await authService.login(email, password, role); setUser(next); return next; };
  const logout = async () => { try { return await authService.logout(); } finally { setUser(null); } };
  const updateUser = details => setUser(current => {
    if (!current) return current;
    const next = { ...current, ...details, role: current.role };
    storage.set(STORAGE_KEYS.session, next);
    return next;
  });
  return <AuthContext.Provider value={{ user, login, logout, updateUser }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);

