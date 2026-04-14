import { useState, useEffect } from "react";
import PostCard from "./PostCard";
import CreatePostBar from "./CreatePostBar";
import StoriesBar from "./StoriesBar";
import "./Feed.css";

const DEFAULT_POSTS = [
  {
    id: 1,
    username: "priya_k",
    avatar: "👩",
    location: "Mumbai, India",
    imageEmoji: "🌆",
    imageBg: "linear-gradient(135deg, #1a1040, #2d1b69)",
    caption: "Golden hour never hits different 🌅 some moments just stay forever",
    likes: 1243,
    comments: 48,
    timeAgo: "2 hours ago",
    liked: false,
    saved: false,
    tags: ["#Vibes", "#Mumbai", "#Sunset"],
  },
  {
    id: 2,
    username: "rohan.dev",
    avatar: "👨‍💻",
    location: "Bengaluru, Karnataka",
    imageEmoji: "💻",
    imageBg: "linear-gradient(135deg, #0d1b2a, #1a3a5c)",
    caption: "Shipped a banger feature at 2am. No sleep gang 🚀 #buildinpublic",
    likes: 892,
    comments: 71,
    timeAgo: "5 hours ago",
    liked: true,
    saved: false,
    tags: ["#Dev", "#Code", "#BuildInPublic"],
  },
  {
    id: 3,
    username: "anjali_m",
    avatar: "💁‍♀️",
    location: "Jaipur, Rajasthan",
    imageEmoji: "🏰",
    imageBg: "linear-gradient(135deg, #2d1a00, #5a3600)",
    caption: "Amber Fort at dusk — pure magic ✨ #Rajasthan",
    likes: 3401,
    comments: 124,
    timeAgo: "8 hours ago",
    liked: false,
    saved: true,
    tags: ["#Travel", "#Heritage", "#India"],
  },
  {
    id: 4,
    username: "foodie_india",
    avatar: "🍛",
    location: "Old Delhi",
    imageEmoji: "🍛",
    imageBg: "linear-gradient(135deg, #1a0a00, #3d1f00)",
    caption: "Butter chicken so good it should be illegal 😋 Recipe dropping soon!",
    likes: 5120,
    comments: 203,
    timeAgo: "12 hours ago",
    liked: false,
    saved: false,
    tags: ["#FoodPorn", "#Delhi", "#Foodie"],
  },
];

export default function Feed() {
  const [posts, setPosts] = useState(() => {
    try {
      const saved = localStorage.getItem("snapvibe_posts");
      return saved ? JSON.parse(saved) : DEFAULT_POSTS;
    } catch {
      return DEFAULT_POSTS;
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Fetch posts from backend
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_URL}/posts`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          // If backend fetch fails, use local posts
          throw new Error('Failed to fetch posts from server');
        }

        const data = await response.json();
        if (data.success && data.data && Array.isArray(data.data)) {
          // Convert backend posts to frontend format
          const convertedPosts = data.data.map(post => ({
            id: post._id,
            username: post.user?.username || 'unknown',
            fullName: post.user?.fullName || 'Unknown User',
            userId: post.user?._id,
            avatar: '👤',
            profilePicture: post.user?.profilePicture || null,
            location: post.location || '',
            caption: post.content || '',
            imageEmoji: '📸',
            imageBg: 'linear-gradient(135deg, #1a1040, #2d1b69)',
            mediaUrl: post.media?.[0]?.url || null,
            mediaType: post.media?.[0]?.type || null,
            likes: post.likes?.length || 0,
            comments: post.comments?.length || 0,
            timeAgo: new Date(post.createdAt).toLocaleDateString(),
            liked: false,
            saved: false,
            tags: post.tags || [],
          }));
          setPosts(convertedPosts);
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
        // Keep existing posts if fetch fails
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
    // Set up auto-refresh every 10 seconds
    const interval = setInterval(fetchPosts, 10000);
    return () => clearInterval(interval);
  }, [API_URL]);

  // Auto save to localStorage whenever posts change
  useEffect(() => {
    try {
      // Save only non-blob posts (blob URLs expire on refresh)
      const toSave = posts.map(p => ({
        ...p,
        mediaUrl: p.mediaUrl?.startsWith("blob:") ? null : p.mediaUrl,
      }));
      localStorage.setItem("snapvibe_posts", JSON.stringify(toSave));
    } catch {
      // localStorage full — ignore
    }
  }, [posts]);

  const toggleLike = (id) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  const toggleSave = (id) => {
    setPosts(prev =>
      prev.map(p => p.id === id ? { ...p, saved: !p.saved } : p)
    );
  };

  const addComment = (id) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === id ? { ...p, comments: p.comments + 1 } : p
      )
    );
  };

  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const handleAddPost = (newPost) => {
    const post = {
      id: Date.now(),
      username: "your_username",
      avatar: "🧑",
      location: "",
      imageEmoji: newPost.feeling ? newPost.feeling.emoji : "✍️",
      imageBg: newPost.media
        ? "linear-gradient(135deg, #1a1040, #2d1b69)"
        : newPost.feeling
        ? "linear-gradient(135deg, #2d0a2e, #6b1a6e)"
        : "linear-gradient(135deg, #0d1b2a, #1a3a5c)",
      caption: newPost.feeling
        ? `${newPost.text} — feeling ${newPost.feeling.emoji} ${newPost.feeling.label}`
        : newPost.text,
      mediaUrl: newPost.media || null,
      mediaType: newPost.mediaType || null,
      likes: 0,
      comments: 0,
      timeAgo: "Just now",
      liked: false,
      saved: false,
      tags: [],
    };
    setPosts(prev => [post, ...prev]);
  };

  return (
    <div className="feed">
      <CreatePostBar onAddPost={handleAddPost} />
      <StoriesBar />
      
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
          <p>Loading posts...</p>
        </div>
      )}
      
      {error && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#ff6b6b', fontSize: '14px' }}>
          <p>⚠️ {error}</p>
        </div>
      )}
      
      {!loading && posts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
          <p>No posts yet. Be the first to share! 📸</p>
        </div>
      )}
      
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          onLike={() => toggleLike(post.id)}
          onSave={() => toggleSave(post.id)}
          onComment={() => addComment(post.id)}
          onDelete={handleDeletePost}
        />
      ))}
    </div>
  );
}