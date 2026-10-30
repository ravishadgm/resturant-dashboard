import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import ServerTable from '../../components/common/ServerTable';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { restaurantAnnouncementApi } from '../../api/restaurantAnnouncementApi';
import './notifications.css';

const audiences = {
  ADMINS: 'Admins',
  CUSTOMERS: 'Customers',
  BRANCH_OWNERS: 'Branch owners',
};

const dateLabel = value => value ? new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';
const initialForm = () => ({ title: '', body: '', audience: ['ADMINS', 'CUSTOMERS'] });

const rowsFrom = response => {
  const data = response?.data ?? response;
  return Array.isArray(data) ? data : data?.items || data?.announcements || data?.rows || [];
};

const totalFrom = (response, rows) => {
  const data = response?.data ?? response;
  const page = data?.pagination || data?.meta || response?.pagination || response?.meta || {};
  return Number(page.total ?? page.totalRecords ?? page.totalItems ?? data?.total ?? response?.total ?? rows.length);
};

export default function RestaurantNotifications() {
  const toast = useToast();
  const [tab, setTab] = useState('all');
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [form, setForm] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async ({ page = 1, limit = 10 } = {}) => {
    setLoading(true); setListError('');
    try {
      const response = await (tab === 'mine' ? restaurantAnnouncementApi.mine() : restaurantAnnouncementApi.list({ page, limit }));
      const rows = rowsFrom(response);
      setRecords(rows.map(item => ({
        ...item,
        id: item.notification_id ?? item.announcement_id ?? item.id,
        message: item.body ?? item.message ?? '',
        recipientGroups: item.data?.audience ?? item.audience ?? '—',
        sentAt: item.sent_at ?? item.created_at,
      })));
      setTotal(totalFrom(response, rows));
    } catch (error) {
      setRecords([]); setTotal(0);
      setListError(error instanceof Error ? error.message : 'Could not load announcements.');
    } finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const toggleAudience = audience => setForm(current => ({
    ...current,
    audience: current.audience.includes(audience) ? current.audience.filter(value => value !== audience) : [...current.audience, audience],
  }));

  const save = async () => {
    const title = form.title.trim();
    const body = form.body.trim();
    if (!title) { setFormError('Enter an announcement title.'); return; }
    if (!body) { setFormError('Enter an announcement message.'); return; }
    if (!form.audience.length) { setFormError('Select at least one audience.'); return; }
    setSaving(true); setFormError('');
    try {
      await restaurantAnnouncementApi.create({ type: 'ANNOUNCEMENT', audience: form.audience, title, body });
      setForm(null); toast('Announcement sent.'); await load();
    } catch (error) { setFormError(error instanceof Error ? error.message : 'Could not send the announcement.'); }
    finally { setSaving(false); }
  };

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'message', label: 'Message', render: value => <span className="nt-table-message">{value}</span> },
    { key: 'recipientGroups', label: 'Recipients' },
    { key: 'sentAt', label: 'Sent date', render: value => dateLabel(value) },
    { key: 'status', label: 'Status', render: value => value || '—' },
  ];

  return <div className="notifications-page">
    <PageHeader title="Notifications" description="Send announcements and review restaurant notifications." action={<button className="btn primary" onClick={() => { setForm(initialForm()); setFormError(''); }}><Plus size={17}/> New announcement</button>}/>
    <div className="nt-list-tabs" role="tablist" aria-label="Announcement lists">
      <button type="button" role="tab" aria-selected={tab === 'all'} className={tab === 'all' ? 'active' : ''} onClick={() => setTab('all')}>All announcements</button>
      <button type="button" role="tab" aria-selected={tab === 'mine'} className={tab === 'mine' ? 'active' : ''} onClick={() => setTab('mine')}>My announcements</button>
    </div>
    {listError && <p className="nt-error" role="alert">{listError}</p>}
    <ServerTable key={tab} columns={columns} data={records} loading={loading} total={total} onQueryChange={load} searchPlaceholder="Search announcements" minWidth={900}/>
    <Modal open={!!form} title="New announcement" size="wide" onClose={() => !saving && setForm(null)}>
      {form && <form onSubmit={event => { event.preventDefault(); save(); }} noValidate><div className="nt-form">
        {formError && <p className="nt-error" role="alert">{formError}</p>}
        <label className="field"><span>Title</span><input autoFocus maxLength={120} value={form.title} placeholder="What is this announcement about?" onChange={event => setForm(current => ({ ...current, title: event.target.value }))}/></label>
        <label className="field"><span>Message</span><textarea rows={4} maxLength={2000} value={form.body} placeholder="Write your message" onChange={event => setForm(current => ({ ...current, body: event.target.value }))}/></label>
        <fieldset className="nt-recipient-fieldset"><legend>Send to all</legend><div className="nt-audience-options">
          {Object.entries(audiences).map(([value, label]) => <label key={value} className={form.audience.includes(value) ? 'nt-audience-option active' : 'nt-audience-option'}>
            <input type="checkbox" checked={form.audience.includes(value)} onChange={() => toggleAudience(value)}/><span><strong>All {label}</strong><small>Send to every {label.toLowerCase().slice(0, -1)}.</small></span>
          </label>)}
        </div></fieldset>
        <p className="nt-hint">The announcement will be delivered immediately to the selected audiences.</p>
      </div><footer className="modal-actions"><button type="button" className="btn secondary" disabled={saving} onClick={() => setForm(null)}>Cancel</button><button type="submit" className="btn primary" disabled={saving}>{saving ? 'Sending...' : 'Send announcement'}</button></footer></form>}
    </Modal>
  </div>;
}
