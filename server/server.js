const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/database');
const telegramService = require('./services/telegramService');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '.env') });

// Log environment variables for debugging
console.log('\n🔑 Environment Variables Check:');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Loaded ✅' : 'MISSING ❌');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Loaded ✅' : 'MISSING ❌');
console.log('CLIENT_URL:', process.env.CLIENT_URL || 'Using default');
console.log('TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? 'Loaded ✅' : 'MISSING ❌');
console.log('TELEGRAM_CHAT_ID:', process.env.TELEGRAM_CHAT_ID ? 'Loaded ✅' : 'MISSING ❌');
console.log('');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/chat', require('./routes/chat'));
app.use('/api/users', require('./routes/users'));
app.use('/api/conversations', require('./routes/conversations'));
app.use('/api/system-prompt', require('./routes/systemPrompt'));
app.use('/api/image-prompt', require('./routes/imagePrompt'));
app.use('/api/userinfo', require('./routes/userInfo'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Adamanti Support Server is running',
    timestamp: new Date().toISOString()
  });
});

// Telegram test endpoint
app.post('/api/telegram/test', async (req, res) => {
  try {
    const result = await telegramService.testConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error testing Telegram connection',
      error: error.message
    });
  }
});

// Telegram send test message endpoint
app.post('/api/telegram/send-test', async (req, res) => {
  try {
    const { message } = req.body;
    const success = await telegramService.sendNotification(
      message || '🧪 *Test Message*\n\nThis is a test from your support bot!'
    );
    
    if (success) {
      res.json({
        success: true,
        message: 'Test message sent to Telegram successfully!'
      });
    } else {
      res.json({
        success: false,
        message: 'Failed to send test message. Check server logs.'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending test message',
      error: error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Adamanti Support API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      chat: '/api/chat',
      users: '/api/users',
      conversations: '/api/conversations'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('\n═══════════════════════════════════════════');
  console.log('🚀 ADAMANTI SUPPORT SERVER');
  console.log('═══════════════════════════════════════════');
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Client URL: ${process.env.CLIENT_URL}`);
  console.log('═══════════════════════════════════════════\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n⚠️ SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
