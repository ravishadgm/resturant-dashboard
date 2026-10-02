import { createContext, useContext, useState } from 'react';
import { authService } from '../modules/auth/authService';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(authService.current());
  const login = async (email, password, role) => { const next = await authService.login(email, password, role); setUser(next); return next; };
  const logout = async () => { try { return await authService.logout(); } finally { setUser(null); } };
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);

