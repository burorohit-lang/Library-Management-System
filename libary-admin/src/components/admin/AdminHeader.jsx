import { useNavigate } from 'react-router-dom';
import { FaBars, FaSignOutAlt, FaUserCircle, FaBell } from 'react-icons/fa';
import './AdminHeader.css';

const AdminHeader = ({ toggleSidebar, isCollapsed }) => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userEmail')?.split('@')[0] || 'Admin';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  return (
    <header className={`admin-header ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="header-left">
        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          <FaBars />
        </button>
        <h3 className="header-page-title">Dashboard Overview</h3>
      </div>

      <div className="header-right">
        <div className="header-notification">
          <FaBell className="header-icon" />
          <span className="badge">3</span>
        </div>

        <div className="header-user-profile">
          <FaUserCircle className="user-avatar" />
          <span className="user-name">{localStorage.getItem('userName') || userName}</span>
        </div>

        <button className="logout-btn" onClick={handleLogout} title="Logout">
          <FaSignOutAlt style={{ marginRight: '6px' }} /> Logout
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;