import { useEffect, useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';

import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { restaurantApi } from '../../api/restaurantApi';
import { managerApi } from '../../api/managerApi';
import { customerApi } from '../../api/customerApi';
import { AUDIENCES, audienceLabel, emptyAnnouncement, localDateTime, notificationStore, validateAnnouncement } from '../../services/notificationService';
import './notifications.css';

const tabs = [['all', 'All'], ['draft', 'Drafts'], ['scheduled', 'Scheduled'], ['sent', 'Sent']];
const apis = { restaurants: restaurantApi, managers: managerApi, customers: customerApi };
const dateLabel = value => value ? new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';

function RecipientPicker({ selected, onChange }) {
  const [kind, setKind] = useState('restaurants');
  const [search, setSearch] = useState('');
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
        const response = await apis[kind].list({ page, limit: 10, search });
        const data = response?.data ?? response;
        const records = Array.isArray(data) ? data : data?.[kind] || data?.items || data?.rows || data?.records || data?.data || [];
        const idField = (kind === 'restaurants' ? 'restaurant' : kind === 'managers' ? 'manager' : 'customer') + '_id';
        if (active) {
          setRows(records.filter(row => row[idField] != null || row.id != null).map(row => ({ id: String(row[idField] ?? row.id), kind, name: row.restaurant_name || row.name || row.email || ('Account ' + (row[idField] ?? row.id)), detail: row.email || row.phone || '' })));
          const pagination = data?.pagination || data?.meta || response?.pagination || response?.meta || {};
          const total = pagination.total ?? pagination.totalRecords ?? pagination.totalItems ?? data?.total ?? response?.total;
          setHasMore(total != null ? page * 10 < Number(total) : records.length === 10);
        }
      } catch (err) { if (active) setError(err.message || 'Unable to load recipients.'); }
      finally { if (active) setLoading(false); }
    }, 300);
    return () => { active = false; clearTimeout(timer); };
  }, [kind, search, page]);
  const includes = row => selected.some(item => item.kind === row.kind && item.id === row.id);
  const remove = row => selected.filter(item => !(item.kind === row.kind && item.id === row.id));
  return <div className="nt-recipient-picker">
    <div className="nt-recipient-tools"><label className="field"><span>Account type</span><select value={kind} onChange={event => { setKind(event.target.value); setPage(1); }}>{Object.entries(AUDIENCES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="field"><span>Search accounts</span><input value={search} placeholder="Search by name or email" onChange={event => { setSearch(event.target.value); setPage(1); }}/></label></div>
    {error && <p role="alert" className="nt-error">{error}</p>}
    <div className="nt-recipient-list" aria-busy={loading}>{loading ? <p>Loading recipients…</p> : rows.length ? rows.map(row => <label key={row.kind + ':' + row.id}><input type="checkbox" checked={includes(row)} onChange={() => onChange(includes(row) ? remove(row) : [...selected, row])}/><span><strong>{row.name}</strong><small>{row.detail}</small></span></label>) : !error && <p>No accounts found. Try another search.</p>}</div>
    <div className="nt-picker-footer"><span>{selected.length} selected</span><button type="button" className="btn secondary" disabled={page === 1 || loading} onClick={() => setPage(value => value - 1)}>Previous</button><span>Page {page}</span><button type="button" className="btn secondary" disabled={!hasMore || loading} onClick={() => setPage(value => value + 1)}>Next</button></div>
    {!!selected.length && <div className="nt-chips">{selected.map(row => <button type="button" key={row.kind + ':' + row.id} onClick={() => onChange(remove(row))} aria-label={'Remove ' + row.name}><span>{row.name} · {AUDIENCES[row.kind]}</span><X size={13}/></button>)}</div>}
  </div>;
}

function AnnouncementPreview({ record }) {
  return <div className="nt-preview"><div className="nt-preview-meta"><span className={'nt-badge ' + record.priority}>{record.priority}</span>{record.status && <span className={'nt-badge ' + record.status}>{record.status === 'sent' ? 'Sent (preview)' : record.status}</span>}</div><h3>{record.title}</h3><p className="nt-message">{record.message || 'No message yet.'}</p><dl><div><dt>Recipients</dt><dd>{audienceLabel(record)}</dd></div><div><dt>Delivery</dt><dd>{record.status === 'sent' ? 'Simulated on ' + dateLabel(record.sentAt) : record.timing === 'later' ? dateLabel(record.scheduledAt) + ' (' + Intl.DateTimeFormat().resolvedOptions().timeZone + ')' : 'Send now'}</dd></div></dl>{record.audience === 'selected' && <div className="nt-chips">{record.recipients.map(recipient => <span key={recipient.kind + ':' + recipient.id}>{recipient.name} · {AUDIENCES[recipient.kind]}</span>)}</div>}</div>;
}

export default function Notifications() {
  const { user } = useAuth();
  const toast = useToast();
  const store = useMemo(() => notificationStore('restrodesk_admin_notifications_' + (user.id ?? user.user_id ?? user.email ?? user.name)), [user]);
  const [records, setRecords] = useState([]);
  const [storageError, setStorageError] = useState('');
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [view, setView] = useState(null);
  const [remove, setRemove] = useState(null);
  useEffect(() => { try { setRecords(store.list()); setStorageError(''); } catch { setStorageError('Saved notifications could not be loaded. Changes are disabled to protect existing records.'); } }, [store]);
  const persist = next => { try { store.save(next); setRecords(next); return true; } catch { setError('Unable to save. Browser storage may be full or unavailable.'); return false; } };
  const change = (key, value) => { setForm(current => ({ ...current, [key]: value })); setError(''); };
  const edit = record => { setView(null); setForm(record ? { ...record, scheduledAt: localDateTime(record.scheduledAt), groups: [...record.groups], recipients: [...record.recipients] } : emptyAnnouncement()); setError(''); };
  const save = status => {
    const invalid = validateAnnouncement(form, status);
    if (invalid) { setError(invalid); return; }
    const now = new Date().toISOString();
    const schedule = form.scheduledAt && Number.isFinite(new Date(form.scheduledAt).getTime()) ? new Date(form.scheduledAt).toISOString() : '';
    const saved = { ...form, scheduledAt: schedule, searchText: audienceLabel(form) + ' ' + (form.audience === 'selected' ? form.recipients.map(recipient => recipient.name + ' ' + recipient.detail).join(' ') : ''), title: form.title.trim(), message: form.message.trim(), id: form.id || crypto.randomUUID(), status, createdAt: form.createdAt || now, updatedAt: now, sentAt: status === 'sent' ? now : null };
    if (persist([saved, ...records.filter(record => record.id !== saved.id)])) { setForm(null); setTab(status); setSearch(''); setLimit(10); toast(status === 'draft' ? 'Draft saved' : status === 'scheduled' ? 'Preview schedule saved' : 'Preview send recorded'); }
  };
  const filtered = records.filter(record => (tab === 'all' || record.status === tab) && [record.title, record.message, record.searchText, audienceLabel(record)].join(' ').toLowerCase().includes(search.toLowerCase()));
  return <div className="notifications-page">
    <PageHeader title="Notifications" description="Write a message, choose who gets it, and send or save it." action={<button className="btn primary" disabled={!!storageError} onClick={() => edit()}><Plus size={17}/> New announcement</button>}/>
    <p className="nt-notice">Preview only. Messages are saved in this browser and are not delivered.</p>
    {storageError && <p role="alert" className="nt-error">{storageError}</p>}
    <section className="nt-list">
      <div className="nt-list-tools"><div className="nt-tabs" aria-label="Filter announcements">{tabs.map(([key, label]) => <button key={key} className={tab === key ? 'active' : ''} aria-pressed={tab === key} onClick={() => { setTab(key); setLimit(10); }}>{label}</button>)}</div><input className="nt-search" aria-label="Search announcements" placeholder="Search messages" value={search} onChange={event => { setSearch(event.target.value); setLimit(10); }}/></div>
      {filtered.length ? <ul className="nt-announcements">{filtered.slice(0, limit).map(record => <li key={record.id}><button className="nt-open" onClick={() => setView(record)}><strong>{record.title}</strong><span>{audienceLabel(record)} · {dateLabel(record.status === 'scheduled' ? record.scheduledAt : record.sentAt || record.updatedAt)}</span></button><span className={'nt-badge ' + record.status}>{record.status === 'sent' ? 'Sent (preview)' : record.status}</span>{record.status !== 'sent' && <button className="btn secondary nt-edit" disabled={!!storageError} onClick={() => edit(record)}>Edit</button>}</li>)}</ul> : <div className="nt-empty"><p>{search ? 'No messages match your search.' : tab === 'all' ? 'No announcements yet.' : 'No ' + (tab === 'draft' ? 'drafts' : tab === 'scheduled' ? 'scheduled messages' : 'sent messages') + ' yet.'}</p>{!search && <button className="btn secondary" disabled={!!storageError} onClick={() => edit()}>Create announcement</button>}</div>}
      {filtered.length > limit && <div className="nt-more"><button className="btn secondary" onClick={() => setLimit(value => value + 10)}>Show more</button></div>}
    </section>
    <Modal open={!!form} title={form?.id ? 'Edit announcement' : 'New announcement'} onClose={() => setForm(null)}>
      {form && <form onSubmit={event => { event.preventDefault(); save(form.timing === 'later' ? 'scheduled' : 'sent'); }} noValidate><div className="nt-form">
        {error && <p className="nt-error" role="alert">{error}</p>}
        <label className="field"><span>Title</span><input autoFocus maxLength={120} value={form.title} placeholder="What is this announcement about?" onChange={event => change('title', event.target.value)}/></label>
        <label className="field"><span>Message</span><textarea rows={4} maxLength={2000} value={form.message} placeholder="Write your message" onChange={event => change('message', event.target.value)}/></label>
        <label className="field"><span>Send to</span><select value={form.audience} onChange={event => change('audience', event.target.value)}><option value="all">Everyone</option><option value="groups">Choose groups</option><option value="selected">Choose people</option></select></label>
        {form.audience === 'groups' && <div className="nt-options">{Object.entries(AUDIENCES).map(([key, label]) => <label key={key}><input type="checkbox" checked={form.groups.includes(key)} onChange={() => change('groups', form.groups.includes(key) ? form.groups.filter(group => group !== key) : [...form.groups, key])}/>{label}</label>)}</div>}
        {form.audience === 'selected' && <RecipientPicker selected={form.recipients} onChange={value => change('recipients', value)}/>}
        <label className="nt-schedule"><input type="checkbox" checked={form.timing === 'later'} onChange={event => change('timing', event.target.checked ? 'later' : 'now')}/>Schedule for later</label>
        {form.timing === 'later' && <label className="field"><span>Date and time</span><input type="datetime-local" value={form.scheduledAt} onChange={event => change('scheduledAt', event.target.value)}/><small>{Intl.DateTimeFormat().resolvedOptions().timeZone} · Preview schedule only</small></label>}
        <details className="nt-extra"><summary>More options</summary><label className="field"><span>Priority</span><select value={form.priority} onChange={event => change('priority', event.target.value)}><option value="normal">Normal</option><option value="important">Important</option><option value="urgent">Urgent</option></select></label></details>
        <p className="nt-hint">Preview only. No messages will be delivered.</p>
      </div><footer className="modal-actions"><button type="button" className="btn secondary" onClick={() => save('draft')}>Save draft</button><button type="submit" className="btn primary">{form.timing === 'later' ? 'Save schedule' : 'Send preview'}</button></footer></form>}
    </Modal>
    <Modal open={!!view} title="Announcement" onClose={() => setView(null)}>{view && <><div className="nt-form"><AnnouncementPreview record={view}/><details className="nt-extra"><summary>More actions</summary><div className="nt-detail-actions"><button className="btn secondary" disabled={!!storageError} onClick={() => edit({ ...view, id: undefined, createdAt: undefined, status: undefined, sentAt: undefined, title: view.title.slice(0, 113) + ' (copy)', timing: 'now', scheduledAt: '' })}>Make a copy</button>{view.status !== 'sent' && <button className="btn secondary" disabled={!!storageError} onClick={() => { setError(''); setRemove(view); setView(null); }}>{view.status === 'scheduled' ? 'Cancel schedule' : 'Delete draft'}</button>}</div></details></div><footer className="modal-actions"><button className="btn secondary" onClick={() => setView(null)}>Close</button>{view.status !== 'sent' && <button className="btn primary" disabled={!!storageError} onClick={() => edit(view)}>Edit</button>}</footer></>}</Modal>
    <Modal open={!!remove} title={remove?.status === 'scheduled' ? 'Cancel schedule?' : 'Delete draft?'} onClose={() => setRemove(null)}><div className="nt-form"><p>{remove?.status === 'scheduled' ? 'This message will move back to drafts.' : 'This draft will be permanently deleted.'}</p>{error && <p role="alert" className="nt-error">{error}</p>}</div><footer className="modal-actions"><button className="btn secondary" onClick={() => setRemove(null)}>Go back</button><button className="btn destructive" onClick={() => { const next = remove.status === 'scheduled' ? records.map(record => record.id === remove.id ? { ...record, status: 'draft', timing: 'now', scheduledAt: '', updatedAt: new Date().toISOString() } : record) : records.filter(record => record.id !== remove.id); if (persist(next)) { toast(remove.status === 'scheduled' ? 'Schedule canceled' : 'Draft deleted'); setRemove(null); } }}>{remove?.status === 'scheduled' ? 'Cancel schedule' : 'Delete draft'}</button></footer></Modal>
  </div>;
}
