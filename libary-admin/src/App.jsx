import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import api from './lib/api';
import Login from './pages/login/Login';
import Register from './pages/Register/Register';
import ForgotPassword from './pages/password/ForgotPassword';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Admin Submenu Pages
import Overview from './pages/admin/Overview';
import Analytics from './pages/admin/Analytics';
import CategoryManagement from './pages/admin/CategoryManagement';
import AddBook from './pages/admin/AddBook';
import BookList from './pages/admin/BookList';
import StudentUsers from './pages/admin/StudentUsers';
import LibrarianUsers from './pages/admin/LibrarianUsers';
import AddUser from './pages/admin/AddUser';
import ActiveIssues from './pages/admin/ActiveIssues';
import IssueHistory from './pages/admin/IssueHistory';
import AdminProfile from './pages/admin/AdminProfile';
import SystemConfig from './pages/admin/SystemConfig';

// Librarian Portal Pages
import LibrarianDashboard from './pages/librarian/LibrarianDashboard';
import LibrarianIssueBook from './pages/librarian/LibrarianIssueBook';
import BookListLibrarian from './pages/admin/BookList';
import IssueHistoryLibrarian from './pages/admin/IssueHistory';

// Student Portal Page
import StudentDashboard from './pages/student/StudentDashboard';

function App() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const currentRole = localStorage.getItem('role');


  useEffect(() => {
    const checkBackendSession = async () => {
      try {
        const { data } = await api.get('/auth/verify-session');
        if (data?.maintenanceMode) {
          setMaintenanceMode(true);
        }

        if (localStorage.getItem('token') && data?.authenticated === false) {
          localStorage.clear();
        }
      } catch (error) {
        console.error('Session verification failed:', error);
      }
    };

    checkBackendSession();
  }, []);

  if (maintenanceMode && currentRole !== 'admin' && window.location.pathname !== '/login') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '14px', border: '1px solid #e2e8f0', maxWidth: '460px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#dc2626', margin: '0 0 10px 0' }}>System Under Maintenance</h2>
          <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>
            The Digital Library Portal is currently undergoing scheduled maintenance by the Administrator. Please check back shortly.
          </p>
          <button
            onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
            style={{ marginTop: '18px', backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register-student" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Admin Protected Nested Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Overview />} />
            <Route path="dashboard/analytics" element={<Analytics />} />
            
            {/* Manual Categories Routes */}
            <Route path="categories/books" element={<CategoryManagement />} />

            <Route path="books/add" element={<AddBook />} />
            <Route path="books/list" element={<BookList />} />
            <Route path="users/students" element={<StudentUsers />} />
            <Route path="users/librarians" element={<LibrarianUsers />} />
            <Route path="users/add" element={<AddUser />} />
            
            {/* Issued Books & Student Borrowing Routes */}
            <Route path="issues/borrow" element={<ActiveIssues />} />
            <Route path="issues/active" element={<ActiveIssues />} />
            <Route path="issues/history" element={<IssueHistory />} />

            <Route path="settings/profile" element={<AdminProfile />} />
            <Route path="settings/system" element={<SystemConfig />} />
          </Route>
        </Route>

        {/* Librarian Protected Portal Routes */}
        <Route element={<ProtectedRoute allowedRoles={['librarian', 'admin']} />}>
          <Route path="/librarian/dashboard" element={<LibrarianDashboard />} />
          <Route path="/librarian/issue-book" element={<LibrarianIssueBook />} />
          <Route path="/librarian/active-checkouts" element={<LibrarianIssueBook />} />
          <Route path="/librarian/inventory" element={<BookListLibrarian />} />
          <Route path="/librarian/fines" element={<IssueHistoryLibrarian />} />
        </Route>

        {/* Student Protected Portal Routes */}
        <Route element={<ProtectedRoute allowedRoles={['student', 'admin']} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;