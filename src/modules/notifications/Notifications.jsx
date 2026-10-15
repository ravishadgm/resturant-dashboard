import ResponsiveSelect from '../../components/common/ResponsiveSelect';
import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import CommonTable from '../../components/common/CommonTable';

import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { branchCustomerApi } from '../../api/branchCustomerApi';


import { audienceLabel, emptyAnnouncement, notificationStore, validateAnnouncement } from '../../services/notificationService';
import './notifications.css';

const dateLabel = value => value ? new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';

function RecipientPicker({ selected, onChange }) {
  const kind = 'customers';
  const [search, setSearch] = useState('');
  const [retry, setRetry] = useState(0);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(false);
  useEffect(() => {
    let active = true;
    setLoading(true); setError(''); setRows([]);
    const timer = setTimeout(async () => {
      try {
        const response = await branchCustomerApi.list({ page, limit: 10, search });
        const data = response?.data ?? response;
        const records = Array.isArray(data) ? data : data?.[kind] || data?.items || data?.rows || data?.records || data?.data || [];
        const idField = 'customer_id';
        if (active) {
          setRows(records.filter(row => row[idField] != null || row.id != null).map(row => ({ id: String(row[idField] ?? row.id), kind, name: row.name || row.customer?.name || row.email || ('Account ' + (row[idField] ?? row.id)), detail: row.owner?.email || row.user?.email || row.owner_email || row.email || row.phone || '' })));
          const pagination = data?.pagination || data?.meta || response?.pagination || response?.meta || {};
          const total = pagination.total ?? pagination.totalRecords ?? pagination.totalItems ?? data?.total ?? response?.total;
          setHasMore(total != null ? page * 10 < Number(total) : records.length === 10);
        }
      } catch (err) { if (active) setError(err.message || 'Unable to load recipients.'); }
      finally { if (active) setLoading(false); }
    }, 300);
    return () => { active = false; clearTimeout(timer); };
  }, [kind, search, page, retry]);
  const includes = row => selected.some(item => item.kind === row.kind && item.id === row.id);
  return <div className="nt-recipient-picker">
    <div className="nt-recipient-tools"><label className="field"><span>Search customers</span><input value={search} placeholder="Search by name or email" onChange={event => { setSearch(event.target.value); setPage(1); }}/></label></div>
    {error && <div role="alert" className="nt-error">{error}<button type="button" className="btn secondary" onClick={() => setRetry(value => value + 1)}>Try again</button></div>}
    <div className="nt-recipient-list" aria-busy={loading}>{loading ? <p>Loading customers…</p> : rows.length ? rows.map(row => <label className={includes(row) ? 'nt-restaurant-option selected' : 'nt-restaurant-option'} key={row.kind + ':' + row.id}><input type="checkbox" checked={includes(row)} onChange={() => onChange(includes(row) ? selected.filter(item => !(item.kind === row.kind && item.id === row.id)) : [...selected, row])}/><span><strong>{row.name}</strong><small>{row.detail}</small></span></label>) : !error && <p>No customers found. Try another search.</p>}</div>
    <div className="nt-picker-footer"><span>{selected.length} selected</span><button type="button" className="btn secondary" disabled={page === 1 || loading} onClick={() => setPage(value => value - 1)}>Previous</button><span>Page {page}</span><button type="button" className="btn secondary" disabled={!hasMore || loading} onClick={() => setPage(value => value + 1)}>Next</button></div>
    {!!selected.length && <p className="nt-hint">Selected: {selected.map(row => row.name).join(", ")}</p>}
  </div>;
}


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
  const chooseGroup = groups => { setForm(current => ({ ...current, groups, audience: 'all', recipients: [] })); setError(''); };
  const edit = record => { setForm(record ? { ...record, groups: [...record.groups], recipients: [...record.recipients] } : emptyAnnouncement()); setError(''); };
  const save = status => {
    const invalid = validateAnnouncement(form);
    if (invalid) { setError(invalid); return; }
    const now = new Date().toISOString();
    const saved = { ...form, recipients: form.audience === 'all' ? [] : form.recipients, searchText: audienceLabel(form) + ' ' + (form.audience === 'selected' ? form.recipients.map(recipient => recipient.name + ' ' + recipient.detail).join(' ') : ''), title: form.title.trim(), message: form.message.trim(), id: form.id || crypto.randomUUID(), status, createdAt: form.createdAt || now, updatedAt: now, sentAt: status === 'sent' ? now : null };
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
    { key: 'priority', label: 'Priority', render: value => <span className={'nt-badge ' + value}>{value}</span> },
    { key: 'sentAt', label: 'Sent date', render: value => dateLabel(value) },
  ];
  return <div className="notifications-page">
    <PageHeader title="Notifications" description="Send notifications to managers and customers in your branch." action={<button className="btn primary" disabled={!!storageError} onClick={() => edit()}><Plus size={17}/> New announcement</button>}/>

    {storageError && <p role="alert" className="nt-error">{storageError}</p>}
    <CommonTable columns={columns} data={sentRows} searchPlaceholder="Search sent messages"/>
    <Modal open={!!form} title="New announcement" size="wide" onClose={() => setForm(null)}>
      {form && <form onSubmit={event => { event.preventDefault(); save('sent'); }} noValidate><div className="nt-form">
        {error && <p className="nt-error" role="alert">{error}</p>}
        <label className="field"><span>Title</span><input autoFocus maxLength={120} value={form.title} placeholder="What is this announcement about?" onChange={event => change('title', event.target.value)}/></label>
        <label className="field"><span>Message</span><textarea rows={4} maxLength={2000} value={form.message} placeholder="Write your message" onChange={event => change('message', event.target.value)}/></label>
        <fieldset className="nt-recipient-fieldset">
          <legend>Who should receive this notification?</legend>
          <div className="nt-target-options">
            <label className={form.groups.length === 1 && form.groups[0] === 'customers' ? 'nt-audience-option active' : 'nt-audience-option'}>
              <input type="radio" name="recipient-group" checked={form.groups.length === 1 && form.groups[0] === 'customers'} onChange={() => chooseGroup(['customers'])}/>
              <span><strong>Customers</strong><small>People who visit your branch.</small></span>
            </label>
            <label className={form.groups.length === 1 && form.groups[0] === 'managers' ? 'nt-audience-option active' : 'nt-audience-option'}>
              <input type="radio" name="recipient-group" checked={form.groups.length === 1 && form.groups[0] === 'managers'} onChange={() => chooseGroup(['managers'])}/>
              <span><strong>Managers</strong><small>Your branch management team.</small></span>
            </label>
            <label className={form.groups.length === 2 ? 'nt-audience-option active' : 'nt-audience-option'}>
              <input type="radio" name="recipient-group" checked={form.groups.length === 2} onChange={() => chooseGroup(['customers', 'managers'])}/>
              <span><strong>Both</strong><small>Customers and managers.</small></span>
            </label>
          </div>
          {form.groups.length === 1 && form.groups[0] === 'customers' && <div className="nt-customer-scope">
            <label><input type="radio" name="customer-scope" checked={form.audience === 'all'} onChange={() => change('audience', 'all')}/>All customers</label>
            <label><input type="radio" name="customer-scope" checked={form.audience === 'selected'} onChange={() => change('audience', 'selected')}/>Choose specific customers</label>
          </div>}
          {form.audience === 'selected' && <RecipientPicker selected={form.recipients} onChange={value => change('recipients', value)}/>}
          <p className="nt-recipient-summary" aria-live="polite"><strong>To:</strong> {form.audience === 'selected' ? form.recipients.length ? form.recipients.length + ' selected customer' + (form.recipients.length === 1 ? '' : 's') : 'Choose customers from the list above' : audienceLabel(form) + ' in this branch'}</p>
        </fieldset>
        <label className="field"><span>Priority</span><ResponsiveSelect aria-label="Priority" className={'nt-priority-select ' + form.priority} value={form.priority} onChange={event => change('priority', event.target.value)}><option value="normal">Normal</option><option value="important">Important</option><option value="urgent">Urgent</option></ResponsiveSelect></label>
        <p className="nt-hint">Preview only. No messages will be delivered.</p>
      </div><footer className="modal-actions"><button type="button" className="btn secondary" onClick={() => setForm(null)}>Cancel</button><button type="submit" className="btn primary">Send preview</button></footer></form>}
    </Modal>
  </div>;
}