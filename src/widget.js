import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatBotWidget from './components/ChatBotWidget';
import './index.css';

// For standalone widget mode
if (document.getElementById('chatbot-widget-root')) {
  const root = ReactDOM.createRoot(document.getElementById('chatbot-widget-root'));
  root.render(
    <React.StrictMode>
      <ChatBotWidget />
    </React.StrictMode>
  );
}

// Export for external use
export { ChatBotWidget };
