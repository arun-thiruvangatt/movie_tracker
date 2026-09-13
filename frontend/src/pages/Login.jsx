import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { login } from "../services/auth"
import { useAuth } from "../context/AuthContext"

export default function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [previewInputs, setPreviewInputs] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await login(username, password)
      setUser({ token: data.access })
      navigate("/")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="form">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="form" onFocus={() => setPreviewInputs(true)} onBlur={() => setPreviewInputs(false)}>
        <div className="form-group">
          <div className="field">
            <input placeholder=" " value={username} onChange={(e) => setUsername(e.target.value)} />
            <label>Username</label>
          </div>
        </div>
        <div className="form-group">
          <div className="field">
            <input placeholder=" " type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <label>Password</label>
          </div>
        </div>
        {error && <div className="error">{error}</div>}
        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn primary">
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </div>
      </form>
    </div>
  )
}
