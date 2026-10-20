import api from './api';

/**
 * ratingService: Centralized API calls for Ratings & Customer Reviews
 */
export const ratingService = {
  /**
   * Fetch all ratings, optionally filtered by partnerId
   */
  async getAllRatings(partnerId = null) {
    const url = partnerId ? `/ratings?partnerId=${partnerId}` : '/ratings';
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Fetch submitted rating for a specific booking
   */
  async getRatingByBookingId(bookingId) {
    const response = await api.get(`/ratings/${bookingId}`);
    return response.data;
  },

  /**
   * Submit a rating score and review. Enforced by trigger trg_rating_before_insert
   */
  async createRating(ratingData) {
    const response = await api.post('/ratings', ratingData);
    return response.data;
  },
};

export default ratingService;
