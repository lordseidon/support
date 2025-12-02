import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import AdminLogin from './components/AdminLogin';
import reportWebVitals from './reportWebVitals';

// Simple routing based on pathname
const pathname = window.location.pathname;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {pathname === '/all-chats' ? <AdminLogin /> : <App />}
  </React.StrictMode>
);

reportWebVitals();
