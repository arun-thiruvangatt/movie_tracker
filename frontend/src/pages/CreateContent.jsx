import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/apiClient"

export default function CreateContent() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [contentType, setContentType] = useState("movie")
  const [trailerUrl, setTrailerUrl] = useState("")
  const [image, setImage] = useState(null)
  const [genres, setGenres] = useState([])
  const [selectedGenres, setSelectedGenres] = useState([])
  const [genreQuery, setGenreQuery] = useState("")
  const [addingGenre, setAddingGenre] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    api.get("/api/genres/")
      .then((data) => setGenres(data.results || data))
      .catch((e) => setError(e.message))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append("title", title)
      fd.append("description", description)
      fd.append("content_type", contentType)
      fd.append("trailer_url", trailerUrl)
      if (image) fd.append("image", image)
      // append multiple genre_ids
      selectedGenres.forEach((g) => fd.append("genre_ids", g))

      const data = await api.post("/api/content/", fd)
      // on success, go to movies list or detail
      navigate("/movies")
    } catch (err) {
      setError(err.message || "Failed to create content")
    } finally {
      setLoading(false)
    }
  }

  function toggleGenre(id) {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  async function addNewGenre(name) {
    if (!name || !name.trim()) return
    const n = name.trim()
    // optimistic lock: don't add duplicates
    if (genres.some((g) => g.name.toLowerCase() === n.toLowerCase())) return
    setAddingGenre(true)
    try {
      const created = await api.post('/api/genres/', { name: n })
      // ensure genres list contains created
      setGenres((prev) => [...prev, created])
      // select it
      setSelectedGenres((prev) => [...prev, created.id])
      setGenreQuery("")
    } catch (err) {
      console.error('Failed to create genre', err)
      setError('Failed to create genre')
    } finally {
      setAddingGenre(false)
    }
  }

  function handleFile(f) {
    if (!f) { setImage(null); if (preview) { URL.revokeObjectURL(preview); setPreview(null) }; return }
    setImage(f)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(URL.createObjectURL(f))
  }

  return (
    <div className="form">
      <h2>Add Movie / Series</h2>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <div className="field">
            <input placeholder=" " value={title} onChange={(e) => setTitle(e.target.value)} required />
            <label>Title</label>
          </div>
        </div>
        <div className="form-group">
          <div className="field">
            <textarea placeholder=" " value={description} onChange={(e) => setDescription(e.target.value)} />
            <label>Description</label>
          </div>
        </div>
        <div className="form-group">
          <label>Type</label>
          <select value={contentType} onChange={(e) => setContentType(e.target.value)}>
            <option value="movie">Movie</option>
            <option value="series">Series</option>
          </select>
        </div>
        <div className="form-group">
          <div className="field">
            <input placeholder=" " value={trailerUrl} onChange={(e) => setTrailerUrl(e.target.value)} />
            <label>Trailer URL</label>
          </div>
        </div>
        <div className="form-group">
          <div className="file-preview">
            <label className="file-label">
              <span>Choose poster</span>
              <input className="file-input" type="file" accept="image/*" onChange={(e) => handleFile(e.target.files[0])} />
            </label>
            {preview ? (
              <img src={preview} alt="preview" />
            ) : (
              <div className="hint">Poster preview will appear here</div>
            )}
          </div>
        </div>
        <div className="form-group">
          <label>Genres</label>
          <div style={{ marginBottom: 8 }}>
            <input placeholder=" " className="" value={genreQuery} onChange={(e) => setGenreQuery(e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', width: '100%' }} />
            <div className="hint">Type to filter genres or add a new one</div>
          </div>
          <div className="chips">
            {genres
              .filter((g) => g.name.toLowerCase().includes(genreQuery.toLowerCase()))
              .map((g) => (
                <div key={g.id} className={`chip ${selectedGenres.includes(g.id) ? 'selected' : ''}`} onClick={() => toggleGenre(g.id)}>{g.name}</div>
            ))}
            {/* if query doesn't match existing exactly, show add option */}
            {genreQuery && !genres.some((g) => g.name.toLowerCase() === genreQuery.toLowerCase()) && (
              <div className="chip" onClick={() => addNewGenre(genreQuery)}>
                {addingGenre ? 'Adding…' : `Add "${genreQuery}"`}
              </div>
            )}
          </div>
        </div>
        {error && <div style={{ color: "red" }}>{error}</div>}
        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn primary">{loading ? "Creating…" : "Create"}</button>
        </div>
      </form>
    </div>
  )
}
