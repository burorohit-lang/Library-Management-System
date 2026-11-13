import { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminNavbar from '../components/admin/AdminNavbar';

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [adminData, setAdminData] = useState({
    name: localStorage.getItem('userName') || 'System Admin',
    email: localStorage.getItem('userEmail') || 'admin@library.com'
  });
  const [dashboardStats, setDashboardStats] = useState({
    totalBooks: 0,
    totalStudents: 0,
    activeIssues: 0,
    totalFines: 0
  });
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // ব্যাকএন্ড (MongoDB) থেকে অ্যাডমিন ও ড্যাশবোর্ড স্ট্যাটাস ফেচ করার ফাংশন
  const fetchAdminLayoutData = useCallback(async () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    // টোকেন না থাকলে বা রোল admin না হলে লগইনে পাঠিয়ে দেবে
    if (!token || role !== 'admin') {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/admin/layout-data', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.data.adminInfo) {
        setAdminData(res.data.adminInfo);
      }
      if (res.data.stats) {
        setDashboardStats(res.data.stats);
      }
    } catch (error) {
      console.error('Error connecting AdminLayout to backend:', error);
      // যদি সার্ভার থেকে 401 Unauthorized আসে তবে লগআউট করে দেবে
      if (error.response && error.response.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchAdminLayoutData();
  }, [fetchAdminLayoutData]);

  return (
    <div className="admin-layout-wrapper" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar-এ অ্যাডমিনের তথ্য পাস করা হলো */}
      <AdminSidebar isCollapsed={isCollapsed} adminData={adminData} />

      <div className="admin-main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        {/* Navbar-এ অ্যাডমিনের তথ্য পাস করা হলো */}
        <AdminNavbar toggleSidebar={toggleSidebar} adminData={adminData} />

        <main style={{ padding: '24px', flex: 1 }}>
          {/* Outlet context-এর মাধ্যমে সব চাইল্ড পেজে (Overview, AddBook, BookList) ব্যাকএন্ড ডেটা ও রিফ্রেশ ফাংশন পাঠানো হলো */}
          <Outlet
            context={{
              adminData,
              dashboardStats,
              loading,
              refreshAdminData: fetchAdminLayoutData
            }}
          />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;