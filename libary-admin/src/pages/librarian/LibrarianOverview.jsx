import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBook,
  FaUserGraduate,
  FaHourglassHalf,
  FaExclamationTriangle,
  FaRupeeSign,
  FaCheckCircle,
  FaSyncAlt,
  FaArrowRight
} from 'react-icons/fa';

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

const LibrarianOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    totalStudents: 0,
    activeIssuesCount: 0,
    pendingRequestsCount: 0,
    overdueCount: 0,
    totalFines: 0
  });
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_BASE}/librarian/dashboard`, {
        headers: authHeaders()
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || 'Failed to load librarian dashboard.');
      }

      if (data?.stats) {
        setStats(data.stats);
      }
      setPendingRequests(Array.isArray(data?.pendingRequests) ? data.pendingRequests : []);
    } catch (err) {
      setError(err.message || 'Could not fetch dashboard summary.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAction = async (requestId, actionType) => {
    try {
      setError('');
      const res = await fetch(`${API_BASE}/librarian/handle-request/${requestId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ action: actionType })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || `Failed to ${actionType} request.`);
      }
      await fetchDashboardData();
    } catch (err) {
      setError(err.message || 'Action failed.');
    }
  };

  const cards = [
    {
      title: 'Pending Requests',
      value: loading ? '...' : stats.pendingRequestsCount,
      subtitle: 'Student book requests waiting',
      color: '#d97706',
      bg: '#fffbeb',
      border: '#fde68a',
      route: '/librarian/issue-book'
    },
    {
      title: 'Active Checkouts',
      value: loading ? '...' : stats.activeIssuesCount,
      subtitle: 'Books currently issued',
      color: '#2563eb',
      bg: '#eff6ff',
      border: '#bfdbfe',
      route: '/librarian/active-checkouts'
    },
    {
      title: 'Overdue Books',
      value: loading ? '...' : stats.overdueCount,
      subtitle: 'Late return alerts',
      color: '#dc2626',
      bg: '#fef2f2',
      border: '#fecaca',
      route: '/librarian/active-checkouts'
    },
    {
      title: 'Total Fines Collected',
      value: loading ? '...' : `₹${stats.totalFines}`,
      subtitle: 'Accumulated penalty amount',
      color: '#7c3aed',
      bg: '#f5f3ff',
      border: '#ddd6fe',
      route: '/librarian/fines'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Welcome Bar */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '20px 24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>
            Librarian Staff Portal 👋
          </h2>
          <p style={{ margin: '5px 0 0', fontSize: '13.5px', color: '#64748b' }}>
            Manage student book requests, active checkouts, inventory, and library circulation
          </p>
        </div>
        <button
          type="button"
          onClick={fetchDashboardData}
          style={{ backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '9px 15px', borderRadius: '9px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '7px' }}
        >
          <FaSyncAlt size={12} /> Refresh Data
        </button>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', fontSize: '13.5px' }}>
          {error}
        </div>
      )}

      {/* Stats Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
        {cards.map((card, idx) => (
          <div
            key={idx}
            onClick={() => navigate(card.route)}
            style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '22px', border: `1.5px solid ${card.border}`, boxShadow: '0 2px 10px rgba(15,23,42,0.04)', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px', transition: 'transform 0.2s' }}
          >
            <div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#475569' }}>{card.title}</p>
              <h3 style={{ margin: '8px 0 4px', fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>{card.value}</h3>
              <span style={{ fontSize: '12.5px', color: '#64748b' }}>{card.subtitle}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #f1f5f9', fontSize: '13px', fontWeight: '600', color: card.color }}>
              <span>Manage</span>
              <FaArrowRight size={12} />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Pending Requests Section */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(15,23,42,0.04)' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '17px', fontWeight: '700', color: '#0f172a' }}>
          Recent Pending Student Requests ({pendingRequests.length})
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '11px 13px' }}>Student Name</th>
                <th style={{ padding: '11px 13px' }}>Book Title</th>
                <th style={{ padding: '11px 13px' }}>Request Date</th>
                <th style={{ padding: '11px 13px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ padding: '22px', textAlign: 'center', color: '#64748b' }}>Loading pending requests...</td>
                </tr>
              ) : pendingRequests.length > 0 ? (
                pendingRequests.map((req) => (
                  <tr key={req._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 13px', fontWeight: '600', color: '#0f172a' }}>
                      {req.studentName}
                      <div style={{ fontSize: '12px', fontWeight: 'normal', color: '#64748b' }}>{req.studentEmail}</div>
                    </td>
                    <td style={{ padding: '12px 13px', color: '#1e293b', fontWeight: '600' }}>{req.bookTitle}</td>
                    <td style={{ padding: '12px 13px', color: '#334155' }}>{req.issueDate || '—'}</td>
                    <td style={{ padding: '12px 13px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => handleAction(req._id, 'approve')}
                          style={{ backgroundColor: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0', padding: '6px 12px', borderRadius: '7px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAction(req._id, 'reject')}
                          style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', padding: '6px 12px', borderRadius: '7px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ padding: '26px', textAlign: 'center', color: '#64748b' }}>No pending book requests at the moment.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LibrarianOverview;