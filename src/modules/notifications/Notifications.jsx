import { useCallback, useEffect, useState } from 'react';
import { BellRing, Copy, Plus } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import ServerTable from '../../components/common/ServerTable';

import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { audienceLabel, emptyAnnouncement, validateAnnouncement } from '../../services/notificationService';
import { enablePushNotifications, showTestNotification } from '../../services/firebaseMessaging';
import { announcementApi } from '../../api/announcementApi';
import { saveDeviceToken } from '../../services/deviceService';
import './notifications.css';

const dateLabel = value => value ? new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';

export default function Notifications() {
  const toast = useToast();
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [activeList, setActiveList] = useState('all');
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [pushToken, setPushToken] = useState('');
  const [pushStatus, setPushStatus] = useState('Not connected');
  const [pushError, setPushError] = useState('');

  const load = useCallback(async ({ page = 1, limit = 10 } = {}) => {
    setLoading(true);
    setListError('');
    try {
      const response = await (activeList === 'mine' ? announcementApi.mine({ page, limit }) : announcementApi.list({ page, limit }));
      const data = response?.data ?? response;
      const rows = Array.isArray(data) ? data : data?.items || data?.announcements || data?.rows || [];
      const pagination = data?.pagination || data?.meta || response?.pagination || response?.meta || {};
      setRecords(rows.map(item => ({ ...item, id: item.notification_id ?? item.announcement_id ?? item.id, message: item.body ?? item.message ?? '', audience: item.data?.audience ?? item.audience ?? '', sentAt: item.sent_at ?? item.created_at })));
      setTotal(Number(pagination.total ?? pagination.totalRecords ?? pagination.totalItems ?? data?.total ?? response?.total ?? rows.length));
    } catch (loadError) {
      setRecords([]); setTotal(0);
      setListError(loadError instanceof Error ? loadError.message : 'Could not load announcements.');
    } finally { setLoading(false); }
  }, [activeList]);
  useEffect(() => { load(); }, [load]);
  const change = (key, value) => { setForm(current => ({ ...current, [key]: value })); setError(''); };
  const edit = () => { setForm(emptyAnnouncement()); setError(''); };
  const toggleGroup = group => { setForm(current => ({ ...current, groups: current.groups.includes(group) ? current.groups.filter(item => item !== group) : [...current.groups, group] })); setError(''); };
  const save = async () => {
    const invalid = validateAnnouncement(form, 'sent');
    if (invalid) { setError(invalid); return; }
    setSaving(true); setError('');
    try {
      const audience = { restaurants: 'RESTAURANTS', customers: 'CUSTOMERS', managers: 'BRANCH_OWNERS' };
      await announcementApi.create({ type: 'ANNOUNCEMENT', audience: form.groups.map(group => audience[group]), title: form.title.trim(), body: form.message.trim() });
      setForm(null); toast('Announcement sent.'); await load();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'Could not send the announcement.'); }
    finally { setSaving(false); }
  };
  const enablePush = async () => {
    setPushError('');
    setPushStatus('Connecting...');
    try {
      const token = await enablePushNotifications(({ title, body }) => {
        toast(`Firebase message received: ${title}${body ? ` — ${body}` : ''}`);
      });
      setPushToken(token);
      saveDeviceToken(token);
      setPushStatus('Connected');
      toast('Firebase notifications enabled. Sign in again to register this device token.');
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
  const sentRows = records.map(record => ({
    ...record,
    recipientGroups: record.audience || audienceLabel(record),
  }));
  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'message', label: 'Message', render: value => <span className="nt-table-message">{value}</span> },
    { key: 'recipientGroups', label: 'Recipients' },
    { key: 'sentAt', label: 'Sent date', render: value => dateLabel(value) },
    { key: 'branch_name', label: 'Branch', render: value => value || '—' },
    { key: 'restaurant_name', label: 'Restaurant', render: value => value || '—' },
  ];
  return <div className="notifications-page">
    <PageHeader title="Notifications" description="Create announcements and review all delivered notifications." action={<button className="btn primary" onClick={edit}><Plus size={17}/> New announcement</button>}/>

    <div className="nt-list-tabs" role="tablist" aria-label="Announcement lists">
      <button type="button" role="tab" aria-selected={activeList === 'all'} className={activeList === 'all' ? 'active' : ''} onClick={() => setActiveList('all')}>All announcements</button>
      <button type="button" role="tab" aria-selected={activeList === 'mine'} className={activeList === 'mine' ? 'active' : ''} onClick={() => setActiveList('mine')}>My announcements</button>
    </div>
    {listError && <p role="alert" className="nt-error">{listError}</p>}
    <section className="nt-push-panel" aria-labelledby="push-test-title">
      <div className="nt-push-icon"><BellRing size={21}/></div>
      <div className="nt-push-content">
        <div className="nt-push-heading"><div><h2 id="push-test-title">Firebase browser notification test</h2><p>Enable browser notifications to save this browser’s FCM token. The token is sent with your next login.</p></div><span className={pushStatus === 'Connected' ? 'status' : 'nt-push-status'}>{pushStatus}</span></div>
        {pushError && <p role="alert" className="nt-error">{pushError}</p>}
        <div className="nt-push-actions"><button type="button" className="btn primary" onClick={enablePush}>{pushStatus === 'Connected' ? 'Refresh connection' : 'Enable notifications'}</button><button type="button" className="btn secondary" onClick={testPush} disabled={pushStatus !== 'Connected'}>Show local test</button></div>
        {pushToken && <div className="nt-token"><label htmlFor="fcm-token">FCM registration token — copy this to Firebase Console → Messaging → Send test message</label><div><input id="fcm-token" value={pushToken} readOnly/><button type="button" className="btn secondary" onClick={copyToken} aria-label="Copy FCM registration token"><Copy size={16}/> Copy</button></div></div>}
      </div>
    </section>
    <ServerTable key={activeList} columns={columns} data={sentRows} loading={loading} total={total} onQueryChange={load} searchPlaceholder="Search announcements" minWidth={1050}/>
    <Modal open={!!form} title="New announcement" size="wide" onClose={() => setForm(null)}>
      {form && <form onSubmit={event => { event.preventDefault(); save(); }} noValidate><div className="nt-form">
        {error && <p className="nt-error" role="alert">{error}</p>}
        <label className="field"><span>Title</span><input autoFocus maxLength={120} value={form.title} placeholder="What is this announcement about?" onChange={event => change('title', event.target.value)}/></label>
        <label className="field"><span>Message</span><textarea rows={4} maxLength={2000} value={form.message} placeholder="Write your message" onChange={event => change('message', event.target.value)}/></label>
        <fieldset className="nt-recipient-fieldset">
          <legend>Send to all</legend>
          <div className="nt-audience-options">
            {Object.entries({ restaurants: 'Restaurants', customers: 'Customers', managers: 'Branch owners' }).map(([group, label]) => (
              <label key={group} className={form.groups.includes(group) ? 'nt-audience-option active' : 'nt-audience-option'}>
                <input type="checkbox" checked={form.groups.includes(group)} onChange={() => toggleGroup(group)}/>
                <span><strong>All {label}</strong><small>Send to every {label.toLowerCase().slice(0, -1)}.</small></span>
              </label>
            ))}
          </div>
          <p className="nt-audience-summary">{form.groups.length ? `This notification will go to ${audienceLabel(form)}.` : 'Choose at least one recipient group.'}</p>
        </fieldset>
        <p className="nt-hint">The announcement will be delivered immediately to the selected audiences.</p>
      </div><footer className="modal-actions"><button type="button" className="btn secondary" disabled={saving} onClick={() => setForm(null)}>Cancel</button><button type="submit" className="btn primary" disabled={saving}>{saving ? 'Sending...' : 'Send announcement'}</button></footer></form>}
    </Modal>
  </div>;
}
