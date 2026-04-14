import { useState } from "react";
import "./ReelsPage.css";

const REELS = [
  {
    id: 1,
    user: "priya_k",
    avatar: "👩",
    emoji: "🌊",
    bg: "linear-gradient(180deg, #0a0a1a 0%, #1a1040 50%, #2d1b69 100%)",
    caption: "Ocean vibes hit different at midnight 🌊",
    likes: 12400,
    comments: 348,
    shares: 89,
    audio: "Kesariya — Brahmastra",
    liked: false,
  },
  {
    id: 2,
    user: "rohan.dev",
    avatar: "👨‍💻",
    emoji: "🌃",
    bg: "linear-gradient(180deg, #0a0a0f 0%, #0d1b2a 50%, #1a3a5c 100%)",
    caption: "Night coding session hits different 💻 #buildinpublic",
    likes: 8100,
    comments: 201,
    shares: 54,
    audio: "lo-fi beats to code to",
    liked: true,
  },
  {
    id: 3,
    user: "foodie_india",
    avatar: "🍛",
    emoji: "🔥",
    bg: "linear-gradient(180deg, #0a0500 0%, #2d1a00 50%, #5a3600 100%)",
    caption: "Street food of Old Delhi 🔥 Part 2 coming soon!",
    likes: 24000,
    comments: 892,
    shares: 340,
    audio: "Tumse Milke — Parineeta",
    liked: false,
  },
  {
    id: 4,
    user: "anjali_m",
    avatar: "💁‍♀️",
    emoji: "🏰",
    bg: "linear-gradient(180deg, #0a0500 0%, #2d1500 50%, #5a2d00 100%)",
    caption: "Amber Fort sunrise — worth waking up at 4am ✨",
    likes: 31200,
    comments: 1240,
    shares: 567,
    audio: "Tum Hi Ho — Aashiqui 2",
    liked: false,
  },
];

export default function ReelsPage() {
  const [reels, setReels] = useState(REELS);
  const [current, setCurrent] = useState(0);
  const [showHeart, setShowHeart] = useState(false);
  const [muted, setMuted] = useState(false);
  const [following, setFollowing] = useState({});

  const reel = reels[current];

  const toggleLike = () => {
    setReels(prev => prev.map((r, i) =>
      i === current
        ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 }
        : r
    ));
  };

  const handleDoubleTap = () => {
    if (!reel.liked) toggleLike();
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
  };

  const toggleFollow = (id) => {
    setFollowing(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatNum = (n) => {
    if (n >= 1000) return (n / 1000).toFixed(1) + "k";
    return n.toString();
  };

  return (
    <div className="reels-page">
      {/* Reel display */}
      <div
        className="reel-screen"
        style={{ background: reel.bg }}
        onDoubleClick={handleDoubleTap}
      >
        <span className="reel-bg-emoji">{reel.emoji}</span>

        {/* Double tap heart */}
        {showHeart && (
          <div className="reel-heart-pop">
            <svg viewBox="0 0 24 24" width="100" height="100" fill="#ec4899"
              style={{ filter: "drop-shadow(0 0 20px #ec4899)" }}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
        )}

        {/* Top bar */}
        <div className="reel-top">
          <span className="reel-top-title">Reels</span>
          <button className="reel-mute-btn" onClick={() => setMuted(!muted)}>
            {muted ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <line x1="23" y1="9" x2="17" y2="15"/>
                <line x1="17" y1="9" x2="23" y2="15"/>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              </svg>
            )}
          </button>
        </div>

        {/* Progress bars */}
        <div className="reel-progress">
          {reels.map((_, i) => (
            <div
              key={i}
              className={`progress-bar ${i === current ? "active" : i < current ? "done" : ""}`}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>

        {/* Right actions */}
        <div className="reel-actions">
          <button
            className={`reel-act-btn ${reel.liked ? "liked" : ""}`}
            onClick={toggleLike}
          >
            <svg viewBox="0 0 24 24" width="28" height="28"
              fill={reel.liked ? "#ec4899" : "none"}
              stroke={reel.liked ? "#ec4899" : "white"}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span>{formatNum(reel.likes)}</span>
          </button>

          <button className="reel-act-btn">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none"
              stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>{formatNum(reel.comments)}</span>
          </button>

          <button className="reel-act-btn">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none"
              stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            <span>{formatNum(reel.shares)}</span>
          </button>

          <button className="reel-act-btn">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none"
              stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"/>
              <circle cx="12" cy="5" r="1"/>
              <circle cx="12" cy="19" r="1"/>
            </svg>
          </button>

          {/* Rotating audio disc */}
          <div className="audio-disc">
            <span style={{ fontSize: 16 }}>🎵</span>
          </div>
        </div>

        {/* Bottom info */}
        <div className="reel-bottom">
          <div className="reel-user-row">
            <span className="reel-avatar">{reel.avatar}</span>
            <span className="reel-username">{reel.user}</span>
            <button
              className={`reel-follow-btn ${following[reel.id] ? "following" : ""}`}
              onClick={() => toggleFollow(reel.id)}
            >
              {following[reel.id] ? "Following" : "Follow"}
            </button>
          </div>
          <p className="reel-caption">{reel.caption}</p>
          <div className="reel-audio-row">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="white">
              <path d="M9 18V5l12-2v13"/>
              <circle cx="6" cy="18" r="3"/>
              <circle cx="18" cy="16" r="3"/>
            </svg>
            <span className="reel-audio-text">{reel.audio}</span>
          </div>
        </div>

        {/* Nav arrows */}
        {current > 0 && (
          <button className="reel-nav reel-nav-up" onClick={() => setCurrent(c => c - 1)}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none"
              stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15"/>
            </svg>
          </button>
        )}
        {current < reels.length - 1 && (
          <button className="reel-nav reel-nav-down" onClick={() => setCurrent(c => c + 1)}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none"
              stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}