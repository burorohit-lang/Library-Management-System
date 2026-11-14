import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBookOpen,
  FaCalendarAlt,
  FaCheckCircle,
  FaPlusCircle,
  FaArrowLeft,
  FaSearch,
  FaUserGraduate,
  FaBook,
  FaBell,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import api, { getErrorMessage } from '../../lib/api';

const LibrarianIssueBook = () => {
  const navigate = useNavigate();

  const [pendingRequests, setPendingRequests] = useState([]);
  const [issues, setIssues] = useState([]);
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Direct Issue Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultDueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [issueDate, setIssueDate] = useState(todayStr);
  const [dueDate, setDueDate] = useState(defaultDueDate);

  // Extend Modal State
  const [extendingIssue, setExtendingIssue] = useState(null);
  const [newDueDate, setNewDueDate] = useState('');

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [reqRes, issuesRes, studentsRes, booksRes] = await Promise.all([
        api.get('/issues/requests'),
        api.get('/issues/active'),
        api.get('/users/students'),
        api.get('/books')
      ]);

      setPendingRequests(Array.isArray(reqRes.data) ? reqRes.data : []);
      setIssues(Array.isArray(issuesRes.data) ? issuesRes.data : []);
      setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
      setBooks(Array.isArray(booksRes.data) ? booksRes.data : []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load library circulation data.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

 
  const handleApproveRequest = async (reqItem) => {
    setError('');
    setSuccess('');
    try {
      const { data } = await api.put(`/issues/${reqItem._id}/approve`);
      setSuccess(data?.message || `Approved "${reqItem.bookTitle}" for ${reqItem.studentName}!`);
      fetchAllData();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to approve book request.'));
    }
  };


  const handleRejectRequest = async (reqItem) => {
    if (!window.confirm(`Reject request from ${reqItem.studentName} for "${reqItem.bookTitle}"?`)) return;
    setError('');
    setSuccess('');
    try {
      await api.put(`/issues/${reqItem._id}/reject`);
      setSuccess(`Request from ${reqItem.studentName} has been rejected.`);
      fetchAllData();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to reject request.'));
    }
  };

  const handleSelectStudent = (e) => {
    const id = e.target.value;
    setSelectedStudentId(id);
    const found = students.find((s) => s._id === id);
    if (found) {
      setStudentName(found.name);
      setStudentEmail(found.email);
    } else {
      setStudentName('');
      setStudentEmail('');
    }
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setSubmitting(true);
      const { data } = await api.post('/issues', {
        studentName: studentName.trim(),
        studentEmail: studentEmail.trim(),
        bookTitle: bookTitle.trim(),
        issueDate,
        dueDate
      });

      setSuccess(`Book "${data.bookTitle}" issued to ${data.studentName} successfully!`);
      setSelectedStudentId('');
      setStudentName('');
      setStudentEmail('');
      setBookTitle('');
      fetchAllData();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not issue the book.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnBook = async (id, title) => {
    if (!window.confirm(`Confirm return for "${title}"?`)) return;
    try {
      await api.put(`/issues/${id}/return`);
      setSuccess(`"${title}" marked as returned and stock updated!`);
      fetchAllData();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to process book return.'));
    }
  };

  const handleExtendSubmit = async (e) => {
    e.preventDefault();
    if (!extendingIssue || !newDueDate) return;
    try {
      await api.put(`/issues/${extendingIssue._id}/extend`, { newDueDate });
      setSuccess(`Due date extended to ${newDueDate}!`);
      setExtendingIssue(null);
      fetchAllData();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to extend due date.'));
    }
  };

  const filteredIssues = issues.filter(
    (item) =>
      item.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.studentEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.bookTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', padding: '28px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1220px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Top Header */}
        <div style={{ backgroundColor: '#ffffff', padding: '20px 26px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '21px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaBookOpen style={{ color: '#2563eb' }} /> Issue Requests, Checkout & Returns Desk
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#64748b' }}>
              Approve student book requests, issue books directly, and manage active returns
            </p>
          </div>
          <button
            onClick={() => navigate('/librarian/dashboard')}
            style={{ backgroundColor: '#f1f5f9', color: '#334155', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FaArrowLeft /> Back to Dashboard
          </button>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', fontSize: '13.5px', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '12px 16px', borderRadius: '10px', fontSize: '13.5px', border: '1px solid #bbf7d0' }}>
            {success}
          </div>
        )}

        {/* Pending Student Book Issue Requests Section */}
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '14px', border: pendingRequests.length > 0 ? '2px solid #93c5fd' : '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(37, 99, 235, 0.06)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaBell style={{ color: '#2563eb' }} /> Student Book Issue Requests ({pendingRequests.length} Pending)
          </h3>

          {pendingRequests.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#eff6ff', color: '#1e40af' }}>
                    <th style={{ padding: '12px 14px', borderBottom: '1px solid #dbeafe' }}>Student Details</th>
                    <th style={{ padding: '12px 14px', borderBottom: '1px solid #dbeafe' }}>Requested Book</th>
                    <th style={{ padding: '12px 14px', borderBottom: '1px solid #dbeafe' }}>Request Date</th>
                    <th style={{ padding: '12px 14px', borderBottom: '1px solid #dbeafe' }}>Proposed Due Date</th>
                    <th style={{ padding: '12px 14px', borderBottom: '1px solid #dbeafe' }}>Approval Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map((reqItem) => (
                    <tr key={reqItem._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <strong style={{ display: 'block', color: '#0f172a' }}>{reqItem.studentName}</strong>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>{reqItem.studentEmail}</span>
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: '700', color: '#2563eb' }}>{reqItem.bookTitle}</td>
                      <td style={{ padding: '12px 14px', color: '#64748b' }}>{reqItem.issueDate}</td>
                      <td style={{ padding: '12px 14px', fontWeight: '600', color: '#0f172a' }}>{reqItem.dueDate}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleApproveRequest(reqItem)}
                            style={{ backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '7px 14px', borderRadius: '7px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                          >
                            <FaCheck /> Accept & Issue
                          </button>
                          <button
                            onClick={() => handleRejectRequest(reqItem)}
                            style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', padding: '7px 12px', borderRadius: '7px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                          >
                            <FaTimes /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b' }}>
              No pending book requests from students right now.
            </p>
          )}
        </div>

        {/* Direct Book Issue Form Card */}
        <div style={{ backgroundColor: '#ffffff', padding: '26px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 18px 0', fontSize: '17px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaPlusCircle style={{ color: '#2563eb' }} /> Direct Issue Book to Student
          </h3>

          <form onSubmit={handleIssueSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                <FaUserGraduate style={{ marginRight: '5px', color: '#2563eb' }} /> Select Registered Student
              </label>
              <select
                value={selectedStudentId}
                onChange={handleSelectStudent}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', backgroundColor: '#f8fafc' }}
              >
                <option value="">-- Choose Student --</option>
                {students.map((st) => (
                  <option key={st._id} value={st._id}>
                    {st.name} ({st.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Student Name *
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                required
                placeholder="Student full name"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Student Email *
              </label>
              <input
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                required
                placeholder="student@library.com"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                <FaBook style={{ marginRight: '5px', color: '#16a34a' }} /> Select Book *
              </label>
              <select
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', backgroundColor: '#f8fafc' }}
              >
                <option value="">-- Select Available Book --</option>
                {books.map((b) => (
                  <option key={b._id} value={b.title} disabled={b.availableCopies <= 0}>
                    {b.title} — ({b.availableCopies} available)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Issue Date *
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Due Date *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                min={issueDate}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '11px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <FaPlusCircle /> {submitting ? 'Issuing Book...' : 'Confirm & Issue Book'}
              </button>
            </div>
          </form>
        </div>

        {/* Active Issues & Returns Table */}
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
            <h3 style={{ margin: 0, fontSize: '17px', color: '#0f172a' }}>
              Active Issued Books ({filteredIssues.length})
            </h3>
            <div style={{ position: 'relative', width: '280px' }}>
              <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search student or book..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', color: '#475569' }}>
                  <th style={{ padding: '12px 14px', borderBottom: '1px solid #e2e8f0' }}>Student</th>
                  <th style={{ padding: '12px 14px', borderBottom: '1px solid #e2e8f0' }}>Book Title</th>
                  <th style={{ padding: '12px 14px', borderBottom: '1px solid #e2e8f0' }}>Issue Date</th>
                  <th style={{ padding: '12px 14px', borderBottom: '1px solid #e2e8f0' }}>Due Date</th>
                  <th style={{ padding: '12px 14px', borderBottom: '1px solid #e2e8f0' }}>Fine</th>
                  <th style={{ padding: '12px 14px', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                  <th style={{ padding: '12px 14px', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>Loading records...</td>
                  </tr>
                ) : filteredIssues.length > 0 ? (
                  filteredIssues.map((item) => (
                    <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <strong style={{ display: 'block', color: '#0f172a' }}>{item.studentName}</strong>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>{item.studentEmail}</span>
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: '600', color: '#334155' }}>{item.bookTitle}</td>
                      <td style={{ padding: '12px 14px', color: '#64748b' }}>{item.issueDate}</td>
                      <td style={{ padding: '12px 14px', fontWeight: '600', color: '#0f172a' }}>{item.dueDate}</td>
                      <td style={{ padding: '12px 14px', fontWeight: '700', color: item.fine > 0 ? '#dc2626' : '#16a34a' }}>
                        ₹{item.fine || 0}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: item.status === 'Overdue' ? '#fee2e2' : '#fff7ed',
                            color: item.status === 'Overdue' ? '#dc2626' : '#ea580c'
                          }}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => { setExtendingIssue(item); setNewDueDate(item.dueDate); }}
                            style={{ backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <FaCalendarAlt /> Extend
                          </button>
                          <button
                            onClick={() => handleReturnBook(item._id, item.bookTitle)}
                            style={{ backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <FaCheckCircle /> Return
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No active issued books found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Extend Modal */}
        {extendingIssue && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', width: '360px', maxWidth: '90%' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '17px' }}>Extend Due Date</h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                Book: <strong>{extendingIssue.bookTitle}</strong>
              </p>
              <form onSubmit={handleExtendSubmit}>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '16px', boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" onClick={() => setExtendingIssue(null)} style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>
                    Save Date
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default LibrarianIssueBook;