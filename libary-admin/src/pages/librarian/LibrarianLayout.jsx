import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  FaChartPie,
  FaBookMedical,
  FaClipboardList,
  FaBook,
  FaRupeeSign,
  FaHistory,
  FaSignOutAlt
} from 'react-icons/fa';

const LibrarianLayout = () => {
  const navigate = useNavigate();
  const librarianName = localStorage.getItem('userName') || 'Librarian Staff';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { path: 'dashboard', label: 'Dashboard Overview', icon: <FaChartPie size={16} /> },
    { path: 'issue-book', label: 'Issue & Requests', icon: <FaBookMedical size={16} /> },
    { path: 'active-checkouts', label: 'Active Checkouts', icon: <FaClipboardList size={16} /> },
    { path: 'inventory', label: 'Book Inventory', icon: <FaBook size={16} /> },
    { path: 'fines', label: 'Fines & Penalties', icon: <FaRupeeSign size={16} /> },
    { path: 'logs', label: 'Circulation Logs', icon: <FaHistory size={16} /> }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', backgroundColor: '#0f172a', color: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px', flexShrink: 0 }}>
        <div>
          <div style={{ paddingBottom: '20px', borderBottom: '1px solid #1e293b', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#38bdf8' }}>Library Staff</h2>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{librarianName}</span>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '11px 14px',
                  borderRadius: '9px',
                  fontSize: '13.5px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  backgroundColor: isActive ? '#2563eb' : 'transparent',
                  color: isActive ? '#ffffff' : '#cbd5e1',
                  transition: 'background 0.15s'
                })}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div>
          <button
            type="button"
            onClick={handleLogout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '9px', border: 'none', backgroundColor: '#ef4444', color: '#ffffff', fontSize: '13.5px', fontWeight: '600', cursor: 'pointer' }}
          >
            <FaSignOutAlt size={15} /> Logout Portal
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
        <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Librarian Staff Management Panel</h1>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#16a34a', backgroundColor: '#dcfce7', padding: '5px 12px', borderRadius: '20px' }}>
            ● Online Staff
          </span>
        </header>

        <div style={{ padding: '28px' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default LibrarianLayout;