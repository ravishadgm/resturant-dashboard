import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PORTAL_ROLE } from '../utils/portal';
export default function ProtectedRoute({ roles }) {
  const { user } = useAuth();
  if (!user || user.role !== PORTAL_ROLE) return <Navigate to="/login" replace/>;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace/>;
  return <Outlet/>;
}
