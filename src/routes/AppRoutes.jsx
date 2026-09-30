import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/constants';
import DashboardLayout from '../components/layout/DashboardLayout';
import Login from '../modules/auth/Login';
import CustomerRegister from '../modules/auth/CustomerRegister';
import Dashboard from '../modules/dashboard/Dashboard';
import Queue from '../modules/queue/Queue';
import RegistryPage from '../modules/operations/RegistryPage';
import CustomerQueue from '../modules/customer/CustomerQueue';
import ProtectedRoute from './ProtectedRoute';

const access = roles => <ProtectedRoute roles={roles}/>;
export default function AppRoutes(){
  const {user}=useAuth();
  return <Routes>
    <Route path="/login" element={user?<Navigate to="/dashboard" replace/>:<Login/>}/>
    <Route path="/register" element={user?<Navigate to="/dashboard" replace/>:<CustomerRegister/>}/>
    <Route element={<ProtectedRoute/>}><Route element={<DashboardLayout/>}>
      <Route path="/dashboard" element={<Dashboard/>}/>
      <Route element={access([ROLES.SUPER_ADMIN])}><Route path="/restaurants" element={<RegistryPage kind="restaurants"/>}/></Route>
      <Route element={access([ROLES.SUPER_ADMIN,ROLES.RESTAURANT])}><Route path="/branches" element={<RegistryPage kind="branches"/>}/><Route path="/managers" element={<RegistryPage kind="managers"/>}/></Route>
      <Route element={access([ROLES.SUPER_ADMIN,ROLES.MANAGER])}><Route path="/customers" element={<RegistryPage kind="customers"/>}/><Route path="/queue" element={<Queue/>}/><Route path="/history" element={<Queue/>}/></Route>
      <Route element={access([ROLES.SUPER_ADMIN,ROLES.RESTAURANT,ROLES.MANAGER])}><Route path="/tables" element={<RegistryPage kind="tables"/>}/></Route>
      <Route element={access([ROLES.CUSTOMER])}><Route path="/nearby" element={<RegistryPage kind="branches" readOnly title="Nearby restaurants" description="Nearby branches by latitude, longitude, distance and current availability."/>}/><Route path="/my-queue" element={<CustomerQueue/>}/></Route>
    </Route></Route>
    <Route path="*" element={<Navigate to={user?'/dashboard':'/login'} replace/>}/>
  </Routes>;
}
