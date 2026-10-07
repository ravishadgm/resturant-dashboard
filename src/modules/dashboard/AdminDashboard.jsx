import { useState } from 'react';
import { ArrowDown, ArrowUp, CalendarDays, ListOrdered, Users, XCircle } from 'lucide-react';
import response from '../../services/adminDashboardResponse.json';
import restaurantDetails from '../../services/adminDashboardDailyRestaurants.json';
import { adminSeries, getAdminPeriod } from '../../utils/adminDashboard';
import { AdminDailyChart, AdminDonut } from './AdminDashboardCharts';

export default function AdminDashboard() {
  const [from, setFrom] = useState(response.from);
  const [to, setTo] = useState(response.to);
  const invalid = !from || !to || from > to;
  const { daily, counts, total, restaurants } = getAdminPeriod(response, restaurantDetails, from, to);
  const fullPeriod = from === response.from && to === response.to;
  const stats = [
    [Users, 'Total Customers', total, 'total', 'blue'],
    [ListOrdered, 'Walk-ins (Queue)', counts.walk_in, 'walk_in', 'blue'],
    [CalendarDays, 'Scheduled', counts.scheduled, 'scheduled', 'green'],
    [XCircle, 'Cancelled', counts.cancelled, 'cancelled', 'red'],
  ];
  const segments = [
    { key: 'walk_in', label: 'Walk-in (not cancelled)', color: '#2186eb', value: counts.walk_in - counts.cancelled },
    { key: 'scheduled', label: 'Scheduled', color: '#10b981', value: counts.scheduled },
    { key: 'cancelled', label: 'Cancelled', color: '#f05264', value: counts.cancelled },
  ];
  return <div className="admin-reference-dashboard">
    <header className="admin-reference-header">
      <div><span>ADMIN OVERVIEW</span><h1>Dashboard</h1><p>Customer activity across all restaurants.</p></div>
      <div className="admin-date-filters">
        <label>From date<input type="date" value={from} onChange={event => setFrom(event.target.value)} /></label>
        <label>To date<input type="date" value={to} onChange={event => setTo(event.target.value)} /></label>
        <button className="btn secondary" onClick={() => { setFrom(response.from); setTo(response.to); }}>Reset</button>
      </div>
    </header>
    {invalid ? <p className="profile-error" role="alert">Select both dates. From date must be on or before To date.</p> : <>
      <div className="admin-summary-grid" aria-live="polite">
        {stats.map(([Icon, label, value, key, color]) => {
          const growth = response.data.summary.growth[key];
          return <article className="admin-summary-card" key={key}>
            <div className="admin-summary-label"><span className={'admin-stat-icon ' + color}><Icon size={18} /></span>{label}</div>
            <strong>{value.toLocaleString('en-IN')}</strong>
            {fullPeriod ? <><span className={'admin-growth ' + (growth >= 0 ? 'positive' : 'negative')}>{growth >= 0 ? <ArrowUp size={13} /> : <ArrowDown size={13} />}{Math.abs(growth)}%</span><small>vs previous period</small></> : <small>In selected date range</small>}
          </article>;
        })}
      </div>
      <div className="admin-customer-grid">
        <section className="admin-reference-card"><h2>Customer Distribution</h2>
          {total ? <AdminDonut key={from + to} segments={segments} total={total} /> : <p className="admin-empty">No customers for the selected dates. Sample dates: {response.from} to {response.to}.</p>}
        </section>
        <section className="admin-reference-card"><h2>Daily Customer Count</h2><AdminDailyChart key={from + to} rows={daily} series={adminSeries} /></section>
      </div>
      <section className="admin-reference-card admin-top-restaurants"><h2>Top Restaurants <small>(by Customers)</small></h2>
        <div className="admin-table-scroll"><table><caption>Restaurant performance for {from} to {to}</caption><thead><tr><th scope="col">#</th><th scope="col">Restaurant</th><th scope="col">Branches</th><th scope="col">Total Customers</th><th scope="col">Cancelled</th><th scope="col">Conversion</th></tr></thead><tbody>
          {restaurants.length ? restaurants.map((row, i) => <tr key={row.restaurant_id}><td>{i + 1}</td><th scope="row">{row.restaurant_name}</th><td>{row.branches}</td><td>{row.total_customers.toLocaleString('en-IN')}</td><td>{row.cancelled_count}</td><td><span className="admin-conversion">{row.conversion.toFixed(1)}%</span></td></tr>) : <tr><td colSpan="6" className="admin-empty">No restaurant activity in the selected range.</td></tr>}
        </tbody></table></div>
      </section>
    </>}
  </div>;
}
