import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RootLayout from './layouts/RootLayout';
import { RoleProvider } from './hooks/useRole';
import {
  LandingPage,
  CustomerDashboard,
  BrowseServices,
  BookService,
  MyBookings,
  BookingDetails,
  RateBooking,
  PartnerDashboard,
  AssignedJobs,
  PartnerAvailability,
  PartnerServices,
  PartnerProfile,
  PartnerJobDetails,
  AdminDashboard,
  PendingKyc,
  PartnerRatings,
  BookingDetailsView,
  NotFound,
} from './pages';

export default function App() {
  return (
    <RoleProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            {/* Landing Page */}
            <Route index element={<LandingPage />} />

            {/* Customer Module Routes */}
            <Route path="customer" element={<CustomerDashboard />} />
            <Route path="services" element={<BrowseServices />} />
            <Route path="book" element={<BookService />} />
            <Route path="bookings" element={<MyBookings />} />
            <Route path="bookings/:id" element={<BookingDetails />} />
            <Route path="ratings" element={<RateBooking />} />
            <Route path="ratings/new" element={<RateBooking />} />

            {/* Partner Module Routes */}
            <Route path="partner" element={<PartnerDashboard />} />
            <Route path="partner/jobs" element={<AssignedJobs />} />
            <Route path="partner/jobs/:id" element={<PartnerJobDetails />} />
            <Route path="partner/availability" element={<PartnerAvailability />} />
            <Route path="partner/services" element={<PartnerServices />} />
            <Route path="partner/profile" element={<PartnerProfile />} />

            {/* Admin Module Routes (Direct SQL View Querying) */}
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="pending-kyc" element={<PendingKyc />} />
            <Route path="partner-ratings" element={<PartnerRatings />} />
            <Route path="booking-details" element={<BookingDetailsView />} />

            {/* 404 Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="light"
        />
      </BrowserRouter>
    </RoleProvider>
  );
}
