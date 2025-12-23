import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ImagePromptEditor.css';

function ImagePromptEditor() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [backups, setBackups] = useState([]);
  const [showBackups, setShowBackups] = useState(false);

  // Fetch current image prompt
  useEffect(() => {
    fetchPrompt();
    fetchBackups();
  }, []);

  const fetchPrompt = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${API_URL}/image-prompt`);
      if (response.data.success) {
        setPrompt(response.data.content);
      }
    } catch (error) {
      console.error('Error fetching image prompt:', error);
      setMessage({ type: 'error', text: 'Failed to load image prompt' });
    } finally {
      setLoading(false);
    }
  };

  const fetchBackups = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${API_URL}/image-prompt/backups`);
      if (response.data.success) {
        setBackups(response.data.backups);
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await axios.put(`${API_URL}/image-prompt`, {
        content: prompt
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Image prompt updated successfully!' });
        fetchBackups(); // Refresh backup list
        
        // Clear success message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error saving image prompt:', error);
      setMessage({ type: 'error', text: 'Failed to save image prompt' });
    } finally {
      setSaving(false);
    }
  };

  const loadBackup = async (filename) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${API_URL}/image-prompt/backups/${filename}`);
      if (response.data.success) {
        setPrompt(response.data.content);
        setMessage({ type: 'success', text: `Loaded backup: ${filename}` });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error loading backup:', error);
      setMessage({ type: 'error', text: 'Failed to load backup' });
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="prompt-editor-container">
        <div className="loading">Loading image prompt...</div>
      </div>
    );
  }

  return (
    <div className="prompt-editor-container">
      <div className="prompt-editor-header">
        <h1>Image Prompt Editor</h1>
        <p className="subtitle">
          Configure when the AI assistant displays before/after dental transformation images to users
        </p>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="editor-section">
        <label htmlFor="prompt-textarea">Image Decision Prompt</label>
        <textarea
          id="prompt-textarea"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter the prompt that guides Gemini AI in deciding when to show images..."
          rows={20}
        />
        
        <div className="editor-actions">
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="save-btn"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          
          <button 
            onClick={() => setShowBackups(!showBackups)}
            className="backups-btn"
          >
            {showBackups ? 'Hide' : 'Show'} Backups ({backups.length})
          </button>

          <button 
            onClick={fetchPrompt}
            className="reload-btn"
            title="Reload from server"
          >
            Reload
          </button>
        </div>
      </div>

      {showBackups && (
        <div className="backups-section">
          <h2>Version History</h2>
          {backups.length === 0 ? (
            <p className="no-backups">No backup versions available yet</p>
          ) : (
            <div className="backups-list">
              {backups.map((backup) => (
                <div key={backup.filename} className="backup-item">
                  <div className="backup-info">
                    <span className="backup-date">
                      {formatDate(backup.timestamp)}
                    </span>
                    <span className="backup-size">
                      Size: {(backup.size / 1024).toFixed(2)} KB
                    </span>
                  </div>
                  <button
                    onClick={() => loadBackup(backup.filename)}
                    className="restore-btn"
                  >
                    Restore Version
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="help-section">
        <h3>How It Works</h3>
        <ul>
          <li><strong>Purpose:</strong> This prompt determines when the chatbot displays before/after dental images to users</li>
          <li><strong>AI Analysis:</strong> Gemini 2.0 Flash analyzes each user message using this prompt as guidance</li>
          <li><strong>Placeholder:</strong> Use <code>{'{userMessage}'}</code> where the actual user message should be inserted</li>
          <li><strong>Expected Output:</strong> The AI should respond with only "yes" (show images) or "no" (don't show)</li>
          <li><strong>Instant Effect:</strong> Changes are applied immediately after saving - no restart needed</li>
          <li><strong>Safety:</strong> Previous versions are automatically backed up before each save</li>
        </ul>
      </div>
    </div>
  );
}

export default ImagePromptEditor;
