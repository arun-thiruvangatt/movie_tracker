import { useEffect, useState } from 'react'
import api from '../services/apiClient'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ username: '', email: '', bio: '' })
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const data = await api.get('/api/accounts/me/')
        if (!mounted) return
        setUser(data)
        setForm({ username: data.username || '', email: data.email || '', bio: (data.profile && data.profile.bio) || '' })
      } catch (e) {
        console.error(e)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => (mounted = false)
  }, [])

  async function save(e) {
    e.preventDefault()
    const fd = new FormData()
    fd.append('username', form.username)
    fd.append('email', form.email)
    fd.append('profile.bio', form.bio)
    if (imageFile) fd.append('profile.image', imageFile)
    try {
      const res = await api.patch('/api/accounts/me/', fd)
      setUser(res)
      setEditing(false)
    } catch (err) {
      console.error(err)
      alert('Failed to update profile')
    }
  }

  function handleImage(f) {
    if (!f) { setImageFile(null); if (preview) { URL.revokeObjectURL(preview); setPreview(null) } ; return }
    setImageFile(f)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(URL.createObjectURL(f))
  }

  if (loading) return <div className="page">Loading...</div>
  if (!user) return <div className="page">No user</div>

  return (
    <div className="page app-root">
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <div style={{ width: 160 }}>
          {user.profile && user.profile.image ? (
            <img src={user.profile.image} alt={user.username} style={{ width: 160, borderRadius: 8 }} />
          ) : (
            <div style={{ width: 160, height: 240, background: '#222', borderRadius: 8 }} />
          )}
        </div>

        <div style={{ flex: 1 }}>
          {!editing ? (
            <>
              <h2>{user.username}</h2>
              <div className="muted">{user.email}</div>
              <p style={{ marginTop: 12 }}>{user.profile && user.profile.bio}</p>
              <div style={{ marginTop: 12 }}>
                <button onClick={() => setEditing(true)} className="btn">Edit</button>
                <button onClick={() => navigate('/')} style={{ marginLeft: 8 }} className="btn muted">Back</button>
              </div>
            </>
          ) : (
            <form onSubmit={save} className="form">
              <div className="form-group">
                <div className="field">
                  <input placeholder=" " value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
                  <label>Username</label>
                </div>
              </div>
              <div className="form-group">
                <div className="field">
                  <input placeholder=" " value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  <label>Email</label>
                </div>
              </div>
              <div className="form-group">
                <div className="field">
                  <textarea placeholder=" " value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} />
                  <label>Bio</label>
                </div>
              </div>
              <div className="form-group">
                <div className="file-preview">
                  <label className="file-label">
                    <span>Choose avatar</span>
                    <input className="file-input" type="file" accept="image/*" onChange={(e) => handleImage(e.target.files[0])} />
                  </label>
                  {preview ? (
                    <img src={preview} alt="preview" />
                  ) : user.profile && user.profile.image ? (
                    <img src={user.profile.image} alt="current" />
                  ) : (
                    <div className="hint">No avatar</div>
                  )}
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn primary">Save</button>
                <button type="button" onClick={() => setEditing(false)} className="btn muted">Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
