import RestaurantDashboard from '../modules/dashboard/RestaurantDashboard';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PORTAL_ROLE } from '../utils/portal';
import DashboardLayout from '../components/layout/DashboardLayout';
import Login from '../modules/auth/Login';


import RegistryPage from '../modules/operations/RegistryPage';
import MyProfile from '../modules/profile/MyProfile';
import ProtectedRoute from './ProtectedRoute';
import Notifications from '../modules/notifications/RestaurantNotifications';

export default function AppRoutes() {
  const { user } = useAuth();
  const signedIn = user?.role === PORTAL_ROLE;
  return <Routes>
    <Route path="/login" element={signedIn ? <Navigate to="/dashboard" replace/> : <Login/>}/>
    <Route element={<ProtectedRoute/>}><Route element={<DashboardLayout/>}>
      <Route path="/dashboard" element={<RestaurantDashboard/>}/>
      <Route path="/branches" element={<RegistryPage kind="branches"/>}/>
      <Route path="/managers" element={<RegistryPage kind="managers"/>}/>
      <Route path="/tables" element={<RegistryPage kind="tables"/>}/>
      <Route path="/notifications" element={<Notifications/>}/>
      <Route path="/my-profile" element={<MyProfile/>}/>
    </Route></Route>
    <Route path="*" element={<Navigate to={signedIn ? '/dashboard' : '/login'} replace/>}/>
  </Routes>;
}
