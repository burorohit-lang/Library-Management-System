import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaBookReader,
  FaClock,
  FaExclamationCircle,
  FaRupeeSign,
  FaSyncAlt
} from 'react-icons/fa';

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

const MyBorrowedBooks = () => {
  const navigate = useNavigate();
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBorrowedBooks = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE}/library/student/dashboard`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load your borrowed books.');
      }

      setBorrowedBooks(Array.isArray(data?.borrowedBooks) ? data.borrowedBooks : []);
    } catch (err) {
      setError(err.message || 'Could not load borrowed books.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)' }}>
      {/* Top Back & Refresh Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '10px' }}>
        <button
          type="button"
          onClick={() => navigate('/student/dashboard')}
          style={{
            backgroundColor: '#eff6ff',
            color: '#2563eb',
            border: '1px solid #bfdbfe',
            padding: '8px 15px',
            borderRadius: '8px',
            fontSize: '13.5px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px'
          }}
        >
          <FaArrowLeft size={12} /> Back to Dashboard
        </button>

        <button
          type="button"
          onClick={fetchBorrowedBooks}
          style={{
            backgroundColor: '#f8fafc',
            color: '#334155',
            border: '1px solid #e2e8f0',
            padding: '8px 13px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <FaSyncAlt size={11} /> Refresh
        </button>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '18px' }}>
        <h2 style={{ margin: 0, fontSize: '19px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaBookReader style={{ color: '#2563eb' }} /> My Borrowed & Overdue Books ({borrowedBooks.length})
        </h2>
        <p style={{ margin: '5px 0 0', fontSize: '13.5px', color: '#64748b' }}>
          Track your currently issued books, return due dates, and late fine status
        </p>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13.5px' }}>
          {error}
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '12px 14px' }}>Book Title</th>
              <th style={{ padding: '12px 14px' }}>Issue Date</th>
              <th style={{ padding: '12px 14px' }}>Due Date</th>
              <th style={{ padding: '12px 14px' }}>Late Fine</th>
              <th style={{ padding: '12px 14px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                  Loading your borrowed books...
                </td>
              </tr>
            ) : borrowedBooks.length > 0 ? (
              borrowedBooks.map((item, idx) => (
                <tr key={item._id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '13px 14px' }}>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{item.bookTitle || item.title}</div>
                    {item.bookAuthor && <div style={{ fontSize: '12px', color: '#64748b' }}>by {item.bookAuthor}</div>}
                  </td>
                  <td style={{ padding: '13px 14px', color: '#334155' }}>{item.issueDate || '—'}</td>
                  <td style={{ padding: '13px 14px', fontWeight: '600', color: item.status === 'Overdue' ? '#dc2626' : '#334155' }}>
                    {item.dueDate || '—'}
                  </td>
                  <td style={{ padding: '13px 14px', fontWeight: '700', color: (item.fine || 0) > 0 ? '#dc2626' : '#16a34a' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                      <FaRupeeSign size={11} /> {item.fine || 0}
                    </span>
                  </td>
                  <td style={{ padding: '13px 14px' }}>
                    {item.status === 'Overdue' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                        <FaExclamationCircle size={11} /> Overdue
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                        <FaClock size={11} /> Active
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ padding: '28px', textAlign: 'center', color: '#64748b' }}>
                  You currently have no borrowed books.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyBorrowedBooks;