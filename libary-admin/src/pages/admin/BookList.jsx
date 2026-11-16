import { useState, useEffect } from 'react';
import {
  FaBook,
  FaSearch,
  FaEdit,
  FaTrash,
  FaSyncAlt,
  FaTimes,
  FaSave,
  FaCheckCircle
} from 'react-icons/fa';

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Edit Modal State
  const [editingBook, setEditingBook] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    author: '',
    category: '',
    totalCopies: 1,
    availableCopies: 1,
    shelfLocation: ''
  });
  const [saving, setSaving] = useState(false);

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError('');

      // ব্যাকএন্ড থেকে বইয়ের তালিকা আনা
      const res = await fetch(`${API_BASE}/books`, {
        headers: authHeaders()
      });
      const data = await res.json().catch(() => []);

      if (!res.ok) {
        throw new Error(data.message || 'Failed to load book inventory.');
      }

      setBooks(Array.isArray(data) ? data : data.books || []);
    } catch (err) {
      setError(err.message || 'Could not fetch books.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
    // প্রতি ১৫ সেকেন্ড পর পর লাইভ সিঙ্ক
    const interval = setInterval(fetchBooks, 15000);
    return () => clearInterval(interval);
  }, []);

  const openEditModal = (book) => {
    setEditingBook(book);
    setEditForm({
      title: book.title || '',
      author: book.author || '',
      category: book.category || 'General',
      totalCopies: book.totalCopies ?? 1,
      availableCopies: book.availableCopies ?? 1,
      shelfLocation: book.shelfLocation || book.location || ''
    });
  };

  const handleUpdateBook = async (e) => {
    e.preventDefault();
    if (!editingBook) return;

    try {
      setSaving(true);
      setError('');
      setSuccessMsg('');

      const res = await fetch(`${API_BASE}/books/${editingBook._id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(editForm)
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update book inventory.');
      }

      setSuccessMsg(data.message || 'Book updated successfully!');
      setEditingBook(null);
      await fetchBooks(); // লাইভ রিফ্রেশ
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Error updating book.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBook = async (book) => {
    if (!window.confirm(`Are you sure you want to delete "${book.title}"?`)) return;

    try {
      setError('');
      const res = await fetch(`${API_BASE}/books/${book._id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to delete book.');

      setSuccessMsg('Book deleted successfully.');
      await fetchBooks();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Error deleting book.');
    }
  };

  const categories = ['All', ...new Set(books.map((b) => b.category).filter(Boolean))];

  const filteredBooks = books.filter((book) => {
    const q = searchQuery.toLowerCase().trim();
    const shelf = (book.shelfLocation || book.location || '').toLowerCase();
    const matchesSearch =
      !q ||
      book.title?.toLowerCase().includes(q) ||
      book.author?.toLowerCase().includes(q) ||
      book.category?.toLowerCase().includes(q) ||
      shelf.includes(q);

    const matchesCat = categoryFilter === 'All' || book.category === categoryFilter;
    return matchesSearch && matchesCat;
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
      {/* Header & Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '19px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaBook style={{ color: '#16a34a' }} /> Library Book Inventory ({books.length})
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#64748b' }}>
            Manage book stock, total copies, shelf locations, and live updates
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <FaSearch style={{ position: 'absolute', left: '11px', color: '#94a3b8', fontSize: '12px' }} />
            <input
              type="text"
              placeholder="Search title, author, shelf..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '8px 12px 8px 32px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', minWidth: '220px' }}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#ffffff', color: '#334155', outline: 'none' }}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={fetchBooks}
            style={{ backgroundColor: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0', padding: '8px 13px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <FaSyncAlt size={11} /> Refresh Live
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

      {/* Inventory Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '12px 14px' }}>Book Title & Author</th>
              <th style={{ padding: '12px 14px' }}>Category</th>
              <th style={{ padding: '12px 14px' }}>Shelf Location</th>
              <th style={{ padding: '12px 14px' }}>Total Copies</th>
              <th style={{ padding: '12px 14px' }}>Available</th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                  Loading book inventory...
                </td>
              </tr>
            ) : filteredBooks.length > 0 ? (
              filteredBooks.map((book, idx) => (
                <tr key={book._id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '13px 14px' }}>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{book.title}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>by {book.author || 'Unknown'}</div>
                  </td>
                  <td style={{ padding: '13px 14px' }}>
                    <span style={{ backgroundColor: '#f1f5f9', color: '#334155', padding: '4px 9px', borderRadius: '6px', fontSize: '12px', fontWeight: '500' }}>
                      {book.category || 'General'}
                    </span>
                  </td>
                  <td style={{ padding: '13px 14px' }}>
                    <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '4px 9px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                      {book.shelfLocation || book.location || 'Not Assigned'}
                    </span>
                  </td>
                  <td style={{ padding: '13px 14px', fontWeight: '700', color: '#0f172a' }}>
                    {book.totalCopies ?? 1}
                  </td>
                  <td style={{ padding: '13px 14px', fontWeight: '700', color: (book.availableCopies ?? 0) > 0 ? '#16a34a' : '#dc2626' }}>
                    {book.availableCopies ?? 0}
                  </td>
                  <td style={{ padding: '13px 14px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => openEditModal(book)}
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
                        <FaEdit size={11} /> Edit & Extend
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteBook(book)}
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
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ padding: '26px', textAlign: 'center', color: '#64748b' }}>
                  No books found in inventory.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Book Modal (Total Copies Extension) */}
      {editingBook && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 100 }}>
          <div style={{ width: '100%', maxWidth: '440px', backgroundColor: '#ffffff', borderRadius: '14px', padding: '24px', boxShadow: '0 20px 35px rgba(15, 23, 42, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#0f172a' }}>
                Edit Book & Extend Copies
              </h3>
              <button type="button" onClick={() => setEditingBook(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <FaTimes size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdateBook} style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '5px' }}>Book Title *</label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '5px' }}>Author Name</label>
                <input
                  type="text"
                  value={editForm.author}
                  onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '5px' }}>Total Copies *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editForm.totalCopies}
                    onChange={(e) => setEditForm({ ...editForm, totalCopies: parseInt(e.target.value) || 1 })}
                    style={inputStyle}
                  />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Extends inventory stock</span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '5px' }}>Shelf Location</label>
                  <input
                    type="text"
                    placeholder="e.g., Rack 4A"
                    value={editForm.shelfLocation}
                    onChange={(e) => setEditForm({ ...editForm, shelfLocation: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingBook(null)}
                  style={{ padding: '9px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', fontSize: '13.5px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontSize: '13.5px', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <FaSave size={12} /> {saving ? 'Updating...' : 'Save & Sync Live'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookList;