import { useEffect, useState } from 'react';
import { CheckCircle2, Clock3, Settings, Store, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { entityService } from '../../services/entityService';
import { ROLES } from '../../utils/constants';

export default function Dashboard() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ managers: 0, settings: 0, restaurants: 0 });

  useEffect(() => {
    Promise.all(['managers', 'settings', 'restaurants'].map(entityService.list)).then(([managers, settings, restaurants]) => {
      setCounts({ managers: managers.length, settings: settings.length, restaurants: restaurants.length });
    });
  }, []);

  const isSuperAdmin = user.role === ROLES.SUPER_ADMIN;
  const stats = isSuperAdmin
    ? [
        [Store, 'Total restaurants', counts.restaurants, '+8%', 'violet'],
        
      ]
    : [
        [Users, 'Total managers', counts.managers, '+12%', 'violet'],
        [Settings, 'Active settings', counts.settings, 'Up to date', 'green'],
      ];

  return (
    <>
      <div className="dashboard-welcome">
        <div>
          <span>FRIDAY, 4 SEPTEMBER</span>
          <h1>Good morning, {user.name.split(' ')[0]}.</h1>
          <p>Here’s an overview of your workspace.</p>
        </div>
        <button className="btn secondary"><Clock3 size={17} /> Last 30 days</button>
      </div>

      <div className={`stats-grid ${stats.length === 2 ? 'two-columns' : ''}`}>
        {stats.map(([Icon, label, value, delta, color]) => (
          <article className="stat-card" key={label}>
            <div className={`stat-icon ${color}`}><Icon /></div>
            <span>{label}</span>
            <strong>{value}</strong>
            <small><b>{delta}</b> from last month</small>
          </article>
        ))}
      </div>
    </>
  );
}
