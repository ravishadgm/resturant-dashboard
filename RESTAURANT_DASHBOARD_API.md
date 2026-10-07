# Restaurant Dashboard API

Static response: src/services/restaurantDashboardResponse.json.
Uses Spice Hub and the four branches from the reference image, for
1–30 September 2025. Summary: 640 customers, 480 walk-ins, 140 scheduled,
20 cancelled. Branch performance:
Ring Road 220 / 160 / 52 / 8;
Adajan 180 / 140 / 35 / 5;
Vesu 140 / 100 / 33 / 7;
City Light 100 / 80 / 20 / 0.
Values are customers / walk-ins / scheduled / cancelled.

GET /api/v1/restaurant/dashboard?from=2025-09-01&to=2025-09-30
Optional branch_id filter; omit for all branches.

Return success/message/from/to/timezone and data containing restaurant,
summary, daily, branches, matching the fixture. Scope to the signed-in restaurant.
Date endpoints are inclusive in Asia/Kolkata. Include all dates with zeros.

In this restaurant dataset, walk-in, scheduled and cancelled are separate
categories; total_customers equals their sum. Conversion is the non-cancelled
share of customers. The daily rows include branch breakdowns for local static
branch/date filtering. With a real API, filter the data on the server and return
summary/daily/branches already scoped to the requested range/branch.

Growth values from the reference are shown only for all branches over the
full sample period because previous-period data is absent in the fixture.
For API integration return growth against the preceding equal-length period.
Connect through the existing API client on date/branch changes, with loading,
error and stale-request handling. No dashboard API request is made now.

The reference has off-by-one scheduled counts for Vesu and City Light. These are corrected to 33 and 20 so both branch totals and the 140 scheduled summary agree.