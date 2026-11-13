import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaUserPlus,
  FaEye,
  FaEyeSlash,
  FaBookOpen,
} from 'react-icons/fa';
import api, { getErrorMessage } from '../../lib/api';
import './Register.css';

const ROLES = [
  'Student',
  'Admin',
  'Staff',
];

const RegisterStudent = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Student');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError('');
    setSuccess('');

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        name: cleanName,
        email: cleanEmail,
        password,
        role,
      });

      localStorage.setItem('savedEmail', cleanEmail);
      setSuccess(data?.message || 'Registration successful! Redirecting to login...');

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    } catch (err) {
      const status = err.response?.status;
      if (!status || status >= 500) {
        setError('Unable to reach the server. Please try again later.');
      } else {
        setError(getErrorMessage(err, 'Registration failed. Please check your details.'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header-container">
          <div className="login-logo-wrapper">
            <FaBookOpen className="login-logo-icon" />
          </div>
          <div className="login-title-wrapper">
            <h2 className="login-title">Create Account</h2>
            <p className="login-subtitle">Register your library member account</p>
          </div>
        </div>

        {error && (
          <div className="login-error-box" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            style={{
              backgroundColor: '#ecfdf5',
              color: '#065f46',
              border: '1px solid #a7f3d0',
              padding: '10px 14px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '0.9rem',
            }}
          >
            {success}
          </div>
        )}

        <form onSubmit={handleRegister} className="login-form">
          {/* Full Name */}
          <div className="login-input-group">
            <label htmlFor="reg-name" className="login-label">
              Full Name
            </label>
            <div className="login-input-wrapper">
              <FaUser className="login-icon" />
              <input
                id="reg-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Jane Doe"
                className="login-input"
              />
            </div>
          </div>

          {/* Email */}
          <div className="login-input-group">
            <label htmlFor="reg-email" className="login-label">
              Email Address
            </label>
            <div className="login-input-wrapper">
              <FaEnvelope className="login-icon" />
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="user@library.com"
                className="login-input"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="login-input-group">
            <label htmlFor="reg-role" className="login-label">
              Select Role
            </label>
            <div className="login-input-wrapper">
              <FaUser className="login-icon" />
              <select
                id="reg-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="login-select"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Password */}
          <div className="login-input-group">
            <label htmlFor="reg-password" className="login-label">
              Password (min. 6 characters)
            </label>
            <div className="login-input-wrapper">
              <FaLock className="login-icon" />
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="login-input-eye"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="login-eye-icon"
                style={{ background: 'none', border: 'none', padding: 0 }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="login-input-group">
            <label htmlFor="reg-confirm-password" className="login-label">
              Confirm Password
            </label>
            <div className="login-input-wrapper">
              <FaLock className="login-icon" />
              <input
                id="reg-confirm-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="login-input"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="login-button">
            <FaUserPlus style={{ marginRight: '8px' }} />
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <div className="login-register-container">
          <p className="login-register-text">
            Already have an account?{' '}
            <Link to="/login" className="login-register-link">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterStudent;