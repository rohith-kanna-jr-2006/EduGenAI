import apiClient from './api';

export const authService = {
  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.data?.token) {
        localStorage.setItem('edugenai_token', response.data.token);
        localStorage.setItem('edugenai_user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      // If server is not running (Network Error), provide clean developer fallback
      if (!error.response) {
        console.warn('Backend server offline. Using local session mode.');
        const mockUser = {
          id: 'usr_edu_101',
          name: email.split('@')[0].replace('.', ' ').replace(/^./, str => str.toUpperCase()) || 'Educator',
          email: email,
          role: 'Curriculum Director',
          district: 'Lincoln School District',
          avatar: null,
          tokenBudget: 50000,
          usedBudget: 14250,
        };
        const mockToken = 'mock_jwt_token_' + Date.now();
        localStorage.setItem('edugenai_token', mockToken);
        localStorage.setItem('edugenai_user', JSON.stringify(mockUser));
        return { token: mockToken, user: mockUser, isLocalFallback: true };
      }
      throw error;
    }
  },

  async signup(userData) {
    try {
      const response = await apiClient.post('/auth/signup', userData);
      if (response.data?.token) {
        localStorage.setItem('edugenai_token', response.data.token);
        localStorage.setItem('edugenai_user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      if (!error.response) {
        console.warn('Backend server offline. Using local session mode.');
        const mockUser = {
          id: 'usr_' + Date.now(),
          name: userData.name,
          email: userData.email,
          role: 'Teacher',
          district: 'Unified District 4',
          tokenBudget: 25000,
          usedBudget: 0,
        };
        const mockToken = 'mock_jwt_token_' + Date.now();
        localStorage.setItem('edugenai_token', mockToken);
        localStorage.setItem('edugenai_user', JSON.stringify(mockUser));
        return { token: mockToken, user: mockUser, isLocalFallback: true };
      }
      throw error;
    }
  },

  async requestPasswordReset(email) {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      if (!error.response) {
        return { message: 'Password reset link sent to ' + email, isLocalFallback: true };
      }
      throw error;
    }
  },

  getCurrentUser() {
    try {
      const user = localStorage.getItem('edugenai_user');
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('edugenai_token');
  },

  logout() {
    localStorage.removeItem('edugenai_token');
    localStorage.removeItem('edugenai_user');
  }
};
