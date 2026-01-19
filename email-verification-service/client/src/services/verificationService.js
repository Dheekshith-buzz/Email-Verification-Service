import api from './api';

export const verificationService = {
  verifySingle: async (email) => {
    const response = await api.post('/verify/single', { email });
    return response.data;
  },

  verifyBulk: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/verify/bulk', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getHistory: async (page = 1, limit = 20) => {
    const response = await api.get('/verify/history', {
      params: { page, limit }
    });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/verify/stats');
    return response.data;
  }
};