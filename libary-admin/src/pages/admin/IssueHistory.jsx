import { useState, useEffect } from 'react';
import {
  FaHistory,
  FaSearch,
  FaCheckCircle,
  FaExclamationCircle,
  FaClock,
  FaHourglassHalf,
  FaTimesCircle,
  FaRupeeSign,
  FaSyncAlt
} from 'react-icons/fa';

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

const IssueHistory = () => {
  const [historyList, setHistoryList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  const fetchIssueHistory = async () => {
    try {
      setLoading(true);
      setError('');

      // ব্যাকএন্ডের /api/issues অথবা /api/librarian/dashboard থেকে সমস্ত ট্রানজেকশন আনা
      const res = await fetch(`${API_BASE}/issues`, {
        headers: authHeaders()
      });
      
      let data = [];
      if (res.ok) {
        data = await res.json().catch(() => []);
      } else {
        // যদি /api/issues না থাকে, তবে librarian dashboard থেকে ফেচ করা
        const altRes = await fetch(`${API_BASE}/librarian/dashboard`, {
          headers: authHeaders()
        });
        const altData = await altRes.json().catch(() => ({}));
        data = altData.issues || altData.recentLogs || altData.activeIssues || [];
      }

      const list = Array.isArray(data) ? data : data.issues || [];
      setHistoryList(list);
    } catch (err) {
      setError(err.message || 'Could not load issue history records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssueHistory();
    // প্রতি ১০ সেকেন্ড পর পর অটো লাইভ সিঙ্ক (Live polling)
    const interval = setInterval(fetchIssueHistory, 10000);
    return () => clearInterval(interval);
  }, []);

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Returned':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
            <FaCheckCircle size={11} /> Returned
          </span>
        );
      case 'Overdue':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
            <FaExclamationCircle size={11} /> Overdue
          </span>
        );
      case 'Pending':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
            <FaHourglassHalf size={11} /> Pending
          </span>
        );
      case 'Rejected':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#f1f5f9', color: '#64748b', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
            <FaTimesCircle size={11} /> Rejected
          </span>
        );
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
            <FaClock size={11} /> Active
          </span>
        );
    }
  };

  const filteredHistory = historyList.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const student = (item.studentName || item.studentEmail || '').toLowerCase();
    const book = (item.bookTitle || '').toLowerCase();
    const roll = (item.universityRoll || '').toLowerCase();
    const currentStatus = item.status || 'Active';

    const matchesSearch = !q || student.includes(q) || book.includes(q) || roll.includes(q);
    const matchesStatus = statusFilter === 'All' || currentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)' }}>
      {/* Top Header & Search/Filter Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '19px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaHistory style={{ color: '#2563eb' }} /> Issue History & Returned Books ({historyList.length})
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#64748b' }}>
            Live circulation logs of all borrowed, overdue, returned, and pending books
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <FaSearch style={{ position: 'absolute', left: '11px', color: '#94a3b8', fontSize: '12px' }} />
            <input
              type="text"
              placeholder="Search student, book, roll..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '8px 12px 8px 32px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', minWidth: '220px' }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#ffffff', color: '#334155', outline: 'none' }}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Returned">Returned</option>
            <option value="Overdue">Overdue</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>

          <button
            type="button"
            onClick={fetchIssueHistory}
            style={{ backgroundColor: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0', padding: '8px 13px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <FaSyncAlt size={11} /> Refresh Live
          </button>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '11px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13.5px' }}>
          {error}
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '12px 14px' }}>Student Details</th>
              <th style={{ padding: '12px 14px' }}>Book Title</th>
              <th style={{ padding: '12px 14px' }}>Issue Date</th>
              <th style={{ padding: '12px 14px' }}>Due Date</th>
              <th style={{ padding: '12px 14px' }}>Return Date</th>
              <th style={{ padding: '12px 14px' }}>Fine</th>
              <th style={{ padding: '12px 14px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                  Loading live history records...
                </td>
              </tr>
            ) : filteredHistory.length > 0 ? (
              filteredHistory.map((item, idx) => (
                <tr key={item._id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '13px 14px' }}>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{item.studentName || 'Student'}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {item.universityRoll ? `Roll: ${item.universityRoll} • ` : ''}
                      {item.studentEmail}
                    </div>
                  </td>
                  <td style={{ padding: '13px 14px', fontWeight: '600', color: '#1e293b' }}>
                    {item.bookTitle}
                  </td>
                  <td style={{ padding: '13px 14px', color: '#334155' }}>{item.issueDate || '—'}</td>
                  <td style={{ padding: '13px 14px', color: '#334155', fontWeight: '500' }}>{item.dueDate || '—'}</td>
                  <td style={{ padding: '13px 14px', color: item.returnDate ? '#16a34a' : '#94a3b8', fontWeight: item.returnDate ? '600' : '400' }}>
                    {item.returnDate || 'Not returned'}
                  </td>
                  <td style={{ padding: '13px 14px', fontWeight: '700', color: (item.fine || 0) > 0 ? '#dc2626' : '#16a34a' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                      <FaRupeeSign size={11} /> {item.fine || 0}
                    </span>
                  </td>
                  <td style={{ padding: '13px 14px' }}>{renderStatusBadge(item.status)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ padding: '28px', textAlign: 'center', color: '#64748b' }}>
                  No circulation history records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IssueHistory;