export const overviewSeries = [
  { key: 'tables', label: 'Tables', color: '#6d45d8' },
  { key: 'managers', label: 'Managers', color: '#3478d4' },
  { key: 'branches', label: 'Restaurant branches', color: '#268b60' },
];
export const overviewSampleData = Array.from({ length: 30 }, (_, index) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - (29 - index));
  return {
    date: [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-'),
    counts: { tables: (index * 7 + 3) % 13, managers: (index * 3 + 1) % 5, branches: index % 4 === 0 ? 1 : 0 },
  };
});
export const filterOverviewData = (data, from, to) => data.filter(row => row.date >= from && row.date <= to);
export const totalOverviewData = data => Object.fromEntries(overviewSeries.map(({ key }) => [key, data.reduce((sum, row) => sum + row.counts[key], 0)]));
