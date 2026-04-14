import { useState, useEffect } from "react";
import { ThemeProvider } from "./ThemeContext";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Feed from "./components/Feed";
import ExplorePage from "./pages/ExplorePage";
import ProfilePage from "./pages/ProfilePage";
import ReelsPage from "./pages/ReelsPage";
import AddPostPage from "./pages/AddPostPage";
import LoginPage from "./pages/LoginPage";
import "./App.css";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  // Show login page if not authenticated
  if (loading) {
    return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh'}}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (activeTab) {
      case "search":  return <ExplorePage />;
      case "profile": return <ProfilePage />;
      case "reels":   return <ReelsPage />;
      case "add":     return <AddPostPage />;
      default:        return <Feed />;
    }
  };

  return (
    <ThemeProvider>
      <div className="app-layout">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
        <div className="app-main">
          <Navbar />
          <main className="main-content">{renderPage()}</main>
        </div>
      </div>
    </ThemeProvider>
  );
}