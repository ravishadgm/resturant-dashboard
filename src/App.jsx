import { BrowserRouter } from 'react-router-dom'; import { AuthProvider } from './context/AuthContext'; import { ToastProvider } from './context/ToastContext'; import AppRoutes from './routes/AppRoutes';
export default function App(){return <BrowserRouter basename={import.meta.env.BASE_URL}><AuthProvider><ToastProvider><AppRoutes/></ToastProvider></AuthProvider></BrowserRouter>}

