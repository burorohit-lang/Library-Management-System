import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../../lib/api';
import './AdminPages.css';

const BookCategories = () => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/categories')
      .then(({ data }) => setCategories(data))
      .catch((requestError) => setError(getErrorMessage(requestError, 'Could not load book categories.')));
  }, []);

  return (
    <div className="admin-page">
      <h2>Book Categories</h2>
      <p>Categories are created automatically from book records.</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Category</th><th>Titles</th><th>Total copies</th></tr></thead><tbody>
        {categories.map((category) => <tr key={category.name}><td>{category.name}</td><td>{category.titleCount}</td><td>{category.copies}</td></tr>)}
        {!categories.length && !error && <tr><td colSpan="3">Categories will appear when books are added.</td></tr>}
      </tbody></table></div>
    </div>
  );
};
export default BookCategories;