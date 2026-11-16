import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBook,
  FaSearch,
  FaSignOutAlt,
  FaClock,
  FaExclamationCircle,
  FaCheckCircle,
  FaRupeeSign,
  FaLayerGroup,
  FaBookOpen,
  FaSyncAlt,
  FaPaperPlane,
  FaHourglassHalf,
  FaTimesCircle,
  FaHome,
  FaKey,
  FaChevronDown,
  FaEye,
  FaEyeSlash,
  FaTimes,
  FaExclamationTriangle
} from 'react-icons/fa';
import api, { getErrorMessage } from '../../lib/api';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const studentEmail = localStorage.getItem('userEmail') || '';
  const studentName = localStorage.getItem('userName') || 'Student Member';
  const studentId = localStorage.getItem('userId') || '';

  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [libraryInventory, setLibraryInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [requestingBookId, setRequestingBookId] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Dropdown state and ref
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Change Password Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchStudentDashboard = useCallback(async () => {
    if (!studentEmail && !studentId) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/library/student-dashboard', {
        params: { email: studentEmail, studentId }
      });

      setBorrowedBooks(Array.isArray(data.issuedBooks) ? data.issuedBooks : []);
      setLibraryInventory(Array.isArray(data.availableBooks) ? data.availableBooks : []);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not connect to server to load your library account.'));
    } finally {
      setLoading(false);
    }
  }, [studentEmail, studentId, navigate]);

  useEffect(() => {
    fetchStudentDashboard();
  }, [fetchStudentDashboard]);

  const handleRequestBook = async (book) => {
    setError('');
    setSuccessMsg('');

    try {
      setRequestingBookId(book._id);
      const { data } = await api.post('/library/request-book', {
        studentName,
        studentEmail,
        bookTitle: book.title,
        requestedDays: 14
      });

      setSuccessMsg(data?.message || `Issue request sent to Librarian for "${book.title}"!`);
      fetchStudentDashboard();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to send book issue request.'));
    } finally {
      setRequestingBookId(null);
    }
  };

  // Open Change Password Modal
  const openPasswordModal = () => {
    setDropdownOpen(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordError('');
    setShowPasswordModal(true);
  };

  // Submit Change Password Form
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordError('New password must be different from your current password.');
      return;
    }

    try {
      setPasswordLoading(true);
      const { data } = await api.post('/auth/change-password', {
        email: studentEmail,
        studentId,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      setShowPasswordModal(false);
      setSuccessMsg(data?.message || 'Password changed successfully!');
    } catch (err) {
      setPasswordError(getErrorMessage(err, 'Failed to update password. Please check your current password.'));
    } finally {
      setPasswordLoading(false);
    }
  };

  // Summary Card Calculations (5 Cards)
  const activeIssuedList = borrowedBooks.filter((b) => b.status === 'Active' || b.status === 'Overdue');
  const pendingRequestsList = borrowedBooks.filter((b) => b.status === 'Pending');
  const overdueBooksList = borrowedBooks.filter((b) => b.status === 'Overdue');
  const totalFine = activeIssuedList.reduce((sum, book) => sum + (book.fine || 0), 0);
  const totalAvailableBooks = libraryInventory.filter((b) => (b.availableCopies ?? 0) > 0).length;

  const filteredBooks = libraryInventory.filter((book) =>
    book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    setDropdownOpen(false);
    localStorage.clear();
    navigate('/login');
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

  const inputWrapperStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 38px 10px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const eyeBtnStyle = {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
  };

  return (
    <div className="sd-wrapper">
      {/* Top Professional Navbar */}
      <nav className="sd-navbar">
        <div className="sd-brand">
          <div className="sd-brand-icon">
            <FaBookOpen />
          </div>
          <div>
            <h1>Digital Library</h1>
            <span>Student Self-Service Portal</span>
          </div>
        </div>

        <div className="sd-nav-right">
          <button
            onClick={fetchStudentDashboard}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              border: 'none',
              padding: '8px 13px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Refresh Status"
          >
            <FaSyncAlt /> Refresh
          </button>

          {/* User Profile Dropdown */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <div
              className="sd-user-profile"
              onClick={() => setDropdownOpen((prev) => !prev)}
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              <div className="sd-avatar">{studentName.charAt(0).toUpperCase()}</div>
              <div className="sd-user-info">
                <p className="sd-user-name">{studentName}</p>
                <p className="sd-user-email">{studentEmail}</p>
              </div>
              <FaChevronDown
                size={12}
                style={{
                  marginLeft: '4px',
                  transition: 'transform 0.2s ease',
                  transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
              />
            </div>

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
                    navigate('/');
                  }}
                  style={dropdownItemStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <FaHome style={{ color: '#2563eb' }} /> Home
                </button>

                <button
                  onClick={openPasswordModal}
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
      </nav>

      {/* Main Content Container */}
      <div className="sd-container">
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', fontSize: '13.5px', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}
        {successMsg && (
          <div style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '12px 16px', borderRadius: '10px', fontSize: '13.5px', border: '1px solid #bbf7d0', fontWeight: '500' }}>
            {successMsg}
          </div>
        )}

        {/* Summary Stats Cards (5 Cards fitted responsively) */}
        <div
          className="sd-stats-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '16px'
          }}
        >
          {/* Card 1: Active Books Issued */}
          <div className="sd-stat-card" style={{ padding: '18px 16px' }}>
            <div className="sd-stat-icon icon-blue">
              <FaBook />
            </div>
            <div className="sd-stat-details">
              <p>Active Books Issued</p>
              <h3>{loading ? '...' : activeIssuedList.length}</h3>
            </div>
          </div>

          {/* Card 2: Pending Requests (New Card 1) */}
          <div className="sd-stat-card" style={{ padding: '18px 16px' }}>
            <div
              className="sd-stat-icon"
              style={{ backgroundColor: '#fef3c7', color: '#d97706' }}
            >
              <FaHourglassHalf />
            </div>
            <div className="sd-stat-details">
              <p>Pending Requests</p>
              <h3 style={{ color: pendingRequestsList.length > 0 ? '#d97706' : '#0f172a' }}>
                {loading ? '...' : pendingRequestsList.length}
              </h3>
            </div>
          </div>

          {/* Card 3: Overdue Books (New Card 2) */}
          <div className="sd-stat-card" style={{ padding: '18px 16px' }}>
            <div
              className={`sd-stat-icon ${overdueBooksList.length > 0 ? 'icon-red' : ''}`}
              style={overdueBooksList.length === 0 ? { backgroundColor: '#f1f5f9', color: '#64748b' } : {}}
            >
              <FaExclamationTriangle />
            </div>
            <div className="sd-stat-details">
              <p>Overdue Books</p>
              <h3 style={{ color: overdueBooksList.length > 0 ? '#dc2626' : '#0f172a' }}>
                {loading ? '...' : overdueBooksList.length}
              </h3>
            </div>
          </div>

          {/* Card 4: Pending Fine */}
          <div className="sd-stat-card" style={{ padding: '18px 16px' }}>
            <div className={`sd-stat-icon ${totalFine > 0 ? 'icon-red' : 'icon-green'}`}>
              <FaRupeeSign />
            </div>
            <div className="sd-stat-details">
              <p>Pending Fine</p>
              <h3 style={{ color: totalFine > 0 ? '#dc2626' : '#16a34a' }}>
                ₹ {loading ? '...' : totalFine}
              </h3>
            </div>
          </div>

          {/* Card 5: Available Books in Library */}
          <div className="sd-stat-card" style={{ padding: '18px 16px' }}>
            <div className="sd-stat-icon icon-purple">
              <FaLayerGroup />
            </div>
            <div className="sd-stat-details">
              <p>Available Catalog</p>
              <h3>{loading ? '...' : totalAvailableBooks}</h3>
            </div>
          </div>
        </div>

        {/* Section 1: My Borrowed Books & Pending Requests */}
        <section className="sd-card">
          <div className="sd-card-header">
            <div>
              <h2 className="sd-card-title">
                <FaBook style={{ color: '#2563eb' }} /> My Issued Books & Requests
              </h2>
              <p className="sd-card-subtitle">Track your librarian approval status, borrowed books, due dates, and late fines</p>
            </div>
          </div>

          <div className="sd-table-wrapper">
            <table className="sd-table">
              <thead>
                <tr>
                  <th>Book Details</th>
                  <th>Request / Issue Date</th>
                  <th>Due Date</th>
                  <th>Fine Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="sd-empty-msg">Loading your records...</td>
                  </tr>
                ) : borrowedBooks.length > 0 ? (
                  borrowedBooks.map((item, index) => (
                    <tr key={item._id || index}>
                      <td>
                        <span className="sd-book-title">{item.title}</span>
                        <span className="sd-book-author">by {item.author || 'Library Edition'}</span>
                      </td>
                      <td>{item.issueDate}</td>
                      <td style={{ fontWeight: '600' }}>{item.dueDate}</td>
                      <td>
                        <span className={item.fine > 0 ? 'sd-fine-due' : 'sd-fine-clear'}>
                          ₹ {item.fine || 0}
                        </span>
                      </td>
                      <td>
                        {item.status === 'Pending' && (
                          <span className="sd-badge" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                            <FaHourglassHalf size={11} /> Pending Librarian Approval
                          </span>
                        )}
                        {item.status === 'Rejected' && (
                          <span className="sd-badge badge-overdue">
                            <FaTimesCircle size={11} /> Rejected by Librarian
                          </span>
                        )}
                        {item.status === 'Active' && (
                          <span className="sd-badge badge-active">
                            <FaClock size={11} /> Active (Issued)
                          </span>
                        )}
                        {item.status === 'Overdue' && (
                          <span className="sd-badge badge-overdue">
                            <FaExclamationCircle size={11} /> Overdue
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="sd-empty-msg">
                      You have no issued books or pending requests. Request any book from the catalog below!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2: Search Library Catalog & Self-Request Issue */}
        <section className="sd-card">
          <div className="sd-card-header">
            <div>
              <h2 className="sd-card-title">
                <FaSearch style={{ color: '#2563eb' }} /> Library Catalog — Request a Book
              </h2>
              <p className="sd-card-subtitle">Find any book and click "Request Issue" to send an approval request to the Librarian</p>
            </div>

            <div className="sd-search-box">
              <FaSearch className="sd-search-icon" />
              <input
                type="text"
                className="sd-search-input"
                placeholder="Search book title, author, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="sd-table-wrapper">
            <table className="sd-table">
              <thead>
                <tr>
                  <th>Book Title & Author</th>
                  <th>Category</th>
                  <th>Shelf Location</th>
                  <th>Copies</th>
                  <th>Availability</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="sd-empty-msg">Loading library catalog...</td>
                  </tr>
                ) : filteredBooks.length > 0 ? (
                  filteredBooks.map((book, index) => {
                    const availableCount = book.availableCopies ?? 0;
                    const totalCount = book.totalCopies ?? 0;
                    const existingRecord = borrowedBooks.find(
                      (b) => b.title?.toLowerCase() === book.title?.toLowerCase() && ['Pending', 'Active', 'Overdue'].includes(b.status)
                    );

                    return (
                      <tr key={book._id || index}>
                        <td>
                          <span className="sd-book-title">{book.title}</span>
                          <span className="sd-book-author">{book.author || 'Library Edition'}</span>
                        </td>
                        <td>
                          <span className="sd-category-tag">{book.category}</span>
                        </td>
                        <td>
                          <span className="sd-shelf-badge">{book.location || 'Main Rack'}</span>
                        </td>
                        <td style={{ fontWeight: '600' }}>
                          {availableCount} / {totalCount}
                        </td>
                        <td>
                          <span className={`sd-badge ${availableCount > 0 ? 'badge-available' : 'badge-out'}`}>
                            {availableCount > 0 ? <FaCheckCircle size={11} /> : <FaExclamationCircle size={11} />}
                            {availableCount > 0 ? 'Available' : 'Out of Stock'}
                          </span>
                        </td>
                        <td>
                          {existingRecord ? (
                            <span style={{ fontSize: '12px', fontWeight: '600', color: '#2563eb' }}>
                              {existingRecord.status === 'Pending' ? 'Requested (Pending)' : 'Already Issued'}
                            </span>
                          ) : availableCount > 0 ? (
                            <button
                              onClick={() => handleRequestBook(book)}
                              disabled={requestingBookId === book._id}
                              style={{
                                backgroundColor: '#2563eb',
                                color: '#ffffff',
                                border: 'none',
                                padding: '7px 13px',
                                borderRadius: '7px',
                                fontSize: '12.5px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <FaPaperPlane size={11} />
                              {requestingBookId === book._id ? 'Sending...' : 'Request Issue'}
                            </button>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Unavailable</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="sd-empty-msg">
                      No books found matching "{searchQuery}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '16px'
          }}
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '420px',
              padding: '24px',
              boxShadow: '0 20px 35px rgba(0, 0, 0, 0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '9px', borderRadius: '9px', display: 'flex' }}>
                  <FaKey size={16} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', color: '#0f172a' }}>Change Password</h3>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>Update your student portal password</p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                <FaTimes size={16} />
              </button>
            </div>

            {passwordError && (
              <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px', border: '1px solid #fecaca' }}>
                {passwordError}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '5px' }}>
                  Current Password
                </label>
                <div style={inputWrapperStyle}>
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    required
                    placeholder="Enter current password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    style={eyeBtnStyle}
                  >
                    {showPasswords.current ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '5px' }}>
                  New Password
                </label>
                <div style={inputWrapperStyle}>
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    required
                    placeholder="Minimum 6 characters"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    style={eyeBtnStyle}
                  >
                    {showPasswords.new ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '5px' }}>
                  Confirm New Password
                </label>
                <div style={inputWrapperStyle}>
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    required
                    placeholder="Re-enter new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    style={eyeBtnStyle}
                  >
                    {showPasswords.confirm ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    cursor: passwordLoading ? 'not-allowed' : 'pointer',
                    opacity: passwordLoading ? 0.7 : 1
                  }}
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;