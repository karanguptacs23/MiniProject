import { useState, useEffect } from "react";
import "./PostCard.css";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function PostCard({ post, onLike, onSave, onComment, onDelete }) {
  const [showHeart, setShowHeart] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [showLikes, setShowLikes] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editCaption, setEditCaption] = useState(post.caption);
  const [caption, setCaption] = useState(post.caption);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(post.liked || false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [liking, setLiking] = useState(false);

  const LIKERS = [
    { user: "priya_k",      avatar: "👩"   },
    { user: "rohan.dev",    avatar: "👨‍💻" },
    { user: "anjali_m",     avatar: "💁‍♀️" },
    { user: "foodie_india", avatar: "🍛"   },
    { user: "sk_photos",    avatar: "📸"   },
  ];

  // Fetch comments from backend when post is loaded or comments are shown
  useEffect(() => {
    if (!showComments) return;
    
    const fetchComments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/posts/${post.id}/comments`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const commentList = data.data.map(comment => ({
            id: comment._id,
            user: comment.user.username,
            avatar: "🧑",
            text: comment.content,
            liked: false
          }));
          setComments(commentList);
        }
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      }
    };
    
    fetchComments();
  }, [showComments, post.id]);

  const handleDoubleTap = async () => {
    if (!isLiked) {
      await handleLike();
    }
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
  };

  const handleLike = async () => {
    if (liking) return; // Prevent multiple clicks
    
    try {
      setLiking(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/posts/${post.id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to update like');
      }

      const data = await response.json();
      
      // Update local state with response
      setIsLiked(data.data.isLiked);
      setLikeCount(data.data.likeCount);
      
      // Call parent callback
      if (onLike) onLike();
    } catch (error) {
      console.error('Like error:', error);
      alert('❌ Failed to update like');
    } finally {
      setLiking(false);
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/posts/${post.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: commentText.trim() })
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      const data = await response.json();
      
      // Add the comment returned from backend to state
      const newComment = {
        id: data.data._id,
        user: data.data.user.username,
        avatar: "🧑",
        text: data.data.content,
        liked: false,
      };
      
      setComments(prev => [...prev, newComment]);
      onComment();
      setCommentText("");
      setShowComments(true);
    } catch (error) {
      alert('❌ Failed to post comment');
      console.error('Comment error:', error);
    }
  };

  const toggleCommentLike = (id) => {
    setComments(prev =>
      prev.map(c => c.id === id ? { ...c, liked: !c.liked } : c)
    );
  };

  const deleteComment = (id) => {
    setComments(prev => prev.filter(c => c.id !== id));
    onComment && onComment(-1);
  };

  const handleSaveEdit = () => {
    setCaption(editCaption);
    setIsEditing(false);
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/posts/${post.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      setShowMoreMenu(false);
      onDelete && onDelete(post.id);
      alert('✅ Post deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      alert('❌ Failed to delete post: ' + error.message);
    }
  };

  return (
    <article className="post-card">

      {/* Header */}
      <div className="post-header">
        <div className="post-user">
          <div className="avatar-ring">
            <div className="avatar">
              {post.profilePicture ? (
                <img src={post.profilePicture} alt={post.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                post.avatar
              )}
            </div>
          </div>
          <div className="post-meta">
            <span className="post-username">{post.username}</span>
            {post.location && (
              <span className="post-location">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {post.location}
              </span>
            )}
          </div>
        </div>

        {/* More menu */}
        <div className="more-wrap">
          <button className="more-btn"
            onClick={() => setShowMoreMenu(!showMoreMenu)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5"/>
              <circle cx="12" cy="12" r="1.5"/>
              <circle cx="12" cy="19" r="1.5"/>
            </svg>
          </button>
          {showMoreMenu && (
            <div className="more-menu">
              <button className="more-menu-item edit"
                onClick={() => { setIsEditing(true); setShowMoreMenu(false); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit Post
              </button>
              <button className="more-menu-item delete"
                onClick={handleDeletePost}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6"/><path d="M14 11v6"/>
                </svg>
                Delete Post
              </button>
              <button className="more-menu-item"
                onClick={() => setShowMoreMenu(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/>
                  <circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                Share Post
              </button>
              <button className="more-menu-item"
                onClick={() => setShowMoreMenu(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                Report
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit caption */}
      {isEditing && (
        <div className="edit-caption-box">
          <textarea
            className="edit-caption-inp"
            value={editCaption}
            onChange={e => setEditCaption(e.target.value)}
            autoFocus
          />
          <div className="edit-caption-actions">
            <button className="edit-cancel-btn"
              onClick={() => { setIsEditing(false); setEditCaption(caption); }}>
              Cancel
            </button>
            <button className="edit-save-btn" onClick={handleSaveEdit}>
              Save
            </button>
          </div>
        </div>
      )}

      {/* Image / Video / Emoji */}
      <div
        className="post-image"
        style={{ background: post.imageBg }}
        onDoubleClick={handleDoubleTap}
      >
        {post.mediaUrl && post.mediaType === "video"
          ? (
            <div className="video-wrap">
              <video
                src={post.mediaUrl}
                className="post-media-file"
                autoPlay
                loop
                controls
                muted={videoMuted}
                playsInline
              />
              <button
                className="video-sound-btn"
                onClick={() => setVideoMuted(!videoMuted)}
              >
                {videoMuted ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <line x1="23" y1="9" x2="17" y2="15"/>
                    <line x1="17" y1="9" x2="23" y2="15"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  </svg>
                )}
              </button>
            </div>
          )
          : post.mediaUrl && post.mediaType === "image"
          ? <img src={post.mediaUrl} alt="post" className="post-media-file" />
          : <span className="post-emoji">{post.imageEmoji}</span>
        }
        {showHeart && (
          <div className="heart-burst">
            <svg viewBox="0 0 24 24" fill="#ec4899" width="90" height="90">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
        )}
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="tags-row">
          {post.tags.map(tag => (
            <span key={tag} className="tag-chip">{tag}</span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="post-actions">
        <button
          className={`action-btn like-btn ${isLiked ? "liked" : ""}`}
          onClick={handleLike}
          disabled={liking}
          aria-label={isLiked ? "Unlike" : "Like"}
        >
          <svg viewBox="0 0 24 24" width="26" height="26"
            fill={isLiked ? "#ec4899" : "none"}
            stroke={isLiked ? "#ec4899" : "currentColor"}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        <button
          className="action-btn"
          aria-label="Comment"
          onClick={() => {
            setShowComments(!showComments);
            setTimeout(() => document.getElementById(`cinp-${post.id}`)?.focus(), 100);
          }}
        >
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none"
            stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </button>

        <button className="action-btn" aria-label="Share">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none"
            stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>

        <button
          className={`action-btn save-btn ${post.saved ? "saved" : ""}`}
          onClick={onSave}
          aria-label={post.saved ? "Unsave" : "Save"}
        >
          <svg viewBox="0 0 24 24" width="24" height="24"
            fill={post.saved ? "#a78bfa" : "none"}
            stroke={post.saved ? "#a78bfa" : "currentColor"}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      </div>

      {/* Likes row — click to see who liked */}
      <div className="post-likes" onClick={() => setShowLikes(!showLikes)}>
        <div className="likes-avatars">
          {LIKERS.slice(0, 3).map((l, i) => (
            <span key={i} className="liker-avatar"
              style={{ zIndex: 3 - i, marginLeft: i === 0 ? 0 : -8 }}>
              {l.avatar}
            </span>
          ))}
        </div>
        <span>
          Liked by <span className="likes-num">{likeCount.toLocaleString()}</span> people
        </span>
      </div>

      {/* Likes modal */}
      {showLikes && (
        <div className="likes-list">
          <div className="likes-list-header">
            <span>Likes</span>
            <button className="likes-close" onClick={() => setShowLikes(false)}>×</button>
          </div>
          {LIKERS.map((l, i) => (
            <div key={i} className="liker-row">
              <span className="liker-big-avatar">{l.avatar}</span>
              <span className="liker-name">{l.user}</span>
              <button className="follow-small-btn">Follow</button>
            </div>
          ))}
        </div>
      )}

      {/* Caption */}
      <div className="post-caption">
        <span className="caption-username">{post.username}</span>
        {caption}
      </div>

      {/* Comments section */}
      <button
        className="post-comments"
        onClick={() => setShowComments(!showComments)}
      >
        {showComments ? "Hide comments" : `View all ${comments.length} comments`}
      </button>

      {showComments && (
        <div className="comments-list">
          {comments.map(c => (
            <div key={c.id} className="comment-item">
              <span className="comment-avatar">{c.avatar}</span>
              <div className="comment-content">
                <span className="comment-user">{c.user}</span>
                <span className="comment-text">{c.text}</span>
              </div>
              <div className="comment-right">
                <button
                  className={`comment-like-btn ${c.liked ? "liked" : ""}`}
                  onClick={() => toggleCommentLike(c.id)}
                >
                  <svg viewBox="0 0 24 24" width="14" height="14"
                    fill={c.liked ? "#ec4899" : "none"}
                    stroke={c.liked ? "#ec4899" : "currentColor"}
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
                {c.user === "your_username" && (
                  <button
                    className="comment-delete-btn"
                    onClick={() => deleteComment(c.id)}
                  >×</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment input */}
      <div className="comment-row">
        <span className="comment-own-avatar">🧑</span>
        <input
          id={`cinp-${post.id}`}
          className="comment-input"
          type="text"
          placeholder="Add a comment..."
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSendComment()}
        />
        {commentText.trim() && (
          <button className="send-btn" onClick={handleSendComment}>
            Post
          </button>
        )}
      </div>

      {/* Time */}
      <div className="post-time">{post.timeAgo}</div>
    </article>
  );
}