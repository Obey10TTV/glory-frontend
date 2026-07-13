import axios from 'axios'

const productionApiUrl = '/api'
const localHost = typeof window !== 'undefined' && window.location.hostname === '127.0.0.1'
  ? '127.0.0.1'
  : 'localhost'
const localApiUrl = `http://${localHost}:5000/api`
const normalizeApiUrl = (url) => (url || '').trim().replace(/\/$/, '')
const configuredApiUrl = normalizeApiUrl(import.meta.env.VITE_API_URL)
const useLocalApi = import.meta.env.VITE_USE_LOCAL_API === 'true'
const baseURL = configuredApiUrl || (useLocalApi ? localApiUrl : productionApiUrl)

const API = axios.create({ baseURL, timeout: 20000, withCredentials: true })
const csrfClient = axios.create({ baseURL, timeout: 20000, withCredentials: true })
const CSRF_STORAGE_KEY = 'gloryCsrfToken'
const mutatingMethods = new Set(['post', 'put', 'patch', 'delete'])
let csrfPromise

const getCsrfToken = async (force = false) => {
  if (!force) {
    const saved = sessionStorage.getItem(CSRF_STORAGE_KEY)
    if (saved) return saved
  }
  if (!csrfPromise) {
    csrfPromise = csrfClient.get('/users/csrf')
      .then(({ data }) => {
        sessionStorage.setItem(CSRF_STORAGE_KEY, data.csrfToken)
        return data.csrfToken
      })
      .finally(() => { csrfPromise = null })
  }
  return csrfPromise
}

API.interceptors.request.use(async (config) => {
  if (mutatingMethods.has(String(config.method).toLowerCase())) {
    config.headers['X-CSRF-Token'] = await getCsrfToken()
  }
  return config
})

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const canRefreshCsrf = error.response?.status === 403
      && original
      && !original._gloryCsrfRetried
      && mutatingMethods.has(String(original.method).toLowerCase())

    if (canRefreshCsrf) {
      original._gloryCsrfRetried = true
      try {
        const csrfToken = await getCsrfToken(true)
        original.headers['X-CSRF-Token'] = csrfToken
        return API(original)
      } catch (csrfError) {
        return Promise.reject(csrfError)
      }
    }

    const canRefresh = error.response?.status === 401
      && original
      && !original._gloryRetried
      && !String(original.url).includes('/users/refresh')
      && !String(original.url).includes('/users/login')

    if (canRefresh) {
      original._gloryRetried = true
      try {
        const csrfToken = await getCsrfToken()
        await csrfClient.post('/users/refresh', {}, {
          headers: { 'X-CSRF-Token': csrfToken }
        })
        return API(original)
      } catch (refreshError) {
        localStorage.removeItem('gloryUser')
        window.dispatchEvent(new Event('glory:auth-expired'))
      }
    }
    return Promise.reject(error)
  }
)

// USERS
export const registerUser = (data) => API.post('/users/register', data)
export const loginUser = (data) => API.post('/users/login', data)
export const logoutUser = () => API.post('/users/logout')
export const refreshSession = () => API.post('/users/refresh')
export const verifyEmailOtp = (data) => API.post('/users/verify-email', data)
export const resendVerificationOtp = (data) => API.post('/users/resend-verification', data)
export const verifyLoginTwoFactor = (data) => API.post('/users/2fa/verify-login', data)
export const startTwoFactorEnable = () => API.post('/users/2fa/enable/start')
export const confirmTwoFactorEnable = (data) => API.post('/users/2fa/enable/confirm', data)
export const startTwoFactorDisable = () => API.post('/users/2fa/disable/start')
export const confirmTwoFactorDisable = (data) => API.post('/users/2fa/disable/confirm', data)
export const startRecoveryCodeRegeneration = () => API.post('/users/2fa/recovery/start')
export const confirmRecoveryCodeRegeneration = (data) => API.post('/users/2fa/recovery/confirm', data)
export const getUserProfile = () => API.get('/users/profile')
export const getSessions = () => API.get('/users/sessions')
export const revokeSession = (sessionId) => API.delete(`/users/sessions/${sessionId}`)
export const revokeAllSessions = () => API.delete('/users/sessions')
export const updateSellerProfile = (data) => API.put('/users/seller-profile', data)
export const exportMyData = () => API.get('/users/privacy/export')
export const requestAccountDeletion = (data) => API.post('/users/privacy/deletion-request', data)
export const cancelAccountDeletion = () => API.delete('/users/privacy/deletion-request')

// PRODUCTS
export const getProducts = (params) => API.get('/products', { params })
export const getMySellerProducts = () => API.get('/products/mine')
export const getProduct = (id) => API.get(`/products/${id}`)
export const createProduct = (data) => API.post('/products', data)
export const updateProduct = (id, data) => API.put(`/products/${id}`, data)
export const deleteProduct = (id) => API.delete(`/products/${id}`)

// ORDERS
export const createOrder = (data, idempotencyKey) => API.post('/orders', data, {
  headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined
})
export const getMyOrders = () => API.get('/orders/myorders')
export const getSellerOrders = () => API.get('/orders/seller')
export const getOrder = (id) => API.get(`/orders/${id}`)
export const cancelOrder = (id, data) => API.put(`/orders/${id}/cancel`, data)
export const openOrderDispute = (id, data) => API.post(`/orders/${id}/dispute`, data)
export const addOrderSupportNote = (id, data) => API.post(`/orders/${id}/support-notes`, data)
export const updateSellerOrderStatus = (id, data) => API.put(`/orders/${id}/fulfillment`, data)
export const payOrder = (id, data) => API.put(`/orders/${id}/pay`, data)

// REVIEWS
export const addReview = (productId, data) => API.post(`/reviews/${productId}`, data)
export const getReviews = (productId) => API.get(`/reviews/${productId}`)

// UPLOAD
export const uploadImage = (data) => API.post('/upload', data)
export const uploadSellerDocument = (data) => API.post('/upload/seller-document', data)

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
export const getSellerDocumentUrl = (userId, documentId) => API.get(`/admin/users/${userId}/documents/${documentId}`)
export const updateSellerDocumentStatus = (userId, documentId, data) => API.put(`/admin/users/${userId}/documents/${documentId}`, data)
export const resolveCancellation = (orderId, data) => API.put(`/admin/orders/${orderId}/cancellation`, data)
export const resolveDispute = (orderId, data) => API.put(`/admin/orders/${orderId}/dispute`, data)
export const addAdminOrderNote = (orderId, data) => API.post(`/admin/orders/${orderId}/notes`, data)
export const getAdminAudit = (params) => API.get('/admin/audit', { params })

export default API
