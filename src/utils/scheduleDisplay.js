export const scheduleStatus = day => !day || day.is_set === false ? 'Not set' : day.is_closed ? 'Closed' : 'Open';
export const scheduleTime = (day, field) => scheduleStatus(day) === 'Open' ? day[field]?.slice(0,5) || '-' : '-';

export const currentScheduleDay = data => {
  const today = data?.is_open_today;
  if (!today) return null;
  const savedDay = data.days?.find(day => day.day_of_week === today.day_of_week);
  return savedDay ? {...today,...savedDay} : today;
};
