import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, CalendarDays, ListOrdered, Users, XCircle } from 'lucide-react';
import { dashboardApi } from '../../api/dashboardApi';
import { adminSeries } from '../../utils/adminDashboard';
import { AdminDailyChart, AdminDonut } from './AdminDashboardCharts';

export default function AdminDashboard() {
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
    dashboardApi.getAdminDashboard({ from, to }, { signal: controller.signal })
      .then(result => {
        if (!active) return;
        if (result?.success === false) throw new Error(result.message || 'Unable to load admin dashboard.');
        if (!result?.data?.summary || !Array.isArray(result.data.daily) || !Array.isArray(result.data.top_restaurants)) {
          throw new Error('The server returned an invalid admin dashboard response.');
        }
        setResponse(result);
      })
      .catch(err => { if (active) setError(err.message || 'Unable to load admin dashboard.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [from, to, invalid, retry]);
  const summary = response?.data.summary || {};
  const daily = response?.data.daily || [];
  const counts = { walk_in: Number(summary.walk_in_count || 0), scheduled: Number(summary.scheduled_count || 0), cancelled: Number(summary.cancelled_count || 0) };
  const total = Number(summary.total_customers || 0);
  const restaurants = (response?.data.top_restaurants || []).map(row => ({ ...row, total_customers: Number(row.total_customers || 0), conversion: Number(row.conversion || 0) }));
  const periodFrom = from || daily[0]?.date || '';
  const periodTo = to || daily.at(-1)?.date || '';
  const stats = [
    [Users, 'Total Customers', total, 'total', 'blue'],
    [ListOrdered, 'Walk-ins (Queue)', counts.walk_in, 'walk_in', 'blue'],
    [CalendarDays, 'Scheduled', counts.scheduled, 'scheduled', 'green'],
    [XCircle, 'Cancelled', counts.cancelled, 'cancelled', 'red'],
  ];
  const segments = [
    { key: 'walk_in', label: 'Walk-in (Queue)', color: '#2186eb', value: counts.walk_in },
    { key: 'scheduled', label: 'Scheduled', color: '#10b981', value: counts.scheduled },
    { key: 'cancelled', label: 'Cancelled', color: '#f05264', value: counts.cancelled },
  ];
  return <div className="admin-reference-dashboard">
    <header className="admin-reference-header">
      <div><span>ADMIN OVERVIEW</span><h1>Dashboard</h1><p>Customer activity across all restaurants.{response?.data.business_date && <> Business date: {response.data.business_date}.</>}</p></div>
      <div className="admin-date-filters">
        <label>From date<input type="date" value={from} onChange={event => setFrom(event.target.value)} /></label>
        <label>To date<input type="date" value={to} onChange={event => setTo(event.target.value)} /></label>
        <button className="btn secondary" onClick={() => { setFrom(''); setTo(''); setRetry(value => value + 1); }}>Reset</button>
      </div>
    </header>
    {invalid ? <p className="profile-error" role="alert">Select both dates. From date must be on or before To date.</p> : loading ? <p className="admin-empty" role="status">Loading admin dashboard...</p> : error ? <div className="profile-error" role="alert">{error} <button className="btn secondary" onClick={() => setRetry(value => value + 1)}>Retry</button></div> : response && <>
      <div className="admin-summary-grid" aria-live="polite">
        {stats.map(([Icon, label, value, key, color]) => {
          const growth = summary.growth?.[key];
          return <article className="admin-summary-card" key={key}>
            <div className="admin-summary-label"><span className={'admin-stat-icon ' + color}><Icon size={18} /></span>{label}</div>
            <strong>{value.toLocaleString('en-IN')}</strong>
            {growth != null && Number.isFinite(Number(growth)) ? <><span className={'admin-growth ' + (growth >= 0 ? 'positive' : 'negative')}>{growth >= 0 ? <ArrowUp size={13} /> : <ArrowDown size={13} />}{Math.abs(growth)}%</span><small>vs previous period</small></> : <small>In selected date range</small>}
          </article>;
        })}
      </div>
      <div className="admin-customer-grid">
        <section className="admin-reference-card"><h2>Customer Distribution</h2>
          {total ? <AdminDonut key={from + to} segments={segments} total={total} /> : <p className="admin-empty">No customers for the selected period.</p>}
        </section>
        <section className="admin-reference-card"><h2>Daily Customer Count</h2><AdminDailyChart key={from + to} rows={daily} series={adminSeries} /></section>
      </div>
      <section className="admin-reference-card admin-top-restaurants"><h2>Top Restaurants <small>(by Customers)</small></h2>
        <div className="admin-table-scroll"><table><caption>Restaurant performance{periodFrom && periodTo ? ` for ${periodFrom} to ${periodTo}` : ''}</caption><thead><tr><th scope="col">#</th><th scope="col">Restaurant</th><th scope="col">Branches</th><th scope="col">Total Customers</th><th scope="col">Cancelled</th><th scope="col">Conversion</th></tr></thead><tbody>
          {restaurants.length ? restaurants.map((row, i) => <tr key={row.restaurant_id}><td>{i + 1}</td><th scope="row">{row.restaurant_name}</th><td>{row.branches}</td><td>{row.total_customers.toLocaleString('en-IN')}</td><td>{row.cancelled_count}</td><td><span className="admin-conversion">{row.conversion.toFixed(1)}%</span></td></tr>) : <tr><td colSpan="6" className="admin-empty">No restaurant activity in the selected range.</td></tr>}
        </tbody></table></div>
      </section>
    </>}
  </div>;
}
