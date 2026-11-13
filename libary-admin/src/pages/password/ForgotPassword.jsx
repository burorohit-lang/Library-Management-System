import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaPaperPlane, FaArrowLeft, FaBookOpen, FaLock, FaCheckCircle } from 'react-icons/fa';
import api, { getErrorMessage } from '../../lib/api';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isVerified, setIsVerified] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ধাপ ১: ইমেইল ব্যাকএন্ড থেকে ভেরিফাই করা
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      setLoading(true);
      const { data } = await api.post('/auth/forgot-password', {
        email: email.trim()
      });

      setIsVerified(true);
      setMessage(data?.message || 'Account verified! Enter your new password below.');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not verify email address.'));
    } finally {
      setLoading(false);
    }
  };

  // ধাপ ২: নতুন পাসওয়ার্ড MongoDB-তে সেভ করা
  const handleSaveNewPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match!');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long!');
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post('/auth/reset-password', {
        email: email.trim(),
        newPassword
      });

      setMessage(data?.message || 'Password reset successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to reset password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        
        {/* Header with Logo and Title */}
        <div className="forgot-header-container">
          <div className="forgot-logo-wrapper">
            <FaBookOpen className="forgot-logo-icon" />
          </div>
          <div className="forgot-title-wrapper">
            <h2 className="forgot-title">Reset Password</h2>
            <p className="forgot-subtitle">
              {isVerified ? 'Create a strong new password' : 'Enter your email to recover account'}
            </p>
          </div>
        </div>

        {error && <div className="forgot-error-box">{error}</div>}
        {message && <div className="forgot-success-box">{message}</div>}

        {!isVerified ? (
          /* ধাপ ১: ইমেইল ভেরিফিকেশন ফর্ম */
          <form onSubmit={handleVerifyEmail} className="forgot-form">
            <div className="forgot-input-group">
              <label className="forgot-label">Email Address</label>
              <div className="forgot-input-wrapper">
                <FaEnvelope className="forgot-icon" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="user@library.com"
                  className="forgot-input"
                />
              </div>
            </div>

            <button type="submit" className="forgot-button" disabled={loading}>
              <FaPaperPlane style={{ marginRight: '8px' }} />
              {loading ? 'Verifying...' : 'Verify Account'}
            </button>
          </form>
        ) : (
          /* ধাপ ২: নতুন পাসওয়ার্ড সেট করার ফর্ম */
          <form onSubmit={handleSaveNewPassword} className="forgot-form">
            <div className="forgot-input-group">
              <label className="forgot-label">New Password</label>
              <div className="forgot-input-wrapper">
                <FaLock className="forgot-icon" />
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required 
                  placeholder="Minimum 6 characters"
                  className="forgot-input"
                />
              </div>
            </div>

            <div className="forgot-input-group">
              <label className="forgot-label">Confirm New Password</label>
              <div className="forgot-input-wrapper">
                <FaLock className="forgot-icon" />
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                  placeholder="Re-enter new password"
                  className="forgot-input"
                />
              </div>
            </div>

            <button type="submit" className="forgot-button" disabled={loading}>
              <FaCheckCircle style={{ marginRight: '8px' }} />
              {loading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        )}

        {/* Back to Login Link */}
        <div className="forgot-login-container">
          <Link to="/login" className="forgot-login-link">
            <FaArrowLeft style={{ marginRight: '5px' }} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;