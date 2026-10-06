import { useCallback, useEffect, useRef, useState } from 'react';
import { branchQueueApi } from '../../api/branchQueueApi';
import { normalizeBranchQueue } from '../../utils/branchQueue';
import PageHeader from '../../components/common/PageHeader';
import ServerTable from '../../components/common/ServerTable';

const fields = [
  { name: 'business_date', label: 'Business date' },
  { name: 'queue_number', label: 'Queue number' },
  { name: 'restaurant_name', label: 'Restaurant' },
  { name: 'branch_name', label: 'Branch' },
  { name: 'city', label: 'City' },
  { name: 'customer_name', label: 'Customer' },
  { name: 'customer_phone', label: 'Customer phone' },
  { name: 'customer_email', label: 'Customer email' },
  { name: 'member_count', label: 'Members' },
  { name: 'requirements', label: 'Requirements' },
  { name: 'status', label: 'Queue status' },
  { name: 'customer_status', label: 'Customer status' },
  { name: 'customer_address', label: 'Customer address' },
  { name: 'customer_latitude', label: 'Customer latitude' },
  { name: 'customer_longitude', label: 'Customer longitude' },
];
const columns = fields.map(field => ({
  key: field.name,
  label: field.label,
  render: value => ['status', 'customer_status'].includes(field.name)
    ? <span className={`registry-status ${String(value || '').toLowerCase()}`}>{value || '-'}</span>
    : value == null || value === '' ? '-' : String(value),
}));

export default function BranchQueueList() {
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
      const response = await branchQueueApi.list(params);
      const data = response?.data ?? response;
      if (!Array.isArray(data?.items)) throw new Error('The server returned an invalid queue list.');
      if (version !== requestVersion.current) return;
      setRows(data.items.map(normalizeBranchQueue));
      setTotal(Number(data.pagination?.total ?? data.total ?? data.items.length));
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
    <PageHeader eyebrow="BRANCH OWNER" title="Queue" description="View your branch queue, customer details, and requirements." />
    {error && <div className="profile-error" role="alert">{error}<button className="btn secondary" disabled={loading} onClick={() => load()}>Try again</button></div>}
    <ServerTable columns={columns} data={rows} total={total} loading={loading} onQueryChange={load} showSearch={false} minWidth={2400} />
  </>;
}
