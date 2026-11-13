import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaUserShield, FaSignInAlt, FaEye, FaEyeSlash, FaBookOpen } from 'react-icons/fa';
import api, { getErrorMessage } from '../../lib/api';
import './Login.css';

const ROLE_ROUTES = {
  admin: '/admin/dashboard',
  librarian: '/librarian/dashboard',
  student: '/student/dashboard',
};

const Login = () => {
  const [email, setEmail] = useState(() => localStorage.getItem('savedEmail') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('student');
  const [rememberMe, setRememberMe] = useState(() => Boolean(localStorage.getItem('savedEmail')));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const completeLoginSuccess = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userId', user._id);
    localStorage.setItem('userName', user.name);
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('role', user.role);

    if (rememberMe) {
      localStorage.setItem('savedEmail', user.email);
    } else {
      localStorage.removeItem('savedEmail');
    }

    navigate(ROLE_ROUTES[user.role] || '/student/dashboard', { replace: true });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      const { data } = await api.post('/auth/login', {
        email: cleanEmail,
        password,
        role,
      });

      if (!data?.token || !data?.user) {
        throw new Error('Unexpected response from authentication server.');
      }

      completeLoginSuccess(data.token, data.user);
    } catch (err) {
      const status = err.response?.status;

      if (!status || status >= 500) {
        setError('Unable to reach the server. Make sure the backend API is running and connected.');
      } else if (status === 404) {
        setError('Login API endpoint not found (404). Check your VITE_API_URL or Vercel /api rewrite configuration.');
      } else {
        setError(getErrorMessage(err, 'Invalid email, password, or role!'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header with Side-by-Side Logo and Title */}
        <div className="login-header-container">
          <div className="login-logo-wrapper">
            <FaBookOpen className="login-logo-icon" />
          </div>
          <div className="login-title-wrapper">
            <h2 className="login-title">Library Portal</h2>
            <p className="login-subtitle">Sign in to your account</p>
          </div>
        </div>

        {error && (
          <div className="login-error-box" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          {/* Role Select Dropdown */}
          <div className="login-input-group">
            <label htmlFor="login-role" className="login-label">
              Select Role
            </label>
            <div className="login-input-wrapper">
              <FaUserShield className="login-icon" />
              <select
                id="login-role"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setError('');
                }}
                className="login-select"
              >
                <option value="student">Student</option>
                <option value="librarian">Librarian</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Email Field */}
          <div className="login-input-group">
            <label htmlFor="login-email" className="login-label">
              Email Address
            </label>
            <div className="login-input-wrapper">
              <FaEnvelope className="login-icon" />
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={
                  role === 'admin'
                    ? 'admin@library.com'
                    : role === 'librarian'
                    ? 'librarian@library.com'
                    : 'student@library.com'
                }
                className="login-input"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="login-input-group">
            <label htmlFor="login-password" className="login-label">
              Password
            </label>
            <div className="login-input-wrapper">
              <FaLock className="login-icon" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="login-input-eye"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="login-eye-icon"
                style={{ background: 'none', border: 'none', padding: 0 }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="login-options-row">
            <label className="login-remember-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="login-forgot-link">
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={loading} className="login-button">
            <FaSignInAlt style={{ marginRight: '8px' }} />
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        {/* Student Register Link */}
        {role === 'student' && (
          <div className="login-register-container">
            <p className="login-register-text">
              New Student?{' '}
              <Link to="/register-student" className="login-register-link">
                Register here
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;