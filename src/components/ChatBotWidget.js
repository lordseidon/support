import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatBot from './ChatBot';
import './ChatBot.css';

const ChatBotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="chatbot-widget">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="widget-window"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <ChatBot isWidget={true} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className="widget-button"
        onClick={toggleChat}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? '✕' : '💬'}
      </motion.button>
    </div>
  );
};

export default ChatBotWidget;
