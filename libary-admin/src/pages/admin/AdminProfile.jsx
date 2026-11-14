import { useState, useEffect } from 'react';
import { FaUserShield, FaEnvelope, FaLock, FaKey, FaSave, FaShieldAlt } from 'react-icons/fa';
import api, { getErrorMessage } from '../../lib/api';
import '../admin/AdminPages.css';
import './AdminProfile.css';

const AdminProfile = () => {
  const savedEmail = localStorage.getItem('userEmail') || 'admin@library.com';

  const [profile, setProfile] = useState({
    name: localStorage.getItem('userName') || 'System Administrator',
    email: savedEmail,
    role: 'Super Admin'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/profile', { params: { email: savedEmail } })
      .then(({ data }) => {
        if (data) {
          setProfile({
            name: data.name || 'System Administrator',
            email: data.email || savedEmail,
            role: data.role || 'Super Admin'
          });
        }
      })
      .catch(() => {
      });
  }, [savedEmail]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value
    }));
  };


  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('Please fill in all password fields!');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New password and confirm password do not match!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long!');
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.put('/admin/change-password', {
        email: profile.email,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setSuccess(data?.message || 'Admin security password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update admin password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-profile-container">
      {/* Header Banner */}
      <div className="admin-profile-header">
        <div>
          <h2>Admin Profile & Security</h2>
          <p>Manage your master administrator credentials and account security settings.</p>
        </div>
      </div>

      {error && <div className="profile-error-box">{error}</div>}
      {success && <div className="profile-success-box">{success}</div>}

      <div className="profile-content-grid">
        
        {/* Left Card: Admin Info Summary */}
        <div className="profile-info-card">
          <div className="profile-avatar-wrapper">
            <FaUserShield className="profile-avatar-icon" />
          </div>
          <div className="profile-details">
            <h3>{profile.name}</h3>
            <span className="profile-role-badge">{profile.role}</span>
          </div>
          
          <div className="profile-meta-list">
            <div className="meta-item">
              <FaEnvelope className="meta-icon" />
              <div>
                <span className="meta-label">Email / Username</span>
                <span className="meta-value">{profile.email}</span>
              </div>
            </div>
            <div className="meta-item">
              <FaShieldAlt className="meta-icon" />
              <div>
                <span className="meta-label">Access Level</span>
                <span className="meta-value">Full System Privileges</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Change Password Form */}
        <div className="profile-security-card">
          <h3><FaKey style={{ marginRight: '8px' }} /> Change Security Password</h3>
          <p className="security-subtitle">Ensure your account is using a secure password to prevent unauthorized access.</p>

          <form onSubmit={handleUpdatePassword} className="security-form">
            
            <div className="form-group">
              <label>Current Password</label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input 
                  type="password" 
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  required
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>New Password</label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input 
                  type="password" 
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  required
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input 
                  type="password" 
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  required
                  className="form-input"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="update-password-btn">
              <FaSave style={{ marginRight: '8px' }} /> {loading ? 'Updating...' : 'Update Password'}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
};

export default AdminProfile;