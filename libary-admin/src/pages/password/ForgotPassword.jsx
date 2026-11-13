import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaEnvelope,
  FaLock,
  FaKey,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
  FaBookOpen,
} from 'react-icons/fa';
import api, { getErrorMessage } from '../../lib/api';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1 = verify email, 2 = set new password
  const [email, setEmail] = useState(() => localStorage.getItem('savedEmail') || '');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Step 1: Verify email and receive short-lived resetToken
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError('');
    setSuccess('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', {
        email: cleanEmail,
      });

      if (data?.verified) {
        setResetToken(data.resetToken || '');
        setSuccess(data.message || 'Account verified! Enter your new password below.');
        setStep(2);
      }
    } catch (err) {
      const status = err.response?.status;
      if (!status || status >= 500) {
        setError('Unable to reach the server. Please try again later.');
      } else {
        setError(getErrorMessage(err, 'No account found with that email address.'));
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit new password along with resetToken
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data } = await api.post('/auth/reset-password', {
        email: cleanEmail,
        newPassword,
        resetToken,
      });

      localStorage.setItem('savedEmail', cleanEmail);
      setSuccess(data?.message || 'Password reset successful! Redirecting to login...');

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        setError('Your reset session expired. Please verify your email again.');
        setStep(1);
        setResetToken('');
      } else if (!status || status >= 500) {
        setError('Unable to reach the server. Please try again later.');
      } else {
        setError(getErrorMessage(err, 'Failed to reset password.'));
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
            <h2 className="login-title">Reset Password</h2>
            <p className="login-subtitle">
              {step === 1 ? 'Verify your registered email' : 'Choose a new password'}
            </p>
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

        {step === 1 ? (
          <form onSubmit={handleVerifyEmail} className="login-form">
            <div className="login-input-group">
              <label htmlFor="forgot-email" className="login-label">
                Registered Email Address
              </label>
              <div className="login-input-wrapper">
                <FaEnvelope className="login-icon" />
                <input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="student@library.com"
                  className="login-input"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="login-button">
              <FaKey style={{ marginRight: '8px' }} />
              {loading ? 'Verifying...' : 'Verify Account'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="login-form">
            <div className="login-input-group">
              <label className="login-label">Verified Email</label>
              <div className="login-input-wrapper">
                <FaEnvelope className="login-icon" />
                <input
                  type="email"
                  value={email}
                  disabled
                  className="login-input"
                  style={{ opacity: 0.75, cursor: 'not-allowed' }}
                />
              </div>
            </div>

            <div className="login-input-group">
              <label htmlFor="reset-new-password" className="login-label">
                New Password (min. 6 characters)
              </label>
              <div className="login-input-wrapper">
                <FaLock className="login-icon" />
                <input
                  id="reset-new-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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

            <div className="login-input-group">
              <label htmlFor="reset-confirm-password" className="login-label">
                Confirm New Password
              </label>
              <div className="login-input-wrapper">
                <FaLock className="login-icon" />
                <input
                  id="reset-confirm-password"
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
              <FaCheckCircle style={{ marginRight: '8px' }} />
              {loading ? 'Updating password...' : 'Reset Password'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setResetToken('');
                setNewPassword('');
                setConfirmPassword('');
                setError('');
                setSuccess('');
              }}
              style={{
                marginTop: '10px',
                background: 'none',
                border: 'none',
                color: '#4f46e5',
                cursor: 'pointer',
                fontSize: '0.875rem',
                textDecoration: 'underline',
              }}
            >
              Use a different email
            </button>
          </form>
        )}

        <div className="login-register-container">
          <p className="login-register-text">
            Remembered your password?{' '}
            <Link to="/login" className="login-register-link">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;