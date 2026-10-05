import { useEffect, useRef, useState } from 'react';
import { Clock3, Save } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { branchScheduleApi } from '../../api/branchScheduleApi';
import { normalizeSchedule } from '../../utils/branchSchedule';
import { useToast } from '../../context/ToastContext';

const unpack = response => {
  if (response?.success === false) throw new Error(response.message || 'Unable to load timings.');
  const data = response?.data ?? response;
  if (!Array.isArray(data?.days)) throw new Error('The server returned an invalid weekly schedule.');
  return data;
};
export default function BranchSchedule({ branch, onClose }) {
  const branchId = branch.branch_id ?? branch.id;
  const toast = useToast();
  const [days, setDays] = useState([]);
  const [today, setToday] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const saveLock = useRef(false);
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    branchScheduleApi.get(branchId).then(response => {
      if (!active) return;
      const data = unpack(response);
      setDays(normalizeSchedule(data.days)); setToday(data.is_open_today);
    }).catch(err => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [branchId, attempt]);
  const change = (day, changes) => setDays(current => current.map(entry => entry.day_of_week === day ? {...entry,...changes,is_set:true} : entry));
  const save = async event => {
    event.preventDefault();
    if (saveLock.current) return;
    saveLock.current = true; setSaving(true); setError('');
    try {
      const response = await branchScheduleApi.save(branchId, days);
      if (response?.success === false) throw new Error(response.message || 'Unable to save timings.');
      toast('Weekly schedule saved'); onClose();
    } catch (err) { setError(err.message); }
    finally { saveLock.current = false; setSaving(false); }
  };
  return <Modal open title={`${branch.name || branch.branch_name || 'Branch'} - Weekly schedule`} size="wide" onClose={() => { if (!saveLock.current) onClose(); }}>
    <form onSubmit={save} className="schedule-form">
      <div className="schedule-intro"><Clock3 size={20}/><div><strong>Opening hours</strong><p>Set opening and closing times for each day. Mark days off as closed.</p></div></div>
      {!loading && today && <p className="schedule-today">Today: {today.is_set === false ? 'Timings not set' : today.is_closed ? 'Closed' : `${today.open_time || '-'} - ${today.close_time || '-'}`}</p>}
      {error && <div className="profile-error" role="alert">{error}{!days.length && !loading && <button className="btn secondary" type="button" onClick={() => setAttempt(value => value + 1)}>Try again</button>}</div>}
      {loading ? <p role="status">Loading weekly schedule...</p> : days.length > 0 && <>
        <fieldset disabled={saving} className="schedule-days">
          <div className="schedule-head" aria-hidden="true"><span>Day</span><span>Opening</span><span>Closing</span><span>Closed</span></div>
          {days.map(day => <div className="schedule-day" key={day.day_of_week}>
            <div className="schedule-day-name"><strong>{day.day_of_week.toLowerCase()}</strong>{!day.is_set && <small>Not set</small>}{day.day_of_week === today?.day_of_week && <small>Today</small>}</div>
            <label className="field"><span className="schedule-mobile-label">Opening</span><input type="time" aria-label={`${day.day_of_week} opening time`} value={day.open_time} disabled={day.is_closed} required={!day.is_closed} onChange={event => change(day.day_of_week,{open_time:event.target.value})}/></label>
            <label className="field"><span className="schedule-mobile-label">Closing</span><input type="time" aria-label={`${day.day_of_week} closing time`} value={day.close_time} disabled={day.is_closed} required={!day.is_closed} onChange={event => change(day.day_of_week,{close_time:event.target.value})}/></label>
            <label className="schedule-closed"><input type="checkbox" checked={day.is_closed} onChange={event => change(day.day_of_week,{is_closed:event.target.checked})}/><span>Closed</span></label>
          </div>)}
        </fieldset>
        <p className="schedule-note">Unset days will be saved as closed. Set both opening and closing times for each open day.</p>
      </>}
      <footer className="modal-actions"><button className="btn secondary" type="button" disabled={saving} onClick={onClose}>Cancel</button><button className="btn primary" disabled={loading || saving || !days.length}><Save size={16}/>{saving ? 'Saving...' : 'Save schedule'}</button></footer>
    </form>
  </Modal>;
}
