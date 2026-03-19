import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Tự động đính kèm JWT token
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Xử lý lỗi global
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// ─── Auth ─────────────────────────────────────────────
export const authApi = {
  login:    (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
}

// ─── Products ─────────────────────────────────────────
export const productApi = {
  getFrames:        ()      => api.get('/frames'),
  getFrame:         (id)    => api.get(`/frames/${id}`),
  createFrame:      (d)     => api.post('/frames', d),
  updateFrame:      (id,d)  => api.put(`/frames/${id}`, d),
  deleteFrame:      (id)    => api.delete(`/frames/${id}`),

  getLenses:        ()      => api.get('/lenses'),
  getLens:          (id)    => api.get(`/lenses/${id}`),
  createLens:       (d)     => api.post('/lenses', d),
  updateLens:       (id,d)  => api.put(`/lenses/${id}`, d),
  deleteLens:       (id)    => api.delete(`/lenses/${id}`),
  addLensOption:    (id,d)  => api.post(`/lenses/${id}/options`, d),
  deleteLensOption: (id)    => api.delete(`/lenses/options/${id}`),

  getReadyMade:     ()      => api.get('/ready-made-glasses'),
  createReadyMade:  (d)     => api.post('/ready-made-glasses', d),
  updateReadyMade:  (id,d)  => api.put(`/ready-made-glasses/${id}`, d),
  deleteReadyMade:  (id)    => api.delete(`/ready-made-glasses/${id}`),
}

// ─── Customer Profile ─────────────────────────────────
export const customerApi = {
  getMe:          ()     => api.get('/customers/me'),
  updateMe:       (data) => api.put('/customers/me', data),
  changePassword: (data) => api.patch('/customers/me/password', data),
}

// ─── Eye Profiles ─────────────────────────────────────
export const eyeProfileApi = {
  getMyProfiles: ()         => api.get('/eye-profiles/me'),
  getDetail:     (id)       => api.get(`/eye-profiles/${id}`),
  createManual:  (data)     => api.post('/eye-profiles/manual', data),
  createUpload:  (formData) => api.post('/eye-profiles/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deactivate:    (id)       => api.patch(`/eye-profiles/${id}/deactivate`),
  getByCustomer: (cid)      => api.get(`/eye-profiles/customer/${cid}`),
}

// ─── Glasses Design ───────────────────────────────────
export const designApi = {
  create:       (data) => api.post('/glasses-designs', data),
  getMyDesigns: ()     => api.get('/glasses-designs/me'),
  getDetail:    (id)   => api.get(`/glasses-designs/${id}`),
  delete:       (id)   => api.delete(`/glasses-designs/${id}`),
  getMyGlasses: ()     => api.get('/my-glasses'),
}

// ─── Cart ─────────────────────────────────────────────
export const cartApi = {
  get:        ()     => api.get('/cart'),
  addItem:    (data) => api.post('/cart/items', data),
  removeItem: (id)   => api.delete(`/cart/items/${id}`),
}

// ─── Orders ───────────────────────────────────────────
export const orderApi = {
  place:        (data)       => api.post('/orders', data),
  getMyOrders:  ()           => api.get('/orders/me'),
  getDetail:    (id)         => api.get(`/orders/${id}`),
  getByStatus:  (status)     => api.get(`/orders/manage?status=${status}`),
  updateStatus: (id, data)   => api.patch(`/orders/${id}/status`, data),
  cancel:       (id)         => api.patch(`/orders/${id}/cancel`),
}

// ─── Payment ──────────────────────────────────────────
export const paymentApi = {
  pay:        (orderId, data) => api.post(`/payments/orders/${orderId}`, data),
  getPayment: (orderId)       => api.get(`/payments/orders/${orderId}`),
}

// ─── Manufacturing ────────────────────────────────────
export const manufacturingApi = {
  create:       (orderId)  => api.post(`/manufacturing/orders/${orderId}`),
  getByStatus:  (status)   => api.get(`/manufacturing?status=${status}`),
  getById:      (id)       => api.get(`/manufacturing/${id}`),
  updateStatus: (id, data) => api.patch(`/manufacturing/${id}/status`, data),
}

// ─── Shipments ────────────────────────────────────────
export const shipmentApi = {
  getByStatus:    (status)        => api.get(`/shipments?status=${status}`),
  getMyShipments: ()              => api.get('/shipments/me'),
  getById:        (id)            => api.get(`/shipments/${id}`),
  assign:         (id, accountId) => api.patch(`/shipments/${id}/assign/${accountId}`),
  updateStatus:   (id, data)      => api.patch(`/shipments/${id}/status`, data),
}

// ─── Notifications ────────────────────────────────────
export const notificationApi = {
  getAll:      ()    => api.get('/notifications'),
  getCount:    ()    => api.get('/notifications/count'),
  markAllRead: ()    => api.patch('/notifications/read-all'),
  markRead:    (id)  => api.patch(`/notifications/${id}/read`),
  delete:      (id)  => api.delete(`/notifications/${id}`),
}

// ─── Reviews ──────────────────────────────────────────
export const reviewApi = {
  getFrameReviews:   (frameId)   => api.get(`/reviews/frames/${frameId}`),
  getProductReviews: (productId) => api.get(`/reviews/products/${productId}`),
  getMyReviews:      ()          => api.get('/reviews/me'),
  create:            (data)      => api.post('/reviews', data),
  delete:            (id)        => api.delete(`/reviews/${id}`),
}

// ─── Discount ─────────────────────────────────────────
export const discountApi = {
  getAll:    ()         => api.get('/discounts'),
  checkCode: (code)     => api.get(`/discounts/check/${code}`),
  create:    (data)     => api.post('/discounts', data),
  update:    (id, data) => api.put(`/discounts/${id}`, data),
  delete:    (id)       => api.delete(`/discounts/${id}`),
  toggle:    (id)       => api.patch(`/discounts/${id}/toggle`),
}

// ─── Return Request ───────────────────────────────────
export const returnApi = {
  create:      (data)   => api.post('/returns', data),
  getMyReturns: ()      => api.get('/returns/me'),
  getAll:      (status) => api.get(`/returns?status=${status}`),
  approve:     (id, data) => api.patch(`/returns/${id}/approve`, data),
  reject:      (id, data) => api.patch(`/returns/${id}/reject`, data),
  complete:    (id, data) => api.patch(`/returns/${id}/complete`, data),
}

// ─── Admin Users ──────────────────────────────────────
export const adminApi = {
  getUsers:       (role)     => api.get(`/admin/users${role ? `?role=${role}` : ''}`),
  createUser:     (data)     => api.post('/admin/users', data),
  changeRole:     (id, data) => api.patch(`/admin/users/${id}/role`, data),
  resetPassword:  (id, data) => api.patch(`/admin/users/${id}/reset-password`, data),
  deleteUser:     (id)       => api.delete(`/admin/users/${id}`),
}
