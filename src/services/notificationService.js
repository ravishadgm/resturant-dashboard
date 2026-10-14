export const emptyAnnouncement = () => ({ title: '', message: '', priority: 'normal', audience: 'all-branches', recipients: [] });
export function audienceLabel(record) {
  return record.audience === 'all-branches' ? 'All branches' : record.recipients.map(recipient => recipient.name).join(', ') || 'Choose branches';
}
export function branchAnnouncement(record) {
  return { ...record, recipients: [...record.recipients] };
}
export function validateAnnouncement(record, status) {
  if (status !== 'sent') return 'Only immediate sends are supported.';
  if (!record.title.trim()) return 'Enter a notification title.';
  if (record.title.trim().length > 120) return 'Keep the title within 120 characters.';
  if (!record.message.trim()) return 'Enter a notification message.';
  if (record.message.length > 2000) return 'Keep the message within 2,000 characters.';
  if (!['normal', 'important', 'urgent'].includes(record.priority)) return 'Choose a valid priority.';
  if (!['all-branches', 'branch'].includes(record.audience)) return 'Choose all branches or specific branches.';
  if (record.recipients.some(recipient => recipient.kind !== 'branches' || !recipient.id)) return 'Only branches can receive these notifications.';
  if (record.audience === 'branch' && !record.recipients.length) return 'Choose at least one branch.';
  return '';
}
// Browser-only preview; delivery requires a restaurant notification API.
export function notificationStore(key) {
  return {
    list() {
      const records = JSON.parse(localStorage.getItem(key) || '[]');
      if (!Array.isArray(records) || records.some(record => !record || typeof record.title !== 'string' || typeof record.message !== 'string' || !Array.isArray(record.recipients) || record.status !== 'sent')) throw new Error('Saved notifications could not be read.');
      return records;
    },
    save(records) { localStorage.setItem(key, JSON.stringify(records)); },
  };
}
