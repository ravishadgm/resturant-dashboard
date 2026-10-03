import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PORTAL_ROLE, PORTAL_LABEL } from '../../utils/portal';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

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
      await login(form.email.trim(), form.password, PORTAL_ROLE);
      navigate('/dashboard');
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setBusy(false);
    }
  };

  const useDemo = (email, password) => {
    setForm({ email, password });
    setError('');
  };

  return (
    <main className="simple-login-page">
      <section className="simple-login-card">
        <div className="simple-login-brand"><ShieldCheck /><span>{PORTAL_LABEL}</span></div>
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
        <div className="simple-demo">
          <span>Demo login</span>
          <div className="demo-account-grid">
            {PORTAL_ROLE === 'super-admin' ? <button type="button" onClick={() => useDemo('admin@godine.local', 'Admin@123')}><ShieldCheck /> Admin</button> : <button type="button" onClick={() => useDemo('rest1@test.com', 'Rest@123')}><Building2 /> Restaurant</button>}
          </div>
        </div>
      </section>
    </main>
  );
}
