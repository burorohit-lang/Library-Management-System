import { useState, useEffect } from 'react';
import { FaSearch, FaCheckCircle, FaExclamationCircle, FaRupeeSign, FaBook, FaUserGraduate } from 'react-icons/fa';
import api, { getErrorMessage } from '../../lib/api';
import '../admin/AdminPages.css';
import './IssueHistory.css';

const IssueHistory = () => {
  const [historyList, setHistoryList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  const FINE_PER_DAY = 10;


  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api.get('/issues/history')
      .then(({ data }) => {
        if (!isMounted) return;
        setHistoryList(Array.isArray(data) ? data : []);
        setError('');
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(getErrorMessage(err, 'Could not load returned books history from server.'));
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);


  const filteredHistory = historyList.filter(
    (item) =>
      item.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.bookTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.isbn?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="issue-history-container">
      {/* Header Banner */}
      <div className="issue-history-header">
        <div>
          <h2>Issue History & Returned Books</h2>
          <p>Complete archive of returned books, late fines calculation (Rs. 10/day), and transaction logs.</p>
        </div>
      </div>

      {error && (
        <div className="form-error" style={{ marginBottom: '15px' }} role="alert">
          {error}
        </div>
      )}

      {/* Search Toolbar */}
      <div className="history-toolbar">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by student name, email, ISBN, or book title..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="history-table-card">
        <div className="table-responsive">
          <table className="history-table">
            <thead>
              <tr>
                <th>Student Details</th>
                <th>Book Title</th>
                <th>Timeline (Issue / Due / Return)</th>
                <th>Status</th>
                <th>Late Fine</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center no-records">
                    Loading issue history from database...
                  </td>
                </tr>
              ) : filteredHistory.length > 0 ? (
                filteredHistory.map((item) => {
                  const overdueDays = item.overdueDays || 0;
                  const calculatedFine = item.fine ?? (overdueDays > 0 ? overdueDays * FINE_PER_DAY : 0);

                  return (
                    <tr key={item._id || item.id}>
                      <td>
                        <div className="student-cell">
                          <FaUserGraduate className="cell-icon" />
                          <div>
                            <strong>{item.studentName}</strong>
                            <span className="sub-text">{item.studentEmail}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="book-cell">
                          <FaBook className="cell-icon" />
                          <div>
                            <strong>{item.bookTitle}</strong>
                            <span className="sub-text">ISBN: {item.isbn || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="timeline-cell">
                          <span><strong>Issued:</strong> {item.issueDate}</span>
                          <span><strong>Due:</strong> {item.dueDate}</span>
                          <span><strong>Returned:</strong> {item.returnDate}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${overdueDays > 0 ? 'late' : 'ontime'}`}>
                          {overdueDays > 0 ? (
                            <>
                              <FaExclamationCircle style={{ marginRight: '4px' }} /> 
                              Late ({overdueDays} days)
                            </>
                          ) : (
                            <>
                              <FaCheckCircle style={{ marginRight: '4px' }} /> 
                              On Time
                            </>
                          )}
                        </span>
                      </td>
                      <td>
                        {calculatedFine > 0 ? (
                          <div className="fine-badge overdue-fine">
                            <FaRupeeSign size={12} /> {calculatedFine} 
                            <span className="fine-sub">({overdueDays}d × ₹10)</span>
                          </div>
                        ) : (
                          <span className="fine-badge no-fine">₹0 (No Fine)</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center no-records">No issue history records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IssueHistory;