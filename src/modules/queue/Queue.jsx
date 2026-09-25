import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { BellRing, Check, Clock3, Eye, History, Plus, RotateCcw, Search, Table2, UserRoundX, UsersRound } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { queueService } from '../../services/queueService';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';

const emptyForm = { guestName:'', phone:'', customer_id:'', branch_id:'BR-001', partySize:2, preference:'Any', quotedWait:20, notes:'' };
const statusLabels = { waiting:'WAITING', notified:'CALLED', seated:'SEATED', completed:'COMPLETED', no_show:'NO SHOW', cancelled:'CANCELLED' };
const activeStatuses = ['waiting', 'notified', 'seated'];

function elapsed(iso) {
  if (!iso) return '—';
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function QueueStatus({ value }) {
  return <span className={`queue-status ${value}`}><i />{statusLabels[value]}</span>;
}

export default function Queue() {
  const {user}=useAuth(); const location=useLocation(); const historyPage=location.pathname==='/history';
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [tab, setTab] = useState(historyPage?'history':'active');
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [seatGuest, setSeatGuest] = useState(null);
  const [table, setTable] = useState('');
  const [detail,setDetail]=useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const load = () => queueService.list().then(setRows);
  useEffect(() => { load(); }, []);

  const scopedRows=user.role===ROLES.MANAGER?rows.filter(row=>(row.branch_id||'BR-001')===(user.branch_id||'BR-001')&&String(row.business_date||row.joinedAt||'').slice(0,10)===new Date().toISOString().slice(0,10)):rows;
  const active = scopedRows.filter(row => activeStatuses.includes(row.status));
  const waiting = active.filter(row => row.status === 'waiting' || row.status === 'notified');
  const stats = {
    parties: waiting.length,
    guests: waiting.reduce((sum, row) => sum + Number(row.partySize), 0),
    average: waiting.length ? Math.round(waiting.reduce((sum, row) => sum + Number(row.quotedWait || 0), 0) / waiting.length) : 0,
    seated: active.filter(row => row.status === 'seated').length
  };

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return scopedRows
      .filter(row => tab === 'active' ? activeStatuses.includes(row.status) : !activeStatuses.includes(row.status))
      .filter(row => !query || `${row.guestName} ${row.phone} ${row.table || ''}`.toLowerCase().includes(query))
      .sort((a, b) => tab === 'active' ? new Date(a.joinedAt) - new Date(b.joinedAt) : new Date(b.completedAt || b.joinedAt) - new Date(a.completedAt || a.joinedAt));
  }, [scopedRows, tab, search]);

  const changeStatus = async (row, status) => {
    const now=new Date().toISOString(); const timestamps = status === 'notified' ? { notifiedAt:now, called_at:now } : status === 'completed' ? { completedAt:now,completed_at:now } : status === 'no_show' ? { completedAt:now,cancelled_at:now } : {};
    await queueService.update(row.id, { status, ...timestamps });
    await load();
    toast(status === 'notified' ? `${row.guestName} has been marked as notified.` : `${row.guestName} moved to ${statusLabels[status].toLowerCase()}.`);
  };

  const addGuest = async event => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.guestName.trim()) nextErrors.guestName = 'Guest name is required.';
    if (!/^\+?[0-9 ()-]{8,18}$/.test(form.phone.trim())) nextErrors.phone = 'Enter a valid phone number.';
    if (Number(form.partySize) < 1 || Number(form.partySize) > 20) nextErrors.partySize = 'Party size must be between 1 and 20.';
    if (Number(form.quotedWait) < 0 || Number(form.quotedWait) > 240) nextErrors.quotedWait = 'Wait time must be between 0 and 240 minutes.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    await queueService.add({ ...form, guestName:form.guestName.trim(), phone:form.phone.trim(), partySize:Number(form.partySize), member_count:Number(form.partySize), quotedWait:Number(form.quotedWait) });
    setForm(emptyForm); setAddOpen(false); await load(); toast(`${form.guestName.trim()} added to the queue.`);
  };

  const seat = async event => {
    event.preventDefault();
    if (!table.trim()) return;
    const tableNumbers=table.split(',').map(value=>value.trim().toUpperCase()).filter(Boolean); const now=new Date().toISOString();
    await queueService.update(seatGuest.id, { status:'seated', table:tableNumbers.join(', '), table_ids:tableNumbers, assigned_at:now, seatedAt:now, seated_at:now });
    toast(`${seatGuest.guestName} seated at ${tableNumbers.join(' + ')}.`);
    setSeatGuest(null); setTable(''); await load();
  };

  const reopen = async row => {
    await queueService.update(row.id, { status:'waiting', table:undefined, seatedAt:undefined, completedAt:undefined });
    await load(); toast(`${row.guestName} returned to the waiting list.`);
  };

  return <>
    <PageHeader eyebrow={user.role===ROLES.MANAGER?'CURRENT BRANCH + TODAY':'ALL RESTAURANTS'} title={historyPage?'Queue history':'Live queue'} description={user.role===ROLES.MANAGER?'Only today’s assigned-branch records are visible.':'Manage branch-wise queue records and complete history.'} action={!historyPage&&<button className="btn primary" onClick={() => setAddOpen(true)}><Plus size={17}/> Add customer</button>} />

    <section className="queue-stats" aria-label="Queue summary">
      <article><span className="queue-stat-icon purple"><UsersRound/></span><div><small>Waiting parties</small><strong>{stats.parties}</strong><p>{stats.guests} guests total</p></div></article>
      <article><span className="queue-stat-icon amber"><Clock3/></span><div><small>Quoted wait</small><strong>{stats.average}<em> min</em></strong><p>Average estimate</p></div></article>
      <article><span className="queue-stat-icon green"><Table2/></span><div><small>Currently seated</small><strong>{stats.seated}</strong><p>Active tables</p></div></article>
    </section>

    <section className="queue-panel">
      <header className="queue-toolbar">
        {!historyPage&&<div className="queue-tabs" role="tablist">
          <button className={tab === 'active' ? 'active' : ''} onClick={() => setTab('active')}><BellRing/> Active queue <b>{active.length}</b></button>
          <button className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}><History/> History</button>
        </div>}
        <label className="queue-search"><Search/><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search guest, phone or table" /></label>
      </header>

      {visible.length ? <div className="queue-table-scroll">
        <table className="queue-table">
          <colgroup><col className="col-position"/><col className="col-guest"/><col className="col-phone"/><col className="col-party"/><col className="col-preference"/><col className="col-wait"/><col className="col-notes"/><col className="col-status"/><col className="col-actions"/></colgroup>
          <thead><tr><th>Position</th><th>Guest</th><th>Phone</th><th>Party</th><th>Preference</th><th>{tab === 'active' ? 'Wait / table' : 'Total wait'}</th><th>Notes</th><th>Status</th><th className="queue-actions-heading">Actions</th></tr></thead>
          <tbody>{visible.map((row, index) => <tr className={`queue-table-row ${row.status}`} key={row.id}>
            <td><span className="queue-position">{tab === 'active' && row.status !== 'seated' ? String(visible.slice(0, index).filter(item => item.status !== 'seated').length + 1).padStart(2, '0') : <Check/>}</span></td>
            <td className="queue-name-cell"><strong>{row.guestName}</strong></td>
            <td className="queue-phone-cell">{row.phone}</td>
            <td><span className="queue-party-cell"><UsersRound/> {row.partySize} guests</span></td>
            <td>{row.preference || 'Any'}</td>
            <td><span className="queue-wait-cell"><strong>{row.status === 'seated' ? row.table : elapsed(row.joinedAt)}</strong>{tab === 'active' && row.status !== 'seated' && <small>Quoted {row.quotedWait} min</small>}</span></td>
            <td className="queue-notes-cell" title={row.notes || ''}>{row.notes || '—'}</td>
            <td><QueueStatus value={row.status}/></td>
            <td><div className="queue-table-actions">
              <button className="queue-icon-action" title="View all queue fields" aria-label={`View ${row.guestName} queue details`} onClick={()=>setDetail(row)}><Eye/></button>
              {row.status === 'waiting' && <button className="btn secondary compact" onClick={() => changeStatus(row, 'notified')}><BellRing/> Notify</button>}
              {(row.status === 'waiting' || row.status === 'notified') && <button className="btn primary compact" onClick={() => { setSeatGuest(row); setTable(''); }}><Table2/> Seat</button>}
              {row.status === 'notified' && <button className="queue-icon-action danger" title="Mark no-show" aria-label={`Mark ${row.guestName} as no-show`} onClick={() => changeStatus(row, 'no_show')}><UserRoundX/></button>}
              {row.status === 'seated' && <button className="btn secondary compact success" onClick={() => changeStatus(row, 'completed')}><Check/> Complete</button>}
              {!activeStatuses.includes(row.status) && <button className="btn secondary compact" onClick={() => reopen(row)}><RotateCcw/> Return to queue</button>}
            </div></td>
          </tr>)}</tbody>
        </table>
      </div> : <div className="queue-empty"><UsersRound/><h3>{tab === 'active' ? 'The queue is clear' : 'No queue history yet'}</h3><p>{search ? 'No guests match your search.' : tab === 'active' ? 'Add a walk-in when the next party arrives.' : 'Completed and no-show parties will appear here.'}</p>{tab === 'active' && !search && <button className="btn primary" onClick={() => setAddOpen(true)}><Plus size={17}/> Add walk-in</button>}</div>}
    </section>

    <Modal open={addOpen} title="Add walk-in party" onClose={() => { setAddOpen(false); setErrors({}); }} size="wide">
      <form onSubmit={addGuest} className="queue-form">
        <div className="queue-form-intro"><span><UsersRound/></span><div><strong>Guest details</strong><p>Add contact details and give the party a clear wait estimate.</p></div></div>
        <div className="form-grid">
          <label className="field"><span>Branch <em>*</em></span><select value={form.branch_id} onChange={e=>setForm({...form,branch_id:e.target.value})}><option value="BR-001">BR-001 · Adajan</option><option value="BR-002">BR-002 · Vesu</option></select></label>
          <label className="field"><span>Customer ID</span><input value={form.customer_id} onChange={e=>setForm({...form,customer_id:e.target.value})} placeholder="Existing customer ID (optional)" /></label>
          <label className={`field ${errors.guestName ? 'field-error' : ''}`}><span>Guest name <em>*</em></span><input autoFocus value={form.guestName} onChange={e => setForm({...form,guestName:e.target.value})} placeholder="e.g. Priya Sharma" />{errors.guestName && <small>{errors.guestName}</small>}</label>
          <label className={`field ${errors.phone ? 'field-error' : ''}`}><span>Phone number <em>*</em></span><input value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} placeholder="+91 98765 43210" />{errors.phone && <small>{errors.phone}</small>}</label>
          <label className={`field ${errors.partySize ? 'field-error' : ''}`}><span>Party size <em>*</em></span><input type="number" min="1" max="20" value={form.partySize} onChange={e => setForm({...form,partySize:e.target.value})} />{errors.partySize && <small>{errors.partySize}</small>}</label>
          <label className="field"><span>Seating preference</span><select value={form.preference} onChange={e => setForm({...form,preference:e.target.value})}><option>Any</option><option>Indoor</option><option>Outdoor</option><option>Window</option><option>Accessible</option></select></label>
          <label className={`field ${errors.quotedWait ? 'field-error' : ''}`}><span>Quoted wait (minutes) <em>*</em></span><input type="number" min="0" max="240" step="5" value={form.quotedWait} onChange={e => setForm({...form,quotedWait:e.target.value})} />{errors.quotedWait && <small>{errors.quotedWait}</small>}</label>
          <label className="field"><span>Guest notes</span><input value={form.notes} onChange={e => setForm({...form,notes:e.target.value})} placeholder="High chair, allergy, occasion…" /></label>
        </div>
        <footer className="modal-actions"><button type="button" className="btn secondary" onClick={() => setAddOpen(false)}>Cancel</button><button className="btn primary"><Plus size={17}/> Add to queue</button></footer>
      </form>
    </Modal>

    <Modal open={Boolean(seatGuest)} title="Assign a table" onClose={() => setSeatGuest(null)}>
      <form onSubmit={seat} className="seat-form">
        <div className="seat-summary"><span><Table2/></span><div><strong>{seatGuest?.guestName}</strong><p>Party of {seatGuest?.partySize} · {seatGuest?.preference} seating</p></div></div>
        <label className="field"><span>Table number(s) <em>*</em></span><input autoFocus value={table} onChange={e => setTable(e.target.value)} placeholder="e.g. T-04, T-05" required /><small className="field-hint">Separate multiple tables with commas. Confirm their combined capacity covers the party.</small></label>
        <footer className="modal-actions"><button type="button" className="btn secondary" onClick={() => setSeatGuest(null)}>Cancel</button><button className="btn primary" disabled={!table.trim()}><Table2 size={17}/> Confirm seating</button></footer>
      </form>
    </Modal>
    <Modal open={Boolean(detail)} title="Queue record details" onClose={()=>setDetail(null)} size="wide">
      <div className="registry-detail">{[
        ['Queue ID',detail?.queue_id||detail?.id],['Branch ID',detail?.branch_id||'BR-001'],['Customer ID',detail?.customer_id||'—'],['Queue number',detail?.queue_number||'—'],['Member count',detail?.member_count||detail?.partySize],['Status',statusLabels[detail?.status]||detail?.status],['Registered at',detail?.registered_at||detail?.joinedAt],['Called at',detail?.called_at||detail?.notifiedAt||'—'],['Seated at',detail?.seated_at||detail?.seatedAt||'—'],['Completed at',detail?.completed_at||detail?.completedAt||'—'],['Cancelled at',detail?.cancelled_at||'—'],['Assigned tables',(detail?.table_ids||[detail?.table]).filter(Boolean).join(', ')||'—'],['Assigned at',detail?.assigned_at||'—']
      ].map(([label,value])=><div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><footer className="modal-actions"><button className="btn secondary" onClick={()=>setDetail(null)}>Close</button></footer>
    </Modal>
  </>;
}
