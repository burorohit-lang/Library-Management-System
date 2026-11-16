import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaPlusCircle,
  FaBook,
  FaUserEdit,
  FaTags,
  FaLayerGroup,
  FaMapMarkerAlt,
  FaSyncAlt,
  FaArrowLeft,
  FaExternalLinkAlt
} from 'react-icons/fa';
import api, { getErrorMessage } from '../../lib/api';

const AddBook = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: '',
    isbn: '',
    location: 'Main Rack',
    totalCopies: 1
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Manual Category Management থেকে অ্যাড করা ক্যাটাগরিগুলো লোড করার ফাংশন
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      setError('');
      // আপনার ব্যাকএন্ডের Category Management রাউট অনুযায়ী মিলিয়ে নেবেন
      const { data } = await api.get('/categories');
      const list = Array.isArray(data)
        ? data
        : data.categories || data.bookCategories || [];

      setCategories(list);

      // যদি ক্যাটাগরি থাকে এবং আগে থেকে কোনোটি সিলেক্ট না থাকে, তবে প্রথমটি ডিফল্ট হিসেবে সেট হবে
      if (list.length > 0) {
        const firstName = typeof list[0] === 'string' ? list[0] : list[0].name || list[0].title || '';
        setFormData((prev) => ({
          ...prev,
          category: prev.category || firstName
        }));
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load categories from Category Management.'));
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.category) {
      setError('Please select a category from Manual Category Management first.');
      return;
    }

    const copies = Number(formData.totalCopies) || 1;
    if (copies < 1) {
      setError('Total copies must be at least 1.');
      return;
    }

    try {
      setSubmitting(true);
      // আপনার ব্যাকএন্ডের বই যোগ করার API পাথ অনুযায়ী মিলিয়ে নেবেন (/books বা /library/books)
      const { data } = await api.post('/books', {
        title: formData.title.trim(),
        author: formData.author.trim(),
        category: formData.category,
        isbn: formData.isbn.trim(),
        location: formData.location.trim() || 'Main Rack',
        totalCopies: copies,
        availableCopies: copies
      });

      setSuccessMsg(data?.message || `"${formData.title}" added to the library inventory!`);

      // ক্যাটাগরি ঠিক রেখে বাকি ফিল্ড রিসেট করা হলো যাতে পরপর বই অ্যাড করা সহজ হয়
      setFormData((prev) => ({
        ...prev,
        title: '',
        author: '',
        isbn: '',
        location: '',
        totalCopies: 1
      }));
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to add new book. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13.5px',
    fontWeight: '600',
    color: '#334155',
    marginBottom: '6px'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 13px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff'
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          padding: '28px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '22px',
            paddingBottom: '16px',
            borderBottom: '1px solid #f1f5f9'
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: '20px',
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: '9px'
              }}
            >
              <FaPlusCircle style={{ color: '#2563eb' }} /> Add New Book to Inventory
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#64748b' }}>
              Select a category managed under Manual Category Management and enter book details
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/admin/books/list')}
            style={{
              backgroundColor: '#f1f5f9',
              color: '#334155',
              border: '1px solid #e2e8f0',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FaArrowLeft size={11} /> View Book List
          </button>
        </div>

        {/* Error & Success Alerts */}
        {error && (
          <div
            style={{
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              padding: '12px 16px',
              borderRadius: '10px',
              fontSize: '13.5px',
              marginBottom: '18px',
              border: '1px solid #fecaca'
            }}
          >
            {error}
          </div>
        )}

        {successMsg && (
          <div
            style={{
              backgroundColor: '#dcfce7',
              color: '#16a34a',
              padding: '12px 16px',
              borderRadius: '10px',
              fontSize: '13.5px',
              marginBottom: '18px',
              border: '1px solid #bbf7d0',
              fontWeight: '500'
            }}
          >
            {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Book Title */}
          <div>
            <label style={labelStyle}>
              <FaBook size={13} style={{ color: '#2563eb' }} /> Book Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Clean Code: A Handbook of Agile Software Craftsmanship"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={inputStyle}
            />
          </div>

          {/* Author & Category Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div>
              <label style={labelStyle}>
                <FaUserEdit size={13} style={{ color: '#2563eb' }} /> Author Name *
              </label>
              <input
                type="text"
                required
                placeholder=""
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                style={inputStyle}
              />
            </div>

            {/* Dynamic Category Dropdown from Manual Category Management */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>
                  <FaTags size={13} style={{ color: '#2563eb' }} /> Book Category *
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={fetchCategories}
                    title="Refresh Categories"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563eb',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: 0
                    }}
                  >
                    <FaSyncAlt size={10} /> Refresh
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/categories/books')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#475569',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: 0
                    }}
                  >
                    + Manage <FaExternalLinkAlt size={9} />
                  </button>
                </div>
              </div>

              <select
                required
                disabled={loadingCategories || categories.length === 0}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{
                  ...inputStyle,
                  cursor: loadingCategories || categories.length === 0 ? 'not-allowed' : 'pointer',
                  backgroundColor: loadingCategories || categories.length === 0 ? '#f8fafc' : '#ffffff'
                }}
              >
                {loadingCategories ? (
                  <option value="">Loading categories...</option>
                ) : categories.length > 0 ? (
                  categories.map((cat, index) => {
                    const catName = typeof cat === 'string' ? cat : cat.name || cat.title;
                    const catId = typeof cat === 'object' && cat._id ? cat._id : index;
                    return (
                      <option key={catId} value={catName}>
                        {catName}
                      </option>
                    );
                  })
                ) : (
                  <option value="">No manual categories added yet</option>
                )}
              </select>

              {!loadingCategories && categories.length === 0 && (
                <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#dc2626' }}>
                  No categories found. Please{' '}
                  <span
                    onClick={() => navigate('/admin/categories/books')}
                    style={{ textDecoration: 'underline', fontWeight: '600', cursor: 'pointer' }}
                  >
                    add a category in Manual Category Management
                  </span>{' '}
                  first.
                </p>
              )}
            </div>
          </div>

          {/* Shelf Location, ISBN & Total Copies Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <div>
              <label style={labelStyle}>
                <FaMapMarkerAlt size={13} style={{ color: '#2563eb' }} /> Shelf Location
              </label>
              <input
                type="text"
                placeholder="e.g., Rack A-2"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>ISBN (Optional)</label>
              <input
                type="text"
                placeholder="e.g., 978-0132350884"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>
                <FaLayerGroup size={13} style={{ color: '#2563eb' }} /> Total Copies *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.totalCopies}
                onChange={(e) => setFormData({ ...formData, totalCopies: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
            <button
              type="button"
              onClick={() => navigate('/admin/books/list')}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || categories.length === 0}
              style={{
                padding: '10px 22px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: submitting || categories.length === 0 ? 'not-allowed' : 'pointer',
                opacity: submitting || categories.length === 0 ? 0.65 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FaPlusCircle size={14} />
              {submitting ? 'Adding Book...' : 'Add Book to Library'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBook;