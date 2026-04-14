import { useState, useRef, useCallback, useEffect } from "react";
import "./AddPostPage.css";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function AddPostPage() {
  const [step, setStep] = useState(1);
  const [preview, setPreview] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [filter, setFilter] = useState("none");
  const [videoMuted, setVideoMuted] = useState(false);
  const [adjustments, setAdjustments] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
  });
  const [isStory, setIsStory] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();
  const fileInputRef = useRef();
  const videoRef = useRef();
  const autoSaveRef = useRef();

  const FILTERS = [
    { name: "None",    value: "none" },
    { name: "Warm",    value: "sepia(0.4) saturate(1.3)" },
    { name: "Cool",    value: "hue-rotate(30deg) saturate(1.2)" },
    { name: "Fade",    value: "opacity(0.85) brightness(1.1)" },
    { name: "Vivid",   value: "saturate(1.8) contrast(1.1)" },
    { name: "Noir",    value: "grayscale(1) contrast(1.2)" },
    { name: "Glow",    value: "brightness(1.2) saturate(1.4)" },
    { name: "Vintage", value: "sepia(0.6) hue-rotate(-20deg)" },
  ];

  // Combine filter + adjustments into one CSS filter string
  const computedFilter = useCallback(() => {
    const { brightness, contrast, saturation } = adjustments;
    const adj = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    if (filter === "none") return adj;
    return `${filter} ${adj}`;
  }, [filter, adjustments]);

  const handleFile = (file) => {
    if (!file) return;
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
    setFileType(file.type.startsWith("video") ? "video" : "image");
    setStep(2);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const addTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      const t = tagInput.startsWith("#") ? tagInput : "#" + tagInput;
      if (!tags.includes(t)) setTags([...tags, t]);
      setTagInput("");
    }
  };

  const removeTag = (t) => setTags(tags.filter(x => x !== t));

  // Auto-save draft to localStorage
  useEffect(() => {
    autoSaveRef.current = setTimeout(() => {
      if (caption || location || tags.length > 0) {
        const draft = {
          caption,
          location,
          tags,
          filter,
          adjustments,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('postDraft', JSON.stringify(draft));
      }
    }, 1000);

    return () => clearTimeout(autoSaveRef.current);
  }, [caption, location, tags, filter, adjustments]);

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('postDraft');
    if (savedDraft && step === 3) {
      try {
        const draft = JSON.parse(savedDraft);
        setCaption(draft.caption || "");
        setLocation(draft.location || "");
        setTags(draft.tags || []);
        setFilter(draft.filter || "none");
        setAdjustments(draft.adjustments || { brightness: 100, contrast: 100, saturation: 100 });
      } catch (e) {
        console.error('Failed to load draft', e);
      }
    }
  }, []);

  const handlePost = async () => {
    try {
      setUploading(true);
      setError("");

      if (!selectedFile) {
        setError("Please select a file");
        setUploading(false);
        return;
      }

      const formData = new FormData();
      
      if (isStory) {
        // Upload as story
        formData.append('media', selectedFile);

        const response = await fetch(`${API_URL}/stories`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to upload story');
        }
        
        alert("✨ Story posted! Disappears in 24 hours");
        
      } else {
        // Upload as post
        formData.append('media', selectedFile);
        formData.append('content', caption);
        formData.append('location', location);
        formData.append('tags', tags.join(','));
        formData.append('visibility', 'public');

        const response = await fetch(`${API_URL}/posts`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to upload post');
        }
        
        alert("🚀 Post published on SnapVibe!");

        // Clear localStorage draft
        localStorage.removeItem('postDraft');
      }

      // Reset form
      setStep(1);
      setPreview(null);
      setFileType(null);
      setSelectedFile(null);
      setCaption("");
      setLocation("");
      setTags([]);
      setFilter("none");
      setAdjustments({ brightness: 100, contrast: 100, saturation: 100 });
      setIsStory(false);
      if (fileInputRef.current) fileInputRef.current.value = "";

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || "Upload failed");
      alert("❌ " + (err.message || "Upload failed. Please try again."));
    } finally {
      setUploading(false);
    }
  };

  const updateAdjustment = (key, value) => {
    setAdjustments(prev => ({ ...prev, [key]: Number(value) }));
  };

  return (
    <div className="add-page">

      {/* Header */}
      <div className="add-header">
        {step >= 2
          ? <button className="back-btn" onClick={() => setStep(s => s - 1)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
          : <div style={{ width: 32 }} />
        }
        <span className="add-title">
          {step === 1 ? "New Post" : step === 2 ? "Edit Media" : "Details"}
        </span>
        {step === 2 && (
          <button className="next-btn" onClick={() => setStep(3)}>Next</button>
        )}
        {step === 3 && (
          <button className="share-btn" onClick={handlePost}>Share</button>
        )}
        {step === 1 && <div style={{ width: 32 }} />}
      </div>

      {/* ── STEP 1 — Pick media ── */}
      {step === 1 && (
        <div className="upload-area">
          <div
            className={`drop-zone ${dragOver ? "drag-over" : ""}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
          >
            <div className="drop-icon">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.2"
                strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="4"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            <p className="drop-title">Drop photo or video here</p>
            <p className="drop-sub">Supports JPG, PNG, MP4, MOV</p>
            <button
              className="browse-btn"
              onClick={e => { e.stopPropagation(); fileInputRef.current.click(); }}
            >
              Choose from device
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            style={{ display: "none" }}
            onChange={e => handleFile(e.target.files[0])}
          />

          {/* Upload type buttons */}
          <div className="upload-types">
            <button className="type-btn" onClick={() => {
              fileInputRef.current.setAttribute("accept", "image/*");
              fileInputRef.current.click();
              setIsStory(false);
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              Photo
            </button>
            <button className="type-btn" onClick={() => {
              fileInputRef.current.setAttribute("accept", "video/*");
              fileInputRef.current.click();
              setIsStory(false);
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2"/>
              </svg>
              Video
            </button>
            <button className="type-btn" onClick={() => {
              fileInputRef.current.setAttribute("accept", "image/*,video/*");
              fileInputRef.current.click();
              setIsStory(true);
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              Story
            </button>
          </div>

          {/* Quick emoji */}
          <div className="quick-section">
            <p className="quick-label">Quick emoji post</p>
            <div className="emoji-grid">
              {["🌅","🍜","🏔️","🎵","🌸","🚀","🎨","⚡","🌊","🏙️","🌿","🔥"].map(em => (
                <button key={em} className="emoji-pick"
                  onClick={() => { setPreview(em); setFileType("emoji"); setStep(3); }}>
                  {em}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2 — Filter + Adjustments ── */}
      {step === 2 && preview && (
        <div className="filter-area">

          {/* Preview with computed filter */}
          <div className="filter-preview">
            {fileType === "video"
              ? <video
                  ref={videoRef}
                  src={preview}
                  className="preview-media"
                  style={{ filter: computedFilter() }}
                  autoPlay
                  loop
                  muted={videoMuted}
                  playsInline
                  controls={false}
                />
              : <img
                  src={preview}
                  alt="preview"
                  className="preview-media"
                  style={{ filter: computedFilter() }}
                />
            }

            {/* Video sound toggle on preview */}
            {fileType === "video" && (
              <button
                className="preview-sound-btn"
                onClick={() => setVideoMuted(!videoMuted)}
              >
                {videoMuted
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                      <line x1="23" y1="9" x2="17" y2="15"/>
                      <line x1="17" y1="9" x2="23" y2="15"/>
                    </svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                    </svg>
                }
                {videoMuted ? "Unmute" : "Mute"}
              </button>
            )}
          </div>

          {/* Filters bar */}
          <div className="filter-label-row">
            <span className="section-label">Filters</span>
          </div>
          <div className="filters-bar">
            {FILTERS.map(f => (
              <button
                key={f.name}
                className={`filter-btn ${filter === f.value ? "active" : ""}`}
                onClick={() => setFilter(f.value)}
              >
                <div className="filter-thumb" style={{ filter: f.value }}>
                  {fileType === "video" ? "🎬" : "🖼️"}
                </div>
                <span>{f.name}</span>
              </button>
            ))}
          </div>

          {/* Adjustments — fully working */}
          <div className="adjust-section">
            <span className="section-label">Adjustments</span>

            {[
              { key: "brightness", label: "Brightness", min: 50,  max: 200 },
              { key: "contrast",   label: "Contrast",   min: 50,  max: 200 },
              { key: "saturation", label: "Saturation", min: 0,   max: 300 },
            ].map(adj => (
              <div key={adj.key} className="adjust-row">
                <span className="adjust-name">{adj.label}</span>
                <input
                  type="range"
                  min={adj.min}
                  max={adj.max}
                  step="1"
                  value={adjustments[adj.key]}
                  className="adjust-slider"
                  onChange={e => updateAdjustment(adj.key, e.target.value)}
                />
                <span className="adjust-val">{adjustments[adj.key]}</span>
              </div>
            ))}

            {/* Reset button */}
            <button
              className="reset-adj-btn"
              onClick={() => setAdjustments({ brightness: 100, contrast: 100, saturation: 100 })}
            >
              Reset Adjustments
            </button>
          </div>
        </div>
      )}

          {/* ── STEP 3 — Caption & Details ── */}
          {step === 3 && (
            <div className="details-area">

              {/* Preview + Caption (only for posts, not stories) */}
              {!isStory && (
                <>
                  <div className="preview-caption-row">
                    <div className="preview-thumb">
                      {fileType === "emoji"
                        ? <span style={{ fontSize: 44 }}>{preview}</span>
                        : fileType === "video"
                        ? <video
                            src={preview}
                            style={{
                              width: "100%", height: "100%",
                              objectFit: "cover", borderRadius: 12,
                              filter: computedFilter()
                            }}
                            autoPlay loop muted={videoMuted} playsInline
                          />
                        : <img
                            src={preview}
                            alt="p"
                            style={{
                              width: "100%", height: "100%",
                              objectFit: "cover", borderRadius: 12,
                              filter: computedFilter()
                            }}
                          />
                      }
                    </div>
                    <textarea
                      className="caption-inp"
                      placeholder="Write a caption..."
                      value={caption}
                      onChange={e => setCaption(e.target.value)}
                      maxLength={300}
                    />
                  </div>
                  <div className="char-count">{caption.length}/300</div>

                  {/* Location */}
                  <div className="field-row">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="var(--accent)" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <input
                      className="field-inp"
                      placeholder="Add location..."
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                    />
                  </div>

                  {/* Tags */}
                  <div className="field-row">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="var(--accent-pink)" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                      <line x1="7" y1="7" x2="7.01" y2="7"/>
                    </svg>
                    <input
                      className="field-inp"
                      placeholder="Add hashtag + press Enter..."
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={addTag}
                    />
                  </div>

                  {tags.length > 0 && (
                    <div className="tags-wrap">
                      {tags.map(t => (
                        <span key={t} className="tag-chip">
                          {t}
                          <button className="tag-remove" onClick={() => removeTag(t)}>×</button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Options */}
                  <div className="options-list">
                    {[
                      { icon: "👥", label: "Tag people" },
                      { icon: "🎵", label: "Add music" },
                      { icon: "🌍", label: "Audience" },
                      { icon: "⚙️", label: "Advanced settings" },
                    ].map((opt, i) => (
                      <div key={i} className="option-row">
                        <div className="option-left">
                          <span className="option-icon">{opt.icon}</span>
                          <span>{opt.label}</span>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke="var(--text-muted)" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Story preview */}
              {isStory && (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
                  <h3>Your Story</h3>
                  <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Disappears after 24 hours
                  </p>
                </div>
              )}

          <button className="share-big-btn" onClick={handlePost} disabled={uploading}>
            {uploading ? (
              "⏳ Uploading..."
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="white" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2" fill="white" stroke="none"/>
                </svg>
                {isStory ? "Share Story" : "Share to SnapVibe"}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}