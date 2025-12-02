import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import './AllChats.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AllChats = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, closed
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchConversations();
  }, [filter]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const url = filter === 'all' 
        ? `${API_URL}/conversations?limit=100`
        : `${API_URL}/conversations?status=${filter}&limit=100`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setConversations(data.data);
      } else {
        setError('Failed to load conversations');
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Error loading conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchConversationDetails = async (sessionId) => {
    try {
      const response = await fetch(`${API_URL}/conversations/${sessionId}`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedConversation(data.data);
      }
    } catch (err) {
      console.error('Error fetching conversation details:', err);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMessageCount = (messages) => {
    if (!messages) return 0;
    return messages.length;
  };

  const getUserMessageCount = (messages) => {
    if (!messages) return 0;
    return messages.filter(m => m.isUser).length;
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      conv.sessionId?.toLowerCase().includes(searchLower) ||
      conv.userId?.name?.toLowerCase().includes(searchLower) ||
      conv.userId?.phone?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="all-chats-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="all-chats-container">
      {/* Header */}
      <div className="all-chats-header">
        <div className="header-content">
          <h1>💬 All Conversations</h1>
          <p className="subtitle">View and manage all chatbot conversations</p>
        </div>
        <button className="refresh-btn" onClick={fetchConversations}>
          🔄 Refresh
        </button>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="filter-tabs">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            All ({conversations.length})
          </button>
          <button 
            className={filter === 'active' ? 'active' : ''} 
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button 
            className={filter === 'closed' ? 'active' : ''} 
            onClick={() => setFilter('closed')}
          >
            Closed
          </button>
        </div>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by session ID, name, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="chats-layout">
        {/* Conversations List */}
        <div className="conversations-list">
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          {filteredConversations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No conversations found</h3>
              <p>Conversations will appear here as users interact with the chatbot.</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <motion.div
                key={conv._id}
                className={`conversation-item ${selectedConversation?._id === conv._id ? 'selected' : ''}`}
                onClick={() => fetchConversationDetails(conv.sessionId)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="conv-header">
                  <div className="conv-user">
                    <span className="user-icon">👤</span>
                    <div className="user-info">
                      <h4>{conv.userId?.name || 'Anonymous User'}</h4>
                      {conv.userId?.phone && (
                        <span className="phone">📱 {conv.userId.phone}</span>
                      )}
                    </div>
                  </div>
                  <span className={`status-badge ${conv.status}`}>
                    {conv.status}
                  </span>
                </div>
                
                <div className="conv-stats">
                  <span>💬 {getMessageCount(conv.messages)} messages</span>
                  <span>👤 {getUserMessageCount(conv.messages)} user</span>
                </div>

                <div className="conv-footer">
                  <span className="conv-date">
                    🕐 {formatDate(conv.updatedAt)}
                  </span>
                  <span className="session-id">
                    ID: {conv.sessionId.substring(0, 12)}...
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Conversation Details */}
        <div className="conversation-details">
          {!selectedConversation ? (
            <div className="no-selection">
              <div className="no-selection-icon">💬</div>
              <h3>Select a conversation</h3>
              <p>Click on a conversation from the list to view the full chat history</p>
            </div>
          ) : (
            <motion.div
              className="details-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Conversation Header */}
              <div className="details-header">
                <div className="details-user">
                  <span className="details-user-icon">👤</span>
                  <div>
                    <h2>{selectedConversation.userId?.name || 'Anonymous User'}</h2>
                    {selectedConversation.userId?.phone && (
                      <p>📱 {selectedConversation.userId.phone}</p>
                    )}
                    {selectedConversation.userId?.email && (
                      <p>✉️ {selectedConversation.userId.email}</p>
                    )}
                  </div>
                </div>
                <div className="details-meta">
                  <span className={`status-badge ${selectedConversation.status}`}>
                    {selectedConversation.status}
                  </span>
                  <p className="session-id-full">
                    Session: {selectedConversation.sessionId}
                  </p>
                  <p className="conv-dates">
                    Started: {formatDate(selectedConversation.createdAt)}<br/>
                    Last activity: {formatDate(selectedConversation.updatedAt)}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="messages-container">
                <h3>Conversation History ({selectedConversation.messages.length} messages)</h3>
                <div className="messages-list">
                  {selectedConversation.messages.map((message, index) => (
                    <motion.div
                      key={index}
                      className={`chat-message ${message.isUser ? 'user' : 'bot'}`}
                      initial={{ opacity: 0, x: message.isUser ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="message-avatar">
                        {message.isUser ? '👤' : '🤖'}
                      </div>
                      <div className="message-content">
                        <div className="message-header">
                          <span className="message-sender">
                            {message.isUser ? 'User' : 'Adam AI'}
                          </span>
                          <span className="message-time">
                            {formatDate(message.timestamp)}
                          </span>
                        </div>
                        <div className="message-text">
                          <ReactMarkdown>{message.text}</ReactMarkdown>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* User Details (if available) */}
              {selectedConversation.userId && (
                <div className="user-details-section">
                  <h3>User Information</h3>
                  <div className="user-details-grid">
                    {selectedConversation.userId.name && (
                      <div className="detail-item">
                        <span className="detail-label">Name:</span>
                        <span className="detail-value">{selectedConversation.userId.name}</span>
                      </div>
                    )}
                    {selectedConversation.userId.phone && (
                      <div className="detail-item">
                        <span className="detail-label">Phone:</span>
                        <span className="detail-value">{selectedConversation.userId.phone}</span>
                      </div>
                    )}
                    {selectedConversation.userId.email && (
                      <div className="detail-item">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">{selectedConversation.userId.email}</span>
                      </div>
                    )}
                    {selectedConversation.userId.location?.city && (
                      <div className="detail-item">
                        <span className="detail-label">Location:</span>
                        <span className="detail-value">{selectedConversation.userId.location.city}</span>
                      </div>
                    )}
                    {selectedConversation.userId.leadStatus && (
                      <div className="detail-item">
                        <span className="detail-label">Lead Status:</span>
                        <span className={`status-badge ${selectedConversation.userId.leadStatus}`}>
                          {selectedConversation.userId.leadStatus}
                        </span>
                      </div>
                    )}
                    {selectedConversation.userId.issues && selectedConversation.userId.issues.length > 0 && (
                      <div className="detail-item full-width">
                        <span className="detail-label">Issues:</span>
                        <div className="issues-list">
                          {selectedConversation.userId.issues.map((issue, idx) => (
                            <div key={idx} className="issue-item">
                              <span>{issue.description}</span>
                              <span className="issue-date">{formatDate(issue.timestamp)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllChats;
