import apiClient from './api';

export const noteService = {
  /**
   * Get user's notes
   * @param {number} page 
   * @param {number} limit 
   * @param {string} search 
   * @returns {Promise<Object>}
   */
  async getUserNotes(page = 1, limit = 10, search = '') {
    try {
      const response = await apiClient.get('/notes', {
        params: { page, limit, search }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get note by ID
   * @param {string} id 
   * @returns {Promise<Object>}
   */
  async getNoteById(id) {
    try {
      const response = await apiClient.get(`/notes/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get note by share ID (public)
   * @param {string} shareId 
   * @returns {Promise<Object>}
   */
  async getNoteByShareId(shareId) {
    try {
      const response = await apiClient.get(`/notes/share/${shareId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new note
   * @param {Object} noteData 
   * @param {string|null} editToken 
   * @returns {Promise<Object>}
   */
  async createNote(noteData, editToken = null) {
    try {
      const config = editToken
        ? { headers: { 'X-Edit-Token': editToken } }
        : {};
      
      const response = await apiClient.post('/notes', noteData, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update note
   * @param {string} id 
   * @param {Object} noteData 
   * @param {string|null} editToken 
   * @returns {Promise<Object>}
   */
  async updateNote(id, noteData, editToken = null) {
    try {
      const config = editToken
        ? { headers: { 'X-Edit-Token': editToken } }
        : {};
      
      const response = await apiClient.put(`/notes/${id}`, noteData, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete note
   * @param {string} id 
   * @param {string|null} editToken 
   * @returns {Promise<Object>}
   */
  async deleteNote(id, editToken = null) {
    try {
      const config = editToken
        ? { headers: { 'X-Edit-Token': editToken } }
        : {};
      
      const response = await apiClient.delete(`/notes/${id}`, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get public notes list
   * @param {number} page 
   * @param {number} limit 
   * @returns {Promise<Object>}
   */
  async getPublicNotes(page = 1, limit = 10) {
    try {
      const response = await apiClient.get('/notes/public/list', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default noteService;

