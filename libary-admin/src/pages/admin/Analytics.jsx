import React, { useState, useEffect } from 'react';
import { FaChartLine, FaBookReader, FaExchangeAlt, FaBookmark, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import api, { getErrorMessage } from '../../lib/api';
import '../admin/AdminPages.css';
import './Analytics.css';

const Analytics = () => {
  const [period, setPeriod] = useState('this_month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ডিফল্ট ফলব্যাক ডেটা (MongoDB থেকে ডেটা আসলে আপডেট হয়ে যাবে)
  const [metricsData, setMetricsData] = useState([
    { title: 'Monthly Circulation', value: '0', change: '+0%', isPositive: true, key: 'circulation' },
    { title: 'Active Readers', value: '0', change: '+0%', isPositive: true, key: 'readers' },
    { title: 'Book Return Rate', value: '100%', change: '+0%', isPositive: true, key: 'return' },
    { title: 'Catalog Titles', value: '0', change: '+0%', isPositive: true, key: 'growth' }
  ]);

  const [categoryStats, setCategoryStats] = useState([
    { name: 'Computer Science', percentage: 85, booksCount: '0 Books' },
    { name: 'Business Management', percentage: 70, booksCount: '0 Books' },
    { name: 'Design & Arts', percentage: 60, booksCount: '0 Books' },
    { name: 'Science & Math', percentage: 45, booksCount: '0 Books' }
  ]);

  const [monthlyTrends, setMonthlyTrends] = useState([
    { month: 'Jun', borrowHeight: 40, returnHeight: 35, borrowCount: 0, returnCount: 0 },
    { month: 'Jul', borrowHeight: 55, returnHeight: 50, borrowCount: 0, returnCount: 0 },
    { month: 'Aug', borrowHeight: 45, returnHeight: 40, borrowCount: 0, returnCount: 0 },
    { month: 'Sep', borrowHeight: 70, returnHeight: 65, borrowCount: 0, returnCount: 0 },
    { month: 'Oct', borrowHeight: 60, returnHeight: 55, borrowCount: 0, returnCount: 0 },
    { month: 'Nov', borrowHeight: 80, returnHeight: 75, borrowCount: 0, returnCount: 0 }
  ]);

  // আইকন ম্যাপিং ফাংশন
  const getMetricIcon = (key) => {
    switch (key) {
      case 'circulation':
        return <FaExchangeAlt />;
      case 'readers':
        return <FaBookReader />;
      case 'return':
        return <FaBookmark />;
      default:
        return <FaChartLine />;
    }
  };

  // MongoDB ব্যাকএন্ড থেকে Analytics ডেটা লোড করা
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    api.get('/admin/analytics', { params: { period } })
      .then(({ data }) => {
        if (!isMounted) return;
        if (data.metrics) setMetricsData(data.metrics);
        if (data.categoryStats && data.categoryStats.length > 0) {
          setCategoryStats(data.categoryStats);
        }
        if (data.monthlyTrends && data.monthlyTrends.length > 0) {
          setMonthlyTrends(data.monthlyTrends);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(getErrorMessage(err, 'Could not load live analytics from server.'));
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [period]);

  return (
    <div className="analytics-container">
      {/* Top Header Section */}
      <div className="analytics-header">
        <div>
          <h2>Library Performance Analytics</h2>
          <p>Detailed insights into book utilization, reader engagement, and circulation trends.</p>
        </div>
        <div className="analytics-filter">
          <select
            className="filter-select"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="this_month">This Month</option>
            <option value="last_quarter">Last Quarter</option>
            <option value="this_year">This Year</option>
          </select>
        </div>
      </div>

      {error && <div className="form-error" style={{ marginBottom: '15px' }}>{error}</div>}

      {/* Metrics Grid */}
      <div className="analytics-grid">
        {metricsData.map((item, index) => (
          <div className="analytic-card" key={index}>
            <div className="analytic-card-header">
              <span className="analytic-title">{item.title}</span>
              <div className="analytic-icon">{getMetricIcon(item.key)}</div>
            </div>
            <div className="analytic-card-body">
              <h3 className="analytic-value">{loading ? '...' : item.value}</h3>
              <span className={`analytic-change ${item.isPositive ? 'positive' : 'negative'}`}>
                {item.isPositive ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />} {item.change} vs previous period
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Category Breakdown Section */}
      <div className="analytics-lower-section">
        
        {/* Left: Dynamic Circulation Graph */}
        <div className="analytic-box chart-box">
          <div className="box-header">
            <h3>Book Circulation Trends (2026)</h3>
            <span className="box-subtitle">Borrow vs Return Ratio (Last 6 Months)</span>
          </div>
          <div className="chart-placeholder">
            <div className="chart-bars">
              {monthlyTrends.map((trend, idx) => (
                <div className="bar-group" key={idx} title={`Borrowed: ${trend.borrowCount}, Returned: ${trend.returnCount}`}>
                  <div className="bar borrow" style={{ height: `${trend.borrowHeight}%` }}></div>
                  <div className="bar return" style={{ height: `${trend.returnHeight}%` }}></div>
                  <span>{trend.month}</span>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <span className="legend-item"><span className="dot borrow"></span> Borrowed</span>
              <span className="legend-item"><span className="dot return"></span> Returned</span>
            </div>
          </div>
        </div>

        {/* Right: Popular Categories Progress */}
        <div className="analytic-box category-box">
          <div className="box-header">
            <h3>Top Categories Utilization</h3>
            <span className="box-subtitle">Live stock & borrowing breakdown</span>
          </div>
          <div className="category-progress-list">
            {categoryStats.map((cat, index) => (
              <div className="category-progress-item" key={index}>
                <div className="cat-info">
                  <span className="cat-name">{cat.name}</span>
                  <span className="cat-count">{cat.booksCount}</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${cat.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;