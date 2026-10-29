import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import CommonTable from '../../components/common/CommonTable';

import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import NotificationReceiver from './NotificationReceiver';


import { audienceLabel, emptyAnnouncement, notificationStore, validateAnnouncement } from '../../services/notificationService';
import './notifications.css';

const dateLabel = value => value ? new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';

export default function Notifications() {
  const { user } = useAuth();
  const toast = useToast();
  const store = useMemo(() => notificationStore('restrodesk_branch_notifications_' + (user.branch_id ?? user.branch?.branch_id ?? 'branch') + '_' + (user.id ?? user.user_id ?? user.email ?? user.name)), [user]);
  const [records, setRecords] = useState([]);
  const [storageError, setStorageError] = useState('');
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { try { setRecords(store.list()); setStorageError(''); } catch { setStorageError('Saved notifications could not be loaded. Changes are disabled to protect existing records.'); } }, [store]);
  const persist = next => { try { store.save(next); setRecords(next); return true; } catch { setError('Unable to save. Browser storage may be full or unavailable.'); return false; } };
  const change = (key, value) => { setForm(current => ({ ...current, [key]: value })); setError(''); };
  const chooseGroup = group => { setForm(current => ({ ...current, groups: current.groups.includes(group) ? current.groups.filter(item => item !== group) : [...current.groups, group], audience: 'all', recipients: [] })); setError(''); };
  const edit = record => { setForm(record ? { ...record, groups: [...(record.groups || ['customers', 'managers'])], audience: 'all', recipients: [] } : emptyAnnouncement()); setError(''); };
  const save = status => {
    const invalid = validateAnnouncement(form);
    if (invalid) { setError(invalid); return; }
    const now = new Date().toISOString();
    const saved = { ...form, audience: 'all', recipients: [], searchText: audienceLabel(form), title: form.title.trim(), message: form.message.trim(), id: form.id || crypto.randomUUID(), status, createdAt: form.createdAt || now, updatedAt: now, sentAt: status === 'sent' ? now : null };
    if (persist([saved, ...records.filter(record => record.id !== saved.id)])) { setForm(null); toast('Preview send recorded'); }
  };
  const sentRows = records.filter(record => record.status === 'sent').map(record => ({
    ...record,
    recipientNames: audienceLabel(record),
  }));
  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'message', label: 'Message', render: value => <span className="nt-table-message">{value}</span> },
    { key: 'recipientNames', label: 'Recipients' },
    { key: 'sentAt', label: 'Sent date', render: value => dateLabel(value) },
  ];
  return <div className="notifications-page">
    <PageHeader title="Notifications" description="Send notifications to managers and customers in your branch." action={<button className="btn primary" disabled={!!storageError} onClick={() => edit()}><Plus size={17}/> New announcement</button>}/>

    <NotificationReceiver />
    {storageError && <p role="alert" className="nt-error">{storageError}</p>}
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
                <input type="checkbox" checked={form.groups.includes(group)} onChange={() => chooseGroup(group)}/>
                <span><strong>All {label}</strong><small>Send to every {label.toLowerCase().slice(0, -1)}.</small></span>
              </label>
            ))}
          </div>
          <p className="nt-recipient-summary" aria-live="polite"><strong>To:</strong> {form.groups.length ? audienceLabel(form) : 'Select at least one recipient group'}</p>
        </fieldset>
        <p className="nt-hint">Preview only. No messages will be delivered.</p>
      </div><footer className="modal-actions"><button type="button" className="btn secondary" onClick={() => setForm(null)}>Cancel</button><button type="submit" className="btn primary">Send preview</button></footer></form>}
    </Modal>
  </div>;
}
