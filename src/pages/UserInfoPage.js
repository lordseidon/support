import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserInfoPage.css';

const UserInfoPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:5000/api/userinfo');
      
      if (response.data.success) {
        setUsers(response.data.users);
      } else {
        setError('Failed to load user information. Server returned an error.');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        setError('Cannot connect to server. Please make sure the server is running on port 5000.');
      } else if (err.response) {
        setError(`Server error: ${err.response.data?.message || err.response.statusText}`);
      } else {
        setError('Failed to load user information. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (user.address?.toLowerCase().includes(searchTerm.toLowerCase()) || '');
    
    const matchesFilter = 
      filterStatus === 'all' || 
      user.leadStatus === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify(users, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `user-info-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <div className="uip-container">
        <div className="uip-loading">
          <div className="uip-spinner"></div>
          <p>Loading user information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="uip-container">
        <div className="uip-error">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={fetchUsers} className="uip-retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="uip-container">
      <div className="uip-header">
        <h1 className="uip-title">User Information Dashboard</h1>
        <p className="uip-subtitle">View and manage collected user data</p>
      </div>

      <div className="uip-controls">
        <div className="uip-search-box">
          <input
            type="text"
            placeholder="Search by name, phone, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="uip-search-input"
          />
        </div>

        <div className="uip-filter-box">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="uip-filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="appointment_scheduled">Appointment Scheduled</option>
            <option value="converted">Converted</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <button onClick={exportToJSON} className="uip-export-btn">
          Export to JSON
        </button>

        <button onClick={fetchUsers} className="uip-refresh-btn">
          Refresh
        </button>
      </div>

      <div className="uip-stats">
        <div className="uip-stat-card">
          <h3>Total Users</h3>
          <p className="uip-stat-number">{users.length}</p>
        </div>
        <div className="uip-stat-card">
          <h3>Filtered Results</h3>
          <p className="uip-stat-number">{filteredUsers.length}</p>
        </div>
        <div className="uip-stat-card">
          <h3>New Leads</h3>
          <p className="uip-stat-number">
            {users.filter(u => u.leadStatus === 'new').length}
          </p>
        </div>
        <div className="uip-stat-card">
          <h3>Converted</h3>
          <p className="uip-stat-number">
            {users.filter(u => u.leadStatus === 'converted').length}
          </p>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="uip-no-data">
          <p>No user information found.</p>
        </div>
      ) : (
        <div className="uip-table-container">
          <table className="uip-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Phone Message</th>
                <th>Address</th>
                <th>Email</th>
                <th>Status</th>
                <th>First Contact</th>
                <th>Last Contact</th>
                <th>Issues</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="uip-table-row">
                  <td className="uip-cell-name">
                    {user.name || <span className="uip-na">N/A</span>}
                  </td>
                  <td className="uip-cell-phone">
                    {user.phone || <span className="uip-na">N/A</span>}
                  </td>
                  <td className="uip-cell-message">
                    {user.phoneMessage ? (
                      <div className="uip-message-preview" title={user.phoneMessage}>
                        {user.phoneMessage.length > 50 
                          ? user.phoneMessage.substring(0, 50) + '...' 
                          : user.phoneMessage}
                      </div>
                    ) : (
                      <span className="uip-na">N/A</span>
                    )}
                  </td>
                  <td className="uip-cell-address">
                    {user.address || <span className="uip-na">N/A</span>}
                  </td>
                  <td className="uip-cell-email">
                    {user.email || <span className="uip-na">N/A</span>}
                  </td>
                  <td>
                    <span className={`uip-status-badge uip-status-${user.leadStatus}`}>
                      {user.leadStatus?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="uip-cell-date">
                    {formatDate(user.metadata?.firstContact)}
                  </td>
                  <td className="uip-cell-date">
                    {formatDate(user.metadata?.lastContact)}
                  </td>
                  <td className="uip-cell-issues">
                    {user.issues && user.issues.length > 0 ? (
                      <details className="uip-issues-details">
                        <summary>{user.issues.length} issue(s)</summary>
                        <ul className="uip-issues-list">
                          {user.issues.map((issue, idx) => (
                            <li key={idx}>
                              <strong>{formatDate(issue.timestamp)}:</strong>{' '}
                              {issue.description}
                            </li>
                          ))}
                        </ul>
                      </details>
                    ) : (
                      <span className="uip-na">None</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserInfoPage;
