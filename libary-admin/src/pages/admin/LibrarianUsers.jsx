import React, { useState, useEffect } from 'react';
import { FaSearch, FaUserTie, FaTrash, FaEnvelope, FaClock, FaUserCheck } from 'react-icons/fa';
import api, { getErrorMessage } from '../../lib/api';
import './AdminPages.css';
import './LibrarianUsers.css';

const LibrarianUsers = () => {
  const [librarians, setLibrarians] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ডিফল্ট হেড লাইব্রেরিয়ান রেকর্ড (ডেটাবেসে না থাকলেও যেন লিস্টে দেখায়)
  const defaultHeadLibrarian = {
    _id: 'default-head-lib',
    name: 'Default Head Librarian',
    email: 'librarian@library.com',
    shift: 'Morning (09:00 AM - 05:00 PM)',
    joinedDate: '01 Jan 2026',
    status: 'Active',
    isDefault: true
  };

  // MongoDB ব্যাকএন্ড থেকে লাইব্রেরিয়ানদের তালিকা লোড করা
  const fetchLibrarians = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/users/librarians');
      const dbList = Array.isArray(data) ? data : [];

      // ডেটাবেসে ডিফল্ট লাইব্রেরিয়ান না থাকলে শুরুতে যুক্ত করে দেখানো
      const hasDefault = dbList.some((lib) => lib.email === 'librarian@library.com');
      setLibrarians(hasDefault ? dbList : [defaultHeadLibrarian, ...dbList]);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load librarians from server.'));
      setLibrarians([defaultHeadLibrarian]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrarians();
  }, []);

  // MongoDB থেকে লাইব্রেরিয়ান ডিলিট করা
  const handleDeleteLibrarian = async (lib) => {
    if (lib.isDefault || lib.email === 'librarian@library.com') {
      alert('Default Head Librarian account cannot be deleted!');
      return;
    }

    if (!window.confirm(`Are you sure you want to remove "${lib.name}"?`)) return;

    try {
      setError('');
      const libId = lib._id || lib.id;
      await api.delete(`/users/${libId}`);

      setLibrarians(librarians.filter((item) => (item._id || item.id) !== libId));
      setSuccess('Librarian staff member removed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to remove librarian staff member.'));
    }
  };

  // সার্চ ফিল্টার লজিক
  const filteredLibrarians = librarians.filter(
    (lib) =>
      lib.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lib.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="librarian-users-container">
      {/* Header Banner */}
      <div className="librarian-users-header">
        <div>
          <h2>Librarian Staff Members</h2>
          <p>Manage library staff credentials, shift timings, and access permissions.</p>
        </div>
      </div>

      {error && (
        <div className="form-error" style={{ marginBottom: '15px' }} role="alert">
          {error}
        </div>
      )}
      {success && <div className="librarian-success-box">{success}</div>}

      {/* Search Toolbar */}
      <div className="librarian-toolbar">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search librarian by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Librarians Table Card */}
      <div className="librarian-table-card">
        <div className="table-responsive">
          <table className="librarian-table">
            <thead>
              <tr>
                <th>Staff Name</th>
                <th>Email Address (Username)</th>
                <th>Duty Shift</th>
                <th>Joined Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center no-records">
                    Loading librarian staff members...
                  </td>
                </tr>
              ) : filteredLibrarians.length > 0 ? (
                filteredLibrarians.map((lib) => {
                  const isPrimary = lib.isDefault || lib.email === 'librarian@library.com';
                  return (
                    <tr key={lib._id || lib.id}>
                      <td>
                        <div className="librarian-name-cell">
                          <FaUserTie className="table-librarian-icon" />
                          <div>
                            <strong>{lib.name}</strong>
                            {isPrimary && <span className="default-tag">Primary</span>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="librarian-email-cell">
                          <FaEnvelope size={12} style={{ marginRight: '6px', color: '#64748b' }} />
                          {lib.email}
                        </div>
                      </td>
                      <td>
                        <div className="librarian-shift-cell">
                          <FaClock size={12} style={{ marginRight: '6px', color: '#2563eb' }} />
                          {lib.shift}
                        </div>
                      </td>
                      <td>{lib.joinedDate}</td>
                      <td>
                        <span className={`status-badge ${(lib.status || 'Active').toLowerCase()}`}>
                          <FaUserCheck size={11} style={{ marginRight: '4px' }} />
                          {lib.status || 'Active'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className={`action-btn delete ${isPrimary ? 'disabled' : ''}`} 
                          title={isPrimary ? 'Cannot delete primary librarian' : 'Remove Staff'}
                          onClick={() => handleDeleteLibrarian(lib)}
                          disabled={isPrimary}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center no-records">No librarian staff members found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LibrarianUsers;