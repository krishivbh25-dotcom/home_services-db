# Home Services Partner Management System - Frontend

A minimal, professional, student-built React + Vite single-page application (SPA) for a **College DBMS Mini Project**, backed by a MySQL 8.0 relational database and an Express REST API.

---

## Key Highlights

- **Role-Based Simulation**: Interactive persona switcher in the top navigation bar to toggle between **Customer**, **Partner**, and **Administrator** modes without requiring authentication.
- **Dynamic Status Stepper (`BookingStepper`)**: Reads live status history from database table `Job_Tracking` and allowed ENUM statuses from the MySQL schema. Displays step progression (Assigned &rarr; En Route &rarr; Started &rarr; Completed) with timestamps beside completed steps.
- **Verbatim Trigger Error Toasts**: Uses `react-toastify` to display exact MySQL trigger error messages (e.g., `"Cannot skip booking status."`, `"Booking must be completed before rating."`, `"No verified partner available."`).
- **Administrative SQL Views**: Direct tabular querying and sorting for SQL views `booking_details`, `pending_kyc`, and `partner_ratings`.
- **Minimalist Academic Design System**: Clean white surfaces, neutral greys, primary blue (`#1E40AF`), and accent amber (`#D97706`). Avoids AI gradients, glassmorphism, and unnecessary animations.

---

## Folder Structure

```
frontend/
├── public/
├── src/
│   ├── assets/             # Static brand assets (logo.svg)
│   ├── components/         # Reusable UI components
│   │   ├── Alert/          # Inline alert banners (success, error, warning)
│   │   ├── Badge/          # Status pills (Assigned, En Route, Started, Completed, Verified)
│   │   ├── BookingStepper/ # Dynamic Job_Tracking stepper with timestamps & down arrows
│   │   ├── EmptyState/     # Standardized empty table/list placeholder
│   │   ├── Footer/         # Academic project footer with DBMS metadata
│   │   ├── Loading/        # Academic loading spinner
│   │   ├── Navbar/         # Top navigation bar with role persona switcher
│   │   └── Sidebar/        # Left navigation rail adapted per role
│   ├── hooks/              # Custom React hooks
│   │   ├── useRole.jsx     # Context provider for active role & entity IDs
│   │   └── useSortableData.js # Generic client-side table sorting hook
│   ├── layouts/            # Shell layouts
│   │   └── RootLayout.jsx  # Responsive grid shell (Navbar + Sidebar + Main + Footer)
│   ├── pages/              # Role-specific application views
│   │   ├── Admin/          # Admin Dashboard, Booking Details View, Partner Ratings, Pending KYC
│   │   ├── Customer/       # Dashboard, Browse Services, Book Service, My Bookings, Details, Rating
│   │   ├── Partner/        # Dashboard, Assigned Jobs, Job Details, Availability, Services, Profile
│   │   ├── LandingPage/    # Clean role portal gateway
│   │   └── NotFound/       # Academic 404 error page
│   ├── services/           # Reusable Axios service layer
│   │   ├── api.js          # Configured Axios instance with centralized error interceptor
│   │   ├── customerService.js
│   │   ├── bookingService.js
│   │   ├── partnerService.js
│   │   ├── adminService.js
│   │   └── ratingService.js
│   ├── styles/             # Global CSS & CSS variables (design system tokens)
│   │   ├── variables.css   # Color palette, spacing grid, border radius, shadows
│   │   └── global.css      # CSS resets, uniform typography, button & table classes
│   ├── App.jsx             # React Router routing configuration & ToastContainer
│   └── main.jsx            # Application entry point
├── .env.example            # Environment variable template
├── package.json
└── vite.config.js
```

---

## Installation & Setup

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Backend server running on `http://localhost:5000`

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default configuration:
```env
VITE_API_URL=http://localhost:5000
```

### 4. Run Development Server
```bash
npm run dev
```
The frontend will start at `http://localhost:5173`.

### 5. Production Build
```bash
npm run build
```
Generates optimized static assets in the `dist/` directory.

---

## Page & Routing Directory

| URL Route | Module | Purpose |
| :--- | :--- | :--- |
| `/` | Landing | Academic project portal gateway with 3 entry cards |
| `/customer` | Customer | Upcoming jobs, quick stats, demo customer switcher |
| `/services` | Customer | Browse catalog categorized services |
| `/book` | Customer | Booking form invoking stored procedure `create_booking` |
| `/bookings` | Customer | Customer order history with status filter tabs |
| `/bookings/:id` | Customer | Booking details & live `Job_Tracking` stepper |
| `/ratings/new` | Customer | 5-star rating form enforced by trigger `trg_rating_before_insert` |
| `/partner` | Partner | Technician job overview, today's jobs, rating summary |
| `/partner/jobs` | Partner | Assigned job table with status advancement dropdowns |
| `/partner/jobs/:id` | Partner | Technician job detail screen with audit stepper |
| `/partner/availability` | Partner | Weekly working schedule (`Partner_Availability`) |
| `/partner/services` | Partner | Custom hourly rates and offering toggle |
| `/partner/profile` | Partner | Partner KYC verification status & documents |
| `/admin` | Admin | Administrative reporting dashboard & DB schema summary |
| `/pending-kyc` | Admin | Sortable audit table querying SQL view `pending_kyc` |
| `/partner-ratings`| Admin | Sortable rating metric table querying SQL view `partner_ratings` |
| `/booking-details`| Admin | Master audit table querying SQL view `booking_details` |
| `*` | Common | Academic 404 page with dashboard recovery links |
