import OverviewGraph from './OverviewGraph';
import { useEffect, useState } from 'react';
import { Armchair, CalendarDays, Clock3, ListOrdered, RefreshCw, Users, Utensils } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dashboardApi } from '../../api/dashboardApi';

const count = value => value == null ? '-' : Number.isFinite(Number(value)) ? Number(value) : '-';
export default function BranchDashboard() {
  const {user} = useAuth();
  const [data,setData] = useState(null);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const [refresh,setRefresh] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    dashboardApi.getBranchDashboard().then(response => {
      if (!active) return;
      if (response?.success === false) throw new Error(response.message || 'Unable to load dashboard.');
      const details = response?.data ?? response;
      if (!details || typeof details !== 'object' || !details.queue) throw new Error('The server returned an invalid dashboard.');
      setData(details);
    }).catch(err => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  },[refresh]);
  const queue = data?.queue;
  const timing = data?.today_timing;
  const stats = [
    [Armchair,'Tables',data?.tables,'Total branch tables','violet'],
    [Users,'Customers',data?.customers,'Branch customers','blue'],
    [ListOrdered,'Waiting',queue?.waiting_count,'Waiting today','violet'],
    [Utensils,'Dining',queue?.dining_count,'Currently dining','green'],
    [ListOrdered,'Total in queue',queue?.total_in_queue,'Today?s queue','blue'],
    [Armchair,'Free tables',queue?.free_tables,'Available tables','green'],
    [Armchair,'Occupied tables',queue?.occupied_tables,'Tables in use','violet'],
    [CalendarDays,'Weekly schedule',data?.weekly_timing_set,'Days configured out of 7','blue'],
  ];
  return <>
    <div className="dashboard-welcome"><div><span>BRANCH OVERVIEW</span><h1>{data?.branch_name || data?.name || user.name}</h1><p>{data?.restaurant_name || 'Your branch workspace'}{queue?.business_date ? ` ? Business date: ${queue.business_date}` : ''}</p></div><button className="btn secondary" disabled={loading} onClick={()=>setRefresh(value=>value+1)}><RefreshCw size={16}/>{loading?'Loading...':'Refresh'}</button></div>
    {error && <div className="profile-error" role="alert">{error}<button className="btn secondary" disabled={loading} onClick={()=>setRefresh(value=>value+1)}>Try again</button></div>}
    <div className="stats-grid four-columns" aria-busy={loading}>{stats.map(([Icon,label,value,hint,color])=><article className="stat-card" key={label}><div className={`stat-icon ${color}`}><Icon/></div><span>{label}</span><strong>{loading?'-':count(value)}</strong><small>{hint}</small></article>)}</div>
    <OverviewGraph />
    <div className="branch-dashboard-panels">
      <section className="panel"><header><span><Clock3/></span><div><h2>Today?s opening hours</h2><p>{timing?.day_of_week?.toLowerCase() || 'Today'}</p></div></header><div className="branch-dashboard-body"><strong>{loading?'Loading...':!timing || timing.is_set===false?'Schedule not set':timing.is_closed?'Closed today':`${timing.open_time || '-'} ? ${timing.close_time || '-'}`}</strong><p>Queue: {data?.queue_enabled===true?'Enabled':data?.queue_enabled===false?'Disabled':'-'}</p>{data?.address && <p>{data.address}</p>}</div></section>
      <section className="panel"><header><div><h2>Today?s queue status</h2><p>Queue entries by status</p></div></header><div className="branch-dashboard-status">{['WAITING','CALLED','SEATED','COMPLETED'].map(status=><div key={status}><span className={`registry-status ${status.toLowerCase()}`}>{status.charAt(0)+status.slice(1).toLowerCase()}</span><strong>{loading?'-':count(queue?.status_breakdown?.[status])}</strong></div>)}</div></section>
    </div>
  </>;
}
