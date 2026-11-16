import { useState, useEffect, useRef } from 'react';
import {
  FaBookMedical,
  FaUserGraduate,
  FaBook,
  FaCalendarAlt,
  FaCheckCircle,
  FaUndoAlt,
  FaSyncAlt,
  FaSearch,
  FaTimes,
  FaChevronDown,
  FaHourglassHalf,
  FaTimesCircle
} from 'react-icons/fa';

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

const LibrarianIssueBook = () => {
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [activeIssues, setActiveIssues] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  // Searchable Student States
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const studentDropdownRef = useRef(null);

  const [selectedBookId, setSelectedBookId] = useState('');
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // বাইরে ক্লিক করলে ড্রপডাউন বন্ধ হওয়ার জন্য
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (studentDropdownRef.current && !studentDropdownRef.current.contains(event.target)) {
        setShowStudentDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await fetch(`${API_BASE}/librarian/dashboard`, {
        headers: authHeaders()
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || 'Failed to load librarian data.');
      }

      setStudents(Array.isArray(data.students) ? data.students : []);
      setBooks(Array.isArray(data.books) ? data.books : []);
      setActiveIssues(Array.isArray(data.activeIssues) ? data.activeIssues : []);
      setPendingRequests(Array.isArray(data.pendingRequests) ? data.pendingRequests : []);
    } catch (err) {
      setError(err.message || 'Could not fetch records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // শিক্ষার্থী সার্চ ফিল্টার
  const filteredStudents = students.filter((st) => {
    const q = studentSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      st.name?.toLowerCase().includes(q) ||
      st.universityRoll?.toLowerCase().includes(q) ||
      st.email?.toLowerCase().includes(q) ||
      st.stream?.toLowerCase().includes(q)
    );
  });

  const handleSelectStudent = (student) => {
    setSelectedStudentId(student._id);
    setStudentSearch(
      `${student.name}${student.universityRoll ? ` (${student.universityRoll})` : ''} — ${student.email}`
    );
    setShowStudentDropdown(false);
  };

  const handleClearStudent = () => {
    setSelectedStudentId('');
    setStudentSearch('');
    setShowStudentDropdown(true);
  };

  // স্টুডেন্টের রিকোয়েস্ট Approve বা Reject করা
  const handleRequestAction = async (requestId, actionType) => {
    try {
      setError('');
      setSuccessMsg('');
      const res = await fetch(`${API_BASE}/librarian/handle-request/${requestId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ action: actionType })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || `Failed to ${actionType} request.`);
      }

      setSuccessMsg(data.message || `Request ${actionType}ed successfully!`);
      await loadData();
    } catch (err) {
      setError(err.message || 'Action failed.');
    }
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!selectedStudentId) {
      setError('Please search and select a valid student from the dropdown list.');
      return;
    }

    if (!selectedBookId) {
      setError('Please select an available book.');
      return;
    }

    const studentObj = students.find((s) => s._id === selectedStudentId);
    const bookObj = books.find((b) => b._id === selectedBookId);

    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}/librarian/issue-book`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          studentId: selectedStudentId,
          studentName: studentObj?.name,
          studentEmail: studentObj?.email,
          universityRoll: studentObj?.universityRoll,
          bookId: selectedBookId,
          bookTitle: bookObj?.title,
          issueDate,
          dueDate
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to issue book.');
      }

      setSuccessMsg(data.message || 'Book issued successfully!');
      setSelectedBookId('');
      await loadData();
    } catch (err) {
      setError(err.message || 'Error issuing book.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnBook = async (issueId) => {
    try {
      setError('');
      setSuccessMsg('');
      const res = await fetch(`${API_BASE}/librarian/return-book/${issueId}`, {
        method: 'PUT',
        headers: authHeaders()
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to return book.');
      }

      setSuccessMsg(data.message || 'Book returned successfully!');
      await loadData();
    } catch (err) {
      setError(err.message || 'Error returning book.');
    }
  };

  const filteredIssues = activeIssues.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      item.studentName?.toLowerCase().includes(q) ||
      item.studentEmail?.toLowerCase().includes(q) ||
      item.universityRoll?.toLowerCase().includes(q) ||
      item.bookTitle?.toLowerCase().includes(q)
    );
  });

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '13.5px',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box',
    outline: 'none'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Pending Student Requests Section */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(15,23,42,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaHourglassHalf style={{ color: '#d97706' }} /> Student Book Requests ({pendingRequests.length})
          </h3>
          <span style={{ fontSize: '12.5px', color: '#64748b' }}>
            Approve requests to automatically issue books to students
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '11px 13px' }}>Student Details</th>
                <th style={{ padding: '11px 13px' }}>Requested Book</th>
                <th style={{ padding: '11px 13px' }}>Request Date</th>
                <th style={{ padding: '11px 13px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                    Loading student requests...
                  </td>
                </tr>
              ) : pendingRequests.length > 0 ? (
                pendingRequests.map((req) => (
                  <tr key={req._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 13px' }}>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{req.studentName}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {req.universityRoll ? `Roll: ${req.universityRoll} • ` : ''}
                        {req.studentEmail}
                      </div>
                    </td>
                    <td style={{ padding: '12px 13px', fontWeight: '600', color: '#1e293b' }}>{req.bookTitle}</td>
                    <td style={{ padding: '12px 13px', color: '#334155' }}>{req.issueDate || '—'}</td>
                    <td style={{ padding: '12px 13px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => handleRequestAction(req._id, 'approve')}
                          style={{
                            backgroundColor: '#dcfce7',
                            color: '#16a34a',
                            border: '1px solid #bbf7d0',
                            padding: '6px 12px',
                            borderRadius: '7px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <FaCheckCircle size={11} /> Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRequestAction(req._id, 'reject')}
                          style={{
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            border: '1px solid #fecaca',
                            padding: '6px 12px',
                            borderRadius: '7px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <FaTimesCircle size={11} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                    No pending book requests from students.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Direct Issue Book Form Card */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(15,23,42,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '19px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaBookMedical style={{ color: '#2563eb' }} /> Issue a Book Directly
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
              Search a student and assign an available book manually
            </p>
          </div>
          <button
            type="button"
            onClick={loadData}
            style={{ backgroundColor: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0', padding: '8px 13px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <FaSyncAlt size={11} /> Refresh
          </button>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '11px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {successMsg && (
          <div style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '11px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px', fontWeight: '500' }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleIssueSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', alignItems: 'end' }}>
          {/* Searchable Select Student Box */}
          <div ref={studentDropdownRef} style={{ position: 'relative' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              <FaUserGraduate size={12} style={{ color: '#2563eb' }} /> Select Student *
            </label>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <FaSearch style={{ position: 'absolute', left: '11px', color: '#94a3b8', fontSize: '12px', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search name, roll, or email..."
                value={studentSearch}
                onFocus={() => setShowStudentDropdown(true)}
                onChange={(e) => {
                  setStudentSearch(e.target.value);
                  setSelectedStudentId('');
                  setShowStudentDropdown(true);
                }}
                style={{
                  ...inputStyle,
                  paddingLeft: '32px',
                  paddingRight: '32px',
                  borderColor: selectedStudentId ? '#16a34a' : '#cbd5e1'
                }}
              />
              {studentSearch ? (
                <button
                  type="button"
                  onClick={handleClearStudent}
                  title="Clear selection"
                  style={{ position: 'absolute', right: '8px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px', display: 'flex' }}
                >
                  <FaTimes size={12} />
                </button>
              ) : (
                <FaChevronDown size={11} style={{ position: 'absolute', right: '11px', color: '#94a3b8', pointerEvents: 'none' }} />
              )}
            </div>

            {/* Dropdown Search Results */}
            {showStudentDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '4px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  boxShadow: '0 10px 25px rgba(15, 23, 42, 0.12)',
                  maxHeight: '230px',
                  overflowY: 'auto',
                  zIndex: 50
                }}
              >
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((st) => {
                    const isSelected = st._id === selectedStudentId;
                    return (
                      <div
                        key={st._id}
                        onClick={() => handleSelectStudent(st)}
                        style={{
                          padding: '10px 12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f1f5f9',
                          backgroundColor: isSelected ? '#eff6ff' : '#ffffff'
                        }}
                      >
                        <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{st.name}</span>
                          {st.universityRoll && (
                            <span style={{ fontSize: '11.5px', backgroundColor: '#eff6ff', color: '#2563eb', padding: '2px 7px', borderRadius: '5px', fontWeight: '600' }}>
                              Roll: {st.universityRoll}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                          {st.email} {st.stream ? `• ${st.stream}` : ''}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: '14px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
                    No student found matching "{studentSearch}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Select Available Book */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              <FaBook size={12} style={{ color: '#16a34a' }} /> Select Available Book *
            </label>
            <select
              required
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              style={inputStyle}
            >
              <option value="">-- Choose Book --</option>
              {books
                .filter((b) => (b.availableCopies ?? 0) > 0)
                .map((bk) => (
                  <option key={bk._id} value={bk._id}>
                    {bk.title} ({bk.availableCopies} available)
                  </option>
                ))}
            </select>
          </div>

          {/* Issue Date */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              <FaCalendarAlt size={12} style={{ color: '#2563eb' }} /> Issue Date
            </label>
            <input
              type="date"
              required
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Return Due Date */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              <FaCalendarAlt size={12} style={{ color: '#dc2626' }} /> Return Due Date
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px'
              }}
            >
              <FaCheckCircle size={14} />
              {submitting ? 'Issuing...' : 'Issue Book'}
            </button>
          </div>
        </form>
      </div>

      {/* 3. Active Issued Books Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(15,23,42,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#0f172a' }}>
            Active Issued Books ({filteredIssues.length})
          </h3>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <FaSearch style={{ position: 'absolute', left: '11px', color: '#94a3b8', fontSize: '12px' }} />
            <input
              type="text"
              placeholder="Search student, roll, book..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '8px 12px 8px 32px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '11px 13px' }}>Student Details</th>
                <th style={{ padding: '11px 13px' }}>Book Title</th>
                <th style={{ padding: '11px 13px' }}>Issue Date</th>
                <th style={{ padding: '11px 13px' }}>Due Date</th>
                <th style={{ padding: '11px 13px' }}>Status</th>
                <th style={{ padding: '11px 13px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '22px', textAlign: 'center', color: '#64748b' }}>
                    Loading issued books...
                  </td>
                </tr>
              ) : filteredIssues.length > 0 ? (
                filteredIssues.map((item, idx) => (
                  <tr key={item._id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 13px' }}>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{item.studentName}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {item.universityRoll ? `Roll: ${item.universityRoll} • ` : ''}
                        {item.studentEmail}
                      </div>
                    </td>
                    <td style={{ padding: '12px 13px', fontWeight: '600', color: '#1e293b' }}>{item.bookTitle}</td>
                    <td style={{ padding: '12px 13px', color: '#334155' }}>{item.issueDate}</td>
                    <td style={{ padding: '12px 13px', color: '#334155', fontWeight: '600' }}>{item.dueDate}</td>
                    <td style={{ padding: '12px 13px' }}>
                      <span style={{ backgroundColor: item.status === 'Overdue' ? '#fee2e2' : '#dcfce7', color: item.status === 'Overdue' ? '#dc2626' : '#16a34a', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 13px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleReturnBook(item._id)}
                        style={{
                          backgroundColor: '#eff6ff',
                          color: '#2563eb',
                          border: '1px solid #bfdbfe',
                          padding: '6px 12px',
                          borderRadius: '7px',
                          fontSize: '12.5px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <FaUndoAlt size={11} /> Return
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                    No active issued books found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LibrarianIssueBook;