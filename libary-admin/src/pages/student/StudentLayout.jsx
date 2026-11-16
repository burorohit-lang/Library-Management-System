import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  FaBookOpen,
  FaHome,
  FaKey,
  FaSignOutAlt,
  FaChevronDown,
  FaIdCard,
  FaGraduationCap,
  FaLayerGroup,
  FaEnvelope,
  FaCheckCircle
} from 'react-icons/fa';
import api from '../../lib/api';
import ChangePasswordModal from '../../components/ChangePasswordModal';
import './StudentDashboard.css';

const StudentLayout = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Student Profile Details State (LocalStorage + Live Backend Sync)
  const [studentProfile, setStudentProfile] = useState({
    name: localStorage.getItem('userName') || 'Student Member',
    email: localStorage.getItem('userEmail') || '',
    universityRoll: localStorage.getItem('universityRoll') || '',
    stream: localStorage.getItem('stream') || localStorage.getItem('department') || '',
    semester: localStorage.getItem('semester') || '',
    status: 'Active'
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [globalSuccess, setGlobalSuccess] = useState('');

  // ব্যাকএন্ড থেকে শিক্ষার্থীর সর্বশেষ প্রোফাইল তথ্য (Roll, Stream, Semester) লোড করা হচ্ছে
  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const { data } = await api.get('/library/student/dashboard');
        const profile = data?.student || data?.user || data?.profile;
        if (profile) {
          setStudentProfile((prev) => ({
            ...prev,
            name: profile.name || prev.name,
            email: profile.email || prev.email,
            universityRoll: profile.universityRoll || profile.rollNumber || prev.universityRoll,
            stream: profile.stream || profile.department || prev.stream,
            semester: profile.semester || prev.semester,
            status: profile.status || 'Active'
          }));
        }
      } catch {
        // ব্যাকএন্ড কল ব্যর্থ হলে localStorage-এর তথ্য দেখাবে
      }
    };

    fetchStudentProfile();
  }, []);

  // ড্রপডাউনের বাইরে ক্লিক করলে বন্ধ হবে
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    localStorage.clear();
    navigate('/login');
  };

  const handlePasswordSuccess = (msg) => {
    setGlobalSuccess(msg);
    setTimeout(() => setGlobalSuccess(''), 4000);
  };

  const dropdownBtnStyle = {
    width: '100%',
    padding: '10px 16px',
    border: 'none',
    background: 'transparent',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13.5px',
    fontWeight: '500',
    color: '#334155',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.15s'
  };

  return (
    <div className="sd-wrapper">
      {/* Top Navbar */}
      <header className="sd-navbar">
        <div
          className="sd-brand"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/student/dashboard')}
        >
          <div className="sd-brand-icon">
            <FaBookOpen />
          </div>
          <div>
            <h1>Digital Library</h1>
            <span>Student Self-Service Portal</span>
          </div>
        </div>

        {/* Right Profile & Details Dropdown */}
        <div className="sd-nav-right" ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="sd-user-profile"
            style={{
              cursor: 'pointer',
              color: 'inherit',
              fontFamily: 'inherit',
              outline: 'none'
            }}
          >
            <div className="sd-avatar">
              {studentProfile.name.charAt(0).toUpperCase()}
            </div>
            <div className="sd-user-info">
              <p className="sd-user-name">{studentProfile.name}</p>
              <p className="sd-user-email">
                {studentProfile.universityRoll
                  ? `Roll: ${studentProfile.universityRoll}`
                  : studentProfile.email}
              </p>
            </div>
            <FaChevronDown
              size={11}
              style={{
                color: '#dbeafe',
                marginLeft: '4px',
                transition: 'transform 0.2s ease',
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
            />
          </button>

          {/* Expanded Profile Details + Action Dropdown */}
          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 10px)',
                width: '305px',
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                boxShadow: '0 14px 32px rgba(15, 23, 42, 0.18)',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                zIndex: 1000,
                color: '#0f172a'
              }}
            >
              {/* Student Profile Header Banner inside Dropdown */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  padding: '16px',
                  borderBottom: '1px solid #bfdbfe',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontSize: '18px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {studentProfile.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: '15px',
                      fontWeight: '700',
                      color: '#0f172a',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {studentProfile.name}
                  </div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: '#dcfce7',
                      color: '#15803d',
                      fontSize: '11px',
                      fontWeight: '600',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      marginTop: '4px'
                    }}
                  >
                    <FaCheckCircle size={9} /> {studentProfile.status} Member
                  </div>
                </div>
              </div>

              {/* Student Full Academic & Contact Details */}
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '12.5px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <FaIdCard size={12} style={{ color: '#2563eb' }} /> University Roll:
                  </span>
                  <span style={{ fontWeight: '700', color: '#0f172a' }}>
                    {studentProfile.universityRoll || 'Not Assigned'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <FaGraduationCap size={13} style={{ color: '#2563eb' }} /> Stream:
                  </span>
                  <span style={{ fontWeight: '600', color: '#1e293b' }}>
                    {studentProfile.stream || 'Not Set'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <FaLayerGroup size={12} style={{ color: '#2563eb' }} /> Semester:
                  </span>
                  <span style={{ fontWeight: '600', color: '#1e293b' }}>
                    {studentProfile.semester || 'Not Set'}
                  </span>
                </div>

                {studentProfile.email && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#475569',
                      paddingTop: '6px',
                      borderTop: '1px dashed #cbd5e1',
                      fontSize: '12px',
                      wordBreak: 'break-all'
                    }}
                  >
                    <FaEnvelope size={11} style={{ color: '#64748b', flexShrink: 0 }} />
                    <span>{studentProfile.email}</span>
                  </div>
                )}
              </div>

              {/* Navigation & Account Actions */}
              <div style={{ padding: '6px 0' }}>
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/student/dashboard');
                  }}
                  style={dropdownBtnStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <FaHome style={{ color: '#2563eb' }} /> Home Dashboard
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    setIsPasswordModalOpen(true);
                  }}
                  style={dropdownBtnStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <FaKey style={{ color: '#2563eb' }} /> Change Password
                </button>

                <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '4px 0' }} />

                <button
                  type="button"
                  onClick={handleLogout}
                  style={{ ...dropdownBtnStyle, color: '#dc2626', fontWeight: '600' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="sd-container">
        {globalSuccess && (
          <div
            style={{
              backgroundColor: '#dcfce7',
              color: '#16a34a',
              padding: '12px 16px',
              borderRadius: '10px',
              fontSize: '13.5px',
              fontWeight: '500',
              border: '1px solid #bbf7d0'
            }}
          >
            {globalSuccess}
          </div>
        )}

        <Outlet />
      </main>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={handlePasswordSuccess}
      />
    </div>
  );
};

export default StudentLayout;