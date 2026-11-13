import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaUserShield, FaSignInAlt, FaEye, FaEyeSlash, FaBookOpen } from 'react-icons/fa';
import api, { getErrorMessage } from '../../lib/api';
import './Login.css';

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
    setShowPassword((prevState) => !prevState);
  };

  const completeLoginSuccess = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', user._id);
    localStorage.setItem('userName', user.name);
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('role', user.role);

    if (rememberMe) {
      localStorage.setItem('savedEmail', user.email);
    } else {
      localStorage.removeItem('savedEmail');
    }

    if (user.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (user.role === 'librarian') {
      navigate('/librarian/dashboard');
    } else {
      navigate('/student/dashboard');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      // ১. প্রথমে MongoDB ব্যাকএন্ড API দিয়ে লগইন করার চেষ্টা করবে
      const { data } = await api.post('/auth/login', {
        email: cleanEmail,
        password,
        role
      });

      completeLoginSuccess(data.token, data.user);
    } catch (err) {
      const status = err.response?.status;

      // যদি ব্যাকএন্ড সার্ভার বন্ধ থাকে (502 Bad Gateway বা Network Error)
      if (!status || status >= 500) {
        if (role === 'admin' && cleanEmail === 'admin@library.com' && password === 'adminpassword123') {
          completeLoginSuccess('offline_admin_token', {
            _id: 'master-admin',
            name: 'System Admin',
            email: cleanEmail,
            role: 'admin'
          });
          return;
        }

        if (role === 'librarian' && cleanEmail === 'librarian@library.com' && password === 'librarianpassword123') {
          completeLoginSuccess('offline_librarian_token', {
            _id: 'master-librarian',
            name: 'Head Librarian',
            email: cleanEmail,
            role: 'librarian'
          });
          return;
        }

        if (role === 'student' && cleanEmail === 'student@library.com') {
          completeLoginSuccess('offline_student_token', {
            _id: 'demo_student_id',
            name: 'Student Member',
            email: cleanEmail,
            role: 'student'
          });
          return;
        }

        setError('Backend server is not running! Start "node server.js" in backend folder.');
      } else {
        // ভুল পাসওয়ার্ড বা ইমেইল হলে সার্ভারের মেসেজ দেখাবে
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

        {error && <div className="login-error-box">{error}</div>}

        <form onSubmit={handleLogin} className="login-form">
          
          {/* Role Select Dropdown */}
          <div className="login-input-group">
            <label className="login-label">Select Role</label>
            <div className="login-input-wrapper">
              <FaUserShield className="login-icon" />
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
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
            <label className="login-label">Email Address</label>
            <div className="login-input-wrapper">
              <FaEnvelope className="login-icon" />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder={role === 'admin' ? 'admin@library.com' : role === 'librarian' ? 'librarian@library.com' : 'student@library.com'}
                className="login-input"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="login-input-group">
            <label className="login-label">Password</label>
            <div className="login-input-wrapper">
              <FaLock className="login-icon" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="••••••••"
                className="login-input-eye"
              />
              <span onClick={togglePasswordVisibility} className="login-eye-icon">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
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
            <Link to="/forgot-password" className="login-forgot-link">Forgot Password?</Link>
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
              New Student? <Link to="/register-student" className="login-register-link">Register here</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;