import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import AdminLogin from './components/AdminLogin';
import SystemPromptEditor from './pages/SystemPromptEditor';
import reportWebVitals from './reportWebVitals';

// Simple routing based on pathname
const pathname = window.location.pathname;

const root = ReactDOM.createRoot(document.getElementById('root'));

let component;
if (pathname === '/all-chats') {
  component = <AdminLogin />;
} else if (pathname === '/system-prompt') {
  component = <SystemPromptEditor />;
} else {
  component = <App />;
}

root.render(
  <React.StrictMode>
    {component}
  </React.StrictMode>
);

reportWebVitals();
