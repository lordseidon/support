import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ChatBot from './components/ChatBot';
import UserInfoPage from './pages/UserInfoPage';
import AllChats from './pages/AllChats';
import SystemPromptEditor from './pages/SystemPromptEditor';
import AdminLogin from './components/AdminLogin';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<ChatBot />} />
          <Route path="/chat/:sessionId" element={<ChatBot />} />
          <Route path="/user-info" element={<UserInfoPage />} />
          <Route path="/all-chats" element={<AllChats />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/system-prompt" element={<SystemPromptEditor />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
