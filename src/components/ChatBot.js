import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { streamResponse } from '../services/geminiService';
import './ChatBot.css';

// Demo responses for when API is not configured
const getDemoResponse = (userMessage) => {
  const msg = userMessage.toLowerCase();
  
  if (msg.includes('hello') || msg.includes('hi')) {
    return "Hello! 👋 I'm your AI assistant. I'm currently running in demo mode. To enable full functionality, please configure your Gemini API key in the .env file.";
  }
  if (msg.includes('help') || msg.includes('capabilities')) {
    return "I can help you with:\n\n✅ **Customer Support** - Answer questions about products and services\n✅ **Information** - Provide detailed explanations\n✅ **Recommendations** - Suggest solutions based on your needs\n✅ **General Conversation** - Chat naturally about any topic\n\n*Configure your Gemini API key to unlock full AI capabilities!*";
  }
  if (msg.includes('product') || msg.includes('buy')) {
    return "I'd love to help you with products! In demo mode, I have limited functionality. Once you connect the Gemini API, I'll be able to:\n\n🛍️ Provide detailed product information\n💡 Give personalized recommendations\n📊 Compare options\n💬 Answer all your questions\n\nWould you like to know how to set up the API?";
  }
  if (msg.includes('setup') || msg.includes('configure') || msg.includes('api')) {
    return "**Setting up the chatbot is easy!**\n\n1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)\n2. Create a `.env` file in your project root\n3. Add: `REACT_APP_GEMINI_API_KEY=your_key_here`\n4. Restart the app with `npm start`\n\nFor Firebase integration, check the SETUP.md file for complete instructions! 🚀";
  }
  
  return `Thanks for your message: "${userMessage}"\n\n🤖 I'm running in **demo mode** right now. I can provide basic responses, but for intelligent AI-powered conversations, please configure your Gemini API key.\n\nType "help" to see what I can do, or "setup" to learn how to enable full functionality!`;
};

const ChatBot = ({ isWidget = false }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const greetingSentRef = useRef(false);

  // Available testimonial images
  const allTestimonials = [
    '01', '02', '03', '04', '05', '06', '07', '08', '09', '10',
    '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
    '21', '22', '23', '24', '25', '26', '27', '28', '29', '30',
    '31', '32', '33'
  ];

  // Get random testimonials
  const getRandomTestimonials = (count = 3) => {
    const shuffled = [...allTestimonials].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  // Send testimonial images as a message
  const sendTestimonialImages = async (count = 3) => {
    const testimonials = getRandomTestimonials(count);
    const imageMessage = {
      id: Date.now(),
      text: '',
      isUser: false,
      timestamp: new Date(),
      images: testimonials
    };
    setMessages(prev => [...prev, imageMessage]);
    
    // Get AI to explain the images
    setTimeout(async () => {
      const aiMessageId = Date.now() + 1;
      const aiMessage = {
        id: aiMessageId,
        text: '',
        isUser: false,
        timestamp: new Date(),
        isStreaming: true
      };
      setMessages(prev => [...prev, aiMessage]);
      
      const result = await streamResponse(
        '[SYSTEM: I just sent more smile transformation images. Please provide a brief, engaging comment about these examples. Focus on understanding their needs rather than pushing for appointments unless they have already shared their issue and you have exchanged several messages.]',
        [],
        (chunkText, fullText) => {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === aiMessageId
                ? { ...msg, text: fullText, isStreaming: true }
                : msg
            )
          );
        }
      );
      
      if (result.success) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMessageId
              ? { ...msg, text: result.text, isStreaming: false }
              : msg
          )
        );
      }
    }, 400);
  };

  useEffect(() => {
    // Auto-focus input on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Show initial greeting with testimonials
    if (!hasGreeted && !greetingSentRef.current) {
      greetingSentRef.current = true;
      
      const greetingMessage = {
        id: Date.now(),
        text: `Hello! 👋 I'm **Adam**, your personal assistant for **Adamanti Smile Studios**. We specialize in transforming smiles with premium care across Tuscany.

Here's what we offer:

**Dental Implants** - Complete smile restoration with advanced techniques

**Ceramic Veneers** - Perfect aesthetic transformations

**Full Arch Reconstruction** - Complete smile makeovers in zirconia

**Smile Design** - Personalized aesthetic improvements

All backed by our **5-year total guarantee!**

What would you like to know more about? Or would you like to find a clinic near you?`,
        isUser: false,
        timestamp: new Date()
      };

      setMessages([greetingMessage]);
      setHasGreeted(true);
      
      // Send testimonial images first
      setTimeout(() => {
        const testimonials = getRandomTestimonials(3);
        const imageMessage = {
          id: Date.now(),
          text: '',
          isUser: false,
          timestamp: new Date(),
          images: testimonials
        };
        setMessages(prev => [...prev, imageMessage]);
        
        // Get AI to explain the images
        setTimeout(async () => {
          const aiMessageId = Date.now() + 1;
          const aiMessage = {
            id: aiMessageId,
            text: '',
            isUser: false,
            timestamp: new Date(),
            isStreaming: true
          };
          setMessages(prev => [...prev, aiMessage]);
          
          const result = await streamResponse(
            '[SYSTEM: I just sent 3 smile transformation images. Please provide a brief, warm explanation about these testimonials. This is the FIRST interaction - do NOT ask for appointments or contact info. Instead, ask an open-ended question to understand what brings them here or what they would like to improve about their smile.]',
            [],
            (chunkText, fullText) => {
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === aiMessageId
                    ? { ...msg, text: fullText, isStreaming: true }
                    : msg
                )
              );
            }
          );
          
          if (result.success) {
            setMessages(prev =>
              prev.map(msg =>
                msg.id === aiMessageId
                  ? { ...msg, text: result.text, isStreaming: false }
                  : msg
              )
            );
          }
        }, 400);
      }, 500);
    }
  }, [hasGreeted]);

  useEffect(() => {
    // Auto-focus input after sending message
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    // Check if user is requesting to see more testimonials/images
    const messageLower = currentInput.toLowerCase();
    const showImagesKeywords = ['image', 'images', 'photo', 'photos', 'testimonial', 'testimonials', 
                                'see more', 'show more', 'before', 'after', 'example', 'examples', 
                                'case', 'cases', 'result', 'results', 'transformation', 'transformations'];
    const requestingImages = showImagesKeywords.some(keyword => messageLower.includes(keyword));

    // Create placeholder for assistant response
    const assistantMessageId = Date.now() + 1;
    const assistantMessage = {
      id: assistantMessageId,
      text: '',
      isUser: false,
      timestamp: new Date(),
      isStreaming: true
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Get conversation history for context
      const conversationHistory = messages.slice(-10);

      // Stream response from Gemini
      console.log('📤 Streaming to Gemini:', currentInput);
      
      const result = await streamResponse(
        currentInput,
        conversationHistory,
        (chunkText, fullText) => {
          // Update message with each chunk
          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessageId
                ? { ...msg, text: fullText, isStreaming: true }
                : msg
            )
          );
        }
      );
      
      console.log('📥 Stream completed:', result);

      if (result.success) {
        console.log('✅ SUCCESS! Final response:', result.text.substring(0, 100));
        
        // Mark streaming as complete
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessageId
              ? { ...msg, text: result.text, isStreaming: false }
              : msg
          )
        );

        // Send new testimonial images as a message if user requested
        if (requestingImages) {
          setTimeout(() => {
            sendTestimonialImages(3);
          }, 300);
        }
      } else {
        console.log('❌ FAILED! Error:', result.error);
        throw new Error(result.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error getting response:', error);
      const errorText = "Sorry, I encountered an error. Please try again.";
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId
            ? { ...msg, text: errorText, isStreaming: false }
            : msg
        )
      );
    }

    setIsLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    // Shift+Enter will create a new line (default textarea behavior)
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
  };

  const suggestions = [
    "How can you help me?",
    "What are your capabilities?",
    "Tell me about your products",
    "I need support"
  ];

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="chatbot-header-inner">
          <h1>
            <span className="chatbot-icon">AI</span>
            Assistant
          </h1>
          <p className="chatbot-subtitle">
            {isDemoMode ? 'Demo Mode' : 'Powered by Gemini AI'}
          </p>
        </div>
      </div>

      <div className="messages-container">
        <div className="messages-wrapper">
        {messages.length === 0 && false ? (
          <div className="empty-state">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="empty-state-icon">💬</div>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Welcome to AI Assistant
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Ask me anything! I'm here to help you with information, answer questions, and provide support.
            </motion.p>
            <motion.div
              className="suggestions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-chip"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </motion.div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`message ${message.isUser ? 'user' : 'assistant'} ${message.images ? 'message-images-only' : ''}`}
              >
                {message.images && message.images.length > 0 ? (
                  <div className="message-images-standalone">
                    <div className="message-images-grid">
                      {message.images.map((num, index) => (
                        <motion.div
                          key={`${num}-${index}`}
                          className="message-image-card"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <img
                            src={require(`../img/Before & After/250330_Prima e Dopo_Luca La Scala_Adamanti_Page_${num}.jpg`)}
                            alt={`Smile transformation ${num}`}
                            className="message-image"
                            loading="lazy"
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="message-avatar">
                      {message.isUser ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" width="18" height="18">
                          <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" width="18" height="18">
                          <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM164.1 325.5C182 346.2 212.6 368 256 368s74-21.8 91.9-42.5c5.8-6.7 15.9-7.4 22.6-1.6s7.4 15.9 1.6 22.6C349.8 372.1 311.1 400 256 400s-93.8-27.9-116.1-53.5c-5.8-6.7-5.1-16.8 1.6-22.6s16.8-5.1 22.6 1.6zM144.4 208a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm192-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/>
                        </svg>
                      )}
                    </div>
                    <div className="message-content">
                      {message.isStreaming && message.text === '' ? (
                        <div className="typing-indicator">
                          <div className="typing-dot"></div>
                          <div className="typing-dot"></div>
                          <div className="typing-dot"></div>
                        </div>
                      ) : (
                        <ReactMarkdown>{message.text}</ReactMarkdown>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="input-container">
        <div className="input-container-inner">
        <div className="input-wrapper">
          <textarea
            ref={inputRef}
            className="message-input"
            placeholder="Type your message... (Shift+Enter for new line)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={1}
            style={{ resize: 'none', overflow: 'hidden' }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
          />
          <button
            className="send-button"
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
          >
            {isLoading ? '...' : '→'}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
