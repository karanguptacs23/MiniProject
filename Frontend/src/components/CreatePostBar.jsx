import { useState } from "react";
import "./CreatePostBar.css";

export default function CreatePostBar({ onAddPost }) {
  const [showModal, setShowModal] = useState(false);
  const [text, setText] = useState("");
  const [media, setMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [feeling, setFeeling] = useState(null);
  const [showFeelings, setShowFeelings] = useState(false);

  const FEELINGS = [
    { emoji: "😊", label: "happy" },
    { emoji: "😍", label: "loved" },
    { emoji: "😎", label: "cool" },
    { emoji: "😴", label: "tired" },
    { emoji: "😤", label: "motivated" },
    { emoji: "🥳", label: "celebrating" },
    { emoji: "😢", label: "sad" },
    { emoji: "🤩", label: "excited" },
    { emoji: "😌", label: "grateful" },
    { emoji: "🔥", label: "lit" },
  ];

  const handleMedia = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setMedia(URL.createObjectURL(file));
    setMediaType(type);
    setShowModal(true);
  };

  const handlePost = () => {
    if (!text.trim() && !media) return;
    onAddPost && onAddPost({ text, media, mediaType, feeling });
    setText("");
    setMedia(null);
    setMediaType(null);
    setFeeling(null);
    setShowModal(false);
  };

  return (
    <>
      {/* Create bar */}
      <div className="create-bar">
        <div className="create-avatar">🧑</div>
        <button
          className="create-input-btn"
          onClick={() => setShowModal(true)}
        >
          What's on your mind?
        </button>
      </div>

      <div className="create-actions">
        <label className="create-action-btn">
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={e => handleMedia(e, "image")}
          />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="#a78bfa" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="3"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          Photo
        </label>

        <label className="create-action-btn">
          <input
            type="file"
            accept="video/*"
            style={{ display: "none" }}
            onChange={e => handleMedia(e, "video")}
          />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="#ec4899" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <polygon points="23 7 16 12 23 17 23 7"/>
            <rect x="1" y="5" width="15" height="14" rx="2"/>
          </svg>
          Video
        </label>

        <button
          className="create-action-btn"
          onClick={() => { setShowModal(true); setShowFeelings(true); }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="#f97316" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
            <line x1="9" y1="9" x2="9.01" y2="9"/>
            <line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
          Feeling
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => { if(e.target.classList.contains("modal-overlay")) setShowModal(false); }}>
          <div className="modal-box">

            {/* Modal header */}
            <div className="modal-header">
              <span className="modal-title">Create Post</span>
              <button className="modal-close" onClick={() => { setShowModal(false); setShowFeelings(false); }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* User row */}
            <div className="modal-user">
              <div className="modal-avatar">🧑</div>
              <div>
                <div className="modal-username">your_username</div>
                {feeling && (
                  <div className="modal-feeling">
                    is feeling {feeling.emoji} {feeling.label}
                  </div>
                )}
              </div>
            </div>

            {/* Feelings picker */}
            {showFeelings ? (
              <div className="feelings-grid">
                <p className="feelings-title">How are you feeling?</p>
                {FEELINGS.map(f => (
                  <button
                    key={f.label}
                    className={`feeling-btn ${feeling?.label === f.label ? "active" : ""}`}
                    onClick={() => { setFeeling(f); setShowFeelings(false); }}
                  >
                    <span>{f.emoji}</span>
                    <span>{f.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <>
                {/* Text input */}
                <textarea
                  className="modal-textarea"
                  placeholder="What's on your mind?"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  autoFocus
                />

                {/* Media preview */}
                {media && (
                  <div className="modal-media-preview">
                    {mediaType === "video"
                      ? <video src={media} controls className="modal-media" />
                      : <img src={media} alt="preview" className="modal-media" />
                    }
                    <button
                      className="remove-media"
                      onClick={() => { setMedia(null); setMediaType(null); }}
                    >×</button>
                  </div>
                )}

                {/* Bottom actions */}
                <div className="modal-bottom">
                  <div className="modal-add-row">
                    <span className="modal-add-label">Add to your post</span>
                    <div className="modal-add-icons">
                      <label className="modal-icon-btn" title="Photo">
                        <input type="file" accept="image/*" style={{ display:"none" }}
                          onChange={e => handleMedia(e, "image")} />
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                          stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="3"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                      </label>
                      <label className="modal-icon-btn" title="Video">
                        <input type="file" accept="video/*" style={{ display:"none" }}
                          onChange={e => handleMedia(e, "video")} />
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                          stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="23 7 16 12 23 17 23 7"/>
                          <rect x="1" y="5" width="15" height="14" rx="2"/>
                        </svg>
                      </label>
                      <button
                        className="modal-icon-btn"
                        onClick={() => setShowFeelings(true)}
                        title="Feeling"
                      >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                          stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                          <line x1="9" y1="9" x2="9.01" y2="9"/>
                          <line x1="15" y1="9" x2="15.01" y2="9"/>
                        </svg>
                      </button>
                      <button className="modal-icon-btn" title="Location">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                          stroke="#1d9e75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <button
                    className={`post-btn ${(!text.trim() && !media) ? "disabled" : ""}`}
                    onClick={handlePost}
                    disabled={!text.trim() && !media}
                  >
                    Post
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}