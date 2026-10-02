import { seeds } from './mockData';

let rows = [...(seeds.queue || [])];

export const queueService = {
  list() { return Promise.resolve([...rows]); },
  add(data) {
    const now = new Date();
    const branchId = data.branch_id || 'BR-001';
    const businessDate = now.toISOString().slice(0, 10);
    const existing = rows.filter(row => (
      (row.branch_id || 'BR-001') === branchId
      && (row.business_date || String(row.joinedAt || '').slice(0, 10)) === businessDate
    ));
    const item = {
      ...data,
      id: crypto.randomUUID(),
      queue_id: `QUEUE-${Date.now().toString().slice(-7)}`,
      branch_id: branchId,
      queue_number: data.queue_number || existing.length + 1,
      member_count: Number(data.member_count || data.partySize),
      business_date: businessDate,
      status: 'waiting',
      registered_at: now.toISOString(),
      joinedAt: now.toISOString(),
    };
    rows = [...rows, item];
    return Promise.resolve(item);
  },
  update(id, changes) {
    let updated;
    rows = rows.map(item => item.id === id ? (updated = { ...item, ...changes }) : item);
    return Promise.resolve(updated);
  },
  remove(id) {
    rows = rows.filter(item => item.id !== id);
    return Promise.resolve(true);
  },
};
