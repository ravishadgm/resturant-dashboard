// Daily counts represent new unique customer registrations, not repeat visits.
export function filterBranchCustomers(response, from, to) {
  const rows = (response.data?.daily_counts ?? []).filter(row => row.date >= from && row.date <= to);
  return (response.data?.branches ?? []).map(branch => ({
    ...branch,
    customer_count: rows.reduce((sum, row) => sum + (row.counts[branch.branch_id] ?? 0), 0),
  }));
}
