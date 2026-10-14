export const emptyAnnouncement = () => ({ title: '', message: '', priority: 'normal', audience: 'all', groups: ['customers'], recipients: [] });
export const GROUPS = { managers: 'Managers', customers: 'Customers' };
export function audienceLabel(record) {
  return record.audience === 'all' ? record.groups.map(group => 'All ' + GROUPS[group].toLowerCase()).join(', ') : record.recipients.map(recipient => recipient.name + ' (' + (recipient.kind === 'customers' ? 'Customer' : 'Manager') + ')').join(', ');
}
export function validateAnnouncement(record) {
  if (!record.title.trim()) return 'Enter a notification title.';
  if (record.title.trim().length > 120) return 'Keep the title within 120 characters.';
  if (!record.message.trim()) return 'Enter a notification message.';
  if (record.message.length > 2000) return 'Keep the message within 2,000 characters.';
  if (!['normal', 'important', 'urgent'].includes(record.priority)) return 'Choose a valid priority.';
  if (!['all', 'selected'].includes(record.audience)) return 'Choose recipients.';
  if (record.groups.some(group => !GROUPS[group])) return 'Only managers and customers can receive notifications.';
  if (record.audience === 'all' && !record.groups.length) return 'Select Managers or Customers.';
  if (record.audience === 'selected' && !record.recipients.length) return 'Choose at least one recipient.';
  if (record.audience === 'selected' && record.recipients.some(recipient => !record.groups.includes(recipient.kind))) return 'Selected recipients must match Customers or Managers.';
  if (record.recipients.some(recipient => !GROUPS[recipient.kind] || !recipient.id)) return 'Choose valid manager or customer recipients.';
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
