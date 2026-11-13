import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaBookOpen, FaUserPlus } from 'react-icons/fa';
import api, { getErrorMessage } from '../../lib/api';
import './Register.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // পাসওয়ার্ড ম্যাচিং চেক
    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);

      // MongoDB ব্যাকএন্ড API-তে রেজিস্ট্রেশন রিকোয়েস্ট পাঠানো
      const { data } = await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password,
        department
      });

      setSuccess(data?.message || 'Registration successful! Redirecting to login...');

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed! Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card" style={{ maxWidth: '440px' }}>
        
        {/* Header */}
        <div className="login-header-container">
          <div className="login-logo-wrapper">
            <FaBookOpen className="login-logo-icon" />
          </div>
          <div className="login-title-wrapper">
            <h2 className="login-title">Student Registration</h2>
            <p className="login-subtitle">Create your library account</p>
          </div>
        </div>

        {error && (
          <div className="login-error-box" style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px' }}>
            {error}
          </div>
        )}
        {success && (
          <div className="login-error-box" style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleRegister} className="login-form">
          
          {/* Full Name */}
          <div className="login-input-group">
            <label className="login-label">Full Name</label>
            <div className="login-input-wrapper">
              <FaUser className="login-icon" />
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                placeholder="John Doe"
                className="login-input"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="login-input-group">
            <label className="login-label">Email Address</label>
            <div className="login-input-wrapper">
              <FaEnvelope className="login-icon" />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="student@library.com"
                className="login-input"
              />
            </div>
          </div>

          {/* Department / Course */}
          <div className="login-input-group">
            <label className="login-label">Department / Course</label>
            <div className="login-input-wrapper">
              <select 
                value={department} 
                onChange={(e) => setDepartment(e.target.value)} 
                className="login-select"
                style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Business Management">Business Management</option>
                <option value="Information Technology">Information Technology</option>
              </select>
            </div>
          </div>

          {/* Password */}
          <div className="login-input-group">
            <label className="login-label">Password</label>
            <div className="login-input-wrapper">
              <FaLock className="login-icon" />
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="••••••••"
                className="login-input"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="login-input-group">
            <label className="login-label">Confirm Password</label>
            <div className="login-input-wrapper">
              <FaLock className="login-icon" />
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
                placeholder="••••••••"
                className="login-input"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={loading} className="login-button" style={{ marginTop: '10px' }}>
            <FaUserPlus style={{ marginRight: '8px' }} /> {loading ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        {/* Back to Login Link */}
        <div className="login-register-container" style={{ textAlign: 'center', marginTop: '15px' }}>
          <p className="login-register-text">
            Already have an account? <Link to="/login" className="login-register-link">Login here</Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;