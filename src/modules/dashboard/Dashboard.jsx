import { useEffect, useState } from 'react';
import { Armchair, Building2, ListOrdered, MapPin, Smartphone, Store, UserRound, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { entityService } from '../../services/entityService';
import { ROLES } from '../../utils/constants';

export default function Dashboard() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ managers:0, restaurants:0, branches:0, customers:0, tables:0, queue:0, tokens:0 });

  useEffect(() => {
    Promise.all(['managers','restaurants','branches','customers','tables','queue','tokens'].map(entityService.list)).then(([managers,restaurants,branches,customers,tables,queue,tokens]) => {
      setCounts({managers:managers.length,restaurants:restaurants.length,branches:branches.length,customers:customers.length,tables:tables.length,queue:queue.filter(row=>['waiting','notified'].includes(row.status)).length,tokens:tokens.length});
    });
  }, []);

  const isSuperAdmin = user.role === ROLES.SUPER_ADMIN;
  const roleStats={
    [ROLES.SUPER_ADMIN]:[[Store,'Restaurants',counts.restaurants,'All accounts','violet'],[Building2,'Branches',counts.branches,'All locations','blue'],[ListOrdered,'Waiting now',counts.queue,'All branches','green']],
    [ROLES.RESTAURANT]:[[Building2,'My branches',counts.branches,'Owned locations','violet'],[Users,'Managers',counts.managers,'Branch staff','blue'],[Armchair,'Tables',counts.tables,'Capacity managed','green']],
    [ROLES.MANAGER]:[[ListOrdered,"Today's waiting",counts.queue,'Current branch','violet'],[UserRound,'Customers',counts.customers,'Reusable accounts','blue'],[Armchair,'Tables',counts.tables,'Current branch','green']],
    [ROLES.CUSTOMER]:[[MapPin,'Nearby branches',counts.branches,'Location based','violet'],[ListOrdered,'Waiting parties',counts.queue,'Current business day','blue'],[Smartphone,'Registered devices',counts.tokens,'Push notifications','green']]
  };
  const stats=roleStats[user.role]||roleStats[ROLES.CUSTOMER];

  return (
    <>
      <div className="dashboard-welcome">
        <div>
          <span>{new Intl.DateTimeFormat('en-IN',{weekday:'long',day:'numeric',month:'long'}).format(new Date()).toUpperCase()}</span>
          <h1>Good morning, {user.name.split(' ')[0]}.</h1>
          <p>Here’s an overview of your workspace.</p>
        </div>
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
