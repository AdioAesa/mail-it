import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get Clerk token from session storage or local storage
    const token = sessionStorage.getItem('clerk_token') || localStorage.getItem('clerk_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      console.error('Unauthorized access - please login')
    }
    return Promise.reject(error)
  }
)

// Card Templates API
export const cardTemplatesAPI = {
  getAll: () => api.get('/card-templates'),
  getByCategory: (category) => api.get(`/card-templates?category=${category}`),
}

// Orders API
export const ordersAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getAll: (filters) => api.get('/orders', { params: filters }),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.post(`/orders/${id}/cancel`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
}

// Jobs API (for mailers)
export const jobsAPI = {
  getAvailable: (location) => api.get('/jobs/available', { params: location }),
  getMyJobs: () => api.get('/jobs/my-jobs'),
  getById: (id) => api.get(`/jobs/${id}`),
  accept: (id) => api.post(`/jobs/${id}/accept`),
  updateStatus: (id, status) => api.patch(`/jobs/${id}/status`, { status }),
  uploadProof: (id, formData) =>
    api.post(`/jobs/${id}/proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}

// Mailers API
export const mailersAPI = {
  register: (mailerData) => api.post('/mailers/register', mailerData),
  getProfile: () => api.get('/mailers/profile'),
  updateProfile: (data) => api.patch('/mailers/profile', data),
  getEarnings: () => api.get('/mailers/earnings'),
}

// Payment API
export const paymentAPI = {
  createPaymentIntent: (amount) => api.post('/payments/create-intent', { amount }),
  confirmPayment: (paymentIntentId) => api.post('/payments/confirm', { paymentIntentId }),
}

// Upload API
export const uploadAPI = {
  uploadImage: (formData) =>
    api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}

export default api
