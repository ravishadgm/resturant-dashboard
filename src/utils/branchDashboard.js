export const customerSeries = [
  { key: 'walk_in', label: 'Walk-in (Queue)', color: '#2186eb' },
  { key: 'scheduled', label: 'Scheduled', color: '#10b981' },
  { key: 'cancelled', label: 'Cancelled', color: '#f05264' },
];

export function getBranchPeriod(response, from, to) {
  const daily = response.data.daily.filter(row => row.date >= from && row.date <= to);
  const counts = Object.fromEntries(customerSeries.map(({ key }) => [
    key, daily.reduce((sum, row) => sum + row[key], 0),
  ]));
  return { daily, counts, total: Object.values(counts).reduce((sum, value) => sum + value, 0) };
}
