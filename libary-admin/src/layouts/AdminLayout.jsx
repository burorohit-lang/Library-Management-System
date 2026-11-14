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


  const fetchAdminLayoutData = useCallback(async () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

   
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
  
      <AdminSidebar isCollapsed={isCollapsed} adminData={adminData} />

      <div className="admin-main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
  
        <AdminNavbar toggleSidebar={toggleSidebar} adminData={adminData} />

        <main style={{ padding: '24px', flex: 1 }}>
  
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