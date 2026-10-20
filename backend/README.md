# Home Services Partner Management & Tracking System - Backend API

Production-ready Node.js and Express RESTful API backend for the **Home Services Partner Management & Tracking System**, integrated with a MySQL 8.0 relational database.

---

## Table of Contents
- [Architecture & Verification Summary](#architecture--verification-summary)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [How to Run](#how-to-run)
- [API Endpoint Directory](#api-endpoint-directory)
- [Example Requests & Responses](#example-requests--responses)
  - [1. System Health Check](#1-system-health-check)
  - [2. Customer Management](#2-customer-management)
  - [3. Categories & Services](#3-categories--services)
  - [4. Service Partners](#4-service-partners)
  - [5. Bookings & Partner Allocation](#5-bookings--partner-allocation)
  - [6. Booking Status Updates](#6-booking-status-updates)
  - [7. Ratings & Reviews](#7-ratings--reviews)
  - [8. Admin & Reporting Views](#8-admin--reporting-views)
- [Error Handling & MySQL Error Mapping](#error-handling--mysql-error-mapping)
- [Project Structure](#project-structure)

---

## Architecture & Verification Summary

The backend strictly adheres to modern enterprise Express and MySQL architecture principles:

- **100% Parameterized Queries**: Every SQL statement uses bound parameters (`?` placeholders via `mysql2/promise`). Zero string concatenation or template literal interpolation, guaranteeing complete immunity to SQL injection.
- **Zero Duplicated Business Logic**:
  - Automated partner assignment & availability checking are delegated to the MySQL stored procedure `CALL create_booking(?,?,?,?)`.
  - Sequential booking lifecycle transitions (`Assigned` &rarr; `En Route` &rarr; `Started` &rarr; `Completed`) are enforced via database triggers (`trg_booking_before_update`), rejecting invalid transitions with `SQLSTATE 45000`.
  - Job tracking timeline audit rows are automatically recorded by database triggers (`trg_booking_after_insert`, `trg_booking_after_update`).
  - Rating validity (verifying completion) is guarded at the database level (`trg_rating_before_insert`).
- **Native SQL Views**: Admin and partner reporting endpoints query database views (`pending_kyc`, `partner_ratings`, `booking_details`) directly without redundant JavaScript query reconstruction.
- **Centralized Error Handling**: Unhandled exceptions and MySQL errors are automatically caught and transformed into standard JSON responses using custom Express middleware.
- **Consistent Asynchronous Execution**: All controller actions utilize `async/await` patterns with structured try/catch blocks delegating to Express `next(err)`.
- **RESTful Naming Conventions**: Clean URL hierarchies with pluralized collection resources, standard HTTP verbs (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`), and semantic HTTP response codes.

---

## Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **MySQL Server**: v8.0 or higher

---

## Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install all required dependencies:
   ```bash
   npm install
   ```

---

## Environment Variables

Copy the sample environment file to create your local `.env`:

```bash
cp .env.example .env
```

Configure the following variables in `.env`:

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Number | `5000` | Port on which the Express server listens |
| `DB_HOST` | String | `localhost` | Hostname or IP of the MySQL server |
| `DB_PORT` | Number | `3306` | Port number of the MySQL server |
| `DB_USER` | String | `root` | MySQL username |
| `DB_PASSWORD`| String | `""` | MySQL password |
| `DB_NAME` | String | `home_services_db` | Target database name |

---

## Database Setup

Initialize the MySQL database using the provided SQL scripts in the `database/` folder in the following sequence:

```bash
# 1. Create database and table schema (12 tables with constraints)
mysql -u root -p < ../database/schema.sql

# 2. Seed initial data (customers, services, partners, bookings, etc.)
mysql -u root -p home_services_db < ../database/seed.sql

# 3. Create stored procedures, triggers, and views
mysql -u root -p home_services_db < ../database/logic.sql
```

---

## How to Run

### Development Mode (with hot reload via nodemon)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

Upon successful startup, the console displays:
```
Server running on http://localhost:5000
Connected to MySQL database: home_services_db
```

---

## API Endpoint Directory

### System
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Verify database connection pool health |

### Customers
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/customers` | Fetch all registered customers |
| `GET` | `/customers/:id` | Fetch customer details by ID |
| `POST` | `/customers` | Register a new customer |
| `PUT` | `/customers/:id` | Update customer details |
| `DELETE`| `/customers/:id` | Remove a customer |

### Categories & Services
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/categories` | Fetch all service categories |
| `GET` | `/categories/:id/services` | Fetch all services in a specific category |
| `GET` | `/services` | Fetch all services (supports `?categoryId=`) |
| `GET` | `/services/:id` | Fetch specific service details by ID |

### Service Partners
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/partners` | Fetch all partners (supports `?categoryId=&status=`) |
| `GET` | `/partners/:id` | Fetch partner details by ID |
| `GET` | `/partners/pending-kyc` | Fetch partners awaiting KYC approval (queries `pending_kyc` view) |
| `GET` | `/partners/ratings` | Fetch partner rating metrics (queries `partner_ratings` view) |

### Bookings
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/bookings` | List all bookings (supports `?customerId=&partnerId=&status=`) |
| `GET` | `/bookings/statuses` | Fetch allowed status enum values from database schema (`Job_Tracking`) |
| `GET` | `/bookings/:id` | Fetch detailed booking record by ID |
| `GET` | `/bookings/:id/tracking` | Fetch `Job_Tracking` audit history & schema statuses for a booking |
| `POST` | `/bookings` | Create booking & auto-assign partner (`CALL create_booking`) |
| `PATCH` | `/bookings/:id/status` | Update booking status (`UPDATE Booking`) |

### Ratings & Reviews
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/ratings` | Fetch all ratings (supports `?partnerId=`) |
| `GET` | `/ratings/:bookingId` | Fetch rating for a specific booking |
| `POST` | `/ratings` | Submit review/rating for a completed booking |

### Admin & Views
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/booking-details` | Fetch consolidated booking report (`booking_details` view) |
| `GET` | `/pending-kyc` | Fetch KYC pending partners (`pending_kyc` view) |
| `GET` | `/partner-ratings` | Fetch partner rating summary (`partner_ratings` view) |

---

## Example Requests & Responses

### 1. System Health Check
**Request:**
```http
GET /health HTTP/1.1
Host: localhost:5000
```
**Response (`200 OK`):**
```json
{
  "status": "connected"
}
```

---

### 2. Customer Management

#### Create Customer
**Request:**
```http
POST /customers HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "name": "Jane Doe",
  "phone": "9876543210",
  "email": "jane.doe@example.com"
}
```
**Response (`201 Created`):**
```json
{
  "customer_id": 11,
  "name": "Jane Doe",
  "phone": "9876543210",
  "email": "jane.doe@example.com",
  "registered_on": "2026-10-19"
}
```

#### Fetch Customer by ID
**Request:**
```http
GET /customers/1 HTTP/1.1
Host: localhost:5000
```
**Response (`200 OK`):**
```json
{
  "customer_id": 1,
  "name": "Aarav Sharma",
  "phone": "9876543210",
  "email": "aarav.sharma@example.com",
  "registered_on": "2024-01-10"
}
```

---

### 3. Categories & Services

#### Fetch Services by Category
**Request:**
```http
GET /categories/1/services HTTP/1.1
Host: localhost:5000
```
**Response (`200 OK`):**
```json
[
  {
    "service_id": 1,
    "category_id": 1,
    "service_name": "AC Deep Cleaning",
    "base_price": "599.00",
    "duration_min": 60
  },
  {
    "service_id": 2,
    "category_id": 1,
    "service_name": "AC Gas Refill",
    "base_price": "1499.00",
    "duration_min": 45
  },
  {
    "service_id": 3,
    "category_id": 1,
    "service_name": "Refrigerator Repair",
    "base_price": "499.00",
    "duration_min": 60
  }
]
```

---

### 4. Service Partners

#### Fetch Partners Awaiting KYC
**Request:**
```http
GET /partners/pending-kyc HTTP/1.1
Host: localhost:5000
```
**Response (`200 OK`):**
```json
[
  {
    "partner_id": 6,
    "partner_name": "Deepak Joshi",
    "phone": "9876543225",
    "category_name": "Electrical & Wiring",
    "doc_count": 1,
    "doc_types": "Aadhaar Card"
  },
  {
    "partner_id": 7,
    "partner_name": "Meera Nair",
    "phone": "9876543226",
    "category_name": "Plumbing & Sanitary",
    "doc_count": 0,
    "doc_types": null
  }
]
```

---

### 5. Bookings & Partner Allocation

#### Create Booking
Executes `CALL create_booking(?,?,?,?)`. The procedure validates ownership, matches a verified and available partner, reserves availability, inserts the booking in `'Assigned'` status, and triggers job tracking.

**Request:**
```http
POST /bookings HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "customerId": 1,
  "serviceId": 1,
  "addressId": 1,
  "scheduledOn": "2026-10-25 10:00:00"
}
```
**Response (`201 Created`):**
```json
{
  "booking_id": 11,
  "customer_id": 1,
  "customer_name": "Aarav Sharma",
  "service_id": 1,
  "service_name": "AC Deep Cleaning",
  "base_price": "599.00",
  "address_id": 1,
  "address": "Flat 401, Palm Heights, Sector 14, Gurgaon - 122001",
  "partner_id": 1,
  "partner_name": "Rajesh Kumar",
  "scheduled_on": "2026-10-25 10:00:00",
  "booking_status": "Assigned"
}
```

---

### 6. Booking Status Updates

#### Advance Booking Status
Status transitions must follow: `Assigned` &rarr; `En Route` &rarr; `Started` &rarr; `Completed` (or `Cancelled`). Transitions are enforced by trigger `trg_booking_before_update`.

**Request:**
```http
PATCH /bookings/11/status HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "booking_status": "En Route"
}
```
**Response (`200 OK`):**
```json
{
  "booking_id": 11,
  "customer_id": 1,
  "customer_name": "Aarav Sharma",
  "service_id": 1,
  "service_name": "AC Deep Cleaning",
  "address_id": 1,
  "partner_id": 1,
  "partner_name": "Rajesh Kumar",
  "scheduled_on": "2026-10-25 10:00:00",
  "booking_status": "En Route"
}
```

---

### 7. Ratings & Reviews

#### Submit Rating
Allowed only for bookings in `'Completed'` status (enforced by trigger `trg_rating_before_insert`).

**Request:**
```http
POST /ratings HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "bookingId": 1,
  "score": 5,
  "reviewText": "Excellent service and punctual arrival!"
}
```
**Response (`201 Created`):**
```json
{
  "rating_id": 5,
  "booking_id": 1,
  "score": 5,
  "review_text": "Excellent service and punctual arrival!",
  "rated_on": "2026-10-19"
}
```

---

### 8. Admin & Reporting Views

#### Consolidated Booking Details
**Request:**
```http
GET /booking-details HTTP/1.1
Host: localhost:5000
```
**Response (`200 OK`):**
```json
[
  {
    "booking_id": 1,
    "customer_name": "Aarav Sharma",
    "customer_phone": "9876543210",
    "service_name": "AC Deep Cleaning",
    "category_name": "Appliance Repair",
    "base_price": "599.00",
    "partner_name": "Rajesh Kumar",
    "partner_phone": "9876543220",
    "scheduled_on": "2024-03-01 10:00:00",
    "booking_status": "Completed",
    "service_address": "Flat 401, Palm Heights, Sector 14, Gurgaon - 122001",
    "rating_score": 5,
    "review_text": "Excellent service, very thorough cleaning of the AC unit."
  }
]
```

#### Partner Rating Summary
**Request:**
```http
GET /partner-ratings HTTP/1.1
Host: localhost:5000
```
**Response (`200 OK`):**
```json
[
  {
    "partner_id": 1,
    "partner_name": "Rajesh Kumar",
    "category_name": "Appliance Repair",
    "total_ratings": 2,
    "avg_score": "4.5000",
    "completed_bookings": 2
  }
]
```

---

## Error Handling & MySQL Error Mapping

A centralized Express error middleware captures and formats all errors uniformly:

```json
{
  "error": "<message description>"
}
```

### Error Code Mappings

| Condition / MySQL Error | SQLSTATE / Errno | HTTP Status | Response Payload |
| :--- | :--- | :--- | :--- |
| Custom Procedure / Trigger Signal | `SQLSTATE 45000` / `1644` | **`400 Bad Request`** | `{ "error": "<MySQL Signal Message>" }` |
| Unique Constraint Violation | `ER_DUP_ENTRY` / `1062` | **`409 Conflict`** | `{ "error": "Duplicate entry" }` |
| Client Validation / Missing Input | Handled in Controller | **`400 Bad Request`** | `{ "error": "<Validation Message>" }` |
| Resource Not Found | Handled in Controller | **`404 Not Found`** | `{ "error": "<Resource> not found" }` |
| Route Not Found | Route Handler Fallback | **`404 Not Found`** | `{ "error": "Route <METHOD> <URL> not found" }` |
| Unhandled Server / Driver Error | Any | **`500 Internal Server Error`**| `{ "error": "Internal Server Error" }` |

### Common Trigger/Procedure Error Messages (HTTP 400)

- **Date in the past:**
  ```json
  { "error": "Scheduled date and time must be in the future." }
  ```
- **Address not owned by customer:**
  ```json
  { "error": "The specified address does not belong to this customer." }
  ```
- **No partner available:**
  ```json
  { "error": "No verified and available partner found for the requested service and time." }
  ```
- **Illegal status jump (e.g. Assigned to Completed):**
  ```json
  { "error": "Invalid status transition from Assigned to Completed." }
  ```
- **Rating before completion:**
  ```json
  { "error": "Ratings can only be submitted for completed bookings." }
  ```

### Duplicate Entry Errors (HTTP 409)

- **Submitting a second rating for a booking:**
  ```json
  { "error": "Duplicate entry" }
  ```
- **Registering an already existing phone/email:**
  ```json
  { "error": "Duplicate entry" }
  ```

---

## Project Structure

```
backend/
├── config/
│   └── db.js                 # mysql2/promise connection pool
├── controllers/
│   ├── adminController.js    # Direct queries against SQL views
│   ├── bookingController.js  # Stored procedure & status update handlers
│   ├── customerController.js # CRUD operations on Customer table
│   ├── partnerController.js  # Partner listing & KYC/rating view queries
│   ├── ratingController.js   # Rating submission & retrieval
│   └── serviceController.js  # Category & service retrieval
├── middleware/
│   ├── errorHandler.js       # Centralized MySQL & Express error mapper
│   └── notFoundHandler.js    # Fallback for undefined routes
├── routes/
│   ├── adminRoutes.js        # /booking-details, /pending-kyc, /partner-ratings
│   ├── bookingRoutes.js      # /bookings
│   ├── categoryRoutes.js     # /categories
│   ├── customerRoutes.js     # /customers
│   ├── index.js              # Aggregated master route dispatcher
│   ├── partnerRoutes.js      # /partners
│   ├── ratingRoutes.js       # /ratings
│   └── serviceRoutes.js      # /services
├── .env.example              # Environment configuration template
├── package.json              # Project dependencies and run scripts
├── README.md                 # Complete documentation
└── server.js                 # Express application entrypoint
```
