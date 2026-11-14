import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBook, FaPlus, FaSearch, FaTrash } from 'react-icons/fa';
import api, { getErrorMessage } from '../../lib/api';
import './AdminPages.css';

const BookList = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');


  const fetchBooks = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/books');
      setBooks(Array.isArray(data) ? data : (data.books || []));
      setError('');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load books from server.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleDeleteBook = async (bookId, bookTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${bookTitle}"?`)) return;

    try {
      await api.delete(`/books/${bookId}`);
      setBooks(books.filter((b) => b._id !== bookId));
      setSuccess(`"${bookTitle}" has been removed from the catalog.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not delete book.'));
    }
  };


  const filteredBooks = books.filter(
    (book) =>
      book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '22px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaBook style={{ color: '#2563eb' }} /> Library Book Inventory ({books.length})
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Manage all books, check stock availability, and organize shelves.</p>
        </div>

        <button
          onClick={() => navigate('/admin/books/add')}
          style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FaPlus /> Add New Book
        </button>
      </div>

      {success && <div style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>{success}</div>}
      {error && <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>{error}</div>}

      {/* Table Card */}
      <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        {/* Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>All Cataloged Books</h3>
          <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
            <FaSearch style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8', fontSize: '14px' }} />
            <input
              type="text"
              placeholder="Search by title, author, ISBN, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', color: '#475569' }}>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Book Title & Author</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>ISBN</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Category</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Shelf</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Stock (Avail / Total)</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>Loading book inventory...</td>
                </tr>
              ) : filteredBooks.length > 0 ? (
                filteredBooks.map((book) => (
                  <tr key={book._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{book.title}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>by {book.author}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: '#475569' }}>{book.isbn}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '500' }}>
                        {book.category}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#334155' }}>{book.shelfLocation || 'N/A'}</td>
                    <td style={{ padding: '14px 16px', fontWeight: '600' }}>
                      <span style={{ color: book.availableCopies > 0 ? '#16a34a' : '#dc2626' }}>
                        {book.availableCopies}
                      </span>{' '}
                      / {book.totalCopies}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteBook(book._id, book.title)}
                        style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600' }}
                        title="Delete Book"
                      >
                        <FaTrash /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No books found in the inventory.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookList;