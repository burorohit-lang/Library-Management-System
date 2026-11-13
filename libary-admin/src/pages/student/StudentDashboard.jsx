import React, { useState, useEffect, useCallback } from 'react';
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
  FaTimesCircle
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

  // MongoDB ব্যাকএন্ড থেকে লাইভ ডেটা লোড করা
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

  // স্টুডেন্ট নিজে থেকে বই ইস্যু করার জন্য Librarian-এর কাছে Request পাঠাবে
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

  // শুধুমাত্র Active বা Overdue বইয়ের সংখ্যা ও জরিমানা হিসাব
  const activeIssuedList = borrowedBooks.filter((b) => b.status === 'Active' || b.status === 'Overdue');
  const totalFine = activeIssuedList.reduce((sum, book) => sum + (book.fine || 0), 0);
  const totalAvailableBooks = libraryInventory.filter((b) => (b.availableCopies ?? 0) > 0).length;

  // সার্চ ফিল্টার লজিক
  const filteredBooks = libraryInventory.filter((book) =>
    book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
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

          <div className="sd-user-profile">
            <div className="sd-avatar">{studentName.charAt(0)}</div>
            <div className="sd-user-info">
              <p className="sd-user-name">{studentName}</p>
              <p className="sd-user-email">{studentEmail}</p>
            </div>
          </div>

          <button onClick={handleLogout} className="sd-logout-btn">
            <FaSignOutAlt /> Logout
          </button>
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

        {/* Summary Stats Cards */}
        <div className="sd-stats-grid">
          <div className="sd-stat-card">
            <div className="sd-stat-icon icon-blue">
              <FaBook />
            </div>
            <div className="sd-stat-details">
              <p>Active Books Issued</p>
              <h3>{loading ? '...' : activeIssuedList.length}</h3>
            </div>
          </div>

          <div className="sd-stat-card">
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

          <div className="sd-stat-card">
            <div className="sd-stat-icon icon-purple">
              <FaLayerGroup />
            </div>
            <div className="sd-stat-details">
              <p>Available Books in Library</p>
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
    </div>
  );
};

export default StudentDashboard;