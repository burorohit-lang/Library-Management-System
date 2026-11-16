import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaBookOpen,
  FaUser,
  FaEnvelope,
  FaIdCard,
  FaGraduationCap,
  FaLayerGroup,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUserPlus
} from 'react-icons/fa';

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    universityRoll: '',
    stream: '',
    semester: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setFormData({
      name: '',
      email: '',
      universityRoll: '',
      stream: '',
      semester: '',
      password: '',
      confirmPassword: ''
    });
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.universityRoll.trim()) {
      setError('University Roll Number is required.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          universityRoll: formData.universityRoll.trim(),
          rollNumber: formData.universityRoll.trim(),
          stream: formData.stream.trim(),
          semester: formData.semester,
          password: formData.password,
          role: 'student'
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Failed to register library member account.');
      }

      setSuccessMsg(data.message || 'Registration successful! Redirecting to login page...');
      setTimeout(() => {
        navigate('/login');
      }, 1800);
    } catch (err) {
      setError(err.message || 'Network error while registering.');
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
    marginBottom: '6px'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 13px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff'
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 10px 25px rgba(15, 23, 42, 0.08)',
          border: '1px solid #e2e8f0'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}
          >
            <FaBookOpen size={22} />
          </div>
          <h2 style={{ margin: 0, fontSize: '21px', fontWeight: '700', color: '#0f172a' }}>
            Register your library member account
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: '13.5px', color: '#64748b' }}>
            Create your student account to browse books and manage borrowings
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '11px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        {successMsg && (
          <div style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '11px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', border: '1px solid #bbf7d0', fontWeight: '500' }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={labelStyle}>
              <FaUser size={12} style={{ color: '#2563eb' }} /> Full Name *
            </label>
            <input
              type="text"
              name="name"
              required
              autoComplete="off"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>
              <FaIdCard size={13} style={{ color: '#2563eb' }} /> University Roll Number *
            </label>
            <input
              type="text"
              name="universityRoll"
              required
              autoComplete="off"
              placeholder="e.g., 10200123045"
              value={formData.universityRoll}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>
              <FaEnvelope size={12} style={{ color: '#2563eb' }} /> Email Address *
            </label>
            <input
              type="email"
              name="email"
              required
              autoComplete="new-email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>
                <FaGraduationCap size={13} style={{ color: '#2563eb' }} /> Stream / Dept
              </label>
              <input
                type="text"
                name="stream"
                autoComplete="off"
                placeholder="e.g., BCA / B.Tech"
                value={formData.stream}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>
                <FaLayerGroup size={12} style={{ color: '#2563eb' }} /> Semester
              </label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">Select Semester</option>
                <option value="1st Semester">1st Semester</option>
                <option value="2nd Semester">2nd Semester</option>
                <option value="3rd Semester">3rd Semester</option>
                <option value="4th Semester">4th Semester</option>
                <option value="5th Semester">5th Semester</option>
                <option value="6th Semester">6th Semester</option>
                <option value="7th Semester">7th Semester</option>
                <option value="8th Semester">8th Semester</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>
              <FaLock size={12} style={{ color: '#2563eb' }} /> Password *
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                autoComplete="new-password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                style={{ ...inputStyle, paddingRight: '38px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  padding: '4px'
                }}
              >
                {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label style={labelStyle}>
              <FaLock size={12} style={{ color: '#2563eb' }} /> Confirm Password *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              required
              autoComplete="new-password"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '6px',
              width: '100%',
              padding: '11px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontSize: '14.5px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <FaUserPlus size={15} />
            {loading ? 'Creating Account...' : 'Create Member Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', marginBottom: 0, fontSize: '13.5px', color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;