import { useEffect, useRef, useState } from 'react';
import { CalendarDays, Clock3, Save } from 'lucide-react';
import { branchOwnerScheduleApi } from '../../api/branchOwnerScheduleApi';
import { normalizeSchedule } from '../../utils/branchSchedule';
import { currentScheduleDay, scheduleStatus, scheduleTime } from '../../utils/scheduleDisplay';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/common/PageHeader';

export default function BranchSchedules() {
  const toast=useToast();
  const saveLock=useRef(false);
  const [days,setDays]=useState([]);
  const [saving,setSaving]=useState(false);
  const [data,setData] = useState(null);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const [refresh,setRefresh] = useState(0);
  useEffect(()=>{
    let active=true;
    setLoading(true);setError('');
    branchOwnerScheduleApi.get().then(response=>{
      if(!active)return;
      if(response?.success===false)throw new Error(response.message||'Unable to load schedules.');
      const result=response?.data??response;
      if(!Array.isArray(result?.days))throw new Error('The server returned an invalid weekly schedule.');
      const normalized=normalizeSchedule(result.days);
      setData({...result,days:normalized});setDays(normalized);
    }).catch(err=>{if(active)setError(err.message);})
      .finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;};
  },[refresh]);
  const change=(day,changes)=>setDays(current=>current.map(entry=>entry.day_of_week===day?{...entry,...changes,is_set:true}:entry));
  const save=async event=>{
    event.preventDefault();
    if(saveLock.current)return;
    saveLock.current=true;setSaving(true);setError('');
    let submitted=false;
    try{
      const response=await branchOwnerScheduleApi.save(days);
      if(response?.success===false)throw new Error(response.message||'Unable to save schedules.');
      submitted=true;
      const savedResponse=await branchOwnerScheduleApi.get({fresh:true});
      if(savedResponse?.success===false)throw new Error(savedResponse.message||'Unable to load saved schedules.');
      const result=savedResponse?.data??savedResponse;
      if(!Array.isArray(result?.days))throw new Error('Unable to load the saved weekly schedule.');
      const normalized=normalizeSchedule(result.days);
      setData({...result,days:normalized});setDays(normalized);
      toast('Weekly schedules saved');
    }catch(err){setError(submitted?`Update submitted, but the saved schedule could not be loaded. ${err.message}`:err.message);}
    finally{saveLock.current=false;setSaving(false);}
  };
  const today=currentScheduleDay(data);
  const todayStatus=scheduleStatus(today);
  const openDays=data?.days.filter(day=>scheduleStatus(day)==='Open').length??0;
  const configuredDays=data?.days.filter(day=>day.is_set).length??0;
  return <>
    <PageHeader eyebrow="BRANCH OWNER" title="Schedules" description={data?.branch_name?`Weekly opening hours for ${data.branch_name}.`:'Your branch weekly opening hours.'}/>
    {error&&<div className="profile-error" role="alert">{error}<button className="btn secondary" disabled={loading||saving} onClick={()=>setRefresh(value=>value+1)}>Try again</button></div>}
    {loading&&!data?<div className="panel profile-loading" role="status">Loading weekly schedule...</div>:data&&<>
      <div className="branch-schedules-summary" aria-busy={loading||saving}>
        <section className="panel branch-schedules-today"><Clock3 size={25}/><div><small>TODAY - {today?.day_of_week||'-'}</small><h2>{todayStatus==='Not set'?'Schedule not set':todayStatus==='Closed'?'Closed today':`${scheduleTime(today,'open_time')} - ${scheduleTime(today,'close_time')}`}</h2><p>{todayStatus==='Open'?'Scheduled opening hours':'No opening hours scheduled for today.'}</p></div></section>
        <section className="panel branch-schedules-count"><CalendarDays size={25}/><div><strong>{openDays}<small> / 7</small></strong><p>Open days each week</p><small>{configuredDays} of 7 days configured</small></div></section>
      </div>
      <form onSubmit={save} className="panel branch-weekly-schedule" aria-busy={loading||saving}><header><span><CalendarDays/></span><div><h2>Weekly schedule</h2><p>Monday through Sunday</p></div></header>
        <div className="branch-schedule-scroll"><table><thead><tr><th>Day</th><th>Opening time</th><th>Closing time</th><th>Closed</th></tr></thead><tbody>{days.map(day=>{
          const status=scheduleStatus(day);
          const isToday=day.day_of_week===today?.day_of_week;
          return <tr key={day.day_of_week} className={isToday?'branch-schedule-today-row':''}><td data-label="Day"><strong className="branch-schedule-day-label">{day.day_of_week.toLowerCase()}</strong>{isToday&&<span className="branch-schedule-today-tag">Today</span>}</td><td data-label="Opening time"><input className="schedule-time-input" type="time" aria-label={`${day.day_of_week} opening time`} value={day.open_time} required={!day.is_closed} disabled={day.is_closed||saving||loading} onChange={event=>change(day.day_of_week,{open_time:event.target.value})}/></td><td data-label="Closing time"><input className="schedule-time-input" type="time" aria-label={`${day.day_of_week} closing time`} value={day.close_time} required={!day.is_closed} disabled={day.is_closed||saving||loading} onChange={event=>change(day.day_of_week,{close_time:event.target.value})}/></td><td data-label="Closed"><label className="schedule-closed"><input type="checkbox" checked={day.is_closed} disabled={saving||loading} onChange={event=>change(day.day_of_week,{is_closed:event.target.checked})}/><span>{status}</span></label></td></tr>;
        })}</tbody></table></div>
        <p className="branch-schedule-save-note">Unset days will be saved as closed.</p>
        <footer className="modal-actions"><button type="button" className="btn secondary" disabled={saving||loading} onClick={()=>{setDays(data.days);setError('');}}>Reset</button><button className="btn primary" disabled={saving||loading}><Save size={16}/>{saving?'Saving...':'Save schedules'}</button></footer>
      </form>
    </>}
  </>;
}
