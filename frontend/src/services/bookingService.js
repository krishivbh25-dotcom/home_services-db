import api from './api';

/**
 * bookingService: Centralized API calls for Bookings and Status Lifecycle Transitions
 */
export const bookingService = {
  /**
   * Fetch all bookings with optional filtering by customerId, partnerId, or status
   */
  async getAllBookings(filters = {}) {
    const params = new URLSearchParams();
    if (filters.customerId) params.append('customerId', filters.customerId);
    if (filters.partnerId) params.append('partnerId', filters.partnerId);
    if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);

    const queryString = params.toString();
    const url = queryString ? `/bookings?${queryString}` : '/bookings';

    const response = await api.get(url);
    return response.data;
  },

  /**
   * Fetch detailed booking record by ID
   */
  async getBookingById(id) {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  /**
   * Create a booking and auto-assign partner via stored procedure create_booking
   */
  async createBooking(bookingData) {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  /**
   * Advance booking status. Validated by MySQL trigger trg_booking_before_update
   */
  async updateBookingStatus(bookingId, status) {
    const response = await api.patch(`/bookings/${bookingId}/status`, {
      booking_status: status,
    });
    return response.data;
  },

  /**
   * Fetch Job_Tracking audit history and allowed statuses for a booking
   */
  async getBookingTracking(bookingId) {
    const response = await api.get(`/bookings/${bookingId}/tracking`);
    return response.data;
  },

  /**
   * Fetch allowed booking/tracking status list dynamically from database
   */
  async getBookingStatuses() {
    const response = await api.get('/bookings/statuses');
    return response.data;
  },
};

export default bookingService;
