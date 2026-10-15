import ResponsiveSelect from '../../components/common/ResponsiveSelect';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import ServerTable from '../../components/common/ServerTable';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { branchApi } from '../../api/branchApi';
import { queueApi } from '../../api/queueApi';

const fields = [
  { name: 'queue_id', label: 'Queue ID' },
  { name: 'branch_name', label: 'Branch' },
  { name: 'queue_number', label: 'Queue number' },
  { name: 'customer_name', label: 'Customer' },
  { name: 'customer_phone', label: 'Phone' },
  { name: 'customer_email', label: 'Email' },
  { name: 'business_date', label: 'Business date' },
  { name: 'member_count', label: 'Members' },
  { name: 'status', label: 'Status' },
  { name: 'registered_at', label: 'Registered at' },
  { name: 'called_at', label: 'Called at' },
  { name: 'seated_at', label: 'Seated at' },
  { name: 'completed_at', label: 'Completed at' },
  { name: 'cancelled_at', label: 'Cancelled at' },
];

const historyFields = [
  { name: 'business_date', label: 'Business date' },
  { name: 'queue_number', label: 'Queue number' },
  { name: 'restaurant_name', label: 'Restaurant' },
  { name: 'branch_name', label: 'Branch' },
  { name: 'city', label: 'City' },
  { name: 'customer_name', label: 'Customer' },
  { name: 'customer_phone', label: 'Customer phone' },
  { name: 'customer_email', label: 'Customer email' },
  { name: 'member_count', label: 'Members' },
  { name: 'status', label: 'Queue status' },
  { name: 'customer_status', label: 'Customer status' },
  { name: 'customer_address', label: 'Customer address' },
  { name: 'customer_latitude', label: 'Customer latitude' },
  { name: 'customer_longitude', label: 'Customer longitude' },
];

const dateFields = new Set([
  'registered_at',
  'called_at',
  'seated_at',
  'completed_at',
  'cancelled_at',
]);

const displayValue = (field, value) => {
  if (field.name === 'status' || field.name === 'customer_status') {
    return <span className={`registry-status ${String(value || '').toLowerCase()}`}>{value || '-'}</span>;
  }
  if (dateFields.has(field.name)) return value ? new Date(value).toLocaleString() : '-';
  return value === undefined || value === null || value === '' ? '-' : String(value);
};

const normalizeQueue = (row, branchName) => {
  const { password, ...safeUser } = row.customer?.user || {};
  return {
    ...row,
    customer: row.customer ? {
      ...row.customer,
      user: row.customer.user ? safeUser : undefined,
    } : undefined,
    id: row.id || row.queue_id || crypto.randomUUID(),
    branch_name: row.branch?.name || row.branch_name || branchName || '',
    customer_name: row.customer?.name || row.customer?.user?.name || row.customer_name || '',
    customer_phone: row.customer?.phone || row.customer?.user?.phone || row.customer_phone || '',
    customer_email: row.customer?.email || row.customer?.user?.email || row.customer_email || '',
    restaurant_name: row.restaurant_name || row.restaurant?.name || row.branch?.restaurant?.name || '',
    city: row.city || row.branch?.city || '',
    customer_status: row.customer?.status ?? row.customer?.user?.status ?? row.customer_status ?? '',
    customer_address: row.customer?.address ?? row.customer?.user?.address ?? row.customer_address ?? '',
    customer_latitude: row.customer?.latitude ?? row.customer?.user?.latitude ?? row.customer_latitude ?? '',
    customer_longitude: row.customer?.longitude ?? row.customer?.user?.longitude ?? row.customer_longitude ?? '',
  };
};

export default function Queue() {
  const { user } = useAuth();
  const location = useLocation();
  const toast = useToast();
  const historyPage = location.pathname === '/history';
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [branchId, setBranchId] = useState(user.branch_id ? String(user.branch_id) : '');
  const [branchOptions, setBranchOptions] = useState([]);
  const [query, setQuery] = useState({ page: 1, limit: 10, search: '' });

  const load = async (params = query, selectedBranch = branchId, knownBranchName = '') => {
    if (!selectedBranch) {
      setRows([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await queueApi.list({
        branchId: selectedBranch,
        ...params,
        history: historyPage,
      });
      const data = response?.data ?? response;
      const items = Array.isArray(data)
        ? data
        : data?.items || data?.queue || data?.rows || data?.records || data?.data || [];
      const pagination = data?.pagination || data?.meta || response?.pagination || response?.meta || {};
      const selectedName = knownBranchName
        || branchOptions.find(option => String(option.value) === String(selectedBranch))?.name
        || '';
      setRows(items.map(row => normalizeQueue(row, selectedName)));
      setTotal(Number(
        pagination.total
        ?? pagination.totalRecords
        ?? pagination.totalItems
        ?? data?.total
        ?? response?.total
        ?? items.length
      ));
    } catch (error) {
      setRows([]);
      setTotal(0);
      toast(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let current = true;
    const loadBranches = async () => {
      try {
        const response = await branchApi.list({ page: 1, limit: 100, search: '' });
        const data = response?.data ?? response;
        const branches = Array.isArray(data)
          ? data
          : data?.branches || data?.items || data?.rows || data?.records || data?.data || [];
        if (!current) return;
        const options = branches.map(row => ({
          value: String(row.branch_id || row.id),
          name: row.name || row.branch_name || 'Branch',
        }));
        setBranchOptions(options);
        const initialBranch = user.branch_id
          ? String(user.branch_id)
          : String(options[0]?.value || '');
        setBranchId(initialBranch);
        const initialBranchName = options.find(option => option.value === initialBranch)?.name || '';
        load({ page: 1, limit: 10, search: '' }, initialBranch, initialBranchName);
      } catch (error) {
        if (current) {
          setLoading(false);
          toast(error.message);
        }
      }
    };
    loadBranches();
    return () => { current = false; };
  }, [historyPage]);

  const columns = useMemo(() => (historyPage ? historyFields : fields).map(field => ({
    key: field.name,
    label: field.label,
    render: value => displayValue(field, value),
  })), [historyPage]);

  const handleQueryChange = nextQuery => {
    setQuery(nextQuery);
    load(nextQuery, branchId);
  };

  const handleBranchChange = event => {
    const nextBranch = event.target.value;
    const nextQuery = { ...query, page: 1 };
    setBranchId(nextBranch);
    setQuery(nextQuery);
    load(nextQuery, nextBranch);
  };

  return <>
    <PageHeader
      eyebrow="OPERATIONS"
      title={historyPage ? 'Complete history' : 'Today queue'}
      description={historyPage ? 'Queue history with branch, restaurant, and customer details.' : 'Read-only branch queue records.'}
    />
    <div className="table-card queue-branch-filter">
      <label className="field">
        <span>Branch</span>
        <ResponsiveSelect aria-label="Branch" value={branchId} onChange={handleBranchChange} disabled={loading}>
          {branchOptions.length
            ? branchOptions.map(option => <option key={option.value} value={option.value}>{option.name}</option>)
            : <option value="">No branches available</option>}
        </ResponsiveSelect>
      </label>
    </div>
    <ServerTable
      key={`${historyPage ? 'history' : 'queue'}-${branchId}`}
      columns={columns}
      data={rows}
      loading={loading}
      total={total}
      onQueryChange={handleQueryChange}
      searchPlaceholder={historyPage ? 'Search history' : 'Search queue'}
      minWidth={1900}
    />
  </>;
}
