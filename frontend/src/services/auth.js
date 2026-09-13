const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"

export async function login(username, password) {
  const res = await fetch(`${API_BASE}/api/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.detail || `Login failed: ${res.status}`)
  }
  const data = await res.json()
  // data should contain access and refresh
  localStorage.setItem("access_token", data.access)
  localStorage.setItem("refresh_token", data.refresh)
  return data
}

export function logout() {
  localStorage.removeItem("access_token")
  localStorage.removeItem("refresh_token")
}

export function getAccessToken() {
  return localStorage.getItem("access_token")
}

export function authHeaders() {
  const token = getAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function refreshToken() {
  const refresh = localStorage.getItem("refresh_token")
  if (!refresh) throw new Error("No refresh token")
  const res = await fetch(`${API_BASE}/api/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  })
  if (!res.ok) {
    logout()
    throw new Error("Refresh failed")
  }
  const data = await res.json()
  localStorage.setItem("access_token", data.access)
  return data.access
}
