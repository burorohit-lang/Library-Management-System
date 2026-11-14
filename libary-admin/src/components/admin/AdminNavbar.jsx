import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaBell, FaUser, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import './AdminNavbar.css';

const AdminNavbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const role = localStorage.getItem('role') || 'admin';
  const userName = localStorage.getItem('userName') || (role === 'admin' ? 'System Admin' : 'Library Staff');


  const [notifications, setNotifications] = useState([
    { id: 1, text: 'John Doe borrowed "React JS Mastery"', time: '10 mins ago', unread: true },
    { id: 2, text: 'Book "Advanced Node.js" is overdue', time: '1 hour ago', unread: true },
    { id: 3, text: 'New student registration pending approval', time: 'Yesterday', unread: false }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  return (
    <header className="admin-navbar">
      <div className="navbar-left">
        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          <FaBars />
        </button>
        <h2 className="page-title-heading">Dashboard Overview</h2>
      </div>

      <div className="navbar-right">
        
        {/* Notification Bell with Popup Dropdown */}
        <div className="navbar-dropdown-container">
          <div 
            className="notification-icon-wrapper" 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserDropdown(false);
            }}
          >
            <FaBell className="nav-icon" />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </div>

          {showNotifications && (
            <div className="notification-popup">
              <div className="notification-popup-header">
                <h4>Notifications</h4>
                {unreadCount > 0 && (
                  <span className="mark-read-text" onClick={markAllAsRead}>Mark all as read</span>
                )}
              </div>
              <div className="notification-list">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div key={notif.id} className={`notification-item ${notif.unread ? 'unread' : ''}`}>
                      <p>{notif.text}</p>
                      <span className="notif-time">{notif.time}</span>
                    </div>
                  ))
                ) : (
                  <div className="no-notifications">No new notifications</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Role & Profile Dropdown (Admin / Librarian) */}
        <div className="navbar-dropdown-container">
          <div 
            className="user-profile-menu-btn" 
            onClick={() => {
              setShowUserDropdown(!showUserDropdown);
              setShowNotifications(false); 
            }}
          >
            <div className="user-avatar-icon">
              <FaUser />
            </div>
            <span className="user-role-text">{userName} ({role.toUpperCase()})</span>
            <FaChevronDown size={11} className={`dropdown-chevron ${showUserDropdown ? 'open' : ''}`} />
          </div>

          {showUserDropdown && (
            <div className="user-dropdown-popup">
              <div className="dropdown-user-info">
                <p className="dropdown-name">{userName}</p>
                <p className="dropdown-role-badge">{role.toUpperCase()} PORTAL</p>
              </div>
              <div className="dropdown-divider"></div>
              <button onClick={handleLogout} className="dropdown-logout-btn">
                <FaSignOutAlt /> Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default AdminNavbar;