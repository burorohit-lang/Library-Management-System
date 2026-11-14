import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBook,
  FaUsers,
  FaExchangeAlt,
  FaExclamationTriangle,
  FaRupeeSign,
  FaPlus,
  FaSyncAlt
} from 'react-icons/fa';
import api, { getErrorMessage } from '../../lib/api';
import './AdminPages.css';

const Overview = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalTitles: 0,
    totalCopies: 0,
    availableCopies: 0,
    totalStudents: 0,
    totalLibrarians: 0,
    activeIssuesCount: 0,
    overdueIssuesCount: 0,
    totalFines: 0
  });

  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/admin/overview');
      if (data.stats) setStats(data.stats);
      if (data.recentIssues) setRecentIssues(data.recentIssues);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load dashboard overview from server.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Welcome & Quick Actions Header */}
      <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '22px', color: '#0f172a', fontWeight: '700' }}>Library Overview</h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Real-time summary of books, members, active borrowings, and fines.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchOverviewData}
            style={{ backgroundColor: '#f1f5f9', color: '#334155', border: 'none', padding: '10px 14px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <FaSyncAlt /> Refresh
          </button>
          <button
            onClick={() => navigate('/admin/books/add')}
            style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <FaPlus /> Add Book
          </button>
        </div>
      </div>

      {error && <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', fontSize: '13px' }}>{error}</div>}

      {/* Summary Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        {/* Total Books */}
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '14px', borderRadius: '12px' }}>
            <FaBook size={22} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Total Book Titles</p>
            <h3 style={{ margin: '4px 0 0', fontSize: '24px', color: '#0f172a' }}>{loading ? '...' : stats.totalTitles}</h3>
            <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600' }}>
              {stats.availableCopies} / {stats.totalCopies} Copies Available
            </span>
          </div>
        </div>

        {/* Registered Students */}
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: '#f5f3ff', color: '#7c3aed', padding: '14px', borderRadius: '12px' }}>
            <FaUsers size={22} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Registered Students</p>
            <h3 style={{ margin: '4px 0 0', fontSize: '24px', color: '#0f172a' }}>{loading ? '...' : stats.totalStudents}</h3>
            <span style={{ fontSize: '11px', color: '#64748b' }}>{stats.totalLibrarians} Librarian Staff</span>
          </div>
        </div>

        {/* Active Issues */}
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: '#fff7ed', color: '#ea580c', padding: '14px', borderRadius: '12px' }}>
            <FaExchangeAlt size={22} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Active Issues</p>
            <h3 style={{ margin: '4px 0 0', fontSize: '24px', color: '#0f172a' }}>{loading ? '...' : stats.activeIssuesCount}</h3>
            <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: '600' }}>
              {stats.overdueIssuesCount} Overdue
            </span>
          </div>
        </div>

        {/* Total Fines */}
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: '#f0fdf4', color: '#16a34a', padding: '14px', borderRadius: '12px' }}>
            <FaRupeeSign size={22} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Total Fines Recorded</p>
            <h3 style={{ margin: '4px 0 0', fontSize: '24px', color: '#0f172a' }}>₹ {loading ? '...' : stats.totalFines}</h3>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Late return penalties</span>
          </div>
        </div>

      </div>

      {/* Recent Book Issue Activity Table */}
      <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '17px', color: '#0f172a' }}>Recent Book Circulation Activity</h3>
          <button
            onClick={() => navigate('/admin/issues/active')}
            style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
          >
            View All Issues →
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', color: '#475569' }}>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Student</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Book Title</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Issue Date</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Due Date</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Loading recent activity...</td>
                </tr>
              ) : recentIssues.length > 0 ? (
                recentIssues.map((issue) => (
                  <tr key={issue._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '13px 16px', fontWeight: '600', color: '#0f172a' }}>{issue.studentName}</td>
                    <td style={{ padding: '13px 16px', color: '#334155' }}>{issue.bookTitle}</td>
                    <td style={{ padding: '13px 16px', color: '#64748b' }}>{issue.issueDate}</td>
                    <td style={{ padding: '13px 16px', color: '#64748b' }}>{issue.dueDate}</td>
                    <td style={{ padding: '13px 16px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor:
                            issue.status === 'Returned'
                              ? '#f0fdf4'
                              : issue.status === 'Overdue'
                              ? '#fee2e2'
                              : '#fff7ed',
                          color:
                            issue.status === 'Returned'
                              ? '#16a34a'
                              : issue.status === 'Overdue'
                              ? '#dc2626'
                              : '#ea580c'
                        }}
                      >
                        {issue.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No recent circulation records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Overview;