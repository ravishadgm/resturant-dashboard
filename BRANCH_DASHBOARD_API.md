# Static Branch Dashboard

The branch dashboard matches the third panel of the supplied reference image.
It reads src/services/branchDashboardResponse.json and makes no dashboard API call.
Default range: 1–30 September 2026. Customer summary counts: 220 total, 160
walk-ins, 52 scheduled, 8 cancelled. Table counts: 20 total, 12 available, 6
occupied, 2 reserved. Current queue: 12 groups, 35-minute average wait,
approximately 10 minutes until the next table.

Proposed endpoint:
GET /api/v1/branch/dashboard?from=2026-09-01&to=2026-09-30

Return the exact shape in branchDashboardResponse.json: success, message, from,
to, timezone and data containing branch, summary, daily, tables and queue.
Authenticate and scope to the signed-in branch. Dates are inclusive, grouped in
Asia/Kolkata, sorted ascending, including zero-count dates.

Summary counts must equal the daily sums. Total customers here is the combined
walk-in/scheduled/cancelled count as in the reference. Summary growth is signed
percentage change against the preceding equal-length range. The fixture retains
the reference's sample growth values; they are shown only for the full sample
period. Other date ranges show counts only because prior-period data is absent.
Percentages in the charts are calculated from counts, without rounding the data.

Tables and queue are current snapshots and do not change with historical dates.
When integrating, use dashboardApi.getBranchDashboard with from/to parameters,
load on date changes and handle loading/errors and stale requests.
The API should return growth for each selected period so comparisons can appear
for every range.
