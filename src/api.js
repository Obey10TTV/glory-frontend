import axios from 'axios'

const productionApiUrl = 'https://glory-store-production.up.railway.app/api'
const localHost = typeof window !== 'undefined' && window.location.hostname === '127.0.0.1'
  ? '127.0.0.1'
  : 'localhost'
const localApiUrl = `http://${localHost}:5000/api`
const normalizeApiUrl = (url) => (url || '').trim().replace(/\/$/, '')

const configuredApiUrl = normalizeApiUrl(import.meta.env.VITE_API_URL)
const useLocalApi = import.meta.env.VITE_USE_LOCAL_API === 'true'

const API = axios.create({
  baseURL: configuredApiUrl || (useLocalApi ? localApiUrl : productionApiUrl),
  timeout: 20000,
})

// Automatically add token to every request if user is logged in
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('gloryUser'))
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`
  }
  return config
})

// Handle expired tokens automatically
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid — log user out
      localStorage.removeItem('gloryUser')
      localStorage.removeItem('gloryCart')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// USERS
export const registerUser = (data) => API.post('/users/register', data)
export const loginUser = (data) => API.post('/users/login', data)
export const verifyEmailOtp = (data) => API.post('/users/verify-email', data)
export const resendVerificationOtp = (data) => API.post('/users/resend-verification', data)
export const verifyLoginTwoFactor = (data) => API.post('/users/2fa/verify-login', data)
export const startTwoFactorEnable = () => API.post('/users/2fa/enable/start')
export const confirmTwoFactorEnable = (data) => API.post('/users/2fa/enable/confirm', data)
export const startTwoFactorDisable = () => API.post('/users/2fa/disable/start')
export const confirmTwoFactorDisable = (data) => API.post('/users/2fa/disable/confirm', data)
export const getUserProfile = () => API.get('/users/profile')
export const updateSellerProfile = (data) => API.put('/users/seller-profile', data)

// PRODUCTS
export const getProducts = () => API.get('/products')
export const getMySellerProducts = () => API.get('/products/mine')
export const getProduct = (id) => API.get(`/products/${id}`)
export const createProduct = (data) => API.post('/products', data)
export const updateProduct = (id, data) => API.put(`/products/${id}`, data)
export const deleteProduct = (id) => API.delete(`/products/${id}`)

// ORDERS
export const createOrder = (data) => API.post('/orders', data)
export const getMyOrders = () => API.get('/orders/myorders')
export const getOrder = (id) => API.get(`/orders/${id}`)
export const payOrder = (id, data) => API.put(`/orders/${id}/pay`, data)

// REVIEWS
export const addReview = (productId, data) => API.post(`/reviews/${productId}`, data)
export const getReviews = (productId) => API.get(`/reviews/${productId}`)

// UPLOAD
export const uploadImage = (data) => API.post('/upload', data)

// PAYSTACK
export const initializePayment = (data) => API.post('/paystack/initialize', data)
export const verifyPayment = (reference) => API.get(`/paystack/verify/${reference}`)

// ADMIN
export const getAdminStats = () => API.get('/admin/stats')
export const getAllUsers = () => API.get('/admin/users')
export const getAllOrders = () => API.get('/admin/orders')
export const getAdminProducts = () => API.get('/admin/products')
export const updateProductStatus = (id, data) => API.put(`/admin/products/${id}/status`, data)
export const deleteUser = (id) => API.delete(`/admin/users/${id}`)
export const deleteAdminProduct = (id) => API.delete(`/admin/products/${id}`)
export const makeSeller = (id) => API.put(`/admin/users/${id}/makeseller`)
export const updateSellerStatus = (id, data) => API.put(`/admin/users/${id}/seller-status`, data)
