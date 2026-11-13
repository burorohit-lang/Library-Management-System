import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaLayerGroup } from 'react-icons/fa';
import api, { getErrorMessage } from '../../lib/api';
import './AdminPages.css';
import './CategoryManagement.css';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryType, setCategoryType] = useState('Academic');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ১. MongoDB থেকে সব ক্যাটাগরি লোড করা
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/categories');
      setCategories(Array.isArray(data) ? data : (data.categories || []));
      setError('');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load categories from server.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ২. নতুন ক্যাটাগরি যোগ করে MongoDB-তে সেভ করা
  const handleAddCategory = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newCategoryName.trim()) {
      setError('Category name cannot be empty!');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: newCategoryName.trim(),
        type: categoryType,
        description: description.trim() || 'No description provided'
      };

      const { data } = await api.post('/categories', payload);
      setCategories([data, ...categories]);

      setSuccess('Category added successfully to database!');
      setNewCategoryName('');
      setDescription('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to add category.'));
    } finally {
      setSubmitting(false);
    }
  };

  // ৩. MongoDB থেকে ক্যাটাগরি ডিলিট করা
  const handleDeleteCategory = async (categoryItem) => {
    const categoryId = categoryItem._id || categoryItem.id;
    if (!window.confirm(`Are you sure you want to delete "${categoryItem.name}"?`)) return;

    try {
      setError('');
      await api.delete(`/categories/${categoryId}`);
      setCategories(categories.filter((cat) => (cat._id || cat.id) !== categoryId));

      setSuccess('Category deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete category.'));
    }
  };

  return (
    <div className="category-management-container">
      {/* Header Section */}
      <div className="category-header">
        <div>
          <h2>Manual Category Management</h2>
          <p>Create and manage available categories (Academic like BCA/BBA & Book Genres) manually.</p>
        </div>
      </div>

      {error && <div className="category-error-box">{error}</div>}
      {success && <div className="category-success-box">{success}</div>}

      <div className="category-content-grid">
        
        {/* Left: Add New Category Form */}
        <div className="category-form-card">
          <h3><FaPlus style={{ marginRight: '8px' }} /> Add New Category</h3>
          <form onSubmit={handleAddCategory} className="cat-form">
            
            <div className="cat-input-group">
              <label>Category Type</label>
              <select 
                value={categoryType} 
                onChange={(e) => setCategoryType(e.target.value)}
                className="cat-select"
              >
                <option value="Academic">Academic System (e.g. BCA, BBA)</option>
                <option value="Book Genre">Book Genre / Subject</option>
              </select>
            </div>

            <div className="cat-input-group">
              <label>Category Name</label>
              <input 
                type="text" 
                value={newCategoryName} 
                onChange={(e) => setNewCategoryName(e.target.value)} 
                placeholder="e.g. Data Structures / BCA Sem 1" 
                required
                className="cat-input"
              />
            </div>

            <div className="cat-input-group">
              <label>Description</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Brief description of this category..." 
                rows="3"
                className="cat-textarea"
              ></textarea>
            </div>

            <button type="submit" disabled={submitting} className="cat-submit-btn">
              <FaPlus /> {submitting ? 'Saving...' : 'Save Category'}
            </button>
          </form>
        </div>

        {/* Right: Available Categories Table / List */}
        <div className="category-list-card">
          <h3><FaLayerGroup style={{ marginRight: '8px' }} /> Available Categories List ({categories.length})</h3>
          
          <div className="cat-table-responsive">
            <table className="cat-table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center">Loading categories...</td>
                  </tr>
                ) : categories.length > 0 ? (
                  categories.map((cat) => (
                    <tr key={cat._id || cat.id}>
                      <td><strong>{cat.name}</strong></td>
                      <td>
                        <span className={`cat-badge ${cat.type?.toLowerCase().includes('academic') ? 'academic' : 'genre'}`}>
                          {cat.type}
                        </span>
                      </td>
                      <td>{cat.description}</td>
                      <td>
                        <button 
                          onClick={() => handleDeleteCategory(cat)} 
                          className="cat-delete-btn"
                          title="Delete Category"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center">No categories available. Add one!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CategoryManagement;