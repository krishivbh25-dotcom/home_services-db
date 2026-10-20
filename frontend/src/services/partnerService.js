import api from './api';

/**
 * partnerService: Centralized API calls for Partners, Availability, Services & KYC
 */
export const partnerService = {
  /**
   * Fetch all service partners with optional filtering
   */
  async getAllPartners(filters = {}) {
    const params = new URLSearchParams();
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.status) params.append('status', filters.status);

    const queryString = params.toString();
    const url = queryString ? `/partners?${queryString}` : '/partners';

    const response = await api.get(url);
    return response.data;
  },

  /**
   * Fetch single partner profile by ID
   */
  async getPartnerById(id) {
    const response = await api.get(`/partners/${id}`);
    return response.data;
  },

  /**
   * Fetch partner's recurring weekly availability slots
   */
  async getPartnerAvailability(partnerId) {
    const response = await api.get(`/partners/${partnerId}/availability`);
    return response.data;
  },

  /**
   * Fetch services offered and custom rates by partner
   */
  async getPartnerServices(partnerId) {
    const response = await api.get(`/partners/${partnerId}/services`);
    return response.data;
  },

  /**
   * Update custom price or active state for an offered service
   */
  async updatePartnerService(partnerId, serviceId, data) {
    const response = await api.put(`/partners/${partnerId}/services/${serviceId}`, data);
    return response.data;
  },

  /**
   * Fetch uploaded compliance documents for a partner
   */
  async getPartnerDocuments(partnerId) {
    const response = await api.get(`/partners/${partnerId}/documents`);
    return response.data;
  },

  /**
   * Fetch partners awaiting KYC approval (queries pending_kyc view)
   */
  async getPendingKyc() {
    const response = await api.get('/partners/pending-kyc');
    return response.data;
  },

  /**
   * Fetch partner ratings summary (queries partner_ratings view)
   */
  async getPartnerRatings() {
    const response = await api.get('/partners/ratings');
    return response.data;
  },
};

export default partnerService;
