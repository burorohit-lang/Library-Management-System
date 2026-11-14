import { useState, useEffect } from 'react';
import { FaFolderPlus, FaTrash, FaLayerGroup, FaTag, FaSearch } from 'react-icons/fa';
import api, { getErrorMessage } from '../../lib/api';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');


  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/categories');
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load categories from server.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);


  const handleAddCategory = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim() || !type.trim()) {
      setError('Both Category Name and Category Type are required!');
      return;
    }

    try {
      setSubmitting(true);
      const { data } = await api.post('/categories', {
        name: name.trim(),
        type: type.trim(),
        description: description.trim()
      });

      setCategories((prev) => [data, ...prev]);
      setSuccess(`Category "${data.name}" (${data.type}) added successfully!`);
      setName('');
      setType('');
      setDescription('');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to add new category.'));
    } finally {
      setSubmitting(false);
    }
  };


  const handleDeleteCategory = async (id, catName) => {
    if (!window.confirm(`Are you sure you want to delete "${catName}"?`)) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((item) => item._id !== id));
      setSuccess(`Category "${catName}" deleted.`);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete category.'));
    }
  };

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1150px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Page Header */}
      <div style={{ backgroundColor: '#ffffff', padding: '22px 26px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaLayerGroup style={{ color: '#2563eb' }} /> Manual Category Management
        </h2>
        <p style={{ margin: '5px 0 0', fontSize: '13.5px', color: '#64748b' }}>
          Create and organize custom book categories and manual category types for the library catalog.
        </p>
      </div>

      {/* Status Messages */}
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

      {/* Add New Category Form (Manual Category Type Input) */}
      <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '26px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
        <h3 style={{ margin: '0 0 18px 0', fontSize: '16.5px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaFolderPlus style={{ color: '#2563eb' }} /> Add New Category
        </h3>

        <form onSubmit={handleAddCategory} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          
          {/* Category Name */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Category Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Computer Science, Fiction"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          {/* Manual Category Type Input (No Dropdown) */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Category Type (Manual) *
            </label>
            <input
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
              placeholder="e.g. Academic, Reference, Journal, Novel"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of this category"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          {/* Submit Button */}
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '10px 22px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <FaFolderPlus /> {submitting ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </form>
      </div>

      {/* Categories Table */}
      <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
          <h3 style={{ margin: 0, fontSize: '16.5px', color: '#0f172a' }}>
            Existing Categories ({filteredCategories.length})
          </h3>

          <div style={{ position: 'relative', width: '270px' }}>
            <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '13px' }} />
            <input
              type="text"
              placeholder="Search category or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', color: '#475569' }}>
                <th style={{ padding: '12px 14px', borderBottom: '1px solid #e2e8f0' }}>Category Name</th>
                <th style={{ padding: '12px 14px', borderBottom: '1px solid #e2e8f0' }}>Category Type</th>
                <th style={{ padding: '12px 14px', borderBottom: '1px solid #e2e8f0' }}>Description</th>
                <th style={{ padding: '12px 14px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    Loading categories...
                  </td>
                </tr>
              ) : filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => (
                  <tr key={cat._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', fontWeight: '600', color: '#0f172a' }}>
                      {cat.name}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <FaTag size={10} /> {cat.type}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#64748b' }}>
                      {cat.description || 'No description provided'}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteCategory(cat._id, cat.name)}
                        style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '7px 12px', borderRadius: '6px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                      >
                        <FaTrash size={11} /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    No categories found. Add your first category above!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default CategoryManagement;