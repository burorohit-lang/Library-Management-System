import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaHistory,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaHourglassHalf,
  FaTimesCircle,
  FaRupeeSign,
  FaSyncAlt
} from 'react-icons/fa';

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

const StudentHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [totalFines, setTotalFines] = useState(0);
  const [filterTab, setFilterTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
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
        throw new Error(data.message || 'Failed to load borrowing history & fines.');
      }

      setHistory(Array.isArray(data?.history) ? data.history : []);
      setTotalFines(data?.stats?.totalFines || 0);
    } catch (err) {
      setError(err.message || 'Could not load history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = history.filter((item) => {
    if (filterTab === 'All') return true;
    if (filterTab === 'Fines') return (item.fine || 0) > 0;
    return item.status === filterTab;
  });

  const renderStatus = (status) => {
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
            <FaHourglassHalf size={11} /> Pending Approval
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ backgroundColor: totalFines > 0 ? '#fef2f2' : '#f0fdf4', color: totalFines > 0 ? '#dc2626' : '#16a34a', padding: '7px 13px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', border: `1px solid ${totalFines > 0 ? '#fecaca' : '#bbf7d0'}` }}>
            Total Fines: ₹{totalFines}
          </div>

          <button
            type="button"
            onClick={fetchHistory}
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
      </div>

      {/* Header & Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '19px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaHistory style={{ color: '#7c3aed' }} /> Borrowing History, Requests & Fines
          </h2>
          <p style={{ margin: '5px 0 0', fontSize: '13.5px', color: '#64748b' }}>
            View your pending book requests, past returns, and fine details
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['All', 'Pending', 'Returned', 'Fines'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterTab(tab)}
              style={{
                padding: '6px 13px',
                borderRadius: '20px',
                border: filterTab === tab ? '1px solid #2563eb' : '1px solid #e2e8f0',
                backgroundColor: filterTab === tab ? '#2563eb' : '#f8fafc',
                color: filterTab === tab ? '#ffffff' : '#475569',
                fontSize: '12.5px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {tab === 'Fines' ? 'With Fines' : tab}
            </button>
          ))}
        </div>
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
              <th style={{ padding: '12px 14px' }}>Request / Issue Date</th>
              <th style={{ padding: '12px 14px' }}>Due Date</th>
              <th style={{ padding: '12px 14px' }}>Return Date</th>
              <th style={{ padding: '12px 14px' }}>Fine</th>
              <th style={{ padding: '12px 14px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                  Loading history records...
                </td>
              </tr>
            ) : filteredHistory.length > 0 ? (
              filteredHistory.map((item, idx) => (
                <tr key={item._id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '13px 14px', fontWeight: '600', color: '#0f172a' }}>
                    {item.bookTitle || item.title}
                  </td>
                  <td style={{ padding: '13px 14px', color: '#334155' }}>{item.issueDate || '—'}</td>
                  <td style={{ padding: '13px 14px', color: '#334155' }}>{item.dueDate || '—'}</td>
                  <td style={{ padding: '13px 14px', color: item.returnDate ? '#16a34a' : '#94a3b8', fontWeight: item.returnDate ? '600' : '400' }}>
                    {item.returnDate || 'Not returned'}
                  </td>
                  <td style={{ padding: '13px 14px', fontWeight: '700', color: (item.fine || 0) > 0 ? '#dc2626' : '#16a34a' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                      <FaRupeeSign size={11} /> {item.fine || 0}
                    </span>
                  </td>
                  <td style={{ padding: '13px 14px' }}>{renderStatus(item.status)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ padding: '28px', textAlign: 'center', color: '#64748b' }}>
                  No records found in this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentHistory;