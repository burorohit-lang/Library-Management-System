import { useState } from 'react';
import api, { getErrorMessage } from '../../lib/api';

const emptyBook = { title: '', author: '', isbn: '', category: '', totalCopies: 1 };

export default function BookForm({ initialBook, onSaved, onCancel }) {
  const [book, setBook] = useState(initialBook ? {
    title: initialBook.title,
    author: initialBook.author,
    isbn: initialBook.isbn,
    category: initialBook.category,
    totalCopies: initialBook.totalCopies
  } : emptyBook);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (event) => setBook((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { ...book, totalCopies: Number(book.totalCopies) };
      if (initialBook) {
        await api.patch(`/books/${initialBook._id}`, payload);
      } else {
        await api.post('/books', payload);
      }
      onSaved();
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Could not save this book.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="admin-form" onSubmit={submit}>
      {error && <p className="form-error" role="alert">{error}</p>}
      <label>Book title<input name="title" value={book.title} onChange={update} maxLength="160" required /></label>
      <label>Author<input name="author" value={book.author} onChange={update} maxLength="120" required /></label>
      <div className="admin-form-row">
        <label>ISBN<input name="isbn" value={book.isbn} onChange={update} maxLength="32" required /></label>
        <label>Category<input name="category" value={book.category} onChange={update} maxLength="80" required /></label>
      </div>
      <label>Total copies<input name="totalCopies" type="number" min="1" step="1" value={book.totalCopies} onChange={update} required /></label>
      {initialBook && <p className="form-hint">{initialBook.totalCopies - initialBook.availableCopies} copies are currently on loan.</p>}
      <div className="admin-form-actions">
        {onCancel && <button className="admin-button secondary" type="button" onClick={onCancel}>Cancel</button>}
        <button className="admin-button" type="submit" disabled={saving}>{saving ? 'Saving…' : initialBook ? 'Save changes' : 'Add book'}</button>
      </div>
    </form>
  );
}
