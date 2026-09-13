import { createContext, useContext, useEffect, useState } from "react"
import { getAccessToken, refreshToken, logout as doLogout } from "../services/auth"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // naive approach: if access token exists, consider authenticated
    const token = getAccessToken()
    if (token) setUser({ token })
    setLoading(false)
  }, [])

  async function refresh() {
    try {
      await refreshToken()
    } catch (e) {
      doLogout()
      setUser(null)
    }
  }

  function logout() {
    doLogout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
