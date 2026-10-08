# Branch Dashboard API

The branch admin overview now loads GET /api/v1/branch/dashboard using the shared API client and stored bearer token. Initial load and Reset send no query parameters and use the server default period.

Date filters send from and to using the existing optional filter contract. Both dates must be selected and ordered. The server must return summary and daily already scoped to that range.

The response requires success/message/data with branch, summary, daily, tables, and queue. Customer cards use summary counts and growth; the charts use summary counts and daily rows. Table status uses tables.total/available/occupied/reserved. Queue status shows queue.business_date, current_waiting, avg_waiting_minutes, and next_table_in_minutes, preserving zero values. Tables and queue represent current snapshots.

Loading, retryable errors, invalid response detection, empty chart states, and aborted/stale requests are handled. The overview no longer imports the sample fixture.
