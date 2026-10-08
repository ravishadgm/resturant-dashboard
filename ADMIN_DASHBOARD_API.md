# Admin Dashboard API

The admin overview loads GET /api/v1/admin/dashboard through the shared API client with the stored bearer token. The default API base URL is https://godine.cloud. Initial load and Reset send no query parameters, using the server default period.

Date filters use optional from/to parameters from the existing filter contract. Both dates must be selected and ordered. The server must scope summary, daily, and top_restaurants to the requested range.

The response contains success/message/data with summary, daily, top_restaurants, and business_date. Cards use summary counts and growth. Walk-ins, scheduled, and cancelled are separate categories; the donut uses each count directly against total_customers. Daily bars use API rows, including zeros. Restaurant rows use server totals, cancellation counts, branch counts, and conversion. The business date is displayed from the API.

Loading, retryable errors, invalid response detection, empty states, and cancellation/stale response handling are implemented. No sample fixture is imported by the active admin overview. Dashboard responses are fetched fresh rather than cached indefinitely.
