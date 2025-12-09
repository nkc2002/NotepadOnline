import apiClient from './api';

export const authService = {
  /**
   * Register new user
   * @param {string} email 
   * @param {string} password 
   * @param {string} name 
   * @returns {Promise<Object>}
   */
  async register(email, password, name) {
    try {
      const response = await apiClient.post('/auth/register', {
        email,
        password,
        name
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Login user
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<Object>}
   */
  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout user
   * @returns {Promise<Object>}
   */
  async logout() {
    try {
      const response = await apiClient.post('/auth/logout');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get current user profile
   * @returns {Promise<Object>}
   */
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update user profile
   * @param {string} name 
   * @returns {Promise<Object>}
   */
  async updateProfile(name) {
    try {
      const response = await apiClient.put('/auth/me', { name });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Change user password
   * @param {string} currentPassword 
   * @param {string} newPassword 
   * @returns {Promise<Object>}
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await apiClient.put('/auth/password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default authService;

