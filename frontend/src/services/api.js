import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('ns_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Auth ────────────────────────────────────────────────────────────
export const authAPI = {
  login: (payload) => api.post('/api/auth/login', payload),
  logout: ()        => api.post('/api/auth/logout'),
  verify: ()        => api.get('/api/auth/verify'),
}

// ── Behavior ────────────────────────────────────────────────────────
export const behaviorAPI = {
  /**
   * payload: {
   *   session_id, user_id,
   *   keystroke_data: { intervals, dwell_times, avg_interval, variance },
   *   mouse_data:     { velocities, avg_velocity, entropy },
   *   session_data:   { duration_seconds, tab_switches, copy_pastes }
   * }
   */
  sendKeystroke: (data) => api.post('/api/behavior/keystroke', data),
  sendMouse:     (data) => api.post('/api/behavior/mouse', data),
  sendSession:   (data) => api.post('/api/behavior/session', data),
  sendBatch:     (data) => api.post('/api/behavior/batch', data),
}

// ── Risk ────────────────────────────────────────────────────────────
export const riskAPI = {
  getScore:     (sessionId) => api.get(`/api/risk/score/${sessionId}`),
  getHistory:   (userId)    => api.get(`/api/risk/history/${userId}`),
  getTrend:     (userId)    => api.get(`/api/risk/trend/${userId}`),
  getThreats:   ()          => api.get('/api/risk/threats'),
}

// ── Alerts ──────────────────────────────────────────────────────────
export const alertAPI = {
  getAll:    ()        => api.get('/api/alerts'),
  getActive: ()        => api.get('/api/alerts/active'),
  dismiss:   (alertId) => api.patch(`/api/alerts/${alertId}/dismiss`),
  dismissAll:()        => api.patch('/api/alerts/dismiss-all'),
}

export default api