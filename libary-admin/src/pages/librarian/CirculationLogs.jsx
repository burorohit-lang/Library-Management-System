import { useState, useEffect } from 'react';
import { FaSyncAlt, FaSearch } from 'react-icons/fa';
import api, { getErrorMessage } from '../../lib/api';

const CirculationLogs = () => {
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/librarian/dashboard');
      if (data.recentTransactions) {
        setRecentTransactions(data.recentTransactions);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load recent circulation logs.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = recentTransactions.filter((item) => {
    const matchesSearch =
      item.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.bookTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      {/* Header & Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>
            Recent Book Circulation Logs
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
            Filter and monitor all recent issue, return, and request records
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <FaSearch size={13} style={{ position: 'absolute', left: '11px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search student or book..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '8px 12px 8px 32px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13.5px',
                outline: 'none'
              }}
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13.5px',
              backgroundColor: '#ffffff',
              color: '#334155',
              outline: 'none'
            }}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Active">Active</option>
            <option value="Returned">Returned</option>
            <option value="Overdue">Overdue</option>
            <option value="Rejected">Rejected</option>
          </select>

          <button
            onClick={fetchLogs}
            style={{
              backgroundColor: '#f1f5f9',
              color: '#334155',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FaSyncAlt /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {/* Logs Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', color: '#475569' }}>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Student Name</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Book Title</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Date</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Due Date</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>Loading live records...</td>
              </tr>
            ) : filteredLogs.length > 0 ? (
              filteredLogs.map((item) => (
                <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '600', color: '#0f172a' }}>{item.studentName}</td>
                  <td style={{ padding: '12px 16px', color: '#334155' }}>{item.bookTitle}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>{item.issueDate}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>{item.dueDate}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor:
                          item.status === 'Pending'
                            ? '#eff6ff'
                            : item.status === 'Returned'
                            ? '#f0fdf4'
                            : item.status === 'Overdue' || item.status === 'Rejected'
                            ? '#fee2e2'
                            : '#fff7ed',
                        color:
                          item.status === 'Pending'
                            ? '#2563eb'
                            : item.status === 'Returned'
                            ? '#16a34a'
                            : item.status === 'Overdue' || item.status === 'Rejected'
                            ? '#dc2626'
                            : '#ea580c'
                      }}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                  No matching circulation logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CirculationLogs;