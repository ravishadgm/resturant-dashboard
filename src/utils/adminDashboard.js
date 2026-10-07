export const adminSeries = [
  { key: 'walk_in', label: 'Walk-in (Queue)', color: '#2186eb' },
  { key: 'scheduled', label: 'Scheduled', color: '#10b981' },
  { key: 'cancelled', label: 'Cancelled', color: '#f05264' },
];
export function getAdminPeriod(response, details, from, to) {
  const daily = response.data.daily.filter(row => row.date >= from && row.date <= to);
  const counts = Object.fromEntries(adminSeries.map(({ key }) => [key, daily.reduce((sum, row) => sum + row[key], 0)]));
  const restaurants = response.data.top_restaurants.map(restaurant => {
    const entries = details.data.filter(row => row.date >= from && row.date <= to).flatMap(row => row.restaurants).filter(row => row.restaurant_id === restaurant.restaurant_id);
    const total_customers = entries.reduce((sum, row) => sum + row.walk_in + row.scheduled, 0);
    const cancelled_count = entries.reduce((sum, row) => sum + row.cancelled, 0);
    return { ...restaurant, total_customers, cancelled_count, conversion: total_customers ? (total_customers - cancelled_count) / total_customers * 100 : 0 };
  }).filter(row => row.total_customers > 0).sort((a, b) => b.total_customers - a.total_customers);
  return { daily, counts, total: counts.walk_in + counts.scheduled, restaurants };
}
