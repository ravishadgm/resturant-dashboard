import { storage } from './storageService';
import { STORAGE_KEYS } from '../utils/constants';
import { seeds } from './mockData';

function key(type) { return STORAGE_KEYS[type]; }
function ensure(type) { const current = storage.get(key(type)); return current || storage.set(key(type), seeds[type] || []); }
export const entityService = {
  list(type) { return Promise.resolve([...ensure(type)]); },
  get(type, id) { return Promise.resolve(ensure(type).find(item => item.id === id)); },
  create(type, data) { const item = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() }; storage.set(key(type), [item, ...ensure(type)]); return Promise.resolve(item); },
  update(type, id, data) { const item = { ...data, id, updatedAt: new Date().toISOString() }; storage.set(key(type), ensure(type).map(row => row.id === id ? item : row)); return Promise.resolve(item); },
  delete(type, id) { storage.set(key(type), ensure(type).filter(row => row.id !== id)); return Promise.resolve(true); }
};

