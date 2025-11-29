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
  register: (mailerData) => api.post('/mailer/register', mailerData),
  getProfile: () => api.get('/mailer/profile'),
  updateProfile: (data) => api.patch('/mailer/profile', data),
  getEarnings: () => api.get('/mailer/earnings'),
  getNearby: (lat, lng, radius = 15) =>
    api.get('/mailer/nearby', { params: { lat, lng, radius } }),
}

// Geocoding API
export const geocodingAPI = {
  geocodeAddress: async (street, city, state, zipCode) => {
    // Try structured query first for better results
    const structuredUrl = `https://nominatim.openstreetmap.org/search?` +
      `street=${encodeURIComponent(street)}&` +
      `city=${encodeURIComponent(city)}&` +
      `state=${encodeURIComponent(state)}&` +
      `postalcode=${encodeURIComponent(zipCode)}&` +
      `country=USA&format=json&limit=1`

    try {
      let response = await fetch(structuredUrl, {
        headers: { 'User-Agent': 'MailIt App (contact@mailit.com)' }
      })
      let data = await response.json()

      // If structured query fails, try free-form query
      if (!data || data.length === 0) {
        const query = `${street}, ${city}, ${state} ${zipCode}, USA`
        const freeFormUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
        response = await fetch(freeFormUrl, {
          headers: { 'User-Agent': 'MailIt App (contact@mailit.com)' }
        })
        data = await response.json()
      }

      // If still no results, try just city/state/zip
      if (!data || data.length === 0) {
        const fallbackQuery = `${city}, ${state} ${zipCode}, USA`
        const fallbackUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fallbackQuery)}&format=json&limit=1`
        response = await fetch(fallbackUrl, {
          headers: { 'User-Agent': 'MailIt App (contact@mailit.com)' }
        })
        data = await response.json()
      }

      if (!data || data.length === 0) {
        throw new Error('Address not found')
      }

      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      throw new Error('Could not locate address. Please verify and try again.')
    }
  }
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
