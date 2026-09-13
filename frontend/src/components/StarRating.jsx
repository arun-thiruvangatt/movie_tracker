import './star-rating.css'
import { useState } from 'react'

export default function StarRating({ value = 0, onChange, readOnly = false }) {
  const [hover, setHover] = useState(0)
  const v = value || 0
  return (
    <div className="star-rating">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          className={`star ${n <= (hover || v) ? 'filled' : ''}`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => !readOnly && onChange && onChange(n)}
          aria-label={`Rate ${n}`}
        >★</button>
      ))}
    </div>
  )
}
