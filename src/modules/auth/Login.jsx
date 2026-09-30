import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRound, UserRoundCog } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [accountType, setAccountType] = useState(ROLES.SUPER_ADMIN);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Enter your email and password.');
      return;
    }
    setBusy(true);
    try {
      await login(form.email.trim(), form.password, accountType);
      navigate('/dashboard');
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setBusy(false);
    }
  };

  const useDemo = (email, password, role) => {
    setForm({ email, password });
    setAccountType(role);
    setError('');
  };

  return (
    <main className="simple-login-page">
      <section className="simple-login-card">
        <div className="simple-login-brand"><ShieldCheck /><span>Restaurant Dashboard</span></div>
        <div className="simple-login-heading">
          <h1>Welcome back</h1>
          <p>Sign in to continue.</p>
        </div>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={submit}>
          <label className="login-field">
            <span>Email</span>
            <div><Mail /><input autoFocus autoComplete="username" type="email" placeholder="you@example.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></div>
          </label>
          <label className="login-field">
            <span>Password</span>
            <div><LockKeyhole /><input autoComplete="current-password" type={show ? 'text' : 'password'} placeholder="Enter password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /><button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff /> : <Eye />}</button></div>
          </label>
          <button className="login-submit" disabled={busy}>{busy ? 'Signing in...' : <>Sign in <ArrowRight size={18} /></>}</button>
        </form>
        <Link className="customer-register-link" to="/register">New customer? Create an account</Link>
        <div className="simple-demo">
          <span>Demo login</span>
          <div className="demo-account-grid">
            <button type="button" onClick={() => useDemo('admin@godine.local', 'Admin@123', ROLES.SUPER_ADMIN)}><ShieldCheck /> Admin</button>
            <button type="button" onClick={() => useDemo('rest1@test.com', 'Rest@123', ROLES.RESTAURANT)}><Building2 /> Restaurant</button>
            <button type="button" onClick={() => useDemo('manager1@test.com', 'Mgr@123', ROLES.MANAGER)}><UserRoundCog /> Manager</button>
            <button type="button" onClick={() => useDemo('ravisha@gmail.com', 'Ravisha@123', ROLES.CUSTOMER)}><UserRound /> Customer</button>
          </div>
        </div>
      </section>
    </main>
  );
}
