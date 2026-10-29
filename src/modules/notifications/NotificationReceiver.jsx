import { useEffect, useMemo, useState } from 'react';
import { Bell, Check, Copy, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getMessagingConfigError, listenForBranchMessages, registerBranchBrowser } from '../../services/firebaseMessaging';

const tokenKeyFor = user => `restrodesk_fcm_branch_${user?.branch_id ?? user?.branch?.branch_id ?? user?.id ?? user?.user_id ?? 'default'}`;

export default function NotificationReceiver() {
  const { user } = useAuth();
  const toast = useToast();
  const tokenKey = useMemo(() => tokenKeyFor(user), [user]);
  const [token, setToken] = useState(() => localStorage.getItem(tokenKey) || '');
  const [error, setError] = useState(() => getMessagingConfigError());
  const [working, setWorking] = useState(false);
  const [received, setReceived] = useState(null);

  useEffect(() => { setToken(localStorage.getItem(tokenKey) || ''); }, [tokenKey]);

  useEffect(() => {
    let active = true;
    let unsubscribe;
    listenForBranchMessages(payload => {
      if (!active) return;
      const title = payload.notification?.title || payload.data?.title || 'Branch notification';
      const body = payload.notification?.body || payload.data?.body || '';
      setReceived({ title, body, receivedAt: new Date().toLocaleTimeString() });
      toast(`New notification: ${title}`);
    }).then(stop => {
      if (active) unsubscribe = stop;
      else stop();
    }).catch(() => {});
    return () => { active = false; unsubscribe?.(); };
  }, [toast]);

  const connect = async () => {
    setWorking(true);
    setError('');
    try {
      const nextToken = await registerBranchBrowser();
      localStorage.setItem(tokenKey, nextToken);
      setToken(nextToken);
      toast('This branch browser is connected to Firebase.');
    } catch (err) {
      setError(err?.message || 'Unable to connect this browser to Firebase Messaging.');
    } finally {
      setWorking(false);
    }
  };

  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(token);
      toast('Registration token copied.');
    } catch {
      setError('Could not copy automatically. Select and copy the token text.');
    }
  };

  return <section className="branch-fcm-card" aria-labelledby="branch-fcm-title">
    <div className="branch-fcm-heading">
      <span className="branch-fcm-icon"><Bell size={19}/></span>
      <div><h2 id="branch-fcm-title">Branch browser notifications</h2><p>Connect this branch browser so it can receive admin notifications.</p></div>
      {token ? <span className="branch-fcm-status"><i/> Connected</span> : <span className="branch-fcm-status disconnected">Not connected</span>}
    </div>
    {error && <p className="nt-error" role="alert">{error}</p>}
    {received && <div className="branch-fcm-received" role="status"><strong>{received.title}</strong><span>{received.body}</span><small>Received at {received.receivedAt}</small></div>}
    <div className="branch-fcm-actions">
      <button type="button" className="btn primary" onClick={connect} disabled={working || !!getMessagingConfigError()}><RefreshCw size={15}/>{working ? 'Connecting…' : token ? 'Refresh connection' : 'Enable notifications'}</button>
      {token && <button type="button" className="btn secondary" onClick={copyToken}><Copy size={15}/>Copy token</button>}
    </div>
    {token && <label className="branch-fcm-token"><span>Branch device token — use this for Firebase Console → Messaging → test message</span><textarea rows={2} readOnly value={token}/></label>}
    {token && <p className="branch-fcm-hint"><Check size={14}/> This token belongs to this browser. Other branch browsers must enable notifications separately.</p>}
  </section>;
}
