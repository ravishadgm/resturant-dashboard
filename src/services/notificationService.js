export const emptyAnnouncement = () => ({ title: '', message: '', priority: 'normal', audience: 'all-restaurants', recipients: [] });

export function audienceLabel(record) {
  if (record.audience === 'all-restaurants') return 'All restaurants';
  if (record.audience === 'restaurant') return record.recipients.map(recipient => recipient.name).join(', ') || 'Choose restaurants';
  // Keep older history accurate without allowing these audiences in new sends.
  if (record.audience === 'all') return 'Previous audience: everyone';
  if (record.audience === 'groups') return 'Previous groups: ' + record.groups.join(', ');
  return record.recipients.map(recipient => recipient.name).join(', ') || 'Choose a restaurant';
}

export function restaurantAnnouncement(record) {
  const { timing, scheduledAt, groups, searchText, ...current } = record;
  const recipients = (record.recipients || []).filter(recipient => recipient.kind === 'restaurants');
  const allowed = ['all-restaurants', 'restaurant'].includes(record.audience);
  return { ...current, audience: allowed ? record.audience : 'restaurant', recipients };
}

export function validateAnnouncement(record, status) {
  if (!['draft', 'sent'].includes(status)) return 'Only drafts and immediate sends are supported.';
  if (!record.title.trim()) return 'Enter a notification title.';
  if (record.title.trim().length > 120) return 'Keep the title within 120 characters.';
  if (record.message.length > 2000) return 'Keep the message within 2,000 characters.';
  if (!['normal', 'important', 'urgent'].includes(record.priority)) return 'Choose a valid priority.';
  if (!['all-restaurants', 'restaurant'].includes(record.audience)) return 'Notifications can only be sent to restaurants.';
  if (record.recipients.some(recipient => recipient.kind !== 'restaurants')) return 'Notifications can only be sent to restaurants.';
  if (status === 'draft') return '';
  if (!record.message.trim()) return 'Enter a notification message.';
  if (record.audience === 'restaurant' && (!record.recipients.length || record.recipients.some(recipient => !recipient.id))) return 'Choose at least one restaurant.';
  return '';
}

// Browser-only UI preview adapter; replace when an admin delivery API is available.
export function notificationStore(key) {
  return {
    list() {
      const records = JSON.parse(localStorage.getItem(key) || '[]');
      if (!Array.isArray(records) || records.some(record => !record || typeof record.id !== 'string' || typeof record.title !== 'string' || typeof record.message !== 'string' || !Array.isArray(record.recipients) || !['draft', 'scheduled', 'sent'].includes(record.status))) throw new Error('Saved notifications could not be read.');
      return records.map(record => record.status === 'sent' ? record : {
        ...restaurantAnnouncement(record),
        status: 'draft',
      });
    },
    save(records) { localStorage.setItem(key, JSON.stringify(records)); },
  };
}
