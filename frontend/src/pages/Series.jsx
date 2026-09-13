import api from "../services/apiClient"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Series() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    api.get("/api/content/?type=series")
      .then((data) => setItems(data.results || data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h2>Series</h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      <div className="grid">
        {items.map((c) => (
          <div
            key={c.id}
            className="card fade-in"
            onClick={() => navigate(`/content/${c.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault()
                navigate(`/content/${c.id}`)
              }
            }}
          >
            <div className="card-media">
              {c.image ? <img className="card-img" src={c.image} alt={c.title} /> : <div className="card-img" />}
              <div className="card-overlay">
                <div className="overlay-row">
                  <div className="rating" aria-hidden>{c.average_rating ? `★ ${c.average_rating}` : '—'}</div>
                  <button
                    className="btn small"
                    onClick={(e) => { e.stopPropagation(); navigate(`/content/${c.id}`) }}
                    aria-label={`View ${c.title}`}
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="card-title">{c.title}</div>
              <div className="muted">{(c.genres || []).map(g => g.name).join(', ')}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
