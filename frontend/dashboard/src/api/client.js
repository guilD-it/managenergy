const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

const buildUrl = (path) => `${API_BASE}${path}`

const getCookie = (name) => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

let csrfPromise = null

const ensureCsrfCookie = async () => {
  if (csrfPromise) return csrfPromise
  csrfPromise = fetch(buildUrl('/csrf/'), { credentials: 'include' }).finally(
    () => {
      csrfPromise = null
    }
  )
  return csrfPromise
}

const parseBody = async (response) => {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function apiRequest(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase()
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && !getCookie('csrftoken')) {
    await ensureCsrfCookie()
  }

  const response = await fetch(buildUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(getCookie('csrftoken') ? { 'X-CSRFToken': getCookie('csrftoken') } : {}),
      ...(options.headers || {}),
    },
    credentials: 'include',
    ...options,
  })

  const data = await parseBody(response)

  if (!response.ok) {
    const error = new Error(data?.detail || 'Request failed')
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}
