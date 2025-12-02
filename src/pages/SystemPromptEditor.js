import React, { useState, useEffect } from 'react';
import './SystemPromptEditor.css';

const SystemPromptEditor = () => {
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Check if already authenticated
    const auth = sessionStorage.getItem('adminAuth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      loadSystemPrompt();
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    // Simple password check (you can enhance this)
    if (password === 'adamanti2024') {
      sessionStorage.setItem('adminAuth', 'true');
      setIsAuthenticated(true);
      loadSystemPrompt();
    } else {
      setMessage({ type: 'error', text: 'Password errata!' });
    }
  };

  const loadSystemPrompt = async () => {
    setIsLoading(true);
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      console.log('🔄 Loading system prompt from:', `${API_URL}/system-prompt`);
      const response = await fetch(`${API_URL}/system-prompt`);
      console.log('📥 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Response data:', data);
      
      if (data.success && data.prompt) {
        console.log('✅ Setting prompt, length:', data.prompt.length);
        setSystemPrompt(data.prompt);
      } else {
        console.error('❌ No prompt in response:', data);
        setMessage({ type: 'error', text: 'Errore nel caricamento del prompt' });
      }
    } catch (error) {
      console.error('❌ Error loading system prompt:', error);
      setMessage({ type: 'error', text: 'Errore di connessione al server' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/system-prompt`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: systemPrompt })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: '✅ System prompt salvato con successo!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: `❌ Errore: ${data.message}` });
      }
    } catch (error) {
      console.error('Error saving system prompt:', error);
      setMessage({ type: 'error', text: '❌ Errore di connessione al server' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div className="system-prompt-editor">
        <div className="login-container">
          <h1>🔒 Autenticazione Richiesta</h1>
          <p>Inserisci la password per accedere all'editor del System Prompt</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="password-input"
              autoFocus
            />
            <button type="submit" className="login-button">
              Accedi
            </button>
          </form>
          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}
          <button onClick={() => window.location.href = '/all-chats'} className="back-button">
            ← Torna alle Chat
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="system-prompt-editor">
        <div className="loading">
          <div className="spinner"></div>
          <p>Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="system-prompt-editor">
      <div className="editor-header">
        <div className="header-left">
          <h1>⚙️ System Prompt Editor</h1>
          <p className="subtitle">Modifica le istruzioni dell'AI Assistant</p>
        </div>
        <div className="header-right">
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
          <button onClick={() => window.location.href = '/all-chats'} className="back-button">
            ← Torna alle Chat
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="editor-container">
        <div className="editor-toolbar">
          <span className="char-count">
            {systemPrompt.length.toLocaleString()} caratteri
          </span>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="save-button"
          >
            {isSaving ? '💾 Salvataggio...' : '💾 Salva Modifiche'}
          </button>
        </div>

        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          className="prompt-textarea"
          placeholder="Scrivi qui il system prompt..."
          disabled={isSaving}
        />

        <div className="editor-footer">
          <div className="info-box">
            <h3>ℹ️ Informazioni</h3>
            <ul>
              <li>Questo prompt viene utilizzato dall'AI per ogni conversazione</li>
              <li>Le modifiche saranno applicate immediatamente dopo il salvataggio</li>
              <li>Supporta Markdown per la formattazione</li>
              <li>Fai attenzione a non rimuovere le istruzioni critiche</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemPromptEditor;
