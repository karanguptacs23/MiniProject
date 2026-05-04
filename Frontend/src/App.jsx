import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔐 Check auth on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  // 🔓 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  // ⏳ Loading screen
  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        fontSize: "20px"
      }}>
        Loading...
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Routes>

        {/* 🔓 Public Route */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/" /> : <LoginPage />
          }
        />

        {/* 🔐 Protected Routes */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <div className="app-layout">
                <Sidebar onLogout={handleLogout} />

                <div className="app-main">
                  <Navbar />

                  <main className="main-content">
                    <Routes>
                      <Route path="/" element={<Feed />} />
                      <Route path="/explore" element={<ExplorePage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/reels" element={<ReelsPage />} />
                      <Route path="/add" element={<AddPostPage />} />
                    </Routes>
                  </main>
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

      </Routes>
    </ThemeProvider>
  );
}