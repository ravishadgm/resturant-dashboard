# Restaurant Queue Management API

## 1. Project Overview

આ project એક **Restaurant Queue / Waiting List Management System** છે.

Technology stack:

- Node.js
- Express.js
- MySQL
- Sequelize ORM
- JWT Authentication
- FCM (Firebase Cloud Messaging) for push notifications
- Socket.IO (later phase) for real-time queue updates
- Postman for API testing

System માં કુલ 4 roles રહેશે:

| Role | Platform | Responsibility |
|---|---|---|
| Admin | Web | Complete system management |
| Restaurant | Web | Own restaurant, branches, managers and tables management |
| Restaurant Manager | App | Current branch ની daily queue/customer/table management |
| Customer | App | Nearby restaurants, waiting list registration and cancellation |

---

# 2. Main Business Flow

```text
Admin
  |
  +-- Create Restaurant
          |
          +-- Restaurant
                  |
                  +-- Create Branch
                  |      |
                  |      +-- Add Manager
                  |      |
                  |      +-- Add Restaurant Tables
                  |
                  +-- Manage Branches
                  +-- Manage Managers
                  +-- Manage Tables

Customer
  |
  +-- Open App
  |
  +-- Get Nearby Restaurants
  |
  +-- Select Restaurant Branch
  |
  +-- Enter Member Size
  |
  +-- Join Waiting Queue
  |
  +-- Get Queue Number
  |
  +-- See People Ahead / Waiting Count
  |
  +-- Cancel Queue if required

Manager
  |
  +-- Login from App
  |
  +-- See Today's Queue
  |
  +-- Add Customer Manually
  |
  +-- Call Customer
  |
  +-- Assign One or Multiple Tables
  |
  +-- Mark Customer Seated / Completed
  |
  +-- See Only Today's Branch History

Admin
  |
  +-- See All Restaurants
  +-- See All Branches
  +-- See All Managers
  +-- See All Customers
  +-- See All Tables
  +-- See Complete Queue History
  +-- Manage System Data
```

---

# 3. Role Structure

## 3.1 Admin

Admin will use Web.

Admin can:

- Create restaurant
- Update restaurant
- Activate/deactivate restaurant
- Manage restaurant information
- View all branches
- View all managers
- View all customers
- View all restaurant tables
- View today's queue
- View past queue history
- Manage queue-related records
- View complete system history

Admin has access to all restaurants and all branches.

---

## 3.2 Restaurant

Restaurant will use Web.

Restaurant can manage only its own data.

Restaurant can:

- View/update own restaurant profile
- Create branch
- Update branch
- Activate/deactivate branch
- Add manager to branch
- Update manager
- Manage restaurant tables
- Set table capacity
- View branch information

Restaurant cannot access another restaurant's data.

---

## 3.3 Restaurant Manager

Manager will use Mobile App.

Manager is assigned to a specific branch.

Manager can:

- Login
- View own branch
- View today's waiting queue
- Add customer manually
- Register customer in today's queue
- View customer/member count
- Call customer when turn arrives
- Assign one table
- Assign multiple tables
- Mark customer as seated
- Mark customer as completed
- Cancel/no-show queue entry where permitted
- View only today's branch history

### Manager History Rule

Manager can see:

```text
Current Branch + Current Date
```

Manager cannot see:

```text
Past Dates
Other Branches
Future Bookings
```

There is no future booking system.

---

# 4. Customer

Customer will use Mobile App.

Customer can:

- Register/login
- Manage own profile
- Get nearby restaurants
- View nearby restaurant branches
- View current waiting count
- View queue status
- Enter member size
- Join waiting queue
- See own queue number
- See people ahead
- Cancel own waiting queue
- Receive push notifications

Customer can also be added manually by a Restaurant Manager.

If a customer already exists, the existing customer account should be reused instead of creating duplicate customer accounts.

---

# 5. Restaurant Hierarchy

```text
Restaurant
   |
   +-- Branch 1
   |     |
   |     +-- Manager 1
   |     +-- Manager 2
   |     +-- Tables
   |
   +-- Branch 2
   |     |
   |     +-- Manager
   |     +-- Tables
   |
   +-- Branch 3
         |
         +-- Manager
         +-- Tables
```

A manager belongs to a specific branch.

---

# 6. Database Naming Convention

All database tables must start with:

```text
tbl_
```

Examples:

```text
tbl_user
tbl_restaurant
tbl_branch
tbl_manager
tbl_customer
tbl_restaurant_table
tbl_queue
tbl_queue_table
tbl_token
```

Primary key naming convention:

| Table | Primary Key |
|---|---|
| tbl_user | user_id |
| tbl_restaurant | restaurant_id |
| tbl_branch | branch_id |
| tbl_manager | manager_id |
| tbl_customer | customer_id |
| tbl_restaurant_table | table_id |
| tbl_queue | queue_id |
| tbl_queue_table | queue_table_id |
| tbl_token | token_id |

Foreign keys should also use the related table's primary-key name.

Example:

```text
restaurant_id
branch_id
manager_id
customer_id
user_id
table_id
queue_id
```

---

# 7. Common User Authentication

`tbl_user` will be the common authentication table.

```text
tbl_user
   |
   +-- ADMIN
   |
   +-- RESTAURANT
   |
   +-- MANAGER
   |
   +-- CUSTOMER
```

Recommended fields:

```text
user_id
name
email
phone
password
role
status
created_at
updated_at
```

The login system will be common.

JWT will contain the authenticated user's information and role.

Role-based middleware will protect APIs.

---

# 8. Device Token / FCM Notification

`tbl_token` is required for mobile/web push notifications.

Table:

```text
tbl_token
```

Fields:

```text
token_id
device_type
device_token
device_id
user_id
created_at
```

`device_type`:

```text
Android
Ios
Web
```

`device_token` is the **FCM token**.

Flow:

```text
User Login
    |
    +-- Device sends FCM token
    |
    +-- API saves token in tbl_token
    |
    +-- user_id is linked with token
```

One user can have multiple devices.

Example:

```text
user_id = 101

token_id | user_id | device_type | device_token
------------------------------------------------
1        | 101     | Android     | AAA...
2        | 101     | Ios         | BBB...
```

Notification flow:

```text
Queue Event
    |
    +-- Find user's tbl_token records
    |
    +-- Get device_token / FCM token
    |
    +-- Send Firebase notification
```

Example events:

- Customer's turn is near
- Customer called
- Table assigned
- Queue registration successful
- Queue cancelled
- Other important queue status updates

---

# 9. Restaurant Tables

Each branch can have multiple restaurant tables.

Example:

```text
Branch
 |
 +-- Table 1 -> Capacity 2
 +-- Table 2 -> Capacity 4
 +-- Table 3 -> Capacity 4
 +-- Table 4 -> Capacity 6
```

Recommended table fields:

```text
table_id
branch_id
table_number
capacity
status
created_at
updated_at
```

Table status can be:

```text
AVAILABLE
OCCUPIED
DISABLED
```

---

# 10. Queue / Waiting List

The queue is branch and date based.

Example:

```text
23 Sep - Branch A

#1 -> 2 members
#2 -> 4 members
#3 -> 3 members
#4 -> 6 members
```

Next day the numbering starts again:

```text
24 Sep - Branch A

#1
#2
#3
```

Queue number is therefore scoped to:

```text
branch_id + business_date
```

It does not need to be globally unique.

Recommended queue fields:

```text
queue_id
branch_id
customer_id
queue_number
member_count
status
registered_at
called_at
seated_at
completed_at
cancelled_at
```

Queue statuses:

```text
WAITING
CALLED
SEATED
COMPLETED
CANCELLED
NO_SHOW
```

---

# 11. Customer Queue Registration

Customer flow:

```text
Open App
   |
   +-- Get current location
   |
   +-- Find nearby restaurant branches
   |
   +-- Select branch
   |
   +-- Enter member count
   |
   +-- Register in queue
   |
   +-- Generate queue number
   |
   +-- Show queue information
```

Customer should see:

```text
Your Queue Number: #13
People Ahead: 2
Current Waiting Count: ...
Members: 4
Status: WAITING
```

---

# 12. Nearby Restaurant

Branches will store location information.

Recommended:

```text
latitude
longitude
```

Customer location is used to find nearby branches.

Example:

```text
Customer Location
      |
      +-- Nearby Branch Search
              |
              +-- Restaurant A
              |      Branch - Adajan
              |      Distance - 1.2 KM
              |      Waiting - 4
              |
              +-- Restaurant B
                     Branch - Vesu
                     Distance - 2.8 KM
                     Waiting - 9
```

Nearby search should be based on branch location and customer location.

---

# 13. Customer Cancellation

Customer can cancel a queue entry while it is cancellable.

Example:

```text
WAITING
   |
   +-- Customer Cancel
   |
   v
CANCELLED
```

Cancelled entries should remain in history.

They should not be physically deleted from the database.

---

# 14. Manager Manual Customer Registration

Manager can register a customer from the app.

Flow:

```text
Manager App
   |
   +-- Add Customer
   |
   +-- Search customer by phone
   |
   +-- Existing customer?
   |       |
   |       +-- YES -> Use existing customer
   |       |
   |       +-- NO -> Create customer
   |
   +-- Enter member count
   |
   +-- Add to today's queue
```

Duplicate customer accounts should be avoided.

---

# 15. Table Assignment

When customer's turn arrives, manager can assign:

- One table
- Multiple tables

Example:

```text
Customer = 7 members

Table 4 -> Capacity 4
Table 5 -> Capacity 4

Total capacity = 8

Manager assigns:
Table 4 + Table 5
```

This requires a mapping table:

```text
tbl_queue_table
```

Recommended fields:

```text
queue_table_id
queue_id
table_id
assigned_at
released_at
```

Relationship:

```text
Queue
  |
  +-- Queue Table Mapping
          |
          +-- Table 4
          +-- Table 5
```

---

# 16. Queue Lifecycle

Normal queue lifecycle:

```text
WAITING
   |
   v
CALLED
   |
   v
SEATED
   |
   v
COMPLETED
```

Alternative flows:

```text
WAITING -> CANCELLED

WAITING -> NO_SHOW

CALLED -> NO_SHOW
```

Queue records should not be deleted because they are required for history.

---

# 17. History Rules

## Admin

Admin can view complete history:

```text
Restaurant
   |
   +-- Branch
         |
         +-- Date
               |
               +-- Queue History
```

Admin can see:

- Current day
- Past days
- All branches
- All restaurants
- Queue records
- Customer information
- Member count
- Table assignment
- Queue status
- Relevant timestamps

---

## Manager

Manager can see only:

```text
Own Branch
+
Current Business Date
```

Manager cannot access:

```text
Past Date History
Other Branch History
Future Booking
```

---

# 18. No Future Booking

This system is a **same-day waiting list system**.

There will be no future booking.

Customer can only join:

```text
Current Business Day
```

There is no:

```text
Tomorrow booking
Next week booking
Future reservation
```

---

# 19. API Structure

API base URL:

```text
/api/v1
```

Recommended modules:

```text
/api/v1/auth
/api/v1/admin
/api/v1/restaurants
/api/v1/branches
/api/v1/managers
/api/v1/customers
/api/v1/tables
/api/v1/queue
/api/v1/history
/api/v1/tokens
```

---

# 20. Role-wise API Organization

## Auth

```text
POST /api/v1/auth/login
POST /api/v1/auth/logout
```

Customer registration:

```text
POST /api/v1/auth/customer/register
```

---

## Admin APIs

```text
/api/v1/admin/restaurants
/api/v1/admin/branches
/api/v1/admin/managers
/api/v1/admin/customers
/api/v1/admin/tables
/api/v1/admin/queue
/api/v1/admin/history
```

---

## Restaurant APIs

```text
/api/v1/restaurant/profile
/api/v1/restaurant/branches
/api/v1/restaurant/managers
/api/v1/restaurant/tables
```

---

## Manager APIs

```text
/api/v1/manager/profile
/api/v1/manager/customers
/api/v1/manager/queue
/api/v1/manager/tables
/api/v1/manager/history
```

---

## Customer APIs

```text
/api/v1/customer/profile
/api/v1/customer/restaurants
/api/v1/customer/queue
/api/v1/customer/tokens
```

---

# 21. Recommended Node.js Project Structure

```text
restaurant-queue-api/
│
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── env.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── admin.controller.js
│   │   ├── restaurant.controller.js
│   │   ├── branch.controller.js
│   │   ├── manager.controller.js
│   │   ├── customer.controller.js
│   │   ├── table.controller.js
│   │   └── queue.controller.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Restaurant.js
│   │   ├── Branch.js
│   │   ├── Manager.js
│   │   ├── Customer.js
│   │   ├── RestaurantTable.js
│   │   ├── Queue.js
│   │   ├── QueueTable.js
│   │   └── Token.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── admin.routes.js
│   │   ├── restaurant.routes.js
│   │   ├── branch.routes.js
│   │   ├── manager.routes.js
│   │   ├── customer.routes.js
│   │   ├── table.routes.js
│   │   └── queue.routes.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   └── validation.middleware.js
│   │
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── queue.service.js
│   │   ├── restaurant.service.js
│   │   ├── notification.service.js
│   │   └── token.service.js
│   │
│   ├── utils/
│   │   ├── jwt.js
│   │   ├── response.js
│   │   └── distance.js
│   │
│   ├── app.js
│   └── server.js
│
├── database/
│   ├── migrations/
│   └── seeders/
│
├── postman/
│   └── restaurant-queue.postman_collection.json
│
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

# 22. Postman Collection Structure

Postman collection must be organized role -> module -> API wise.

```text
Restaurant Queue API
│
├── Auth
│   ├── Admin
│   │   ├── Login
│   │   └── Logout
│   │
│   ├── Restaurant
│   │   ├── Login
│   │   └── Logout
│   │
│   ├── Manager
│   │   ├── Login
│   │   └── Logout
│   │
│   └── Customer
│       ├── Register
│       ├── Login
│       └── Logout
│
├── Admin
│   ├── Restaurant
│   ├── Branch
│   ├── Manager
│   ├── Customer
│   ├── Table
│   ├── Queue
│   └── History
│
├── Restaurant
│   ├── Profile
│   ├── Branch
│   ├── Manager
│   └── Table
│
├── Manager
│   ├── Profile
│   ├── Customer
│   ├── Queue
│   ├── Table
│   └── History
│
└── Customer
    ├── Profile
    ├── Restaurant
    ├── Queue
    └── Token
```

Whenever a new API is created, its Postman request should also be added to the collection.

---

# 23. Authentication Flow

```text
Login
  |
  +-- Validate email/phone + password
  |
  +-- Find tbl_user
  |
  +-- Check status
  |
  +-- Generate JWT
  |
  +-- Return JWT
  |
  +-- Mobile app can send device/FCM token
  |
  +-- Save token in tbl_token
```

Protected request:

```text
Request
  |
  +-- Authorization: Bearer JWT
  |
  +-- JWT Middleware
  |
  +-- Validate User
  |
  +-- Role Middleware
  |
  +-- Check Restaurant/Branch ownership
  |
  +-- Controller
  |
  +-- Service
  |
  +-- Database
```

---

# 24. Security Rules

Backend must enforce permissions.

Frontend-only permission checks are not enough.

Examples:

```text
Admin
-> Can access all restaurants

Restaurant
-> Can access only own restaurant

Manager
-> Can access only assigned branch

Customer
-> Can access only own customer data and queue
```

Passwords must be hashed using bcrypt.

JWT must be used for protected APIs.

Sensitive values must be stored in `.env`.

---

# 25. Development Sequence

Implementation should be done in this order:

```text
01. Project Setup
02. MySQL Connection
03. tbl_user
04. Authentication
05. JWT Middleware
06. Role Middleware
07. tbl_token
08. FCM Token API
09. Admin Restaurant APIs
10. Restaurant Branch APIs
11. Manager APIs
12. Restaurant Table APIs
13. Customer APIs
14. Nearby Restaurant API
15. Queue / Waiting List
16. Customer Self Registration
17. Manager Manual Registration
18. Queue Cancellation
19. Queue Status Management
20. Table Assignment
21. Multiple Table Assignment
22. Manager Today's History
23. Admin Complete History
24. FCM Notifications
25. Socket.IO Real-time Updates
26. Validation / Error Handling
27. Postman Collection Finalization
28. Testing
```

---

# 26. Important Business Rules

1. Every table name starts with `tbl_`.
2. Primary keys follow `<entity>_id`.
3. `tbl_token` stores FCM device tokens.
4. One user can have multiple device tokens.
5. Queue is branch-wise.
6. Queue number is date-wise.
7. Queue is only for the current business day.
8. Future booking is not supported.
9. Customer cancellation should preserve history.
10. Manager can see only today's history of their assigned branch.
11. Admin can see complete history.
12. Manager can add an existing customer to today's queue.
13. Duplicate customer accounts should be avoided.
14. One queue entry can have one or multiple assigned tables.
15. Table capacity should be considered during assignment.
16. Queue records should not be deleted for normal business operations.
17. Role and ownership checks must happen on the backend.
18. Postman collection must be maintained alongside every API module.
19. API structure should remain role -> module -> API organized.
20. Push notifications should use FCM tokens stored in `tbl_token`.

---

# 27. Current Implementation Status

```text
[✓] Node.js project setup
[✓] Express setup
[✓] MySQL connection
[✓] Environment configuration
[✓] Base API
[✓] Health API
[✓] tbl_ naming convention
[✓] tbl_token model
[ ] tbl_user
[ ] Authentication
[ ] JWT
[ ] Role middleware
[ ] Admin APIs
[ ] Restaurant APIs
[ ] Branch APIs
[ ] Manager APIs
[ ] Customer APIs
[ ] Table APIs
[ ] Queue APIs
[ ] History APIs
[ ] FCM notification
[ ] Socket.IO
[ ] Final Postman collection
```

---

# 28. Next Development Step

The next implementation step is:

```text
tbl_user
   |
   +-- Authentication
   |
   +-- JWT
   |
   +-- Role Middleware
   |
   +-- Login APIs
```

After authentication is completed, all four roles can safely use their respective APIs.

======================================changes======================================
Customer Role
- My Queue: View, join, cancel
- Nearby Restaurants: Table listing, view
- Device Tokens: Table listing, add
- Customer Profile: View, edit
- Registration: Add
Manager Role
- Today’s Queue: Table listing, add, update status
- Customers: Table listing, add, view, edit
- Tables: Table listing, add, view, edit
- Table Assignment: Add, edit
- Today’s History: Table listing, view
- Manager Profile: View, edit
Restaurant Role
- Branches: Table listing, add, view, edit
- Managers: Table listing, add, view, edit
- Tables: Table listing, add, view, edit
- Restaurant Profile: View, edit
Admin Role
- Restaurants: Table listing, add, view, edit
- Branches: Table listing, add, view, edit
- Managers: Table listing, add, view, edit
- Customers: Table listing, add, view, edit
- Tables: Table listing, add, view, edit
- Live Queue: Table listing, add, view, update status
- Queue History: Table listing, view
- Device Tokens: Table listing, view

- Admin: superadmin@restrodesk.com / Super@123
- Restaurant: restaurant@restrodesk.com / Restaurant@123
- Manager: manager@restrodesk.com / Manager@123
- Customer: customer@restrodesk.com / Customer@123
