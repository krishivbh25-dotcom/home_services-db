import api from './api';

/**
 * adminService: Centralized API calls querying SQL reporting views
 */
export const adminService = {
  /**
   * Fetch consolidated booking audit rows (queries booking_details view)
   */
  async getBookingDetails() {
    const response = await api.get('/booking-details');
    return response.data;
  },

  /**
   * Fetch pending KYC verification records (queries pending_kyc view)
   */
  async getPendingKyc() {
    const response = await api.get('/pending-kyc');
    return response.data;
  },

  /**
   * Fetch partner ratings and performance metrics (queries partner_ratings view)
   */
  async getPartnerRatings() {
    const response = await api.get('/partner-ratings');
    return response.data;
  },
};

export default adminService;
