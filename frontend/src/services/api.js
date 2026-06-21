const API_BASE_URL = 'http://127.0.0.1:8000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('verse_auth_token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('verse_auth_token', token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('verse_auth_token');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur réseau' }));
      throw new Error(error.message || `Erreur HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async ownerRegister(name, email, phone, password) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async ownerLogin(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async driverLogin(credentials) {
    const data = await this.request('/auth/driver/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.setToken(data.token);
    return data;
  }

  // Vehicles endpoints
  async getVehicles() {
    return this.request('/vehicles');
  }

  async createVehicle(vehicleData) {
    return this.request('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicleData),
    });
  }

  async updateVehicle(id, vehicleData) {
    return this.request(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vehicleData),
    });
  }

  async deleteVehicle(id) {
    return this.request(`/vehicles/${id}`, {
      method: 'DELETE',
    });
  }

  // Drivers endpoints
  async getDrivers() {
    return this.request('/drivers');
  }

  async createDriver(driverData) {
    return this.request('/drivers', {
      method: 'POST',
      body: JSON.stringify(driverData),
    });
  }

  async updateDriver(id, driverData) {
    return this.request(`/drivers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(driverData),
    });
  }

  async deleteDriver(id) {
    return this.request(`/drivers/${id}`, {
      method: 'DELETE',
    });
  }

  // Payments endpoints
  async getPayments() {
    return this.request('/payments');
  }

  async approvePayment(id) {
    return this.request(`/payments/${id}/approve`, {
      method: 'POST',
    });
  }

  async rejectPayment(id) {
    return this.request(`/payments/${id}/reject`, {
      method: 'POST',
    });
  }

  // Maintenance endpoints
  async getMaintenance() {
    return this.request('/maintenance');
  }

  async createMaintenance(maintenanceData) {
    return this.request('/maintenance', {
      method: 'POST',
      body: JSON.stringify(maintenanceData),
    });
  }

  // Dashboard metrics
  async getFinancialMetrics() {
    return this.request('/dashboard/financials');
  }

  // Auth: get current user
  async getMe() {
    return this.request('/auth/me');
  }

  // Subscription endpoints
  async createSubscriptionPayment(plan, paymentMethod) {
    return this.request('/subscriptions/create-payment', {
      method: 'POST',
      body: JSON.stringify({ plan, payment_method: paymentMethod }),
    });
  }

  async getMySubscriptionPayments() {
    return this.request('/subscriptions/payments');
  }

  // Admin endpoints
  async adminGetUsers() {
    return this.request('/admin/users');
  }

  async adminGetSubscriptionPayments() {
    return this.request('/admin/subscription-payments');
  }

  async adminApproveSubscriptionPayment(paymentId) {
    return this.request(`/admin/subscription-payments/${paymentId}/approve`, {
      method: 'POST',
    });
  }

  async adminRejectSubscriptionPayment(paymentId, notes = '') {
    return this.request(`/admin/subscription-payments/${paymentId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }
}

export default new ApiService();
