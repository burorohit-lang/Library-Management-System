import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FaThLarge, FaBook, FaUsers, FaClipboardList, FaCog, 
  FaBookOpen, FaChevronDown, FaChevronUp, FaPlusCircle, 
  FaListAlt, FaTags, FaUserPlus, FaUserShield 
} from 'react-icons/fa';
import './AdminSidebar.css';

const AdminSidebar = ({ isCollapsed }) => {
  const location = useLocation();
  const isAdmin = localStorage.getItem('role') === 'admin';

  // সব মেনুর ইনিশিয়াল স্টেট (dashboard সহ)
  const [openMenus, setOpenMenus] = useState({
    dashboard: true,
    books: false,
    categories: false,
    users: false,
    issues: false,
    settings: false
  });

  // বর্তমান URL অনুযায়ী সংশ্লিষ্ট মেনুটি অটোমেটিক ওপেন রাখার লজিক
  useEffect(() => {
    const path = location.pathname;
    setOpenMenus((prev) => ({
      ...prev,
      dashboard: path.includes('/admin/dashboard') ? true : prev.dashboard,
      categories: path.includes('/admin/categories') ? true : prev.categories,
      books: path.includes('/admin/books') ? true : prev.books,
      users: path.includes('/admin/users') ? true : prev.users,
      issues: path.includes('/admin/issues') ? true : prev.issues,
      settings: path.includes('/admin/settings') ? true : prev.settings,
    }));
  }, [location.pathname]);

  const toggleMenu = (menuName) => {
    if (!isCollapsed) {
      setOpenMenus((prev) => ({
        ...prev,
        [menuName]: !prev[menuName]
      }));
    }
  };

  return (
    <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Logo Header */}
      <div className="sidebar-logo-container">
        <FaBookOpen className="sidebar-logo-icon" />
        {!isCollapsed && <span className="sidebar-logo-text">Library Admin</span>}
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        
        {/* 1. Dashboard Menu */}
        <div className="sidebar-menu-item">
          <div 
            className={`sidebar-link dropdown-toggle ${location.pathname.includes('/admin/dashboard') ? 'active-parent' : ''}`} 
            onClick={() => toggleMenu('dashboard')}
          >
            <div className="menu-left">
              <FaThLarge className="sidebar-link-icon" />
              {!isCollapsed && <span className="sidebar-link-text">Dashboard</span>}
            </div>
            {!isCollapsed && (
              <span className="dropdown-arrow">
                {openMenus.dashboard ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
              </span>
            )}
          </div>
          {openMenus.dashboard && !isCollapsed && (
            <div className="submenu-container">
              <NavLink to="/admin/dashboard" end className="submenu-link">Overview</NavLink>
              <NavLink to="/admin/dashboard/analytics" className="submenu-link">Analytics</NavLink>
            </div>
          )}
        </div>

        {/* 2. Categories Menu */}
        <div className="sidebar-menu-item">
          <div 
            className={`sidebar-link dropdown-toggle ${location.pathname.includes('/admin/categories') ? 'active-parent' : ''}`} 
            onClick={() => toggleMenu('categories')}
          >
            <div className="menu-left">
              <FaTags className="sidebar-link-icon" />
              {!isCollapsed && <span className="sidebar-link-text">Categories</span>}
            </div>
            {!isCollapsed && (
              <span className="dropdown-arrow">
                {openMenus.categories ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
              </span>
            )}
          </div>
          {openMenus.categories && !isCollapsed && (
            <div className="submenu-container">
              <NavLink to="/admin/categories/books" className="submenu-link">
                <FaBook size={11} style={{ marginRight: '8px' }} /> Book Categories
              </NavLink>
            </div>
          )}
        </div>

        {/* 3. Books Menu */}
        <div className="sidebar-menu-item">
          <div 
            className={`sidebar-link dropdown-toggle ${location.pathname.includes('/admin/books') ? 'active-parent' : ''}`} 
            onClick={() => toggleMenu('books')}
          >
            <div className="menu-left">
              <FaBook className="sidebar-link-icon" />
              {!isCollapsed && <span className="sidebar-link-text">Books</span>}
            </div>
            {!isCollapsed && (
              <span className="dropdown-arrow">
                {openMenus.books ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
              </span>
            )}
          </div>
          {openMenus.books && !isCollapsed && (
            <div className="submenu-container">
              <NavLink to="/admin/books/add" className="submenu-link">
                <FaPlusCircle size={11} style={{ marginRight: '8px' }} /> Add Book
              </NavLink>
              <NavLink to="/admin/books/list" className="submenu-link">
                <FaListAlt size={11} style={{ marginRight: '8px' }} /> Book List
              </NavLink>
            </div>
          )}
        </div>

        {/* 4. Manage Users Menu (Admin Only) */}
        {isAdmin && (
          <div className="sidebar-menu-item">
            <div 
              className={`sidebar-link dropdown-toggle ${location.pathname.includes('/admin/users') ? 'active-parent' : ''}`} 
              onClick={() => toggleMenu('users')}
            >
              <div className="menu-left">
                <FaUsers className="sidebar-link-icon" />
                {!isCollapsed && <span className="sidebar-link-text">Manage Users</span>}
              </div>
              {!isCollapsed && (
                <span className="dropdown-arrow">
                  {openMenus.users ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
                </span>
              )}
            </div>
            {openMenus.users && !isCollapsed && (
              <div className="submenu-container">
                <NavLink to="/admin/users/students" className="submenu-link">
                  <FaUsers size={11} style={{ marginRight: '8px' }} /> Students
                </NavLink>
                <NavLink to="/admin/users/librarians" className="submenu-link">
                  <FaUserShield size={11} style={{ marginRight: '8px' }} /> Librarians
                </NavLink>
                <NavLink to="/admin/users/add" className="submenu-link">
                  <FaUserPlus size={11} style={{ marginRight: '8px' }} /> Add User
                </NavLink>
              </div>
            )}
          </div>
        )}

        {/* 5. Issued Books Menu with Submenu */}
        <div className="sidebar-menu-item">
          <div 
            className={`sidebar-link dropdown-toggle ${location.pathname.includes('/admin/issues') ? 'active-parent' : ''}`} 
            onClick={() => toggleMenu('issues')}
          >
            <div className="menu-left">
              <FaClipboardList className="sidebar-link-icon" />
              {!isCollapsed && <span className="sidebar-link-text">Issued Books</span>}
            </div>
            {!isCollapsed && (
              <span className="dropdown-arrow">
                {openMenus.issues ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
              </span>
            )}
          </div>
          {openMenus.issues && !isCollapsed && (
            <div className="submenu-container">
              <NavLink to="/admin/issues/borrow" className="submenu-link">Issue a Book</NavLink>
              <NavLink to="/admin/issues/active" className="submenu-link">Active Issues</NavLink>
              <NavLink to="/admin/issues/history" className="submenu-link">History & Returns</NavLink>
            </div>
          )}
        </div>

        {/* 6. Settings Menu */}
        <div className="sidebar-menu-item">
          <div 
            className={`sidebar-link dropdown-toggle ${location.pathname.includes('/admin/settings') ? 'active-parent' : ''}`} 
            onClick={() => toggleMenu('settings')}
          >
            <div className="menu-left">
              <FaCog className="sidebar-link-icon" />
              {!isCollapsed && <span className="sidebar-link-text">Settings</span>}
            </div>
            {!isCollapsed && (
              <span className="dropdown-arrow">
                {openMenus.settings ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
              </span>
            )}
          </div>
          {openMenus.settings && !isCollapsed && (
            <div className="submenu-container">
              <NavLink to="/admin/settings/profile" className="submenu-link">Admin Profile</NavLink>
              <NavLink to="/admin/settings/system" className="submenu-link">System Config</NavLink>
            </div>
          )}
        </div>

      </nav>
    </aside>
  );
};

export default AdminSidebar;