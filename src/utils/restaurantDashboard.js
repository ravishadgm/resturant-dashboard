export const restaurantSeries = [
  { key: 'walk_in', label: 'Walk-in (Queue)', color: '#2186eb' },
  { key: 'scheduled', label: 'Scheduled', color: '#10b981' },
  { key: 'cancelled', label: 'Cancelled', color: '#f05264' },
];
export function getRestaurantPeriod(response, from, to, branchId = 'all') {
  const source = response.data.daily.filter(row => row.date >= from && row.date <= to);
  const selected = response.data.branches.filter(branch => branchId === 'all' || String(branch.branch_id) === String(branchId));
  const daily = source.map(row => {
    const entries = row.branches.filter(branch => selected.some(item => item.branch_id === branch.branch_id));
    return { date: row.date, ...Object.fromEntries(restaurantSeries.map(({ key }) => [key, entries.reduce((sum, entry) => sum + entry[key], 0)])) };
  });
  const counts = Object.fromEntries(restaurantSeries.map(({ key }) => [key, daily.reduce((sum, row) => sum + row[key], 0)]));
  const branches = selected.map(branch => {
    const entries = source.flatMap(row => row.branches).filter(row => row.branch_id === branch.branch_id);
    const values = Object.fromEntries(restaurantSeries.map(({ key }) => [key, entries.reduce((sum, row) => sum + row[key], 0)]));
    const customers = values.walk_in + values.scheduled + values.cancelled;
    return { ...branch, customers, walk_in_count: values.walk_in, scheduled_count: values.scheduled, cancelled_count: values.cancelled,
      conversion: customers ? (customers - values.cancelled) / customers * 100 : 0 };
  });
  return { daily, counts, total: counts.walk_in + counts.scheduled + counts.cancelled, branches };
}
