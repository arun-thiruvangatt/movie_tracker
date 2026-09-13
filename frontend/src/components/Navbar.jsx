import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useState, useEffect, useRef } from "react"
import api from "../services/apiClient"

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system')

  function handleLogout() {
    logout()
    navigate("/")
  }

  useEffect(() => {
    if (theme === 'system') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', theme)
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  function toggleTheme() {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  }

  // Live search state
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [focused, setFocused] = useState(-1)
  const searchRef = useRef(null)
  const containerRef = useRef(null)
  const debRef = useRef(null)
  const [me, setMe] = useState(null)

  useEffect(() => {
    if (!query) return setSuggestions([])
    setLoadingSuggestions(true)
    if (debRef.current) clearTimeout(debRef.current)
    debRef.current = setTimeout(async () => {
      try {
        const data = await api.get(`/api/content/?search=${encodeURIComponent(query)}`)
        const items = (data && data.results) ? data.results : (Array.isArray(data) ? data : [])
        setSuggestions(items.slice(0, 6))
      } catch (e) {
        setSuggestions([])
      } finally {
        setLoadingSuggestions(false)
      }
    }, 250)
    return () => {
      if (debRef.current) clearTimeout(debRef.current)
    }
  }, [query])

  useEffect(() => {
    function onDoc(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setSuggestions([])
        setFocused(-1)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  // fetch current user profile for avatar display
  useEffect(() => {
    let mounted = true
    async function loadMe() {
      try {
        const data = await api.get('/api/accounts/me/')
        if (!mounted) return
        setMe(data)
      } catch (e) {
        // not authenticated or failed
        setMe(null)
      }
    }
    loadMe()
    return () => (mounted = false)
  }, [user])

  function selectSuggestion(item) {
    setQuery("")
    setSuggestions([])
    setFocused(-1)
    navigate(`/content/${item.id}`)
  }

  function onSearchKey(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocused((f) => Math.min(f + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocused((f) => Math.max(f - 1, 0))
    } else if (e.key === 'Enter') {
      if (focused >= 0 && suggestions[focused]) {
        e.preventDefault()
        selectSuggestion(suggestions[focused])
      } else if (query.trim()) {
        navigate(`/movies?search=${encodeURIComponent(query)}`)
        setSuggestions([])
      }
    } else if (e.key === 'Escape') {
      setSuggestions([])
      setFocused(-1)
    }
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <div className="brand" onClick={() => navigate('/')}>MovieTracker</div>
        <button className="nav-toggle" aria-expanded={open} onClick={() => setOpen((s) => !s)} aria-label="Toggle menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <nav className={`nav-links ${open ? 'open' : ''}`} onClick={() => setOpen(false)}>
          <Link to="/movies">Movies</Link>
          <Link to="/series">Series</Link>
        </nav>
        <div className="header-actions" ref={containerRef}>
          <div style={{ position: 'relative' }}>
            <input
              ref={searchRef}
              className="search"
              placeholder="Search movies, series..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setFocused(-1) }}
              onKeyDown={onSearchKey}
              role="combobox"
              aria-expanded={suggestions.length > 0}
              aria-autocomplete="list"
              aria-controls="search-suggestions"
            />
            {suggestions.length > 0 && (
              <ul id="search-suggestions" role="listbox" className="search-suggestions">
                {suggestions.map((it, i) => (
                  <li
                    key={it.id}
                    role="option"
                    aria-selected={focused === i}
                    className={`suggestion ${focused === i ? 'focused' : ''}`}
                    onMouseDown={(ev) => { ev.preventDefault(); selectSuggestion(it) }}
                    onMouseEnter={() => setFocused(i)}
                  >
                    <div className="s-title">{it.title}</div>
                    <div className="s-meta muted">{it.content_type} · {(it.genres || []).map(g => g.name).join(', ')}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="auth-actions">
            <button onClick={toggleTheme} className="btn ghost" aria-label="Toggle theme">{theme === 'dark' ? '🌙' : '☀️'}</button>
            {user ? (
              <>
                <Link to="/create" className="btn">Add</Link>
                <Link to="/profile" className="profile">
                  {me && me.profile && me.profile.image ? (
                    <img src={me.profile.image} alt={me.username} className="nav-avatar" />
                  ) : (
                    <span className="nav-avatar-placeholder">{me ? me.username[0].toUpperCase() : 'U'}</span>
                  )}
                </Link>
                <button onClick={handleLogout} className="btn">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn">Login</Link>
                <Link to="/register" className="btn muted">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
