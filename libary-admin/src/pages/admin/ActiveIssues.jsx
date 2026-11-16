import { useState, useEffect } from 'react';
import {
  FaHandHolding,
  FaSearch,
  FaSyncAlt,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaHourglassHalf,
  FaRupeeSign,
  FaUndoAlt,
  FaTimes
} from 'react-icons/fa';
import api, { getErrorMessage } from '../../lib/api';

const ActiveIssues = () => {
  const [issues, setIssues] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchActiveIssues = async () => {
    try {
      setLoading(true);
      setError('');
      // আপনার ব্যাকএন্ডের Active Issues / Dashboard এন্ডপয়েন্ট থেকে ডেটা আনা হচ্ছে
      const { data } = await api.get('/librarian/dashboard');
      const allRecords = Array.isArray(data)
        ? data
        : data.recentTransactions || data.activeIssues || data.issuedBooks || [];

      // শুধুমাত্র চলমান রেকর্ডগুলো (Pending, Active, Overdue) রাখা হচ্ছে
      const activeOnly = allRecords.filter((item) =>
        ['Pending', 'Active', 'Overdue'].includes(item.status)
      );
      setIssues(activeOnly);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load student book borrowings & active issues.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveIssues();
  }, []);

  // বই ফেরত নেওয়ার (Mark as Returned) ফাংশন
  const handleReturnBook = async (issue) => {
    const confirmReturn = window.confirm(
      `Confirm book return for "${issue.bookTitle || issue.title}" from ${issue.studentName}?`
    );
    if (!confirmReturn) return;

    try {
      setProcessingId(issue._id);
      setError('');
      // আপনার ব্যাকএন্ডের Return API পাথ অনুযায়ী মিলিয়ে নেবেন
      const { data } = await api.post(`/librarian/return-book/${issue._id}`);
      setSuccessMsg(data?.message || 'Book marked as returned successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchActiveIssues();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to process book return.'));
    } finally {
      setProcessingId(null);
    }
  };

  // Student Search & Status Filtering
  const filteredIssues = issues.filter((item) => {
    const query = searchQuery.trim().toLowerCase();
    const bookName = item.bookTitle || item.title || '';

    const matchesStudentOrBook =
      !query ||
      item.studentName?.toLowerCase().includes(query) ||
      item.studentEmail?.toLowerCase().includes(query) ||
      item.studentId?.toLowerCase().includes(query) ||
      bookName.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesStudentOrBook && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const baseStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '5px 11px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      whiteSpace: 'nowrap'
    };

    if (status === 'Overdue') {
      return (
        <span style={{ ...baseStyle, backgroundColor: '#fee2e2', color: '#b91c1c' }}>
          <FaExclamationCircle size={11} /> Overdue
        </span>
      );
    }
    if (status === 'Pending') {
      return (
        <span style={{ ...baseStyle, backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
          <FaHourglassHalf size={11} /> Pending Approval
        </span>
      );
    }
    return (
      <span style={{ ...baseStyle, backgroundColor: '#fef3c7', color: '#b45309' }}>
        <FaClock size={11} /> Active
      </span>
    );
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        padding: '24px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
      }}
    >
      {/* Top Header & Search Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '20px'
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: '19px',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              gap: '9px'
            }}
          >
            <FaHandHolding style={{ color: '#2563eb' }} /> Student Book Borrowings & Active Issues
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#64748b' }}>
            Search by student name, email, or book title to manage active borrowings and returns
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Student Search Box */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <FaSearch size={13} style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search student name, email or book..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '9px 32px 9px 34px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13.5px',
                outline: 'none',
                minWidth: '250px'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                title="Clear Search"
                style={{
                  position: 'absolute',
                  right: '9px',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px'
                }}
              >
                <FaTimes size={12} />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13.5px',
              backgroundColor: '#ffffff',
              color: '#334155',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="All">All Active ({issues.length})</option>
            <option value="Active">Active</option>
            <option value="Overdue">Overdue</option>
            <option value="Pending">Pending</option>
          </select>

          <button
            onClick={fetchActiveIssues}
            style={{
              backgroundColor: '#f1f5f9',
              color: '#334155',
              border: '1px solid #e2e8f0',
              padding: '9px 14px',
              borderRadius: '8px',
              fontSize: '13.5px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FaSyncAlt size={12} /> Refresh
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div
          style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '13.5px',
            marginBottom: '16px',
            border: '1px solid #fecaca'
          }}
        >
          {error}
        </div>
      )}

      {successMsg && (
        <div
          style={{
            backgroundColor: '#dcfce7',
            color: '#16a34a',
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '13.5px',
            marginBottom: '16px',
            border: '1px solid #bbf7d0',
            fontWeight: '500'
          }}
        >
          {successMsg}
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr
              style={{
                backgroundColor: '#f8fafc',
                color: '#475569',
                fontSize: '12.5px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              <th style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0' }}>Student Details</th>
              <th style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0' }}>Book Title</th>
              <th style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0' }}>Issue Date</th>
              <th style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0' }}>Due Date</th>
              <th style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0' }}>Fine</th>
              <th style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0' }}>Status</th>
              <th style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '28px', color: '#64748b' }}>
                  Loading active student borrowings...
                </td>
              </tr>
            ) : filteredIssues.length > 0 ? (
              filteredIssues.map((item, index) => (
                <tr
                  key={item._id || index}
                  style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>
                      {item.studentName || 'Student Member'}
                    </div>
                    {item.studentEmail && (
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        {item.studentEmail}
                      </div>
                    )}
                  </td>

                  <td style={{ padding: '14px 16px', fontWeight: '600', color: '#1e293b' }}>
                    {item.bookTitle || item.title}
                  </td>

                  <td style={{ padding: '14px 16px', color: '#475569' }}>{item.issueDate || '—'}</td>

                  <td
                    style={{
                      padding: '14px 16px',
                      fontWeight: '600',
                      color: item.status === 'Overdue' ? '#dc2626' : '#334155'
                    }}
                  >
                    {item.dueDate || '—'}
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                        fontWeight: '700',
                        color: (item.fine || 0) > 0 ? '#dc2626' : '#16a34a'
                      }}
                    >
                      <FaRupeeSign size={11} /> {item.fine || 0}
                    </span>
                  </td>

                  <td style={{ padding: '14px 16px' }}>{getStatusBadge(item.status)}</td>

                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    {item.status !== 'Pending' ? (
                      <button
                        type="button"
                        disabled={processingId === item._id}
                        onClick={() => handleReturnBook(item)}
                        style={{
                          backgroundColor: '#16a34a',
                          color: '#ffffff',
                          border: 'none',
                          padding: '7px 13px',
                          borderRadius: '7px',
                          fontSize: '12.5px',
                          fontWeight: '600',
                          cursor: processingId === item._id ? 'not-allowed' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          opacity: processingId === item._id ? 0.7 : 1
                        }}
                      >
                        <FaUndoAlt size={11} />
                        {processingId === item._id ? 'Processing...' : 'Mark Returned'}
                      </button>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                        Awaiting Approval
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '28px', color: '#64748b' }}>
                  {searchQuery
                    ? `No student borrowing records found matching "${searchQuery}".`
                    : 'No active student borrowings found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActiveIssues;