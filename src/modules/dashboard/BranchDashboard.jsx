import { useState } from 'react';
import { ArrowDown, ArrowUp, CalendarDays, Clock3, ListOrdered, Timer, Users, XCircle } from 'lucide-react';
import response from '../../services/branchDashboardResponse.json';
import { customerSeries, getBranchPeriod } from '../../utils/branchDashboard';
import { DailyCustomerChart, DistributionChart } from './BranchDashboardCharts';

export default function BranchDashboard() {
  const [from, setFrom] = useState(response.from);
  const [to, setTo] = useState(response.to);
  const { branch, tables, queue, summary } = response.data;
  const invalid = !from || !to || from > to;
  const { daily, counts, total } = getBranchPeriod(response, from, to);
  const fullPeriod = from === response.from && to === response.to;
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
      <div><span className="reference-eyebrow">BRANCH DASHBOARD</span><h1>{branch.branch_name}</h1><p>{branch.restaurant_name} · Single branch overview</p></div>
      <div className="overview-date-filters">
        <label className="field">From date<input type="date" value={from} onChange={event => setFrom(event.target.value)} /></label>
        <label className="field">To date<input type="date" value={to} onChange={event => setTo(event.target.value)} /></label>
        <button className="btn secondary" onClick={() => { setFrom(response.from); setTo(response.to); }}>Reset</button>
      </div>
    </header>
    {invalid ? <p className="profile-error" role="alert">Select both dates. From date must be on or before To date.</p> : <>
      <div className="reference-summary-grid" aria-live="polite">
        {stats.map(([Icon, label, value, key, color]) => {
          const growth = summary.growth[key];
          return <article className="reference-summary-card" key={key}>
            <div className="reference-summary-label"><span className={'reference-stat-icon ' + color}><Icon size={18} /></span>{label}</div>
            <strong>{value.toLocaleString('en-IN')}</strong>
            {fullPeriod ? <><span className={'reference-growth ' + (growth >= 0 ? 'positive' : 'negative')}>{growth >= 0 ? <ArrowUp size={13} /> : <ArrowDown size={13} />}{Math.abs(growth)}%</span><small>vs previous period</small></> : <small>In selected date range</small>}
          </article>;
        })}
      </div>
      <div className="reference-customer-grid">
        <section className="reference-card"><h2>Customer Distribution</h2>
          {total ? <DistributionChart key={from + to} segments={customerSeries.map(item => ({ ...item, value: counts[item.key] }))} total={total} centerLabel="Total" /> :
          <p className="reference-empty">No customer records in this date range. Sample dates: {response.from} to {response.to}.</p>}
        </section>
        <section className="reference-card"><h2>Daily Customer Count</h2><DailyCustomerChart key={from + to} rows={daily} series={customerSeries} /></section>
      </div>
    </>}
    <div className="reference-current-grid">
      <section className="reference-card"><h2>Table Status <small>(Current)</small></h2><DistributionChart segments={tableSegments} total={tables.total} centerLabel="Tables" /></section>
      <section className="reference-card"><h2>Today's Queue Status</h2><p className="reference-current-note">Current snapshot, independent of the selected dates.</p>
        <div className="reference-queue-list">
          {[[Users, 'Current Waiting', queue.current_waiting + ' Groups', 'red'], [Clock3, 'Avg. Waiting Time', queue.avg_waiting_minutes + ' Minutes', 'red'], [Timer, 'Next Table In', '~ ' + queue.next_table_in_minutes + ' Minutes', 'violet']].map(([Icon, label, value, color]) =>
            <div key={label}><span className={'reference-stat-icon ' + color}><Icon size={21} /></span><div><span>{label}</span><strong>{value}</strong></div></div>)}
        </div>
      </section>
    </div>
  </div>;
}
