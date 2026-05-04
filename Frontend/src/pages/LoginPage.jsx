import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function LoginPage() {
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    fullName: ''
  });

  // 🔹 Handle Input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 🔹 Validation
  const validateForm = () => {
    if (!formData.email || !formData.password) {
      return 'Please fill all required fields';
    }
    if (!formData.email.includes('@')) {
      return 'Enter a valid email';
    }
    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    if (isRegistering && (!formData.username || !formData.fullName)) {
      return 'All fields are required';
    }
    return null;
  };

  // 🔹 COMMON API CALL
  const handleAuth = async (endpoint, body) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.errors) {
        throw new Error(data.errors.map(e => e.msg).join(', '));
      }
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  };

  // 🔹 SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      return setError(validationError);
    }

    setLoading(true);
    setError('');

    try {
      const endpoint = isRegistering ? '/auth/register' : '/auth/login';

      const body = isRegistering
        ? formData
        : { email: formData.email, password: formData.password };

      const data = await handleAuth(endpoint, body);

      // ✅ Store auth
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      // ✅ Force app refresh (IMPORTANT FIX)
      window.location.href = '/';

    } catch (err) {
      setError(err.message || 'Server error. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <h1>{isRegistering ? '✨ Create Account' : '📸 SnapVibe'}</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>

          {/* REGISTER FIELDS */}
          {isRegistering && (
            <>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
              />
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
              />
            </>
          )}

          {/* EMAIL */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />

          {/* PASSWORD */}
          <div className="password-box">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
            <span
              className="toggle-eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '🙈' : '👁️'}
            </span>
          </div>

          {/* BUTTON */}
          <button type="submit" disabled={loading}>
            {loading ? 'Please wait...' : isRegistering ? 'Sign Up' : 'Log In'}
          </button>

        </form>

        {/* SWITCH */}
        <p>
          {isRegistering
            ? 'Already have an account?'
            : "Don't have an account?"}

          <button
            type="button"
            className="toggle-btn"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
          >
            {isRegistering ? 'Log In' : 'Sign Up'}
          </button>
        </p>

      </div>
    </div>
  );
}