import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBookReader,
  FaExclamationTriangle,
  FaRupeeSign,
  FaBook,
  FaHistory,
  FaSyncAlt,
  FaArrowRight,
  FaClock
} from 'react-icons/fa';

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

const StudentOverview = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    borrowedCount: 0,
    pendingCount: 0,
    overdueCount: 0,
    returnedCount: 0,
    totalFines: 0,
    availableBooksCount: 0
  });
  const [studentName, setStudentName] = useState(localStorage.getItem('userName') || 'Student');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredCard, setHoveredCard] = useState(null);

  const fetchOverview = async () => {
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
        throw new Error(data.message || 'Failed to load student overview.');
      }

      if (data?.student?.name) {
        setStudentName(data.student.name);
      }
      if (data?.stats) {
        setStats((prev) => ({ ...prev, ...data.stats }));
      }
    } catch (err) {
      setError(err.message || 'Could not load dashboard summary.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const cards = [
    {
      id: 'borrowed',
      title: 'My Borrowed Books',
      value: loading ? '...' : stats.borrowedCount,
      subtitle: 'Currently issued to your account',
      actionText: 'View Issued Books',
      icon: <FaBookReader size={22} />,
      accentColor: '#2563eb',
      iconBg: '#eff6ff',
      borderColor: '#bfdbfe',
      route: '/student/borrowed'
    },
    {
      id: 'catalog',
      title: 'Available Catalog',
      value: loading ? '...' : stats.availableBooksCount,
      subtitle: 'Browse & request library books',
      actionText: 'Explore Books',
      icon: <FaBook size={22} />,
      accentColor: '#16a34a',
      iconBg: '#f0fdf4',
      borderColor: '#bbf7d0',
      route: '/student/catalog'
    },
    {
      id: 'overdue',
      title: 'Overdue Books',
      value: loading ? '...' : stats.overdueCount,
      subtitle: stats.overdueCount > 0 ? 'Please return immediately' : 'No overdue books right now',
      actionText: 'Check Due Dates',
      icon: <FaExclamationTriangle size={22} />,
      accentColor: '#dc2626',
      iconBg: '#fef2f2',
      borderColor: '#fecaca',
      route: '/student/borrowed'
    },
    {
      id: 'fines',
      title: 'Total Pending Fines',
      value: loading ? '...' : `₹${stats.totalFines}`,
      subtitle: stats.totalFines > 0 ? 'Late return penalty due' : 'Clear! Zero pending fines',
      actionText: 'View Fine Details',
      icon: <FaRupeeSign size={22} />,
      accentColor: '#7c3aed',
      iconBg: '#f5f3ff',
      borderColor: '#ddd6fe',
      route: '/student/history'
    },
    {
      id: 'pending',
      title: 'Pending Requests',
      value: loading ? '...' : stats.pendingCount,
      subtitle: 'Awaiting librarian approval',
      actionText: 'Track Requests',
      icon: <FaClock size={22} />,
      accentColor: '#d97706',
      iconBg: '#fffbeb',
      borderColor: '#fde68a',
      route: '/student/history'
    },
    {
      id: 'history',
      title: 'Returned History',
      value: loading ? '...' : stats.returnedCount,
      subtitle: 'Past completed book returns',
      actionText: 'View Full History',
      icon: <FaHistory size={22} />,
      accentColor: '#0284c7',
      iconBg: '#f0f9ff',
      borderColor: '#bae6fd',
      route: '/student/history'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Welcome & Refresh Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          padding: '20px 24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>
            Welcome back, {studentName}! 👋
          </h2>
          <p style={{ margin: '5px 0 0', fontSize: '13.5px', color: '#64748b' }}>
            Select any card below to manage your borrowed books, browse the catalog, or check fines
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOverview}
          style={{
            backgroundColor: '#eff6ff',
            color: '#2563eb',
            border: '1px solid #bfdbfe',
            padding: '9px 15px',
            borderRadius: '9px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px'
          }}
        >
          <FaSyncAlt size={12} /> Refresh Summary
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '13.5px',
            border: '1px solid #fecaca'
          }}
        >
          {error}
        </div>
      )}

      {/* Clean 3-Column Responsive Card Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '18px'
        }}
      >
        {cards.map((card) => {
          const isHovered = hoveredCard === card.id;
          return (
            <div
              key={card.id}
              onClick={() => navigate(card.route)}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                padding: '22px',
                border: `1.5px solid ${isHovered ? card.accentColor : '#e2e8f0'}`,
                boxShadow: isHovered
                  ? '0 12px 24px rgba(15, 23, 42, 0.1)'
                  : '0 2px 10px rgba(15, 23, 42, 0.04)',
                transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px'
              }}
            >
              {/* Card Top: Title, Count & Icon */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '13.5px',
                      fontWeight: '600',
                      color: '#475569'
                    }}
                  >
                    {card.title}
                  </p>
                  <h3
                    style={{
                      margin: '8px 0 4px',
                      fontSize: '28px',
                      fontWeight: '800',
                      color: '#0f172a',
                      lineHeight: '1.1'
                    }}
                  >
                    {card.value}
                  </h3>
                  <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                    {card.subtitle}
                  </span>
                </div>

                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: card.iconBg,
                    color: card.accentColor,
                    border: `1px solid ${card.borderColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {card.icon}
                </div>
              </div>

              {/* Card Footer Link */}
              <div
                style={{
                  paddingTop: '12px',
                  borderTop: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: card.accentColor
                }}
              >
                <span>{card.actionText}</span>
                <FaArrowRight
                  size={12}
                  style={{
                    transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                    transition: 'transform 0.2s ease'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentOverview;