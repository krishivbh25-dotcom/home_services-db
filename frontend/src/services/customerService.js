import api from './api';

/**
 * customerService: Centralized API calls for Customers, Addresses, and Catalog
 */
export const customerService = {
  /**
   * Fetch all registered customers
   */
  async getAllCustomers() {
    const response = await api.get('/customers');
    return response.data;
  },

  /**
   * Fetch single customer by ID
   */
  async getCustomerById(id) {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  /**
   * Fetch all addresses saved for a specific customer
   */
  async getCustomerAddresses(customerId) {
    const response = await api.get(`/customers/${customerId}/addresses`);
    return response.data;
  },

  /**
   * Register a new customer
   */
  async createCustomer(data) {
    const response = await api.post('/customers', data);
    return response.data;
  },

  /**
   * Update an existing customer's information
   */
  async updateCustomer(id, data) {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  },

  /**
   * Remove a customer by ID
   */
  async deleteCustomer(id) {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },

  /**
   * Fetch all service categories
   */
  async getCategories() {
    const response = await api.get('/categories');
    return response.data;
  },

  /**
   * Fetch services, optionally filtered by category
   */
  async getServices(categoryId) {
    const url = categoryId && categoryId !== 'ALL' ? `/services?categoryId=${categoryId}` : '/services';
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Fetch single service details
   */
  async getServiceById(id) {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },
};

export default customerService;
