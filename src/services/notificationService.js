export const emptyAnnouncement = () => ({ title: '', message: '', audience: 'all', groups: ['restaurants', 'customers'], recipients: [] });
export const GROUPS = { restaurants: 'Restaurants', customers: 'Customers', managers: 'Managers' };

export function audienceLabel(record) {
  if (record.audience === 'all' && Array.isArray(record.groups)) return record.groups.filter(group => GROUPS[group]).map(group => 'All ' + GROUPS[group].toLowerCase()).join(', ');
  if (record.audience === 'all-restaurants') return 'All restaurants';
  if (record.audience === 'restaurant') return record.recipients.map(recipient => recipient.name).join(', ') || 'Choose restaurants';
  // Keep older history accurate without allowing these audiences in new sends.
  if (record.audience === 'all') return 'Previous audience: everyone';
  if (record.audience === 'groups') return 'Previous groups: ' + record.groups.join(', ');
  return record.recipients.map(recipient => recipient.name).join(', ') || 'Choose a restaurant';
}

export function notificationAnnouncement(record) {
  const groups = Array.isArray(record.groups)
    ? record.groups.filter(group => GROUPS[group])
    : record.audience === 'all-restaurants' || record.audience === 'restaurant'
      ? ['restaurants']
      : ['restaurants', 'customers'];
  const { timing, scheduledAt, searchText, ...current } = record;
  return { ...current, audience: 'all', groups, recipients: [] };
}

export function validateAnnouncement(record, status) {
  if (!['draft', 'sent'].includes(status)) return 'Only drafts and immediate sends are supported.';
  if (!record.title.trim()) return 'Enter a notification title.';
  if (record.title.trim().length > 120) return 'Keep the title within 120 characters.';
  if (record.message.length > 2000) return 'Keep the message within 2,000 characters.';
  if (record.audience !== 'all') return 'Notifications can only be sent to all members of a recipient group.';
  if (!record.groups.length) return 'Select at least one recipient group.';
  if (record.groups.some(group => !GROUPS[group])) return 'Only restaurants, customers, and managers can receive notifications.';
  if (status === 'draft') return '';
  if (!record.message.trim()) return 'Enter a notification message.';
  return '';
}

// Browser-only UI preview adapter; replace when an admin delivery API is available.
export function notificationStore(key) {
  return {
    list() {
      const records = JSON.parse(localStorage.getItem(key) || '[]');
      if (!Array.isArray(records) || records.some(record => !record || typeof record.id !== 'string' || typeof record.title !== 'string' || typeof record.message !== 'string' || !Array.isArray(record.recipients) || !['draft', 'scheduled', 'sent'].includes(record.status))) throw new Error('Saved notifications could not be read.');
      return records.map(record => record.status === 'sent' ? record : {
        ...notificationAnnouncement(record),
        status: 'draft',
      });
    },
    save(records) { localStorage.setItem(key, JSON.stringify(records)); },
  };
}
