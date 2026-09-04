import { createContext, useContext, useState } from 'react';
import { authService } from '../modules/auth/authService';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(authService.current());
  const login = (email, password) => { const next = authService.login(email, password); setUser(next); return next; };
  const logout = () => { authService.logout(); setUser(null); };
  const updateUser = profile => { const next = authService.saveProfile(user.role, profile); setUser(next); };
  return <AuthContext.Provider value={{ user, login, logout, updateUser }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);

