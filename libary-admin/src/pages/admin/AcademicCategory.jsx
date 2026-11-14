import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../../lib/api';
import './AdminPages.css';

export default function AcademicCategory({ category }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');


    api.get('/books', { params: { search: category } })
      .then(({ data }) => {
        if (!isMounted) return;
 
        const bookList = Array.isArray(data) ? data : (data.books || []);
        
        const filtered = bookList.filter(
          (book) => book.category && book.category.trim().toLowerCase() === category.trim().toLowerCase()
        );
        setBooks(filtered);
      })
      .catch((requestError) => {
        if (!isMounted) return;
        setError(getErrorMessage(requestError, `Could not load ${category} books.`));
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [category]);

  return (
    <div className="admin-page">
      <h2>{category} Academic Category</h2>
      <p>Books categorized under {category}.</p>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>ISBN</th>
              <th>Available</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                  Loading {category} books...
                </td>
              </tr>
            ) : books.length > 0 ? (
              books.map((book) => (
                <tr key={book._id}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.isbn}</td>
                  <td>{book.availableCopies} / {book.totalCopies}</td>
                </tr>
              ))
            ) : (
              !error && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                    No {category} titles in the collection.
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}