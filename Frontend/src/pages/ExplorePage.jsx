import { useState } from "react";
import "./ExplorePage.css";

const EXPLORE_ITEMS = [
  { id: 1,  emoji: "🏔️", bg: "linear-gradient(135deg, #0d1b2a, #1a3a5c)", size: "large" },
  { id: 2,  emoji: "🍕", bg: "linear-gradient(135deg, #2d1a00, #5a3600)", size: "small" },
  { id: 3,  emoji: "🌸", bg: "linear-gradient(135deg, #2d0a2e, #6b1a6e)", size: "small" },
  { id: 4,  emoji: "🚗", bg: "linear-gradient(135deg, #0a1a2e, #1a3a5c)", size: "small" },
  { id: 5,  emoji: "🎨", bg: "linear-gradient(135deg, #1a0a2e, #3d1a6e)", size: "small" },
  { id: 6,  emoji: "🏖️", bg: "linear-gradient(135deg, #1a1040, #2d1b69)", size: "large" },
  { id: 7,  emoji: "🎵", bg: "linear-gradient(135deg, #0a2e1a, #1a6e3a)", size: "small" },
  { id: 8,  emoji: "🐶", bg: "linear-gradient(135deg, #2e1a0a, #6e3a1a)", size: "small" },
  { id: 9,  emoji: "🌮", bg: "linear-gradient(135deg, #2e0a0a, #6e1a1a)", size: "small" },
  { id: 10, emoji: "🏋️", bg: "linear-gradient(135deg, #0a0a2e, #1a1a6e)", size: "small" },
  { id: 11, emoji: "🌴", bg: "linear-gradient(135deg, #0a2e1a, #1a6e3a)", size: "large" },
  { id: 12, emoji: "📚", bg: "linear-gradient(135deg, #1a0a2e, #3d1a6e)", size: "small" },
];

const CATEGORIES = ["All", "Travel", "Food", "Tech", "Art", "Fitness"];

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <div className="explore-page">

      {/* Search box */}
      <div className="search-wrap">
        <div className="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search SnapVibe..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="search-input"
          />
          {query && (
            <button
              className="clear-btn"
              onClick={() => setQuery("")}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="categories-bar">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`cat-btn ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="explore-grid">
        {EXPLORE_ITEMS.map(item => (
          <div
            key={item.id}
            className={`explore-cell ${item.size}`}
            style={{ background: item.bg }}
          >
            <span className="explore-emoji">{item.emoji}</span>
            <div className="cell-overlay">
              <svg width="18" height="18" viewBox="0 0 24 24"
                fill="white" opacity="0.9">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span>{Math.floor(Math.random() * 9 + 1)}k</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}