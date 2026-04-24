import { useState } from "react";
import "./LoginPage.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    fullName: ""
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Login failed");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("token", data.data.token);
      window.location.reload();
    } catch (err) {
      setError("Network error. Please try again.");
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Registration failed");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("token", data.data.token);
      window.location.reload();
    } catch (err) {
      setError("Network error. Please try again.");
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (isLogin) {
      handleLogin(e);
    } else {
      handleRegister(e);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>{isLogin ? "Login" : "Register"}</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </>
          )}
          
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Processing..." : (isLogin ? "Login" : "Register")}
          </button>
        </form>
        
        <p>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            type="button"
            className="toggle-btn"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setFormData({ email: "", password: "", username: "", fullName: "" });
            }}
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
