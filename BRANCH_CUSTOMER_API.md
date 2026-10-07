# Branch customer pie chart API

The dashboard and Branches page use the static dated response in
src/services/branchCustomerResponse.json. From/To filters are inclusive and default
to the last seven dates in that response. Counts are new customer registrations,
not repeat visits or all-time customer totals.

Proposed endpoint:
GET /api/v1/restaurant/branches/customer-counts?from=2026-10-01&to=2026-10-07

Return this shape (one day shown here; include every date requested):
```json
{
  "success": true,
  "from": "2026-10-01",
  "to": "2026-10-07",
  "timezone": "Asia/Kolkata",
  "metric": "customers_registered_by_branch",
  "data": {
    "branches": [
      { "branch_id": "a", "branch_name": "Branch A" },
      { "branch_id": "b", "branch_name": "Branch B" },
      { "branch_id": "c", "branch_name": "Branch C" }
    ],
    "daily_counts": [
      { "date": "2026-10-01", "counts": { "a": 12, "b": 8, "c": 5 } }
    ]
  }
}
```

Scope results to the authenticated restaurant. Use unique real branch IDs.
Daily counts must be non-negative integers, keyed by branch ID. Include zeros
and sort dates ascending. Count a customer's registration once per branch.

The frontend sums daily counts for the selected range and derives pie shares.
For integration, fetch on date changes using the existing API client, add
loading/error/stale-request handling and pass the response with isSample={false}.
Lift the date filter state to the fetching parent or add an onRangeChange callback
when connecting the endpoint.
