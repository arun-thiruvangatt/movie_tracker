import { getAccessToken, refreshToken, logout } from "./auth"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"

async function fetchWithAuth(input, init = {}, retry = true) {
  const headers = new Headers(init.headers || {})
  const token = getAccessToken()
  if (token) headers.set("Authorization", `Bearer ${token}`)
  headers.set("Accept", "application/json")
  if (!headers.has("Content-Type") && !(init && init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  const res = await fetch(input.startsWith("http") ? input : `${API_BASE}${input}`, {
    ...init,
    headers,
  })

  if (res.status === 401 && retry) {
    try {
      await refreshToken()
      return fetchWithAuth(input, init, false)
    } catch (e) {
      logout()
      throw e
    }
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => "")
    let err
    try {
      err = JSON.parse(errText)
    } catch {
      err = { detail: errText || res.statusText }
    }
    const error = new Error(err.detail || `Request failed: ${res.status}`)
    error.response = res
    throw error
  }

  // try parse json, fall back to text
  const contentType = res.headers.get("content-type") || ""
  if (contentType.includes("application/json")) return res.json()
  return res.text()
}

export default {
  get: (path) => fetchWithAuth(path, { method: "GET" }),
  post: (path, body) =>
    fetchWithAuth(path, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body) }),
  put: (path, body) =>
    fetchWithAuth(path, { method: "PUT", body: body instanceof FormData ? body : JSON.stringify(body) }),
  patch: (path, body) =>
    fetchWithAuth(path, { method: "PATCH", body: body instanceof FormData ? body : JSON.stringify(body) }),
  delete: (path) => fetchWithAuth(path, { method: "DELETE" }),
}
