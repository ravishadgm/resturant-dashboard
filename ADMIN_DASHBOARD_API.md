# Static Admin Dashboard API

GET /api/v1/admin/dashboard?from=2025-09-01&to=2025-09-30

The static response in src/services/adminDashboardResponse.json follows the
reference: success, message, data.summary, data.daily, data.top_restaurants,
plus from/to/timezone metadata. Default counts: 2540 customers, 1980 walk-ins,
560 scheduled, 120 cancelled. Dates are inclusive in Asia/Kolkata.

Cancellations are a subset of walk-ins. Total customers is walk-ins plus scheduled.
The donut subtracts cancellations from walk-ins so slices add to 100%.
Reference image percentages are inconsistent; actual chart percentages are
calculated from counts. Royal Dine cancellations are zero so restaurant rows
sum to the reference's 120 cancelled customers. Conversion is
(total_customers - cancelled_count) / total_customers * 100.

Daily counts must sum to summary counts. Include every day with zeros. Return
non-negative counts and top_restaurants sorted by customer count descending.
Growth is the signed change against the previous equal-length period. The
fixture only has growth for the full reference range; other ranges omit growth.

adminDashboardDailyRestaurants.json is a local fixture for date filtering the
restaurant table. With a real API, return summary/daily/top_restaurants already
scoped to the requested dates. Fetch on date changes using the existing API
client, handle loading/errors and stale requests, and replace static state.
