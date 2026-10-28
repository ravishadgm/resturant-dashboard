export const emptyAnnouncement = () => ({ title: '', message: '', audience: 'all', groups: ['restaurants', 'customers', 'managers'], recipients: [] });
export const GROUPS = { restaurants: 'Restaurants', managers: 'Managers', customers: 'Customers' };
export function audienceLabel(record) {
  if (record.audience === 'all') return record.groups.map(group => 'All ' + GROUPS[group].toLowerCase()).join(', ');
  return record.recipients.map(recipient => recipient.name + ' (' + (recipient.kind === 'customers' ? 'Customer' : 'Manager') + ')').join(', ');
}
export function validateAnnouncement(record) {
  if (!record.title.trim()) return 'Enter a notification title.';
  if (record.title.trim().length > 120) return 'Keep the title within 120 characters.';
  if (!record.message.trim()) return 'Enter a notification message.';
  if (record.message.length > 2000) return 'Keep the message within 2,000 characters.';
  if (record.audience !== 'all') return 'Notifications can only be sent to all members of a recipient group.';
  if (!record.groups.length) return 'Select at least one recipient group.';
  if (record.groups.some(group => !GROUPS[group])) return 'Only restaurants, customers, and managers can receive notifications.';
  return '';
}
export function notificationStore(key) {
  return {
    list() {
      const records = JSON.parse(localStorage.getItem(key) || '[]');
      if (!Array.isArray(records) || records.some(record => !record || typeof record.title !== 'string' || typeof record.message !== 'string' || !Array.isArray(record.groups) || !Array.isArray(record.recipients) || record.status !== 'sent')) throw new Error('Saved notifications could not be read.');
      return records;
    },
    save(records) { localStorage.setItem(key, JSON.stringify(records)); },
  };
}
