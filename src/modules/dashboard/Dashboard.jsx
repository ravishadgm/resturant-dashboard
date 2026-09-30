import { useEffect, useState } from 'react';
import { Armchair, Building2, ListOrdered, MapPin, Store, UserRound, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dashboardApi } from '../../api/dashboardApi';
import { entityService } from '../../services/entityService';
import { ROLES } from '../../utils/constants';

export default function Dashboard() {
  const { user } = useAuth();
  const isSuperAdmin = user.role === ROLES.SUPER_ADMIN;
  const [counts, setCounts] = useState({ users:0, managers:0, restaurants:0, branches:0, customers:0, tables:0, queue:0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    const loadDashboard = async () => {
      try {
        if (isSuperAdmin) {
          const response = await dashboardApi.getAdminDashboard();
          const data = response?.data ?? response;
          if (!active) return;
          setCounts(previous => ({
            ...previous,
            users: Number(data?.users ?? 0),
            restaurants: Number(data?.restaurants ?? 0),
            branches: Number(data?.branches ?? 0),
            queue: Number(data?.todayQueue ?? 0),
          }));
          return;
        }

        const [managers,restaurants,branches,customers,tables,queue] = await Promise.all(
          ['managers','restaurants','branches','customers','tables','queue'].map(entityService.list)
        );
        if (!active) return;
        setCounts(previous => ({
          ...previous,
          managers: managers.length,
          restaurants: restaurants.length,
          branches: branches.length,
          customers: customers.length,
          tables: tables.length,
          queue: queue.filter(row => ['waiting','notified'].includes(row.status)).length,
        }));
      } catch (dashboardError) {
        if (active) setError(dashboardError.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDashboard();
    return () => { active = false; };
  }, [isSuperAdmin]);

  const roleStats={
    [ROLES.SUPER_ADMIN]:[[Users,'Users',counts.users,'Registered users','violet'],[Store,'Restaurants',counts.restaurants,'Restaurant accounts','blue'],[Building2,'Branches',counts.branches,'All locations','green'],[ListOrdered,"Today's queue",counts.queue,'Active today','violet']],
    [ROLES.RESTAURANT]:[[Building2,'My branches',counts.branches,'Owned locations','violet'],[Users,'Managers',counts.managers,'Branch staff','blue'],[Armchair,'Tables',counts.tables,'Capacity managed','green']],
    [ROLES.MANAGER]:[[ListOrdered,"Today's waiting",counts.queue,'Current branch','violet'],[UserRound,'Customers',counts.customers,'Reusable accounts','blue'],[Armchair,'Tables',counts.tables,'Current branch','green']],
    [ROLES.CUSTOMER]:[[MapPin,'Nearby branches',counts.branches,'Location based','violet'],[ListOrdered,'Waiting parties',counts.queue,'Current business day','blue']]
  };
  const stats=roleStats[user.role]||roleStats[ROLES.CUSTOMER];

  return (
    <>
      <div className="dashboard-welcome">
        <div>
          <span>{new Intl.DateTimeFormat('en-IN',{weekday:'long',day:'numeric',month:'long'}).format(new Date()).toUpperCase()}</span>
          <h1>Good morning, {(user.name || 'User').split(' ')[0]}.</h1>
          <p>Here’s an overview of your workspace.</p>
        </div>
      </div>

      {error && <div className="login-error">{error}</div>}
      <div className={`stats-grid ${stats.length === 2 ? 'two-columns' : ''} ${stats.length === 4 ? 'four-columns' : ''}`}>
        {stats.map(([Icon, label, value, delta, color]) => (
          <article className="stat-card" key={label}>
            <div className={`stat-icon ${color}`}><Icon /></div>
            <span>{label}</span>
            <strong>{loading ? '—' : value}</strong>
            <small>{delta}</small>
          </article>
        ))}
      </div>
    </>
  );
}
