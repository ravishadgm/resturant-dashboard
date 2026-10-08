import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, CalendarDays, Clock3, ListOrdered, Timer, Users, XCircle } from 'lucide-react';
import { dashboardApi } from '../../api/dashboardApi';
import { customerSeries } from '../../utils/branchDashboard';
import { DailyCustomerChart, DistributionChart } from './BranchDashboardCharts';

export default function BranchDashboard() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const invalid = Boolean((from && !to) || (to && !from) || (from && to && from > to));
  useEffect(() => {
    if (invalid) return;
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    dashboardApi.getBranchDashboard({ from, to }, { signal: controller.signal })
      .then(result => {
        if (!active) return;
        if (result?.success === false) throw new Error(result.message || 'Unable to load branch dashboard.');
        const data = result?.data;
        if (!data?.branch || !data.summary || !Array.isArray(data.daily) || !data.tables || !data.queue) {
          throw new Error('The server returned an invalid branch dashboard response.');
        }
        setResponse(result);
      })
      .catch(err => { if (active) setError(err.message || 'Unable to load branch dashboard.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [from, to, invalid, retry]);
  const { branch = {}, tables = {}, queue = {}, summary = {} } = response?.data || {};
  const daily = response?.data.daily || [];
  const counts = { walk_in: Number(summary.walk_in_count || 0), scheduled: Number(summary.scheduled_count || 0), cancelled: Number(summary.cancelled_count || 0) };
  const total = Number(summary.total_customers || 0);
  const stats = [
    [Users, 'Total Customers', total, 'total', 'blue'],
    [ListOrdered, 'Walk-ins (Queue)', counts.walk_in, 'walk_in', 'blue'],
    [CalendarDays, 'Scheduled', counts.scheduled, 'scheduled', 'green'],
    [XCircle, 'Cancelled', counts.cancelled, 'cancelled', 'red'],
  ];
  const tableSegments = [
    { key: 'available', label: 'Available', value: tables.available, color: '#10b981' },
    { key: 'occupied', label: 'Occupied', value: tables.occupied, color: '#2186eb' },
    { key: 'reserved', label: 'Reserved', value: tables.reserved, color: '#f5a623' },
  ];
  return <div className="reference-dashboard">
    <header className="reference-dashboard-header">
      <div><span className="reference-eyebrow">BRANCH DASHBOARD</span><h1>{branch.branch_name || 'Branch overview'}</h1><p>{branch.restaurant_name} · Single branch overview</p></div>
      <div className="overview-date-filters">
        <label className="field">From date<input type="date" value={from} onChange={event => setFrom(event.target.value)} /></label>
        <label className="field">To date<input type="date" value={to} onChange={event => setTo(event.target.value)} /></label>
        <button className="btn secondary" onClick={() => { setFrom(''); setTo(''); setRetry(value => value + 1); }}>Reset</button>
      </div>
    </header>
    {invalid ? <p className="profile-error" role="alert">Select both dates. From date must be on or before To date.</p> : loading ? <p className="reference-empty" role="status">Loading branch dashboard...</p> : error ? <div className="profile-error" role="alert">{error} <button className="btn secondary" onClick={() => setRetry(value => value + 1)}>Retry</button></div> : response && <>
      <div className="reference-summary-grid" aria-live="polite">
        {stats.map(([Icon, label, value, key, color]) => {
          const growth = summary.growth?.[key];
          return <article className="reference-summary-card" key={key}>
            <div className="reference-summary-label"><span className={'reference-stat-icon ' + color}><Icon size={18} /></span>{label}</div>
            <strong>{value.toLocaleString('en-IN')}</strong>
            {growth != null && Number.isFinite(Number(growth)) ? <><span className={'reference-growth ' + (growth >= 0 ? 'positive' : 'negative')}>{growth >= 0 ? <ArrowUp size={13} /> : <ArrowDown size={13} />}{Math.abs(growth)}%</span><small>vs previous period</small></> : <small>In selected date range</small>}
          </article>;
        })}
      </div>
      <div className="reference-customer-grid">
        <section className="reference-card"><h2>Customer Distribution</h2>
          {total ? <DistributionChart key={from + to} segments={customerSeries.map(item => ({ ...item, value: counts[item.key] }))} total={total} centerLabel="Total" /> :
          <p className="reference-empty">No customer records in this period.</p>}
        </section>
        <section className="reference-card"><h2>Daily Customer Count</h2><DailyCustomerChart key={from + to} rows={daily} series={customerSeries} /></section>
      </div>
    <div className="reference-current-grid">
      <section className="reference-card"><h2>Table Status <small>(Current)</small></h2><DistributionChart segments={tableSegments} total={Number(tables.total || 0)} centerLabel="Tables" /></section>
      <section className="reference-card"><h2>Queue Status{queue.business_date && <small> ({queue.business_date})</small>}</h2><p className="reference-current-note">Current snapshot, independent of the selected dates.</p>
        <div className="reference-queue-list">
          {[[Users, 'Current Waiting', queue.current_waiting + ' Groups', 'red'], [Clock3, 'Avg. Waiting Time', queue.avg_waiting_minutes + ' Minutes', 'red'], [Timer, 'Next Table In', '~ ' + queue.next_table_in_minutes + ' Minutes', 'violet']].map(([Icon, label, value, color]) =>
            <div key={label}><span className={'reference-stat-icon ' + color}><Icon size={21} /></span><div><span>{label}</span><strong>{value}</strong></div></div>)}
        </div>
      </section>
    </div>
    </>}
  </div>;
}
