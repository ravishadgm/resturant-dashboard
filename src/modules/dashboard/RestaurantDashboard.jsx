import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, CalendarDays, ListOrdered, Users, XCircle } from 'lucide-react';
import { dashboardApi } from '../../api/dashboardApi';
import { restaurantSeries } from '../../utils/restaurantDashboard';
import { RestaurantDailyChart, RestaurantDistribution } from './RestaurantDashboardCharts';

export default function RestaurantDashboard() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [branchId, setBranchId] = useState('all');
  const [response, setResponse] = useState(null);
  const [branchOptions, setBranchOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const invalid = Boolean(from !== '' && to === '' || to !== '' && from === '' || from && to && from > to);
  useEffect(() => {
    if (invalid) return;
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    dashboardApi.getRestaurantDashboard({ from, to, branch_id: branchId }, { signal: controller.signal })
      .then(result => {
        if (!active) return;
        if (result?.success === false) throw new Error(result.message || 'Unable to load dashboard.');
        if (!result?.data?.restaurant || !result.data.summary || !Array.isArray(result.data.daily) || !Array.isArray(result.data.branches)) {
          throw new Error('The server returned an invalid dashboard response.');
        }
        setResponse(result);
        if (branchId === 'all') setBranchOptions(result.data.branches);
      })
      .catch(err => { if (active) setError(err.message || 'Unable to load dashboard.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [from, to, branchId, invalid, retry]);
  const summary = response?.data.summary;
  const daily = response?.data.daily || [];
  const counts = { walk_in: Number(summary?.walk_in_count || 0), scheduled: Number(summary?.scheduled_count || 0), cancelled: Number(summary?.cancelled_count || 0) };
  const total = Number(summary?.total_customers || 0);
  const branches = (response?.data.branches || []).map(branch => ({ ...branch, customers: Number(branch.total_customers || 0), conversion: Number(branch.conversion || 0) }));
  const periodFrom = from || daily[0]?.date || '';
  const periodTo = to || daily.at(-1)?.date || '';
  const stats = [
    [Users, 'Total Customers', total, 'total', 'blue'],
    [ListOrdered, 'Walk-ins (Queue)', counts.walk_in, 'walk_in', 'blue'],
    [CalendarDays, 'Scheduled', counts.scheduled, 'scheduled', 'green'],
    [XCircle, 'Cancelled', counts.cancelled, 'cancelled', 'red'],
  ];
  return <div className="restaurant-reference-dashboard">
    <header className="rd-header">
      <div><span>RESTAURANT OVERVIEW</span><h1>{response?.data.restaurant.restaurant_name || 'Restaurant overview'}</h1><p>Customer activity across your restaurant branches.</p></div>
      <div className="rd-filters">
        <label>From date<input type="date" value={from} onChange={event => setFrom(event.target.value)} /></label>
        <label>To date<input type="date" value={to} onChange={event => setTo(event.target.value)} /></label>
        <label>Branch<select value={branchId} onChange={event => setBranchId(event.target.value)}><option value="all">All Branches</option>{branchOptions.map(branch => <option key={branch.branch_id} value={branch.branch_id}>{branch.branch_name}</option>)}</select></label>
        <button className="btn secondary" onClick={() => { setFrom(''); setTo(''); setBranchId('all'); }}>Reset</button>
      </div>
    </header>
    {invalid ? <p className="profile-error" role="alert">Select both dates. From date must be on or before To date.</p> : loading ? <p className="rd-empty" role="status">Loading restaurant dashboard...</p> : error ? <div className="profile-error" role="alert">{error} <button className="btn secondary" onClick={() => setRetry(value => value + 1)}>Retry</button></div> : response && <>
      <div className="rd-summary-grid" aria-live="polite">
        {stats.map(([Icon, label, value, key, color]) => {
          const growth = summary.growth?.[key];
          return <article className="rd-summary-card" key={key}>
            <div className="rd-summary-label"><span className={'rd-stat-icon ' + color}><Icon size={18} /></span>{label}</div>
            <strong>{value.toLocaleString('en-IN')}</strong>
            {growth != null && Number.isFinite(Number(growth)) ? <><span className={'rd-growth ' + (growth >= 0 ? 'positive' : 'negative')}>{growth >= 0 ? <ArrowUp size={13} /> : <ArrowDown size={13} />}{Math.abs(growth)}%</span><small>vs previous period</small></> : <small>In selected date range</small>}
          </article>;
        })}
      </div>
      <div className="rd-customer-grid">
        <section className="rd-card"><h2>Customer Distribution</h2>
          {total ? <RestaurantDistribution key={from + to + branchId} segments={restaurantSeries.map(item => ({ ...item, value: counts[item.key] }))} total={total} /> : <p className="rd-empty">No customers for the selected period.</p>}
        </section>
        <section className="rd-card"><h2>Daily Customer Count</h2><RestaurantDailyChart key={from + to + branchId} rows={daily} series={restaurantSeries} /></section>
      </div>
      <section className="rd-card"><h2>Branch Performance</h2>
        <div className="rd-table-scroll"><table><caption>Branch performance{periodFrom && periodTo ? ` for ${periodFrom} to ${periodTo}` : ''}</caption><thead><tr><th scope="col">#</th><th scope="col">Branch</th><th scope="col">Customers</th><th scope="col">Walk-in</th><th scope="col">Scheduled</th><th scope="col">Cancelled</th><th scope="col">Conversion</th></tr></thead><tbody>
          {branches.map((row, i) => <tr key={row.branch_id}><td>{i + 1}</td><th scope="row">{row.branch_name}</th><td>{row.customers.toLocaleString('en-IN')}</td><td>{row.walk_in_count}</td><td>{row.scheduled_count}</td><td>{row.cancelled_count}</td><td><span className="rd-conversion">{row.customers ? row.conversion.toFixed(1) + '%' : '—'}</span></td></tr>)}
          {branches.length === 0 && <tr><td colSpan={7}>No branches for the selected period.</td></tr>}
        </tbody></table></div>
      </section>
    </>}
  </div>;
}
