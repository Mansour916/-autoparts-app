import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
}

export const vehiclesAPI = {
  lookup: (params) => api.get('/vehicles/lookup', { params }),
  create: (data) => api.post('/vehicles/', data),
  list: () => api.get('/vehicles/')
}

export const partsAPI = {
  list: (params) => api.get('/parts/', { params }),
  get: (id, vehicleId) => api.get(`/parts/${id}`, { params: { vehicle_id: vehicleId } }),
  create: (data) => api.post('/parts/', data),
  update: (id, data) => api.put(`/parts/${id}`, data),
  remove: (id) => api.delete(`/parts/${id}`),
  compare: (oemRef, vehicleId) => api.get(`/parts/compare/${oemRef}`, { params: { vehicle_id: vehicleId } }),
  getImages: (partId) => api.get(`/parts/${partId}/images`)
}

export const garageAPI = {
  list: () => api.get('/garage/'),
  add: (data) => api.post('/garage/', data),
  remove: (garageId) => api.delete(`/garage/${garageId}`),
  updateMileage: (garageId, data) => api.patch(`/garage/${garageId}`, data)
}

export const ordersAPI = {
  create: (data) => api.post('/orders/', data),
  list: () => api.get('/orders/')
}

export const maintenanceAPI = {
  getIntervals: () => api.get('/maintenance/intervals'),
  add: (data) => api.post('/maintenance/', data),
  getHistory: (garageVehicleId) => api.get(`/maintenance/${garageVehicleId}`)
}

export const uploadsAPI = {
  uploadPartImage: (partId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/uploads/parts/${partId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  deletePartImage: (imageId) => api.delete(`/uploads/parts/images/${imageId}`)
}
export const storesAPI = {
  list: () => api.get('/stores/'),
  create: (data) => api.post('/stores/', data),
  remove: (storeId) => api.delete(`/stores/${storeId}`)
}

export const BASE_URL = 'http://localhost:8000'

export default api