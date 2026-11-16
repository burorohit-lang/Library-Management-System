import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaClipboardCheck,
  FaRupeeSign,
  FaBoxes,
  FaSignOutAlt,
  FaSyncAlt,
  FaBell,
  FaHome,
  FaKey,
  FaChevronDown
} from 'react-icons/fa';
import api, { getErrorMessage } from '../../lib/api';
import ChangePasswordModal from '../../components/ChangePasswordModal';
import './LibrarianDashboard.css';

const LibrarianDashboard = () => {
  const navigate = useNavigate();
  const librarianName = localStorage.getItem('userName') || 'Librarian Staff';
  const librarianEmail = localStorage.getItem('userEmail') || '';

  const [stats, setStats] = useState({
    totalAvailableBooks: 0,
    activeIssuesCount: 0,
    pendingRequestsCount: 0,
    overdueCount: 0,
    totalFines: 0
  });
  const [finePerDay, setFinePerDay] = useState(10);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Dropdown & Modal states
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchLibrarianData = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/librarian/dashboard');
      if (data.stats) setStats(data.stats);
      if (data.finePerDay !== undefined) setFinePerDay(data.finePerDay);
      if (data.recentTransactions) setRecentTransactions(data.recentTransactions);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not connect to server for live stats.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrarianData();
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    localStorage.clear();
    navigate('/login');
  };

  const handlePasswordSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const dropdownItemStyle = {
    width: '100%',
    padding: '10px 14px',
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
    <div className="librarian-portal-container">
      <header className="librarian-header">
        <div className="librarian-welcome">
          <h2>Library Management System</h2>
          <p>Welcome<strong>{librarianName}</strong></p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/librarian/issue-book')}
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '9px 16px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '7px'
            }}
          >
            <FaBell /> Requests ({stats.pendingRequestsCount || 0}) & Issue Desk
          </button>

          <button
            onClick={fetchLibrarianData}
            style={{
              backgroundColor: '#f1f5f9',
              color: '#334155',
              border: 'none',
              padding: '9px 14px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FaSyncAlt /> Refresh
          </button>

          {/* User Profile Dropdown */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '6px 12px 6px 8px',
                borderRadius: '10px',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {librarianName.charAt(0).toUpperCase()}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', lineHeight: 1.2 }}>
                  {librarianName}
                </div>
                {librarianEmail && (
                  <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.2 }}>
                    {librarianEmail}
                  </div>
                )}
              </div>
              <FaChevronDown
                size={11}
                style={{
                  color: '#64748b',
                  transition: 'transform 0.2s ease',
                  transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
              />
            </button>

            {dropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                  border: '1px solid #e2e8f0',
                  minWidth: '195px',
                  overflow: 'hidden',
                  zIndex: 1000
                }}
              >
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/librarian/dashboard');
                  }}
                  style={dropdownItemStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <FaHome style={{ color: '#2563eb' }} /> Home
                </button>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    setIsPasswordModalOpen(true);
                  }}
                  style={dropdownItemStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <FaKey style={{ color: '#2563eb' }} /> Change Password
                </button>

                <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '2px 0' }} />

                <button
                  onClick={handleLogout}
                  style={{ ...dropdownItemStyle, color: '#dc2626', fontWeight: '600' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {successMsg && (
        <div style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', fontWeight: '500' }}>
          {successMsg}
        </div>
      )}

      <div className="librarian-grid">
        <div className="lib-card" onClick={() => navigate('/librarian/issue-book')}>
          <div className="lib-card-icon indigo"><FaBell /></div>
          <div className="lib-card-info">
            <h3>Student Requests ({loading ? '...' : stats.pendingRequestsCount})</h3>
            <p>Review & approve student self-issue requests or issue a book directly.</p>
          </div>
        </div>

        <div className="lib-card" onClick={() => navigate('/librarian/active-checkouts')}>
          <div className="lib-card-icon blue"><FaClipboardCheck /></div>
          <div className="lib-card-info">
            <h3>Active Issues & Returns ({loading ? '...' : stats.activeIssuesCount})</h3>
            <p>Process active book returns ({stats.overdueCount} overdue currently).</p>
          </div>
        </div>

        <div className="lib-card" onClick={() => navigate('/librarian/inventory')}>
          <div className="lib-card-icon green"><FaBoxes /></div>
          <div className="lib-card-info">
            <h3>Book Inventory ({loading ? '...' : stats.totalAvailableBooks} Avail)</h3>
            <p>View all available books, quantities, and shelf locations.</p>
          </div>
        </div>

        <div className="lib-card" onClick={() => navigate('/librarian/fines')}>
          <div className="lib-card-icon orange"><FaRupeeSign /></div>
          <div className="lib-card-info">
            <h3>Overdue Fines (₹{finePerDay}/day)</h3>
            <p>Total fines recorded: <strong>₹{loading ? '...' : stats.totalFines}</strong>. View payment logs.</p>
          </div>
        </div>
      </div>

      {/* Recent Circulation Logs Table */}
      <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', color: '#0f172a' }}>
          Recent Book Circulation Logs
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', color: '#475569' }}>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Student Name</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Book Title</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Date</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Due Date</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Loading live records...</td>
                </tr>
              ) : recentTransactions.length > 0 ? (
                recentTransactions.map((item) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '600', color: '#0f172a' }}>{item.studentName}</td>
                    <td style={{ padding: '12px 16px', color: '#334155' }}>{item.bookTitle}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{item.issueDate}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{item.dueDate}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor:
                            item.status === 'Pending'
                              ? '#eff6ff'
                              : item.status === 'Returned'
                              ? '#f0fdf4'
                              : item.status === 'Overdue' || item.status === 'Rejected'
                              ? '#fee2e2'
                              : '#fff7ed',
                          color:
                            item.status === 'Pending'
                              ? '#2563eb'
                              : item.status === 'Returned'
                              ? '#16a34a'
                              : item.status === 'Overdue' || item.status === 'Rejected'
                              ? '#dc2626'
                              : '#ea580c'
                        }}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No recent transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reusable Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={handlePasswordSuccess}
      />
    </div>
  );
};

export default LibrarianDashboard;