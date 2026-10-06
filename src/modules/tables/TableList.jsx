import { useCallback, useEffect, useRef, useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { branchTableApi, TABLE_STATUSES } from '../../api/branchTableApi';
import ServerTable from '../../components/common/ServerTable';
import EntityForm from '../../components/common/EntityForm';
import PageHeader from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

const statusField = { name: 'status', label: 'Status', as: 'select', options: TABLE_STATUSES };
const createFields = [
  { name: 'table_number', label: 'Table number', placeholder: 'e.g. T1' },
  { name: 'capacity', label: 'Capacity', type: 'number', min: 1, step: 1 },
  statusField,
];
const statusFields = [statusField];
const initialTable = { table_number: '', capacity: '', status: 'AVAILABLE' };
const displayFields = [
  { name: 'table_number', label: 'Table number' },
  { name: 'restaurant_name', label: 'Restaurant' },
  { name: 'branch_name', label: 'Branch' },
  { name: 'city', label: 'City' },
  { name: 'capacity', label: 'Capacity' },
  { name: 'status', label: 'Status' },
];

export default function TableList() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState(null);
  const [active, setActive] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const query = useRef({ page: 1, limit: 10, search: '' });
  const requestVersion = useRef(0);
  const saveLock = useRef(false);

  const load = useCallback(async (params = query.current) => {
    query.current = params;
    const version = ++requestVersion.current;
    setLoading(true);
    setError('');
    try {
      const response = await branchTableApi.list(params);
      const data = response?.data ?? response;
      if (!Array.isArray(data?.items)) throw new Error('The server returned an invalid table list.');
      if (version !== requestVersion.current) return;
      setRows(data.items.map(row => ({ ...row, id: row.table_id })));
      setTotal(Number(data.pagination?.total ?? data.items.length));
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

  const close = () => { if (!saveLock.current) setMode(null); };
  const save = async values => {
    if (saveLock.current) return;
    saveLock.current = true;
    setSaving(true);
    setFormError('');
    try {
      if (!TABLE_STATUSES.includes(values.status)) throw new Error('Select a valid table status.');
      if (mode === 'add') {
        if (!Number.isInteger(Number(values.capacity)) || Number(values.capacity) < 1) throw new Error('Capacity must be a positive whole number.');
        if (!values.table_number.trim()) throw new Error('Table number is required.');
        await branchTableApi.create(values);
      } else {
        if (active?.table_id == null) throw new Error('Table ID is missing.');
        await branchTableApi.updateStatus(active.table_id, values.status);
      }
      toast(mode === 'add' ? 'Table created' : 'Table status updated');
      setMode(null);
      await load(query.current);
    } catch (err) {
      setFormError(err.message);
    } finally {
      saveLock.current = false;
      setSaving(false);
    }
  };
  const columns = [
    ...displayFields.map(field => ({
      key: field.name,
      label: field.label,
      render: value => field.name === 'status'
        ? <span className={`registry-status ${String(value || '').toLowerCase()}`}>{value || '-'}</span>
        : value == null || value === '' ? '-' : String(value),
    })),
    { key: 'actions', label: 'Actions', sortable: false, className: 'actions-col', render: (_, row) => <div className="row-actions"><button title="Change status" aria-label={`Change status for table ${row.table_number}`} onClick={() => { setActive(row); setFormError(''); setMode('status'); }}><Pencil /></button></div> },
  ];
  return <>
    <PageHeader eyebrow="BRANCH OWNER" title="Table" description="Manage your branch tables, seating capacity, and availability." action={<button className="btn primary" onClick={() => { setActive(null); setFormError(''); setMode('add'); }}><Plus size={17} /> Add Table</button>} />
    {error && <div className="profile-error" role="alert">{error}<button className="btn secondary" disabled={loading} onClick={() => load()}>Try again</button></div>}
    <ServerTable columns={columns} data={rows} total={total} loading={loading} onQueryChange={load} searchPlaceholder="Search tables" minWidth={1000} />
    <Modal open={mode !== null} title={mode === 'add' ? 'Add Table' : `Change status - ${active?.table_number || 'Table'}`} onClose={close}>
      <EntityForm key={mode === 'add' ? 'add' : active?.table_id} initial={mode === 'add' ? initialTable : active} fields={mode === 'add' ? createFields : statusFields} onSubmit={save} onCancel={close} onFormChange={() => setFormError('')} submitLabel={mode === 'add' ? 'Add Table' : 'Save status'} busy={saving} formError={formError} />
    </Modal>
  </>;
}
