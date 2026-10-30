import { useEffect, useMemo, useState } from 'react';
import { Bell, Check, Copy, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getMessagingConfigError, listenForRestaurantMessages, registerRestaurantBrowser } from '../../services/firebaseMessaging';
import { saveDeviceToken } from '../../services/deviceService';

const tokenKeyFor = user => `restrodesk_fcm_restaurant_${user?.restaurant_id ?? user?.restaurant?.restaurant_id ?? user?.id ?? 'default'}`;

export default function NotificationReceiver() {
  const { user } = useAuth();
  const toast = useToast();
  const tokenKey = useMemo(() => tokenKeyFor(user), [user]);
  const [token, setToken] = useState(() => localStorage.getItem(tokenKey) || '');
  const [error, setError] = useState(() => getMessagingConfigError());
  const [working, setWorking] = useState(false);
  const [received, setReceived] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem(tokenKey) || '';
    setToken(savedToken);
    if (savedToken) saveDeviceToken(savedToken);
  }, [tokenKey]);

  useEffect(() => {
    let active = true;
    let unsubscribe;
    listenForRestaurantMessages(payload => {
      if (!active) return;
      const title = payload.notification?.title || payload.data?.title || 'Restaurant notification';
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
      const result = await registerRestaurantBrowser();
      localStorage.setItem(tokenKey, result.token);
      saveDeviceToken(result.token);
      setToken(result.token);
      toast('This restaurant browser is connected to Firebase.');
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

  return <section className="restaurant-fcm-card" aria-labelledby="restaurant-fcm-title">
    <div className="restaurant-fcm-heading">
      <span className="restaurant-fcm-icon"><Bell size={19}/></span>
      <div><h2 id="restaurant-fcm-title">Restaurant browser notifications</h2><p>Connect this restaurant browser so it can receive admin notifications.</p></div>
      {token ? <span className="restaurant-fcm-status"><i/> Connected</span> : <span className="restaurant-fcm-status disconnected">Not connected</span>}
    </div>
    {error && <p className="nt-error" role="alert">{error}</p>}
    {received && <div className="restaurant-fcm-received" role="status"><strong>{received.title}</strong><span>{received.body}</span><small>Received at {received.receivedAt}</small></div>}
    <div className="restaurant-fcm-actions">
      <button type="button" className="btn primary" onClick={connect} disabled={working || !!getMessagingConfigError()}><RefreshCw size={15}/>{working ? 'Connecting…' : token ? 'Refresh connection' : 'Enable notifications'}</button>
      {token && <button type="button" className="btn secondary" onClick={copyToken}><Copy size={15}/>Copy token</button>}
    </div>
    {token && <label className="restaurant-fcm-token"><span>Restaurant device token — use this for Firebase Console → Messaging → test message</span><textarea rows={2} readOnly value={token}/></label>}
    {token && <p className="restaurant-fcm-hint"><Check size={14}/> This token belongs to this browser. Other restaurant browsers must enable notifications separately.</p>}
  </section>;
}
