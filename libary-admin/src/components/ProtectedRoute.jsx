
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // লগইন করা না থাকলে লগইন পেজে পাঠাবে
  if (!token || !userRole) {
    return <Navigate to="/login" replace />;
  }

  // নির্দিষ্ট রোলের পারমিশন না থাকলে তার নিজস্ব ড্যাশবোর্ডে পাঠাবে
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (userRole === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (userRole === 'librarian') return <Navigate to="/librarian/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;