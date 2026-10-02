import { seeds } from './mockData';

const records = new Map();

const read = (type) => {
  if (!records.has(type)) records.set(type, [...(seeds[type] || [])]);
  return records.get(type);
};

export const entityService = {
  list(type) { return Promise.resolve([...read(type)]); },
  get(type, id) { return Promise.resolve(read(type).find(item => item.id === id)); },
  create(type, data) {
    const item = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    records.set(type, [item, ...read(type)]);
    return Promise.resolve(item);
  },
  update(type, id, data) {
    const item = { ...data, id, updatedAt: new Date().toISOString() };
    records.set(type, read(type).map(row => row.id === id ? item : row));
    return Promise.resolve(item);
  },
  delete(type, id) {
    records.set(type, read(type).filter(item => item.id !== id));
    return Promise.resolve(true);
  },
};
