import { useCallback, useEffect, useRef, useState } from 'react';
import { branchCustomerApi } from '../../api/branchCustomerApi';
import PageHeader from '../../components/common/PageHeader';
import ServerTable from '../../components/common/ServerTable';

const fields = [
  { name: 'name', label: 'Customer' },
  { name: 'phone', label: 'Phone' },
  { name: 'email', label: 'Email' },
  { name: 'restaurant_name', label: 'Restaurant' },
  { name: 'branch_name', label: 'Branch' },
  { name: 'city', label: 'City' },
  { name: 'last_visit_date', label: 'Last visit date' },
  { name: 'total_visits', label: 'Total visits' },
  { name: 'last_status', label: 'Last queue status' },
];
const columns = fields.map(field => ({
  key: field.name,
  label: field.label,
  render: value => field.name === 'last_status'
    ? <span className={`registry-status ${String(value || '').toLowerCase()}`}>{value || '-'}</span>
    : value == null || value === '' ? '-' : String(value),
}));

export default function CustomerList() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const query = useRef({ page: 1, limit: 10, search: '' });
  const requestVersion = useRef(0);
  const load = useCallback(async (params = query.current) => {
    query.current = params;
    const version = ++requestVersion.current;
    setLoading(true);
    setError('');
    try {
      const response = await branchCustomerApi.list(params);
      const data = response?.data ?? response;
      if (!Array.isArray(data?.items)) throw new Error('The server returned an invalid customer list.');
      if (version !== requestVersion.current) return;
      setRows(data.items.map(row => ({ ...row, id: row.customer_id })));
      setTotal(Number(data.total ?? data.pagination?.total ?? data.items.length));
    } catch (err) {
      if (version !== requestVersion.current) return;
      setRows([]);
      setTotal(0);
      setError(err.message);
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
    return () => { requestVersion.current += 1; };
  }, [load]);
  return <>
    <PageHeader eyebrow="BRANCH OWNER" title="Customer" description="View your branch customers, contact details, and visit history." />
    {error && <div className="profile-error" role="alert">{error}<button className="btn secondary" disabled={loading} onClick={() => load()}>Try again</button></div>}
    <ServerTable columns={columns} data={rows} total={total} loading={loading} onQueryChange={load} searchPlaceholder="Search customers" minWidth={1400} />
  </>;
}
