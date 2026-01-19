const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Mock API functions for development
export const authService = {
  login: async (email, password) => {
    // Mock API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            user: { email, credits: 100, name: 'Demo User' },
            token: 'mock_jwt_token_' + Math.random().toString(36).substring(7)
          }
        });
      }, 1000);
    });
  },

  logout: () => {
    localStorage.clear();
  }
};

export const verificationService = {
  verifySingle: async (email) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        const isDisposable = email.includes('tempmail') || email.includes('mailinator');
        const isRoleAccount = email.startsWith('admin@') || email.startsWith('support@');
        
        resolve({
          success: true,
          data: {
            verification: {
              email,
              isValid,
              isDisposable,
              isRoleAccount,
              status: !isValid ? 'invalid_format' : 
                     isDisposable ? 'disposable' : 
                     isRoleAccount ? 'role_account' : 'valid',
              timestamp: new Date().toISOString()
            }
          }
        });
      }, 1500);
    });
  },

  verifyBulk: async (file) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            batchId: 'batch_' + Date.now(),
            fileName: file.name,
            totalEmails: Math.floor(Math.random() * 100) + 1,
            status: 'processing'
          }
        });
      }, 1000);
    });
  },

  getHistory: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            verifications: [
              { id: 1, email: 'test@gmail.com', status: 'valid', date: '2024-01-15' },
              { id: 2, email: 'admin@company.com', status: 'role_account', date: '2024-01-14' },
              { id: 3, email: 'temp@mailinator.com', status: 'disposable', date: '2024-01-14' }
            ]
          }
        });
      }, 800);
    });
  }
};
