import { useState, useEffect } from 'react';
import { FaSave, FaBuilding, FaRupeeSign, FaShieldAlt } from 'react-icons/fa';
import api, { getErrorMessage } from '../../lib/api';
import '../admin/AdminPages.css';
import './SystemConfig.css';

const SystemConfig = () => {
  const [settings, setSettings] = useState({
    libraryName: 'Central Library Portal',
    maxBooksPerStudent: '3',
    finePerDay: '10',
    allowStudentRegistration: true,
    emailNotifications: true,
    maintenanceMode: false
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');


  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api.get('/admin/config')
      .then(({ data }) => {
        if (!isMounted || !data) return;
        setSettings({
          libraryName: data.libraryName ?? 'Central Library Portal',
          maxBooksPerStudent: String(data.maxBooksPerStudent ?? 3),
          finePerDay: String(data.finePerDay ?? 10),
          allowStudentRegistration: Boolean(data.allowStudentRegistration),
          emailNotifications: Boolean(data.emailNotifications),
          maintenanceMode: Boolean(data.maintenanceMode)
        });
        setError('');
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(getErrorMessage(err, 'Could not load system settings from server.'));
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };


  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setSaving(true);
      const payload = {
        libraryName: settings.libraryName.trim(),
        maxBooksPerStudent: Number(settings.maxBooksPerStudent),
        finePerDay: Number(settings.finePerDay),
        allowStudentRegistration: settings.allowStudentRegistration,
        emailNotifications: settings.emailNotifications,
        maintenanceMode: settings.maintenanceMode
      };

      const { data } = await api.put('/admin/config', payload);


      localStorage.setItem('systemSettings', JSON.stringify(payload));
      setSuccess(data?.message || 'System configurations updated successfully!');
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save system configurations.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="system-config-container">
      {/* Header Banner */}
      <div className="system-config-header">
        <div>
          <h2>System Configuration & Preferences</h2>
          <p>Configure global library rules, borrowing limits, late fines, and system status.</p>
        </div>
      </div>

      {error && (
        <div className="form-error" style={{ marginBottom: '15px' }} role="alert">
          {error}
        </div>
      )}
      {success && <div className="config-success-box">{success}</div>}

      {/* Configuration Form Card */}
      <div className="config-card">
        {loading ? (
          <p style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
            Loading system configurations...
          </p>
        ) : (
          <form onSubmit={handleSaveConfig} className="config-form">
            
            <div className="config-section-title">
              <FaBuilding style={{ marginRight: '8px', color: '#2563eb' }} />
              <h3>General Settings</h3>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Library Portal Name</label>
                <input 
                  type="text" 
                  name="libraryName" 
                  value={settings.libraryName} 
                  onChange={handleChange}
                  className="config-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Max Books Allowed Per Student</label>
                <input 
                  type="number" 
                  name="maxBooksPerStudent" 
                  value={settings.maxBooksPerStudent} 
                  onChange={handleChange}
                  className="config-input"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="config-section-title" style={{ marginTop: '20px' }}>
              <FaRupeeSign style={{ marginRight: '8px', color: '#2563eb' }} />
              <h3>Fine & Overdue Rules</h3>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label>Overdue Fine Rate (per day in ₹)</label>
                <input 
                  type="number" 
                  name="finePerDay" 
                  value={settings.finePerDay} 
                  onChange={handleChange}
                  className="config-input"
                  min="0"
                  required
                />
                <span className="input-hint">
                  Students will be charged ₹{settings.finePerDay} for each day a book is returned late.
                </span>
              </div>
            </div>

            <div className="config-section-title" style={{ marginTop: '20px' }}>
              <FaShieldAlt style={{ marginRight: '8px', color: '#2563eb' }} />
              <h3>Access & Notifications</h3>
            </div>

            <div className="config-checkbox-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="allowStudentRegistration" 
                  checked={settings.allowStudentRegistration} 
                  onChange={handleChange}
                />
                <span>Allow Self-Registration for Students</span>
              </label>

              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="emailNotifications" 
                  checked={settings.emailNotifications} 
                  onChange={handleChange}
                />
                <span>Enable Automated Email Alerts (Due reminders & Fines)</span>
              </label>

              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="maintenanceMode" 
                  checked={settings.maintenanceMode} 
                  onChange={handleChange}
                />
                <span>Enable System Maintenance Mode (Locks user access)</span>
              </label>
            </div>

            <button type="submit" disabled={saving} className="save-config-btn">
              <FaSave style={{ marginRight: '8px' }} /> {saving ? 'Saving...' : 'Save Configurations'}
            </button>

          </form>
        )}
      </div>
    </div>
  );
};

export default SystemConfig;