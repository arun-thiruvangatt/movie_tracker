import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/apiClient"

export default function Register() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [password2, setPassword2] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const navigate = useNavigate()
  const [preview, setPreview] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== password2) {
      setError("Passwords do not match")
      return
    }
    setLoading(true)
    setError(null)
    try {
      // Use central API client so the request goes to the backend API base URL
      if (profileImage) {
        const fd = new FormData()
        fd.append('username', username)
        fd.append('email', email)
        fd.append('password', password)
        fd.append('password2', password2)
        fd.append('profile_image', profileImage)
        await api.post("/api/accounts/register/", fd)
      } else {
        await api.post("/api/accounts/register/", { username, email, password, password2 })
      }
      navigate("/login")
    } catch (err) {
      // Try to extract field-level errors from the response if available
      let msg = err.message || "Registration failed"
      try {
        if (err.response) {
          const body = await err.response.json()
          if (typeof body === "object") {
            // collect messages
            const parts = []
            for (const [k, v] of Object.entries(body)) {
              if (Array.isArray(v)) parts.push(`${k}: ${v.join(", ")}`)
              else parts.push(`${k}: ${v}`)
            }
            if (parts.length) msg = parts.join("; ")
          }
        }
      } catch (e) {
        // ignore parsing errors
      }
      setError(msg)
    } finally {
      setLoading(false)
    }
  }
  function handleFileChange(f) {
    if (!f) {
      setProfileImage(null)
      if (preview) { URL.revokeObjectURL(preview); setPreview(null) }
      return
    }
    setProfileImage(f)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(URL.createObjectURL(f))
  }

  return (
    <div className="form">
      <h2>Register</h2>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <div className="field">
            <input placeholder=" " value={username} onChange={(e) => setUsername(e.target.value)} />
            <label>Username</label>
          </div>
        </div>

        <div className="form-group">
          <div className="field">
            <input placeholder=" " value={email} onChange={(e) => setEmail(e.target.value)} />
            <label>Email</label>
          </div>
        </div>

        <div className="form-group">
          <div className="field">
            <input placeholder=" " type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <label>Password</label>
          </div>
        </div>

        <div className="form-group">
          <div className="field">
            <input placeholder=" " type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} />
            <label>Confirm Password</label>
          </div>
        </div>

        <div className="form-group">
          <div className="file-preview">
            <label className="file-label">
              <span>Choose avatar</span>
              <input className="file-input" type="file" accept="image/*" onChange={(e) => handleFileChange(e.target.files[0])} />
            </label>
            {preview ? (
              <img src={preview} alt="preview" />
            ) : (
              <div className="hint">PNG/JPG, recommended 400x600</div>
            )}
          </div>
        </div>

        {error && <div className="error">{error}</div>}
        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn primary">{loading ? "Creating…" : "Create account"}</button>
        </div>
      </form>
    </div>
  )
}
