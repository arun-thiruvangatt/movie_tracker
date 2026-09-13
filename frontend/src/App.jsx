import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "./App.css"
import { fetchContent } from "./api"

function App() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    fetchContent()
      .then((data) => {
        setItems(data.results || data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return (
    <div className="app-root">
      {loading && <p>Loading…</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {!loading && !error && (
        <div className="grid grid-no-hero">
            {items.slice(0, 24).map((c) => (
              <div key={c.id} className="card fade-in" onClick={() => navigate(`/content/${c.id}`)} role="button" tabIndex={0}>
                {c.image ? <img className="card-img" src={c.image} alt={c.title} /> : <div className="card-img" />}
                <div className="card-body">
                  <div className="card-title">{c.title}</div>
                  <div className="muted">{c.content_type} · {(c.genres || []).map(g => g.name).join(', ')}</div>
                </div>
              </div>
            ))}
          </div>
      )}
    </div>
  )
}

export default App
