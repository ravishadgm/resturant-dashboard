import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PORTAL_ROLE } from '../utils/portal';
import DashboardLayout from '../components/layout/DashboardLayout';
import Login from '../modules/auth/Login';
import BranchDashboard from '../modules/dashboard/BranchDashboard';
import ProtectedRoute from './ProtectedRoute';
export default function AppRoutes() {
  const {user}=useAuth();
  const signedIn=user?.role===PORTAL_ROLE;
  return <Routes>
    <Route path="/login" element={signedIn?<Navigate to="/dashboard" replace/>:<Login/>}/>
    <Route element={<ProtectedRoute/>}><Route element={<DashboardLayout/>}>
      <Route path="/dashboard" element={<BranchDashboard/>}/>
    </Route></Route>
    <Route path="*" element={<Navigate to={signedIn?'/dashboard':'/login'} replace/>}/>
  </Routes>;
}
