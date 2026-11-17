import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaBook,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaSyncAlt,
  FaHandPointUp
} from 'react-icons/fa';

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

const LibraryCatalog = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE}/library/student/dashboard`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load library catalog.');
      }

      setBooks(Array.isArray(data?.availableBooks) ? data.availableBooks : []);
    } catch (err) {
      setError(err.message || 'Could not load books.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
    // প্রতি ১৫ সেকেন্ড পর পর লাইভ সিঙ্ক
    const interval = setInterval(fetchCatalog, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleRequestBook = async (book) => {
    try {
      setRequestingId(book._id);
      setError('');
      setSuccessMsg('');
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE}/library/student/request-book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          bookId: book._id,
          bookTitle: book.title
        })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || 'Could not submit book request.');
      }

      setSuccessMsg(data.message || `Issue request sent for "${book.title}"!`);
      await fetchCatalog(); // লাইভ আপডেট সিঙ্ক
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to request book.');
    } finally {
      setRequestingId(null);
    }
  };

  const categories = ['All', ...new Set(books.map((b) => b.category).filter(Boolean))];

  const filteredBooks = books.filter((book) => {
    const q = searchQuery.toLowerCase();
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

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)' }}>
      {/* Top Back & Refresh Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '10px' }}>
        <button
          type="button"
          onClick={() => navigate('/student/dashboard')}
          style={{
            backgroundColor: '#eff6ff',
            color: '#2563eb',
            border: '1px solid #bfdbfe',
            padding: '8px 15px',
            borderRadius: '8px',
            fontSize: '13.5px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px'
          }}
        >
          <FaArrowLeft size={12} /> Back to Dashboard
        </button>

        <button
          type="button"
          onClick={fetchCatalog}
          style={{
            backgroundColor: '#f8fafc',
            color: '#334155',
            border: '1px solid #e2e8f0',
            padding: '8px 13px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <FaSyncAlt size={11} /> Refresh Catalog
        </button>
      </div>

      {/* Header & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '19px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaBook style={{ color: '#16a34a' }} /> Library Book Catalog ({filteredBooks.length})
          </h2>
          <p style={{ margin: '5px 0 0', fontSize: '13.5px', color: '#64748b' }}>
            Browse available books, check shelf locations, and request book issues
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <FaSearch style={{ position: 'absolute', left: '12px', color: '#94a3b8', fontSize: '13px' }} />
            <input
              type="text"
              placeholder="Search title, author, shelf..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '9px 12px 9px 34px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13.5px',
                outline: 'none',
                minWidth: '220px'
              }}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13.5px',
              backgroundColor: '#ffffff',
              color: '#334155',
              outline: 'none'
            }}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13.5px' }}>
          {error}
        </div>
      )}

      {successMsg && (
        <div style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13.5px', fontWeight: '500' }}>
          {successMsg}
        </div>
      )}

      {/* Catalog Table (Total Copies hidden, only Availability shown) */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '12px 14px' }}>Book Title & Author</th>
              <th style={{ padding: '12px 14px' }}>Category</th>
              <th style={{ padding: '12px 14px' }}>Shelf Location</th>
              <th style={{ padding: '12px 14px' }}>Availability Status</th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                  Loading library books...
                </td>
              </tr>
            ) : filteredBooks.length > 0 ? (
              filteredBooks.map((book, idx) => {
                const isAvailable = (book.availableCopies ?? 0) > 0;
                const shelf = book.shelfLocation || book.location;
                return (
                  <tr key={book._id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '13px 14px' }}>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{book.title}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>by {book.author || 'Unknown'}</div>
                    </td>
                    <td style={{ padding: '13px 14px' }}>
                      <span style={{ backgroundColor: '#f1f5f9', color: '#334155', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '500' }}>
                        {book.category || 'General'}
                      </span>
                    </td>
                    <td style={{ padding: '13px 14px' }}>
                      <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                        {shelf || 'Not Assigned'}
                      </span>
                    </td>
                    <td style={{ padding: '13px 14px' }}>
                      {isAvailable ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                          <FaCheckCircle size={11} /> Available
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                          <FaTimesCircle size={11} /> Out of Stock
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '13px 14px', textAlign: 'right' }}>
                      <button
                        type="button"
                        disabled={!isAvailable || requestingId === book._id}
                        onClick={() => handleRequestBook(book)}
                        style={{
                          backgroundColor: isAvailable ? '#2563eb' : '#cbd5e1',
                          color: '#ffffff',
                          border: 'none',
                          padding: '7px 13px',
                          borderRadius: '7px',
                          fontSize: '12.5px',
                          fontWeight: '600',
                          cursor: isAvailable ? 'pointer' : 'not-allowed',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <FaHandPointUp size={11} />
                        {requestingId === book._id ? 'Requesting...' : 'Request Book'}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" style={{ padding: '28px', textAlign: 'center', color: '#64748b' }}>
                  No books found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LibraryCatalog;