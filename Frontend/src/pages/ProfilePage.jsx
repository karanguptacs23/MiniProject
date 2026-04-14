import { useState, useRef, useEffect } from "react";
import "./ProfilePage.css";

const GRID_ITEMS = [
  { id: 1, emoji: "🌅", bg: "linear-gradient(135deg, #1a1040, #2d1b69)" },
  { id: 2, emoji: "🍜", bg: "linear-gradient(135deg, #2d1a00, #5a3600)" },
  { id: 3, emoji: "🏞️", bg: "linear-gradient(135deg, #0d1b2a, #1a3a5c)" },
  { id: 4, emoji: "🎉", bg: "linear-gradient(135deg, #2d0a2e, #6b1a6e)" },
  { id: 5, emoji: "🐾", bg: "linear-gradient(135deg, #0a2e1a, #1a6e3a)" },
  { id: 6, emoji: "☕", bg: "linear-gradient(135deg, #1a0a2e, #3d1a6e)" },
  { id: 7, emoji: "🌿", bg: "linear-gradient(135deg, #0a2e1a, #1a6e3a)" },
  { id: 8, emoji: "🎸", bg: "linear-gradient(135deg, #0a0a2e, #1a1a6e)" },
  { id: 9, emoji: "🏄", bg: "linear-gradient(135deg, #1a1040, #2d1b69)" },
];

export default function ProfilePage() {
  const [activeSection, setActiveSection] = useState("posts");
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const avatarRef = useRef();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Fetch current user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_URL}/users/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        if (data.success) {
          const user = data.data;
          const profileData = {
            username: user.username,
            name: user.fullName,
            bio: user.bio || '',
            website: user.website || '',
            posts: 0,
            followers: user.followers?.length || 0,
            following: user.following?.length || 0,
            avatar: user.profilePicture ? null : '🧑',
            profilePicture: user.profilePicture || null,
            email: user.email
          };
          setProfile(profileData);
          setEditData({ ...profileData });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [API_URL]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
      setProfilePhotoFile(file);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const formData = new FormData();
      formData.append('fullName', editData.name);
      formData.append('username', editData.username);
      formData.append('bio', editData.bio);
      formData.append('website', editData.website);
      
      if (profilePhotoFile) {
        formData.append('profilePicture', profilePhotoFile);
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const data = await response.json();
      if (data.success) {
        const updatedProfile = {
          username: data.data.username,
          name: data.data.fullName,
          bio: data.data.bio || '',
          website: data.data.website || '',
          posts: profile.posts,
          followers: profile.followers,
          following: profile.following,
          avatar: data.data.profilePicture ? null : '🧑',
          profilePicture: data.data.profilePicture || null,
          email: data.data.email
        };
        setProfile(updatedProfile);
        setAvatarPreview(null);
        setProfilePhotoFile(null);
        setEditing(false);
        alert('✅ Profile updated successfully!');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err.message);
      alert('❌ ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({ ...profile });
    setAvatarPreview(null);
    setProfilePhotoFile(null);
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#ff6b6b' }}>
          <p>❌ {error || 'Failed to load profile'}</p>
        </div>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="profile-page">
        {/* Edit Header */}
        <div className="edit-header">
          <button className="edit-cancel-btn" onClick={handleCancel} disabled={saving}>Cancel</button>
          <span className="edit-title">Edit Profile</span>
          <button className="edit-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        {/* Avatar Edit */}
        <div className="edit-avatar-section">
          <div className="edit-avatar-wrap" onClick={() => avatarRef.current.click()}>
            {avatarPreview
              ? <img src={avatarPreview} alt="avatar" className="edit-avatar-img" />
              : profile.profilePicture
              ? <img src={profile.profilePicture} alt="avatar" className="edit-avatar-img" />
              : <span className="edit-avatar-emoji">{profile.avatar}</span>
            }
            <div className="edit-avatar-overlay">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
          </div>
          <button className="change-photo-btn" onClick={() => avatarRef.current.click()}>
            Change Profile Photo
          </button>
          <input
            ref={avatarRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleAvatarChange}
          />
        </div>

        {/* Edit Fields */}
        <div className="edit-fields">
          {[
            { label: "Name", key: "name", placeholder: "Your name" },
            { label: "Username", key: "username", placeholder: "username" },
            { label: "Website", key: "website", placeholder: "Website URL" },
          ].map(field => (
            <div key={field.key} className="edit-field">
              <label className="field-label">{field.label}</label>
              <input
                className="edit-input"
                value={editData[field.key] || ""}
                placeholder={field.placeholder}
                onChange={e => setEditData(prev => ({ ...prev, [field.key]: e.target.value }))}
              />
            </div>
          ))}

          <div className="edit-field">
            <label className="field-label">Bio</label>
            <textarea
              className="edit-textarea"
              value={editData.bio || ""}
              placeholder="Write something about yourself..."
              maxLength={150}
              onChange={e => setEditData(prev => ({ ...prev, bio: e.target.value }))}
            />
            <span className="bio-count">{(editData.bio || "").length}/150</span>
          </div>
        </div>

        {/* Danger zone */}
        <div className="danger-zone">
          <button className="danger-btn">Switch to Professional Account</button>
          <button className="danger-btn">Personal Information Settings</button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-top">
          <div className="profile-avatar-wrap">
            {profile.profilePicture
              ? <img src={profile.profilePicture} alt="avatar" className="profile-avatar-img" />
              : <span className="profile-avatar-emoji">{profile.avatar}</span>
            }
          </div>
          <div className="profile-stats">
            <div className="stat" onClick={() => {}}>
              <span className="stat-num">{profile.posts}</span>
              <span className="stat-label">posts</span>
            </div>
            <div className="stat">
              <span className="stat-num">{profile.followers.toLocaleString()}</span>
              <span className="stat-label">followers</span>
            </div>
            <div className="stat">
              <span className="stat-num">{profile.following}</span>
              <span className="stat-label">following</span>
            </div>
          </div>
        </div>

        <div className="profile-info">
          <span className="profile-name">{profile.name}</span>
          <span className="profile-bio">{profile.bio}</span>
          {profile.website && (
            <a href={profile.website} className="profile-website">
              🔗 {profile.website}
            </a>
          )}
        </div>

        <div className="profile-actions">
          <button className="profile-btn edit-profile-btn"
            onClick={() => { setEditData({ ...profile }); setEditing(true); }}>
            Edit Profile
          </button>
          <button className="profile-btn">
            Share Profile
          </button>
          <button className="profile-icon-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </button>
        </div>

        {/* Story Highlights */}
        <div className="highlights-bar">
          {["Travel", "Food", "Dev", "Life"].map(h => (
            <div key={h} className="highlight-item">
              <div className="highlight-ring">
                <div className="highlight-inner">
                  {h === "Travel" ? "✈️" : h === "Food" ? "🍜" : h === "Dev" ? "💻" : "✨"}
                </div>
              </div>
              <span className="highlight-name">{h}</span>
            </div>
          ))}
          <div className="highlight-item">
            <div className="highlight-ring add-highlight">
              <div className="highlight-inner">+</div>
            </div>
            <span className="highlight-name">New</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeSection === "posts" ? "active" : ""}`}
          onClick={() => setActiveSection("posts")}
        >
          <svg width="22" height="22" viewBox="0 0 24 24"
            fill={activeSection === "posts" ? "currentColor" : "none"}
            stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
        </button>
        <button
          className={`tab-btn ${activeSection === "reels" ? "active" : ""}`}
          onClick={() => setActiveSection("reels")}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={activeSection === "reels" ? 2.8 : 2}
            strokeLinecap="round" strokeLinejoin="round">
            <polygon points="23 7 16 12 23 17 23 7"/>
            <rect x="1" y="5" width="15" height="14" rx="2"/>
          </svg>
        </button>
        <button
          className={`tab-btn ${activeSection === "saved" ? "active" : ""}`}
          onClick={() => setActiveSection("saved")}
        >
          <svg width="22" height="22" viewBox="0 0 24 24"
            fill={activeSection === "saved" ? "currentColor" : "none"}
            stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
        <button
          className={`tab-btn ${activeSection === "tagged" ? "active" : ""}`}
          onClick={() => setActiveSection("tagged")}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={activeSection === "tagged" ? 2.8 : 2}
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
            <line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
        </button>
      </div>

      {/* Grid */}
      <div className="profile-grid">
        {activeSection === "saved" ? (
          <div className="empty-section">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
              stroke="var(--text-muted)" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            <p>No saved posts yet</p>
          </div>
        ) : activeSection === "tagged" ? (
          <div className="empty-section">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
              stroke="var(--text-muted)" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            <p>No tagged posts yet</p>
          </div>
        ) : (
          GRID_ITEMS.map(item => (
            <div key={item.id} className="grid-cell" style={{ background: item.bg }}>
              <span className="grid-emoji">{item.emoji}</span>
              <div className="grid-overlay">
                <div className="grid-stat">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  <span>{Math.floor(Math.random() * 900 + 100)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 