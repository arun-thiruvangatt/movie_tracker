export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"

export async function fetchContent(page = 1) {
  const url = `${API_BASE}/api/content/?page=${page}`
  const res = await fetch(url, {
    headers: { "Accept": "application/json" },
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Fetch error ${res.status}: ${txt}`)
  }
  return res.json()
}
