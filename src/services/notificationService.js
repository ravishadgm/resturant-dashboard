export const AUDIENCES = { restaurants: 'Restaurants', managers: 'Managers', customers: 'Customers' };
export const emptyAnnouncement = () => ({ title: '', message: '', priority: 'normal', audience: 'all', groups: [], recipients: [], timing: 'now', scheduledAt: '' });
export function localDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  const pad = number => String(number).padStart(2, '0');
  return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + 'T' + pad(date.getHours()) + ':' + pad(date.getMinutes());
}
export function audienceLabel(record) {
  if (record.audience === 'all') return 'Everyone';
  if (record.audience === 'groups') return record.groups.map(group => AUDIENCES[group]).join(', ');
  return record.recipients.length + ' selected recipient' + (record.recipients.length === 1 ? '' : 's');
}
export function validateAnnouncement(record, status, now = Date.now()) {
  if (!record.title.trim()) return 'Enter an announcement title.';
  if (record.title.trim().length > 120) return 'Keep the title within 120 characters.';
  if (record.message.length > 2000) return 'Keep the message within 2,000 characters.';
  if (status === 'draft') return '';
  if (!record.message.trim()) return 'Enter an announcement message.';
  if (record.audience === 'groups' && !record.groups.length) return 'Select at least one recipient group.';
  if (record.audience === 'selected' && !record.recipients.length) return 'Select at least one recipient.';
  if (status === 'scheduled' && (!record.scheduledAt || !Number.isFinite(new Date(record.scheduledAt).getTime()) || new Date(record.scheduledAt).getTime() <= now)) return 'Choose a future date and time.';
  return '';
}
// Browser-only UI preview adapter; replace when an admin delivery API is available.
export function notificationStore(key) {
  return {
    list() {
      const records = JSON.parse(localStorage.getItem(key) || '[]');
      if (!Array.isArray(records) || records.some(record => !record || typeof record.id !== 'string' || typeof record.title !== 'string' || typeof record.message !== 'string' || !Array.isArray(record.groups) || !Array.isArray(record.recipients) || !['draft', 'scheduled', 'sent'].includes(record.status))) throw new Error('Saved notifications could not be read.');
      return records;
    },
    save(records) { localStorage.setItem(key, JSON.stringify(records)); },
  };
}
