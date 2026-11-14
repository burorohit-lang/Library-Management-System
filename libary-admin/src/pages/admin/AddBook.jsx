import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBookMedical, FaArrowLeft, FaSave } from 'react-icons/fa';
import api, { getErrorMessage } from '../../lib/api';

const AddBook = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [category, setCategory] = useState('');
  const [totalCopies, setTotalCopies] = useState(1);
  const [shelfLocation, setShelfLocation] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddBook = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim() || !author.trim() || !category.trim()) {
      setError('Book Title, Author Name, and Category are required!');
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post('/books', {
        title: title.trim(),
        author: author.trim(),
        isbn: isbn.trim(),
        category: category.trim(),
        totalCopies: Number(totalCopies) || 1,
        shelfLocation: shelfLocation.trim()
      });

      setSuccess(data?.message || `Book "${title.trim()}" added successfully!`);

      setTitle('');
      setAuthor('');
      setIsbn('');
      setCategory('');
      setTotalCopies(1);
      setShelfLocation('');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to add book to the library catalog.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '920px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header */}
      <div style={{ backgroundColor: '#ffffff', padding: '20px 26px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaBookMedical style={{ color: '#2563eb' }} /> Add New Book
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#64748b' }}>
            Add a new book title, manual category, stock copies, and shelf location to MongoDB.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/admin/books/list')}
          style={{ backgroundColor: '#f1f5f9', color: '#334155', border: 'none', padding: '9px 16px', borderRadius: '8px', fontSize: '13.5px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px' }}
        >
          <FaArrowLeft /> View Book List
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', marginBottom: '18px', fontSize: '13.5px', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '12px 16px', borderRadius: '10px', marginBottom: '18px', fontSize: '13.5px', border: '1px solid #bbf7d0' }}>
          {success}
        </div>
      )}

      {/* Add Book Form Card */}
      <div style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
        <form onSubmit={handleAddBook} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          
          {/* Book Title */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Book Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Clean Code"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          {/* Author Name */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Author Name *
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
              placeholder="e.g. Robert C. Martin"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Category (Manual) *
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              placeholder="e.g. Computer Science, Fiction, History"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          {/* ISBN Number */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              ISBN Number (Optional)
            </label>
            <input
              type="text"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder="e.g. 978-0132350884"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          {/* Total Copies */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Total Copies *
            </label>
            <input
              type="number"
              min="1"
              value={totalCopies}
              onChange={(e) => setTotalCopies(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          {/* Shelf Location */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Shelf / Rack Location
            </label>
            <input
              type="text"
              value={shelfLocation}
              onChange={(e) => setShelfLocation(e.target.value)}
              placeholder="e.g. Shelf A-3"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          {/* Submit Button */}
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '11px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <FaSave /> {loading ? 'Adding Book...' : 'Save Book to Catalog'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default AddBook;