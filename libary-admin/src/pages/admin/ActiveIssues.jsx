import React, { useState, useEffect } from 'react';
import { FaPlus, FaClock, FaEdit, FaCheckDouble, FaExclamationCircle } from 'react-icons/fa';
import api, { getErrorMessage } from '../../lib/api';
import '../admin/AdminPages.css';

const ActiveIssues = () => {
  const [activeBorrows, setActiveBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal States for Issue Book
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modal States for Edit / Extend Due Date
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [newDueDate, setNewDueDate] = useState('');

  const [success, setSuccess] = useState('');


  const fetchActiveIssues = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/issues/active');
      setActiveBorrows(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load active book issues from server.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveIssues();
  }, []);


  const handleIssueBook = async (e) => {
    e.preventDefault();
    if (!studentName || !bookTitle || !issueDate || !dueDate) return;

    try {
      setSubmitting(true);
      setError('');
      const payload = {
        studentName,
        studentEmail: studentEmail || `${studentName.toLowerCase().replace(/\s+/g, '')}@student.com`,
        bookTitle,
        issueDate,
        dueDate
      };

      const { data } = await api.post('/issues', payload);
      setActiveBorrows([data, ...activeBorrows]);

    
      setStudentName('');
      setStudentEmail('');
      setBookTitle('');
      setIssueDate('');
      setDueDate('');
      setShowIssueModal(false);

      setSuccess('Book successfully issued and saved to database!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to issue book.'));
    } finally {
      setSubmitting(false);
    }
  };


  const openEditModal = (record) => {
    setEditingRecord(record);
    setNewDueDate(record.dueDate);
    setShowEditModal(true);
  };


  const handleUpdateDueDate = async (e) => {
    e.preventDefault();
    if (!newDueDate || !editingRecord) return;

    try {
      setSubmitting(true);
      const recordId = editingRecord._id || editingRecord.id;
      const { data } = await api.patch(`/issues/${recordId}/extend`, { dueDate: newDueDate });

      const updatedList = activeBorrows.map((item) =>
        (item._id || item.id) === recordId ? data : item
      );

      setActiveBorrows(updatedList);
      setShowEditModal(false);
      setEditingRecord(null);
      setSuccess('Due date successfully extended in database!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to extend due date.'));
    } finally {
      setSubmitting(false);
    }
  };


  const handleReturnBook = async (record) => {
    const recordId = record._id || record.id;
    try {
      const { data } = await api.patch(`/issues/${recordId}/return`);
      setActiveBorrows(activeBorrows.filter((item) => (item._id || item.id) !== recordId));
      
      const fineMsg = data.fine > 0 ? ` (Late Fine: ₹${data.fine})` : '';
      setSuccess(`Book "${record.bookTitle}" marked as returned!${fineMsg}`);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to return book.'));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      {/* Top Header Banner */}
      <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div>
          <h2 style={{ margin: '0 0 5px 0', fontSize: '22px', color: '#0f172a', fontWeight: '700' }}>Student Book Borrowings & Active Issues</h2>
          <p style={{ margin: '0', color: '#64748b', fontSize: '14px' }}>Monitor borrowed books, issue with calendar dates, extend due dates, and process returns.</p>
        </div>
        <button 
          onClick={() => setShowIssueModal(true)} 
          style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FaPlus /> Issue New Book
        </button>
      </div>

      {success && <div style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '12px', borderRadius: '8px', fontSize: '13px', border: '1px solid #bbf7d0' }}>{success}</div>}
      {error && <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', fontSize: '13px', border: '1px solid #fecaca' }}>{error}</div>}

      {/* Active Borrow List Table */}
      <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#0f172a' }}>Currently Borrowed Books ({activeBorrows.length})</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', color: '#475569' }}>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Student Name</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Book Title</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Date of Issue</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Date of Due</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>Loading active issues...</td>
                </tr>
              ) : activeBorrows.length > 0 ? (
                activeBorrows.map((item) => (
                  <tr key={item._id || item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{item.studentName}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{item.studentEmail}</div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#334155', fontWeight: '500' }}>{item.bookTitle}</td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>{item.issueDate}</td>
                    <td style={{ padding: '14px 16px', color: '#64748b', fontWeight: '600' }}>{item.dueDate}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: '600',
                        backgroundColor: item.status === 'Active' ? '#fff7ed' : '#fee2e2',
                        color: item.status === 'Active' ? '#ea580c' : '#dc2626',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {item.status === 'Active' ? <FaClock size={10} /> : <FaExclamationCircle size={10} />}
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button 
                        onClick={() => openEditModal(item)}
                        style={{ backgroundColor: '#eff6ff', color: '#2563eb', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                        title="Extend Due Date"
                      >
                        <FaEdit /> Extend
                      </button>
                      <button 
                        onClick={() => handleReturnBook(item)}
                        style={{ backgroundColor: '#f0fdf4', color: '#16a34a', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                        title="Mark Book as Returned"
                      >
                        <FaCheckDouble /> Return
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No active borrowed books found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue Book Modal Popup */}
      {showIssueModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', width: '420px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#0f172a' }}>Issue Book with Calendar Dates</h3>
            <form onSubmit={handleIssueBook} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Student Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. David Miller" 
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Student Email</label>
                <input 
                  type="email" 
                  placeholder="e.g. david@student.com" 
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  required
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Book Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Full-Stack Web Dev" 
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  required
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Date of Issue</label>
                <input 
                  type="date" 
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  required
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Date of Due (Return Deadline)</label>
                <input 
                  type="date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowIssueModal(false)}
                  style={{ backgroundColor: '#e2e8f0', color: '#334155', border: 'none', padding: '9px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '9px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                >
                  {submitting ? 'Saving...' : 'Confirm Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit / Extend Due Date Modal Popup */}
      {showEditModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', width: '400px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#0f172a' }}>Extend Due Date</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748b' }}>
              Student: <strong>{editingRecord?.studentName}</strong> <br/>
              Book: <strong>{editingRecord?.bookTitle}</strong>
            </p>
            <form onSubmit={handleUpdateDueDate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>New Due Date</label>
                <input 
                  type="date" 
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  required
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
                  disabled={submitting}
                  style={{ backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '9px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                >
                  {submitting ? 'Updating...' : 'Save New Date'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveIssues;