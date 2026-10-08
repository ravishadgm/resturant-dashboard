# Restaurant overview graph API

The restaurant graph currently uses static sample data from src/services/overviewGraphData.js. Existing overview cards still use their current API.

Proposed endpoint: GET /api/v1/restaurant/dashboard/graph?from=2026-10-01&to=2026-10-03

Authenticate using the existing API client and scope results to the signed-in restaurant. Dates are inclusive. Counts represent records created per day, grouped in the restaurant timezone. Include every day with zeros when nothing was created. Totals sum the selected date range.

```json
{
  "from": "2026-10-01",
  "to": "2026-10-03",
  "timezone": "Asia/Kolkata",
  "metric": "records_created",
  "totals": { "tables": 9, "managers": 3, "branches": 2 },
  "data": [
    { "date": "2026-10-01", "counts": { "tables": 3, "managers": 1, "branches": 1 } },
    { "date": "2026-10-02", "counts": { "tables": 4, "managers": 0, "branches": 0 } },
    { "date": "2026-10-03", "counts": { "tables": 2, "managers": 2, "branches": 1 } }
  ]
}
```

Return non-negative integer counts and rows sorted by date ascending.
To integrate, fetch on date-range changes in OverviewGraph.jsx and replace overviewSampleData with response.data. The frontend already derives totals from daily rows. Replace the sample label with loading/error feedback and handle stale requests when filters change. No graph endpoint is called yet.
  