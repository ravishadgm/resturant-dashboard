# Restaurant Dashboard API

The restaurant overview calls authenticated GET /api/v1/restaurant/dashboard through the shared API client. Initial load and Reset use no query parameters, allowing the server to select its default period.

Date and branch changes send optional from, to, and branch_id parameters. Both dates must be selected together and ordered. The existing filter contract expects the backend to return summary, daily, and branches scoped to those filters; daily rows do not require nested branch details.

The success/message/data response supplies restaurant.restaurant_name, summary counts and growth, daily date/walk_in/scheduled/cancelled values, and branch total_customers/counts/conversion. Cards use server summary values and branch performance uses server totals and conversion. Distribution percentages are calculated from summary counts.

Requests include the stored bearer token. The page shows loading, errors with Retry, and empty states. Filter changes and unmount abort the preceding request and ignore stale results. Restaurant responses are fetched fresh rather than cached indefinitely. The sample fixture is no longer used by the overview.
