export const WEEKDAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
export const normalizeSchedule = days => WEEKDAYS.map(day => {
  const entry = days?.find(item => item.day_of_week === day);
  return {day_of_week:day, open_time:entry?.open_time?.slice(0,5) || '', close_time:entry?.close_time?.slice(0,5) || '', is_closed:entry?.is_closed ?? true, is_set:entry?.is_set ?? !!entry};
});
export const schedulePayload = days => ({schedules:WEEKDAYS.map(day => {
  const entry = days.find(item => item.day_of_week === day);
  if (!entry) throw new Error(`Please set timings for ${day.toLowerCase()}.`);
  if (entry.is_closed) return {day_of_week:day,is_closed:true};
  const validTime = value => /^([01]\d|2[0-3]):[0-5]\d$/.test(value || '');
  if (!validTime(entry.open_time) || !validTime(entry.close_time)) throw new Error(`Enter opening and closing times for ${day.toLowerCase()}.`);
  if (entry.open_time === entry.close_time) throw new Error(`Opening and closing times must differ for ${day.toLowerCase()}.`);
  return {day_of_week:day,open_time:entry.open_time,close_time:entry.close_time,is_closed:false};
})});
