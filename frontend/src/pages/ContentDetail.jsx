import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from "../services/apiClient"
import StarRating from "../components/StarRating"

function extractYouTubeId(url) {
  if (!url) return null
  try {
    const u = new URL(url)
    if (u.hostname.includes("youtube.com")) return u.searchParams.get("v")
    if (u.hostname === "youtu.be") return u.pathname.slice(1)
  } catch (e) {
    const m = url.match(/[?&]v=([^&]+)/)
    if (m) return m[1]
  }
  return null
}

export default function ContentDetail() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showTrailer, setShowTrailer] = useState(false)

  const [reviewText, setReviewText] = useState("")
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await api.get(`/api/content/${id}/`)
        setItem(data)
      } catch (e) {
        setError(e.message || "Failed to load")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  useEffect(() => {
    const key = `reviews:content:${id}`
    const list = JSON.parse(localStorage.getItem(key) || "[]")
    setReviews(list)
  }, [id])

  function saveReview() {
    if (!reviewText) return
    const key = `reviews:content:${id}`
    const list = JSON.parse(localStorage.getItem(key) || "[]")
    const next = [{ text: reviewText, at: Date.now() }, ...list]
    localStorage.setItem(key, JSON.stringify(next))
    setReviews(next)
    setReviewText("")
  }

  async function markMovieWatched() {
    try {
      await api.post(`/api/content/${id}/watch/`)
      const data = await api.get(`/api/content/${id}/`)
      setItem(data)
    } catch (e) {
      setError(e.message)
    }
  }

  async function rateMovie(value) {
    try {
      await api.post(`/api/content/${id}/rate/`, { rating: value })
      const data = await api.get(`/api/content/${id}/`)
      setItem(data)
    } catch (e) {
      setError(e.message)
    }
  }

  async function markEpisodeWatched(epId) {
    try {
      await api.post(`/api/episodes/${epId}/watch/`)
      const data = await api.get(`/api/content/${id}/`)
      setItem(data)
    } catch (e) {
      setError(e.message)
    }
  }

  async function rateEpisode(epId, value) {
    try {
      await api.post(`/api/episodes/${epId}/rate/`, { rating: value })
      const data = await api.get(`/api/content/${id}/`)
      setItem(data)
    } catch (e) {
      setError(e.message)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div style={{ color: "red" }}>{error}</div>
  if (!item) return <div>No content found</div>

  const ytId = extractYouTubeId(item.trailer_url)

  return (
    <div className="fade-in" style={{ maxWidth: 900, margin: "1rem auto" }}>
      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ width: 300 }}>
          {item.image ? (
            <img src={item.image} alt={item.title} style={{ width: "100%" }} />
          ) : (
            <div style={{ width: "100%", height: 420, background: "#222" }} />
          )}
        </div>

        <div style={{ flex: 1 }}>
          <h1>{item.title}</h1>
          <div style={{ color: "#666" }}>{item.content_type}</div>
          <div>
            {(item.genres || []).map((g) => (
              <span key={g.id} style={{ marginRight: 8 }}>{g.name}</span>
            ))}
          </div>
          <p>{item.description}</p>

          {item.content_type === "movie" && (
            <div style={{ marginTop: 12 }}>
              <div>Watched: {item.is_watched ? "Yes" : "No"}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div>My rating: {item.my_rating != null ? item.my_rating : "-"}</div>
                <StarRating value={item.my_rating || 0} onChange={(v) => rateMovie(v)} />
              </div>
              <div style={{ marginTop: 8 }}>
                <button onClick={markMovieWatched} style={{ marginRight: 8 }} className="btn">Mark watched</button>
              </div>
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            {ytId ? (
              <div>
                <button onClick={() => setShowTrailer((s) => !s)}>{showTrailer ? "Hide Trailer" : "Play Trailer"}</button>
                {showTrailer && (
                  <div style={{ marginTop: 12 }}>
                    <iframe
                      width="560"
                      height="315"
                      src={`https://www.youtube.com/embed/${ytId}`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
              </div>
            ) : (
              <div>No trailer available</div>
            )}
          </div>
        </div>
      </div>

      {item.seasons && item.seasons.length > 0 && (
        <section style={{ marginTop: 24 }}>
          <h2>Seasons</h2>
          {item.seasons.map((s) => (
            <div key={s.id} style={{ marginBottom: 12 }}>
              <h3>Season {s.season_number}: {s.title}</h3>
              <ul>
                {s.episodes.map((ep) => (
                  <li key={ep.id} style={{ marginBottom: 6 }}>
                    {ep.episode_number}. {ep.title}
                    <div style={{ fontSize: 12, color: "#666" }}>Watched: {ep.is_watched ? "Yes" : "No"} - My rating: {ep.my_rating != null ? ep.my_rating : "-"}</div>
                    <div style={{ marginTop: 6, display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button onClick={() => markEpisodeWatched(ep.id)} style={{ marginRight: 8 }} className="btn">Mark watched</button>
                      <StarRating value={ep.my_rating || 0} onChange={(v) => rateEpisode(ep.id, v)} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      <section style={{ marginTop: 24 }}>
        <h2>Reviews</h2>
        <div>
          <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Write a review" rows={4} style={{ width: "100%" }} />
          <button onClick={saveReview} style={{ marginTop: 8 }}>Save review (local)</button>
        </div>
        <div style={{ marginTop: 12 }}>
          {reviews.length === 0 && <div>No reviews yet</div>}
          {reviews.map((r, i) => (
            <div key={i} style={{ padding: 8, borderTop: "1px solid #eee" }}>
              <div style={{ fontSize: 12, color: "#666" }}>{new Date(r.at).toLocaleString()}</div>
              <div>{r.text}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
