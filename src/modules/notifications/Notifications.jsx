import { useEffect, useMemo, useState } from 'react';
import { BellRing, Copy, Plus } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import CommonTable from '../../components/common/CommonTable';

import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { audienceLabel, emptyAnnouncement, notificationAnnouncement, notificationStore, validateAnnouncement } from '../../services/notificationService';
import { enablePushNotifications, showTestNotification } from '../../services/firebaseMessaging';
import './notifications.css';

const dateLabel = value => value ? new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';

export default function Notifications() {
  const { user } = useAuth();
  const toast = useToast();
  const store = useMemo(() => notificationStore('restrodesk_admin_notifications_' + (user.id ?? user.user_id ?? user.email ?? user.name)), [user]);
  const [records, setRecords] = useState([]);
  const [storageError, setStorageError] = useState('');
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [pushToken, setPushToken] = useState('');
  const [pushStatus, setPushStatus] = useState('Not connected');
  const [pushError, setPushError] = useState('');

  useEffect(() => { try { setRecords(store.list()); setStorageError(''); } catch { setStorageError('Saved notifications could not be loaded. Changes are disabled to protect existing records.'); } }, [store]);
  const persist = next => { try { store.save(next); setRecords(next); return true; } catch { setError('Unable to save. Browser storage may be full or unavailable.'); return false; } };
  const change = (key, value) => { setForm(current => ({ ...current, [key]: value })); setError(''); };
  const edit = record => { setForm(record ? notificationAnnouncement(record) : emptyAnnouncement()); setError(''); };
  const toggleGroup = group => { setForm(current => ({ ...current, groups: current.groups.includes(group) ? current.groups.filter(item => item !== group) : [...current.groups, group] })); setError(''); };
  const save = status => {
    const invalid = validateAnnouncement(form, status);
    if (invalid) { setError(invalid); return; }
    const now = new Date().toISOString();
    const saved = { ...form, audience: 'all', recipients: [], searchText: audienceLabel(form), title: form.title.trim(), message: form.message.trim(), id: form.id || crypto.randomUUID(), status, createdAt: form.createdAt || now, updatedAt: now, sentAt: status === 'sent' ? now : null };
    if (persist([saved, ...records.filter(record => record.id !== saved.id)])) { setForm(null); toast('Preview send recorded'); }
  };
  const enablePush = async () => {
    setPushError('');
    setPushStatus('Connecting...');
    try {
      const token = await enablePushNotifications(({ title, body }) => {
        toast(`Firebase message received: ${title}${body ? ` — ${body}` : ''}`);
      });
      setPushToken(token);
      setPushStatus('Connected');
      toast('Firebase notifications enabled.');
    } catch (err) {
      setPushStatus('Not connected');
      setPushError(err instanceof Error ? err.message : 'Could not enable notifications.');
    }
  };
  const testPush = () => {
    try { showTestNotification(); toast('Test notification displayed.'); }
    catch (err) { setPushError(err instanceof Error ? err.message : 'Could not show the test notification.'); }
  };
  const copyToken = async () => {
    try { await navigator.clipboard.writeText(pushToken); toast('FCM registration token copied.'); }
    catch { setPushError('Could not copy the token. Select and copy it manually.'); }
  };
  const sentRows = records.filter(record => record.status === 'sent').map(record => ({
    ...record,
    recipientGroups: audienceLabel(record),
  }));
  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'message', label: 'Message', render: value => <span className="nt-table-message">{value}</span> },
    { key: 'recipientGroups', label: 'Recipients' },
    { key: 'sentAt', label: 'Sent date', render: value => dateLabel(value) },
  ];
  return <div className="notifications-page">
    <PageHeader title="Notifications" description="Send notifications to all restaurants, customers, and managers." action={<button className="btn primary" disabled={!!storageError} onClick={() => edit()}><Plus size={17}/> New announcement</button>}/>

    {storageError && <p role="alert" className="nt-error">{storageError}</p>}
    <section className="nt-push-panel" aria-labelledby="push-test-title">
      <div className="nt-push-icon"><BellRing size={21}/></div>
      <div className="nt-push-content">
        <div className="nt-push-heading"><div><h2 id="push-test-title">Firebase browser notification test</h2><p>Connect this admin browser first. Its registration token is what your backend will save and target later.</p></div><span className={pushStatus === 'Connected' ? 'status' : 'nt-push-status'}>{pushStatus}</span></div>
        {pushError && <p role="alert" className="nt-error">{pushError}</p>}
        <div className="nt-push-actions"><button type="button" className="btn primary" onClick={enablePush}>{pushStatus === 'Connected' ? 'Refresh connection' : 'Enable notifications'}</button><button type="button" className="btn secondary" onClick={testPush} disabled={pushStatus !== 'Connected'}>Show local test</button></div>
        {pushToken && <div className="nt-token"><label htmlFor="fcm-token">FCM registration token — copy this to Firebase Console → Messaging → Send test message</label><div><input id="fcm-token" value={pushToken} readOnly/><button type="button" className="btn secondary" onClick={copyToken} aria-label="Copy FCM registration token"><Copy size={16}/> Copy</button></div></div>}
      </div>
    </section>
    <CommonTable columns={columns} data={sentRows} searchPlaceholder="Search sent messages"/>
    <Modal open={!!form} title="New announcement" size="wide" onClose={() => setForm(null)}>
      {form && <form onSubmit={event => { event.preventDefault(); save('sent'); }} noValidate><div className="nt-form">
        {error && <p className="nt-error" role="alert">{error}</p>}
        <label className="field"><span>Title</span><input autoFocus maxLength={120} value={form.title} placeholder="What is this announcement about?" onChange={event => change('title', event.target.value)}/></label>
        <label className="field"><span>Message</span><textarea rows={4} maxLength={2000} value={form.message} placeholder="Write your message" onChange={event => change('message', event.target.value)}/></label>
        <fieldset className="nt-recipient-fieldset">
          <legend>Send to all</legend>
          <div className="nt-audience-options">
            {Object.entries({ restaurants: 'Restaurants', customers: 'Customers', managers: 'Managers' }).map(([group, label]) => (
              <label key={group} className={form.groups.includes(group) ? 'nt-audience-option active' : 'nt-audience-option'}>
                <input type="checkbox" checked={form.groups.includes(group)} onChange={() => toggleGroup(group)}/>
                <span><strong>All {label}</strong><small>Send to every {label.toLowerCase().slice(0, -1)}.</small></span>
              </label>
            ))}
          </div>
          <p className="nt-audience-summary">{form.groups.length ? `This notification will go to ${audienceLabel(form)}.` : 'Choose at least one recipient group.'}</p>
        </fieldset>
        <p className="nt-hint">Preview only. No messages will be delivered.</p>
      </div><footer className="modal-actions"><button type="button" className="btn secondary" onClick={() => setForm(null)}>Cancel</button><button type="submit" className="btn primary">Send preview</button></footer></form>}
    </Modal>
  </div>;
}
