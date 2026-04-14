import { useState, useRef, useEffect } from "react";
import "./StoriesBar.css";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function StoriesBar() {
  const [stories, setStories] = useState([]);
  const [viewing, setViewing] = useState(null);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [storyLikes, setStoryLikes] = useState({});
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState({});
  const fileRef = useRef();
  const timerRef = useRef();
  const progressRef = useRef();

  // Fetch stories on mount
  useEffect(() => {
    fetchStories();
    // Auto-refresh stories every 10 seconds
    const interval = setInterval(fetchStories, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/stories`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch stories');

      const data = await response.json();
      setStories(data.data || []);
    } catch (error) {
      console.error('Error fetching stories:', error);
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  // Open story viewer or file input for own story
  const openStory = (storyGroup, storyItem) => {
    // Mark as viewed
    if (storyItem) {
      markStoryAsViewed(storyItem.id);
    }

    setViewing({ ...storyGroup, currentStoryIndex: 0, currentStory: storyGroup.storyItems[0] });
    setProgress(0);
    setPaused(false);
    startProgress();
  };

  const markStoryAsViewed = async (storyId) => {
    try {
      await fetch(`${API_URL}/stories/${storyId}/view`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error('Error marking story as viewed:', error);
    }
  };

  const startProgress = () => {
    clearInterval(timerRef.current);
    clearInterval(progressRef.current);
    let p = 0;
    progressRef.current = setInterval(() => {
      if (!paused) {
        p += 1;
        setProgress(p);
        if (p >= 100) {
          clearInterval(progressRef.current);
          goNext();
        }
      }
    }, 50); // 5 seconds total
  };

  const closeStory = () => {
    setViewing(null);
    setProgress(0);
    clearInterval(progressRef.current);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('media', file);

      const response = await fetch(`${API_URL}/stories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to upload story');

      // Refresh stories list
      fetchStories();
      alert('✨ Story uploaded! Disappears in 24 hours');
    } catch (error) {
      console.error('Error uploading story:', error);
      alert(' Failed to upload story');
    }

    e.target.value = "";
  };

  const handleStoryLike = async () => {
    if (!viewing?.currentStory) return;
    
    try {
      const storyId = viewing.currentStory.id;
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/stories/${storyId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to like story');
      }

      const data = await response.json();
      
      // Update local state with response
      setStoryLikes(prev => ({
        ...prev,
        [storyId]: data.data.isLiked
      }));
    } catch (error) {
      console.error('Like error:', error);
      alert('❌ Failed to like story');
    }
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !viewing?.currentStory) return;
    
    const storyId = viewing.currentStory.id;
    setReplies(prev => ({
      ...prev,
      [storyId]: [
        ...(prev[storyId] || []),
        {
          id: Date.now(),
          text: replyText,
          timestamp: new Date()
        }
      ]
    }));
    setReplyText('');
  };

  const handleDeleteStory = async () => {
    if (!window.confirm('Are you sure you want to delete this story?')) {
      return;
    }

    try {
      const storyId = viewing.currentStory.id;
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/stories/${storyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete story');
      }

      fetchStories();
      closeStory();
      alert('✅ Story deleted successfully');
    } catch (error) {
      console.error('Error deleting story:', error);
      alert('❌ Failed to delete story: ' + error.message);
    }
  };

  const goNext = () => {
    if (!viewing) return;
    
    const currentIdx = viewing.currentStoryIndex;
    if (currentIdx < viewing.storyItems.length - 1) {
      const nextIdx = currentIdx + 1;
      setViewing(prev => ({
        ...prev,
        currentStoryIndex: nextIdx,
        currentStory: prev.storyItems[nextIdx]
      }));
      setProgress(0);
      startProgress();
    } else {
      closeStory();
    }
  };

  const goPrev = () => {
    if (!viewing) return;

    const currentIdx = viewing.currentStoryIndex;
    if (currentIdx > 0) {
      const prevIdx = currentIdx - 1;
      setViewing(prev => ({
        ...prev,
        currentStoryIndex: prevIdx,
        currentStory: prev.storyItems[prevIdx]
      }));
      setProgress(0);
      startProgress();
    }
  };

  return (
    <>
      {/* Stories bar */}
      <div className="stories-bar">
        {/* Add own story button */}
        <div className="story-item story-own" onClick={() => fileRef.current.click()}>
          <div className="story-ring own">
            <div className="story-inner">
              <span className="add-plus">+</span>
            </div>
          </div>
          <span className="story-name">Your story</span>
        </div>

        {/* Other users' stories */}
        {stories && stories.map((group) => (
          <div
            key={group.userId}
            className="story-item"
            onClick={() => openStory(group, group.storyItems[0])}
          >
            <div className={`story-ring ${group.storyItems[0]?.seen ? "seen" : ""}`}>
              <div className="story-inner">
                <span className="story-emoji">
                  {group.profilePicture ? 
                    <img src={group.profilePicture} alt={group.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> 
                    : "👤"}
                </span>
              </div>
            </div>
            <span className="story-name">{group.username}</span>
          </div>
        ))}

        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />
      </div>

      {/* Story Viewer Modal */}
      {viewing && viewing.currentStory && (
        <div className="story-viewer" onClick={closeStory} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div
            className="story-viewer-box"
            onClick={e => e.stopPropagation()}
            style={{
              width: '90%',
              maxWidth: '480px',
              height: 'auto',
              maxHeight: '85vh',
              aspectRatio: '9/16',
              backgroundColor: '#000',
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}
          >
            {/* Progress bar */}
            <div className="story-progress-bar" style={{ display: 'flex', gap: '4px', padding: '8px 12px', backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
              {viewing.storyItems.map((s, i) => (
                <div key={s.id} className="story-prog-track" style={{ flex: 1, height: '2px', backgroundColor: 'rgba(255, 255, 255, 0.3)', borderRadius: '1px', overflow: 'hidden' }}>
                  <div
                    className="story-prog-fill"
                    style={{
                      height: '100%',
                      backgroundColor: 'white',
                      width: i === viewing.currentStoryIndex
                        ? `${progress}%`
                        : i < viewing.currentStoryIndex ? "100%" : "0%",
                      transition: i === viewing.currentStoryIndex ? 'none' : 'width 0.3s'
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="story-viewer-header" style={{ padding: '12px', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="story-viewer-user" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="story-viewer-avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                  {viewing.profilePicture && viewing.profilePicture.startsWith('/uploads') ? (
                    <img src={viewing.profilePicture} alt={viewing.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : viewing.profilePicture ? (
                    <img src={viewing.profilePicture} alt={viewing.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>👤</span>
                  )}
                </div>
                <div>
                  <div className="story-viewer-name" style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>{viewing.username}</div>
                  <div className="story-viewer-time" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '11px' }}>
                    {new Date(viewing.currentStory.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              <div className="story-viewer-actions" style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="story-pause-btn"
                  onClick={() => setPaused(!paused)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Pause"
                >
                  {paused
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                        <rect x="6" y="4" width="4" height="16"/>
                        <rect x="14" y="4" width="4" height="16"/>
                      </svg>
                  }
                </button>
                <button 
                  className="story-delete-btn" 
                  onClick={handleDeleteStory}
                  title="Delete story"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="#ff6b6b" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <line x1="10" y1="11" x2="10" y2="17"/>
                    <line x1="14" y1="11" x2="14" y2="17"/>
                  </svg>
                </button>
                <button className="story-close-btn" onClick={closeStory} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="white" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Story content */}
            <div
              className="story-content"
              onClick={e => {
                const x = e.clientX;
                const w = e.currentTarget.offsetWidth;
                if (x < w / 2) goPrev();
                else goNext();
              }}
              style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}
            >
              {viewing.currentStory?.media
                ? viewing.currentStory.media.type === "video"
                  ? <video
                      src={viewing.currentStory.media.url}
                      className="story-full-media"
                      autoPlay
                      loop
                      controls
                      playsInline
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  : <img
                      src={viewing.currentStory.media.url}
                      alt="story"
                      className="story-full-media"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                : <div className="story-emoji-full">
                    <span>📱</span>
                    <p className="story-emoji-caption">{viewing.username}'s story</p>
                  </div>
              }

              {/* Profile picture overlay */}
              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                borderRadius: '24px',
                padding: '6px 12px',
                backdropFilter: 'blur(8px)'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.3)'
                }}>
                  {viewing.profilePicture && viewing.profilePicture.startsWith('/uploads') ? (
                    <img src={viewing.profilePicture} alt={viewing.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : viewing.profilePicture ? (
                    <img src={viewing.profilePicture} alt={viewing.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '16px' }}>👤</span>
                  )}
                </div>
                <span style={{ color: 'white', fontSize: '13px', fontWeight: '600', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{viewing.username}</span>
              </div>

              {/* Tap hints */}
              <div className="tap-prev-hint">‹</div>
              <div className="tap-next-hint">›</div>
            </div>

            {/* Reply input */}
            <div className="story-reply-row" style={{ display: 'flex', gap: '8px', padding: '12px', backgroundColor: 'rgba(0, 0, 0, 0.5)', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <input
                className="story-reply-inp"
                placeholder={`Reply to ${viewing.username}...`}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSendReply()}
                onClick={e => e.stopPropagation()}
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  outline: 'none',
                  backdropFilter: 'blur(8px)'
                }}
              />
              <button className="story-reply-send" onClick={() => handleSendReply()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="white" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2" fill="white" stroke="none"/>
                </svg>
              </button>
              <button className="story-heart-btn" onClick={handleStoryLike} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24"
                  fill={storyLikes[viewing.currentStory?.id] ? "#ff6b9d" : "none"} 
                  stroke={storyLikes[viewing.currentStory?.id] ? "#ff6b9d" : "white"} 
                  strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}