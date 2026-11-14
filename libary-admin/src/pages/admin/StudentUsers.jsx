import { useState, useEffect } from 'react';
import { FaEdit, FaUserCheck, FaUserSlash, FaSearch } from 'react-icons/fa';
import api, { getErrorMessage } from '../../lib/api';
import '../admin/AdminPages.css';

const StudentUsers = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');


  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/users/students');
      setStudents(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load registered students from server.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);


  const handleOpenEdit = (student) => {
    setEditingStudent({
      ...student,
      phone: student.phone || '',
      department: student.department || 'General'
    });
    setShowEditModal(true);
  };


  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      setSaving(true);
      setError('');
      const studentId = editingStudent._id || editingStudent.id;

      const { data } = await api.put(`/users/${studentId}`, {
        name: editingStudent.name,
        email: editingStudent.email,
        phone: editingStudent.phone,
        department: editingStudent.department
      });

      const updatedList = students.map((s) =>
        (s._id || s.id) === studentId ? data : s
      );

      setStudents(updatedList);
      setShowEditModal(false);
      setEditingStudent(null);
      setSuccess('Student details updated successfully in database!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update student details.'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (student) => {
    const studentId = student._id || student.id;
    try {
      setError('');
      const { data } = await api.patch(`/users/${studentId}/status`);

      const updatedList = students.map((s) =>
        (s._id || s.id) === studentId ? data : s
      );

      setStudents(updatedList);
      setSuccess(`Student account is now ${data.status}!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update student status.'));
    }
  };


  const filteredStudents = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.department || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      {/* Top Header Banner */}
      <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div>
          <h2 style={{ margin: '0 0 5px 0', fontSize: '22px', color: '#0f172a', fontWeight: '700' }}>Registered Students Management</h2>
          <p style={{ margin: '0', color: '#64748b', fontSize: '14px' }}>View, edit student details, and toggle Active/Deactive access status.</p>
        </div>
        {/* Search Input */}
        <div style={{ position: 'relative', width: '260px' }}>
          <FaSearch style={{ position: 'absolute', top: '12px', left: '12px', color: '#94a3b8', fontSize: '14px' }} />
          <input 
            type="text" 
            placeholder="Search student..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
          />
        </div>
      </div>

      {error && <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', fontSize: '13px', border: '1px solid #fecaca' }}>{error}</div>}
      {success && <div style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '12px', borderRadius: '8px', fontSize: '13px', border: '1px solid #bbf7d0' }}>{success}</div>}

      {/* Students List Table */}
      <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#0f172a' }}>All Registered Students ({filteredStudents.length})</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', color: '#475569' }}>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Student Name</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Contact Info</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Department</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>Loading registered students...</td>
                </tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student._id || student.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{student.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{student.email}</div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#334155' }}>{student.phone || 'N/A'}</td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>{student.department || 'General'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: '600',
                        backgroundColor: student.status === 'Active' ? '#f0fdf4' : '#fee2e2',
                        color: student.status === 'Active' ? '#16a34a' : '#dc2626',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {student.status === 'Active' ? <FaUserCheck size={11} /> : <FaUserSlash size={11} />}
                        {student.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      {/* Edit Details Button */}
                      <button 
                        onClick={() => handleOpenEdit(student)}
                        style={{ backgroundColor: '#eff6ff', color: '#2563eb', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                        title="Edit Student Details"
                      >
                        <FaEdit /> Edit
                      </button>
                      {/* Toggle Active/Deactive Status Button */}
                      <button 
                        onClick={() => handleToggleStatus(student)}
                        style={{ 
                          backgroundColor: student.status === 'Active' ? '#fef2f2' : '#f0fdf4', 
                          color: student.status === 'Active' ? '#dc2626' : '#16a34a', 
                          border: 'none', 
                          padding: '6px 12px', 
                          borderRadius: '6px', 
                          fontSize: '12px', 
                          fontWeight: '600', 
                          cursor: 'pointer' 
                        }}
                      >
                        {student.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No students found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Student Details Modal */}
      {showEditModal && editingStudent && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', width: '420px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#0f172a' }}>Edit Student Details</h3>
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Full Name</label>
                <input 
                  type="text" 
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  required
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Email Address</label>
                <input 
                  type="email" 
                  value={editingStudent.email}
                  onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                  required
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Phone Number</label>
                <input 
                  type="text" 
                  value={editingStudent.phone}
                  onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Department / Course</label>
                <input 
                  type="text" 
                  value={editingStudent.department}
                  onChange={(e) => setEditingStudent({ ...editingStudent, department: e.target.value })}
                  placeholder="e.g. Computer Science"
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  style={{ backgroundColor: '#e2e8f0', color: '#334155', border: 'none', padding: '9px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '9px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentUsers;