# Branch module graph response

The graph below the branch overview cards uses the static JSON in
[src/services/overviewGraphResponse.json](src/services/overviewGraphResponse.json).
It covers every countable module in the current branch portal: Tables, Customers,
Queue and Schedules. Profile is account information, not an activity count.

Proposed endpoint:
GET /api/v1/branch/dashboard/graph?from=2026-10-01&to=2026-10-07

Return the same shape as the fixture, with from/to reflecting the requested range.
Scope results to the authenticated branch. Group dates in Asia/Kolkata, include
both endpoints, sort ascending and include zero-count days. Counts must be
non-negative integers.

- tables: table records created that day.
- customers: customer records created for the branch that day.
- queue: queue entries created that day, counted once irrespective of status changes.
- schedules: distinct weekly schedule days updated that day, at most seven.

The series array defines legend labels, keys, colours and metrics. Every data row
must contain a counts value for each series key. No totals are needed.

To integrate, replace sampleResponse in OverviewGraph.jsx with state populated
through the existing API client on filter changes, adding loading/error feedback
and cancellation of stale requests. Remove the static sample badge when using
real data.
