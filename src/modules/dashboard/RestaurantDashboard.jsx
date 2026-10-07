import { useState } from 'react';
import { ArrowDown, ArrowUp, CalendarDays, ListOrdered, Users, XCircle } from 'lucide-react';
import response from '../../services/restaurantDashboardResponse.json';
import { restaurantSeries, getRestaurantPeriod } from '../../utils/restaurantDashboard';
import { RestaurantDailyChart, RestaurantDistribution } from './RestaurantDashboardCharts';

export default function RestaurantDashboard() {
  const [from, setFrom] = useState(response.from);
  const [to, setTo] = useState(response.to);
  const [branchId, setBranchId] = useState('all');
  const invalid = !from || !to || from > to;
  const { daily, counts, total, branches } = getRestaurantPeriod(response, from, to, branchId);
  const fullPeriod = from === response.from && to === response.to && branchId === 'all';
  const stats = [
    [Users, 'Total Customers', total, 'total', 'blue'],
    [ListOrdered, 'Walk-ins (Queue)', counts.walk_in, 'walk_in', 'blue'],
    [CalendarDays, 'Scheduled', counts.scheduled, 'scheduled', 'green'],
    [XCircle, 'Cancelled', counts.cancelled, 'cancelled', 'red'],
  ];
  return <div className="restaurant-reference-dashboard">
    <header className="rd-header">
      <div><span>RESTAURANT OVERVIEW</span><h1>{response.data.restaurant.restaurant_name}</h1><p>Customer activity across your restaurant branches.</p></div>
      <div className="rd-filters">
        <label>From date<input type="date" value={from} onChange={event => setFrom(event.target.value)} /></label>
        <label>To date<input type="date" value={to} onChange={event => setTo(event.target.value)} /></label>
        <label>Branch<select value={branchId} onChange={event => setBranchId(event.target.value)}><option value="all">All Branches</option>{response.data.branches.map(branch => <option key={branch.branch_id} value={branch.branch_id}>{branch.branch_name}</option>)}</select></label>
        <button className="btn secondary" onClick={() => { setFrom(response.from); setTo(response.to); setBranchId('all'); }}>Reset</button>
      </div>
    </header>
    {invalid ? <p className="profile-error" role="alert">Select both dates. From date must be on or before To date.</p> : <>
      <div className="rd-summary-grid" aria-live="polite">
        {stats.map(([Icon, label, value, key, color]) => {
          const growth = response.data.summary.growth[key];
          return <article className="rd-summary-card" key={key}>
            <div className="rd-summary-label"><span className={'rd-stat-icon ' + color}><Icon size={18} /></span>{label}</div>
            <strong>{value.toLocaleString('en-IN')}</strong>
            {fullPeriod ? <><span className={'rd-growth ' + (growth >= 0 ? 'positive' : 'negative')}>{growth >= 0 ? <ArrowUp size={13} /> : <ArrowDown size={13} />}{Math.abs(growth)}%</span><small>vs previous period</small></> : <small>In selected date range</small>}
          </article>;
        })}
      </div>
      <div className="rd-customer-grid">
        <section className="rd-card"><h2>Customer Distribution</h2>
          {total ? <RestaurantDistribution key={from + to + branchId} segments={restaurantSeries.map(item => ({ ...item, value: counts[item.key] }))} total={total} /> : <p className="rd-empty">No customers for the selected dates. Sample dates: {response.from} to {response.to}.</p>}
        </section>
        <section className="rd-card"><h2>Daily Customer Count</h2><RestaurantDailyChart key={from + to + branchId} rows={daily} series={restaurantSeries} /></section>
      </div>
      <section className="rd-card"><h2>Branch Performance</h2>
        <div className="rd-table-scroll"><table><caption>Branch performance for {from} to {to}</caption><thead><tr><th scope="col">#</th><th scope="col">Branch</th><th scope="col">Customers</th><th scope="col">Walk-in</th><th scope="col">Scheduled</th><th scope="col">Cancelled</th><th scope="col">Conversion</th></tr></thead><tbody>
          {branches.map((row, i) => <tr key={row.branch_id}><td>{i + 1}</td><th scope="row">{row.branch_name}</th><td>{row.customers.toLocaleString('en-IN')}</td><td>{row.walk_in_count}</td><td>{row.scheduled_count}</td><td>{row.cancelled_count}</td><td><span className="rd-conversion">{row.customers ? row.conversion.toFixed(1) + '%' : '—'}</span></td></tr>)}
        </tbody></table></div>
      </section>
    </>}
  </div>;
}
