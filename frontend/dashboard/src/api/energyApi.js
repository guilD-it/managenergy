import { apiRequest } from './client.js'

export const login = (payload) =>
  apiRequest('/login/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const register = (payload) =>
  apiRequest('/register/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const activateAccount = (payload) =>
  apiRequest('/activate/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const logout = () =>
  apiRequest('/logout/', {
    method: 'POST',
  })

export const fetchCurrentUser = async () => {
  const users = await apiRequest('/users/')
  return Array.isArray(users) && users.length ? users[0] : null
}

export const fetchCategories = () => apiRequest('/categories/')

export const fetchConsumptions = () => apiRequest('/consommations/')

export const createConsumption = (payload) =>
  apiRequest('/consommations/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const updateConsumption = (id, payload) =>
  apiRequest(`/consommations/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

export const deleteConsumption = (id) =>
  apiRequest(`/consommations/${id}/`, {
    method: 'DELETE',
  })

export const fetchAlerts = () => apiRequest('/alerts/')

export const createAlert = (payload) =>
  apiRequest('/alerts/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const updateAlert = (id, payload) =>
  apiRequest(`/alerts/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

export const deleteAlert = (id) =>
  apiRequest(`/alerts/${id}/`, {
    method: 'DELETE',
  })

export const fetchNotifications = () => apiRequest('/notifications/')

export const createNotification = (payload) =>
  apiRequest('/notifications/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const deleteNotification = (id) =>
  apiRequest(`/notifications/${id}/`, {
    method: 'DELETE',
  })
