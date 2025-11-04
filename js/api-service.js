// API Service for Backend Integration
// Base URL - will use environment variable in production
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000' 
  : 'https://irl-assessment-platform.vercel.app'; // Update this with your actual backend URL

class APIService {
  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  // Helper method for API calls
  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Set token after login
  setToken(token) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  // Clear token on logout
  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // AUTH ENDPOINTS
  async register(userData) {
    const data = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    this.setToken(data.token);
    return data;
  }

  async login(email, password) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setToken(data.token);
    return data;
  }

  async getCurrentUser() {
    return await this.request('/api/auth/me');
  }

  logout() {
    this.clearToken();
    window.location.href = 'landing/index.html';
  }

  // ASSESSMENT ENDPOINTS (Startup)
  async createAssessment(assessmentData) {
    return await this.request('/api/assessments', {
      method: 'POST',
      body: JSON.stringify(assessmentData)
    });
  }

  async getMyAssessments() {
    return await this.request('/api/assessments');
  }

  async getAssessment(id) {
    return await this.request(`/api/assessments/${id}`);
  }

  // ACTION PLAN ENDPOINTS
  async createActionPlan(planData) {
    return await this.request('/api/action-plans', {
      method: 'POST',
      body: JSON.stringify(planData)
    });
  }

  async getMyActionPlans() {
    return await this.request('/api/action-plans/startup');
  }

  // UNIVERSITY ENDPOINTS
  async getCuratedStartups() {
    return await this.request('/api/organization/startups');
  }

  async getStartupDetails(startupId) {
    return await this.request(`/api/organization/startups/${startupId}`);
  }

  async curateStartup(startupEmail) {
    return await this.request('/api/organization/curate', {
      method: 'POST',
      body: JSON.stringify({ startup_email: startupEmail })
    });
  }

  // ADMIN ENDPOINTS
  async getAllUsers() {
    return await this.request('/api/admin/users');
  }

  async getAllAssessments() {
    return await this.request('/api/admin/assessments');
  }

  async getAllActionPlans() {
    return await this.request('/api/admin/action-plans');
  }

  async getAdminStats() {
    return await this.request('/api/admin/stats');
  }

  // HEALTH CHECK
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'unhealthy', error: error.message };
    }
  }
}

// Create global instance
const apiService = new APIService();
window.apiService = apiService;
