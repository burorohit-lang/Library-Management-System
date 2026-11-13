import React, { useState } from 'react';
import { FaUserPlus, FaUser, FaEnvelope, FaLock, FaUserShield, FaClock, FaEye, FaEyeSlash } from 'react-icons/fa';
import api, { getErrorMessage } from '../../lib/api';
import '../admin/AdminPages.css';
import './AddUser.css';

const AddUser = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    shift: 'Morning (09:00 AM - 05:00 PM)'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all required fields!');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        ...(formData.role === 'librarian' && { shift: formData.shift })
      };

      // MongoDB ব্যাকএন্ড API-তে POST রিকোয়েস্ট পাঠানো
      const { data } = await api.post('/users', payload);

      setSuccess(
        data?.message ||
          `${formData.role === 'librarian' ? 'Librarian staff' : 'Student'} account created successfully in MongoDB!`
      );

      // ফর্ম রিসেট
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'student',
        shift: 'Morning (09:00 AM - 05:00 PM)'
      });

      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create user account. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-user-container">
      {/* Header Banner */}
      <div className="add-user-header">
        <h2>Register New User (Admin Action)</h2>
        <p>Create secure accounts for new Students or Librarian Staff members directly from the admin panel.</p>
      </div>

      {error && <div className="add-user-error-box">{error}</div>}
      {success && <div className="add-user-success-box">{success}</div>}

      {/* Form Card */}
      <div className="add-user-card">
        <form onSubmit={handleUserSubmit} className="add-user-form">
          
          <div className="form-row">
            {/* User Role Selection */}
            <div className="form-group">
              <label>Select User Role <span className="required">*</span></label>
              <div className="input-wrapper">
                <FaUserShield className="input-icon" />
                <select 
                  name="role" 
                  value={formData.role} 
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="student">Student Account</option>
                  <option value="librarian">Librarian Staff Account</option>
                </select>
              </div>
            </div>

            {/* Full Name */}
            <div className="form-group">
              <label>Full Name <span className="required">*</span></label>
              <div className="input-wrapper">
                <FaUser className="input-icon" />
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="e.g. Michael Brown" 
                  required
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            {/* Email Address */}
            <div className="form-group">
              <label>Email Address (Username) <span className="required">*</span></label>
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="e.g. user@library.com" 
                  required
                  className="form-input"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label>Password <span className="required">*</span></label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  placeholder="••••••••" 
                  required
                  className="form-input-eye"
                />
                <span onClick={() => setShowPassword(!showPassword)} className="form-eye-icon">
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>
          </div>

          {/* Conditional Shift Field for Librarian */}
          {formData.role === 'librarian' && (
            <div className="form-row">
              <div className="form-group full-width">
                <label>Duty Shift Timing <span className="required">*</span></label>
                <div className="input-wrapper">
                  <FaClock className="input-icon" />
                  <select 
                    name="shift" 
                    value={formData.shift} 
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="Morning (09:00 AM - 05:00 PM)">Morning Shift (09:00 AM - 05:00 PM)</option>
                    <option value="Evening (01:00 PM - 09:00 PM)">Evening Shift (01:00 PM - 09:00 PM)</option>
                    <option value="Night (08:00 PM - 04:00 AM)">Night Shift (08:00 PM - 04:00 AM)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" disabled={loading} className="submit-user-btn">
            <FaUserPlus /> {loading ? 'Creating Account...' : 'Create User Account'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default AddUser;