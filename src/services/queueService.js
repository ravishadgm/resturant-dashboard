import { storage } from './storageService';
import { STORAGE_KEYS } from '../utils/constants';
import { seeds } from './mockData';

function read() {
  const saved = storage.get(STORAGE_KEYS.queue);
  if (saved) return saved;
  return storage.set(STORAGE_KEYS.queue, seeds.queue || []);
}

function write(rows) {
  storage.set(STORAGE_KEYS.queue, rows);
  return rows;
}

export const queueService = {
  list() { return Promise.resolve([...read()]); },
  add(data) {
    const now=new Date(); const branchId=data.branch_id||'BR-001'; const businessDate=now.toISOString().slice(0,10); const existing=read().filter(row=>(row.branch_id||'BR-001')===branchId&&(row.business_date||String(row.joinedAt||'').slice(0,10))===businessDate);
    const item = { ...data, id: crypto.randomUUID(), queue_id:`QUEUE-${Date.now().toString().slice(-7)}`, branch_id:branchId, queue_number:data.queue_number||existing.length+1, member_count:Number(data.member_count||data.partySize), business_date:businessDate, status: 'waiting', registered_at: now.toISOString(), joinedAt: now.toISOString() };
    write([...read(), item]);
    return Promise.resolve(item);
  },
  update(id, changes) {
    let updated;
    write(read().map(item => item.id === id ? (updated = { ...item, ...changes }) : item));
    return Promise.resolve(updated);
  },
  remove(id) {
    write(read().filter(item => item.id !== id));
    return Promise.resolve(true);
  }
};
