import { useState, useEffect } from 'react';
import {
  FaUserGraduate,
  FaSearch,
  FaEdit,
  FaTrash,
  FaSyncAlt,
  FaCheckCircle,
  FaBan,
  FaTimes,
  FaSave
} from 'react-icons/fa';

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

const StudentUsers = () => {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Edit Modal State
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    universityRoll: '',
    stream: '',
    semester: '',
    status: 'Active'
  });
  const [saving, setSaving] = useState(false);

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await fetch(`${API_BASE}/users?role=student`, {
        headers: authHeaders()
      });
      const data = await res.json().catch(() => []);

      if (!res.ok) {
        throw new Error(data.message || 'Failed to load registered students.');
      }

      const list = Array.isArray(data) ? data : data.students || data.users || [];
      setStudents(list);
    } catch (err) {
      setError(err.message || 'Could not fetch students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const openEditModal = (student) => {
    setEditingStudent(student);
    setEditForm({
      name: student.name || '',
      email: student.email || '',
      universityRoll: student.universityRoll || student.rollNumber || '',
      stream: student.stream || student.department || '',
      semester: student.semester || '',
      status: student.status || 'Active'
    });
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      setSaving(true);
      setError('');
      setSuccessMsg('');

      const res = await fetch(`${API_BASE}/users/${editingStudent._id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(editForm)
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update student details.');
      }

      setSuccessMsg(data.message || 'Student updated successfully!');
      setEditingStudent(null);
      await fetchStudents();
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      setError(err.message || 'Error updating student.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStudent = async (student) => {
    if (!window.confirm(`Are you sure you want to delete student "${student.name}"?`)) {
      return;
    }

    try {
      setError('');
      const res = await fetch(`${API_BASE}/users/${student._id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete student.');
      }

      setSuccessMsg(`Student "${student.name}" deleted.`);
      await fetchStudents();
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      setError(err.message || 'Error deleting student.');
    }
  };

  const filteredStudents = students.filter((st) => {
    const q = searchQuery.toLowerCase().trim();
    const roll = (st.universityRoll || st.rollNumber || '').toLowerCase();
    const stream = (st.stream || st.department || '').toLowerCase();
    const sem = (st.semester || '').toLowerCase();
    const currentStatus = st.status || 'Active';

    const matchesSearch =
      !q ||
      (st.name || '').toLowerCase().includes(q) ||
      (st.email || '').toLowerCase().includes(q) ||
      roll.includes(q) ||
      stream.includes(q) ||
      sem.includes(q);

    const matchesStatus = statusFilter === 'All' || currentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const inputStyle = {
    width: '100%',
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '13.5px',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff'
  };

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '19px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaUserGraduate style={{ color: '#2563eb' }} /> All Registered Students ({students.length})
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#64748b' }}>
            View student registration profiles, academic details, and activate or deactivate accounts
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <FaSearch style={{ position: 'absolute', left: '11px', color: '#94a3b8', fontSize: '12px' }} />
            <input
              type="text"
              placeholder="Search name, roll, stream, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '8px 12px 8px 32px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', minWidth: '220px' }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#ffffff', color: '#334155', outline: 'none' }}
          >
            <option value="All">All Status</option>
            <option value="Active">Active Only</option>
            <option value="Deactive">Deactive Only</option>
          </select>

          <button
            type="button"
            onClick={fetchStudents}
            style={{ backgroundColor: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0', padding: '8px 13px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <FaSyncAlt size={11} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '11px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13.5px' }}>
          {error}
        </div>
      )}

      {successMsg && (
        <div style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '11px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13.5px', fontWeight: '500' }}>
          {successMsg}
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '12px 14px' }}>Student Name</th>
              <th style={{ padding: '12px 14px' }}>University Roll</th>
              <th style={{ padding: '12px 14px' }}>Email Address</th>
              <th style={{ padding: '12px 14px' }}>Stream / Dept</th>
              <th style={{ padding: '12px 14px' }}>Semester</th>
              <th style={{ padding: '12px 14px' }}>Account Status</th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                  Loading registered students...
                </td>
              </tr>
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((st, idx) => {
                const rollVal = st.universityRoll || st.rollNumber || 'Not Provided';
                const streamVal = st.stream || st.department || 'Not Provided';
                const semVal = st.semester || 'Not Provided';
                const statusVal = st.status || 'Active';
                const isActive = statusVal === 'Active';

                return (
                  <tr key={st._id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '13px 14px', fontWeight: '600', color: '#0f172a' }}>
                      {st.name || 'Unnamed Student'}
                    </td>
                    <td style={{ padding: '13px 14px' }}>
                      <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '4px 9px', borderRadius: '6px', fontSize: '12.5px', fontWeight: '600' }}>
                        {rollVal}
                      </span>
                    </td>
                    <td style={{ padding: '13px 14px', color: '#334155' }}>{st.email || '—'}</td>
                    <td style={{ padding: '13px 14px', color: '#334155', fontWeight: '500' }}>{streamVal}</td>
                    <td style={{ padding: '13px 14px', color: '#334155' }}>{semVal}</td>
                    <td style={{ padding: '13px 14px' }}>
                      {isActive ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                          <FaCheckCircle size={11} /> Active
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                          <FaBan size={11} /> Deactive
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '13px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => openEditModal(st)}
                          title="Edit Student & Status"
                          style={{
                            backgroundColor: '#eff6ff',
                            color: '#2563eb',
                            border: '1px solid #bfdbfe',
                            padding: '6px 11px',
                            borderRadius: '7px',
                            fontSize: '12.5px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <FaEdit size={11} /> Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteStudent(st)}
                          title="Delete Student"
                          style={{
                            backgroundColor: '#fef2f2',
                            color: '#dc2626',
                            border: '1px solid #fecaca',
                            padding: '6px 10px',
                            borderRadius: '7px',
                            fontSize: '12.5px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center'
                          }}
                        >
                          <FaTrash size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" style={{ padding: '26px', textAlign: 'center', color: '#64748b' }}>
                  No registered students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Student Modal (Includes Active / Deactive Toggle) */}
      {editingStudent && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 100
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              padding: '24px',
              boxShadow: '0 20px 35px rgba(15, 23, 42, 0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#0f172a' }}>
                Edit Student Profile & Status
              </h3>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                <FaTimes size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdateStudent} style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '5px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '5px' }}>
                    University Roll *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.universityRoll}
                    onChange={(e) => setEditForm({ ...editForm, universityRoll: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '5px' }}>
                    Account Status *
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    style={{
                      ...inputStyle,
                      fontWeight: '600',
                      color: editForm.status === 'Active' ? '#16a34a' : '#dc2626',
                      borderColor: editForm.status === 'Active' ? '#86efac' : '#fca5a5'
                    }}
                  >
                    <option value="Active">Active</option>
                    <option value="Deactive">Deactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '5px' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '5px' }}>
                    Stream / Department
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., BCA / B.Tech"
                    value={editForm.stream}
                    onChange={(e) => setEditForm({ ...editForm, stream: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '5px' }}>
                    Semester
                  </label>
                  <select
                    value={editForm.semester}
                    onChange={(e) => setEditForm({ ...editForm, semester: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="">Select Semester</option>
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                    <option value="3rd Semester">3rd Semester</option>
                    <option value="4th Semester">4th Semester</option>
                    <option value="5th Semester">5th Semester</option>
                    <option value="6th Semester">6th Semester</option>
                    <option value="7th Semester">7th Semester</option>
                    <option value="8th Semester">8th Semester</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  style={{ padding: '9px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', fontSize: '13.5px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontSize: '13.5px', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <FaSave size={12} /> {saving ? 'Saving...' : 'Save Changes'}
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