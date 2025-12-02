# Adamanti Support - Express.js Backend

Complete Express.js server setup for the Adamanti Support chatbot application.

## 📁 Project Structure

```
support/
├── server/
│   ├── server.js                 # Main Express server
│   ├── .env                      # Backend environment variables
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── models/
│   │   ├── User.js              # User/Lead schema
│   │   └── Conversation.js      # Conversation schema
│   └── routes/
│       ├── chat.js              # Chat & AI endpoints
│       ├── users.js             # User management
│       └── conversations.js     # Conversation history
├── src/                         # Frontend React app
├── package.json
└── .env                         # Frontend environment variables
```

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install express cors dotenv mongoose body-parser
npm install @google/generative-ai
```

### 2. Configure Environment Variables

#### Backend (`server/.env`)
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=mongodb://localhost:27017/adamanti-support
```

#### Frontend (`.env` in root)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Install and Start MongoDB

**Option A: Local MongoDB**
```bash
# Windows (using Chocolatey)
choco install mongodb

# Or download from: https://www.mongodb.com/try/download/community

# Start MongoDB
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `server/.env`

### 4. Update package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "start": "react-scripts start",
    "server": "node server/server.js",
    "dev": "concurrently \"npm start\" \"npm run server\"",
    "build": "react-scripts build"
  }
}
```

Install concurrently for development:
```bash
npm install --save-dev concurrently
```

## 🎯 Running the Application

### Development Mode (Both Frontend & Backend)
```bash
npm run dev
```

### Backend Only
```bash
npm run server
```

### Frontend Only
```bash
npm start
```

## 📡 API Endpoints

### Chat Endpoints
- `POST /api/chat/message` - Send message and get AI response
- `POST /api/chat/stream` - Stream AI response (SSE)

### User Endpoints
- `GET /api/users` - Get all users/leads
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PATCH /api/users/:id` - Update user
- `POST /api/users/:id/issues` - Add issue to user
- `POST /api/users/:id/notes` - Add note to user
- `PATCH /api/users/:id/status` - Update lead status
- `DELETE /api/users/:id` - Delete user

### Conversation Endpoints
- `GET /api/conversations` - Get all conversations
- `GET /api/conversations/:sessionId` - Get conversation by session ID
- `POST /api/conversations` - Create new conversation
- `POST /api/conversations/:sessionId/messages` - Add message to conversation
- `PATCH /api/conversations/:sessionId/status` - Update conversation status
- `DELETE /api/conversations/:sessionId` - Delete conversation

### Health Check
- `GET /api/health` - Check server status
- `GET /` - API information

## 💾 Database Schema

### User Model
```javascript
{
  name: String,
  phone: String (indexed),
  email: String (indexed),
  location: {
    city: String,
    nearestStudio: Enum
  },
  issues: [{
    description: String,
    timestamp: Date
  }],
  leadStatus: Enum,
  preferredCallbackTime: String,
  conversationIds: [ObjectId],
  notes: [{
    text: String,
    createdBy: String,
    timestamp: Date
  }],
  metadata: {
    source: Enum,
    firstContact: Date,
    lastContact: Date
  }
}
```

### Conversation Model
```javascript
{
  sessionId: String (unique, indexed),
  userId: ObjectId (ref: User),
  messages: [{
    text: String,
    isUser: Boolean,
    timestamp: Date
  }],
  status: Enum ['active', 'closed', 'archived'],
  metadata: {
    userAgent: String,
    ipAddress: String,
    language: String
  }
}
```

## 🔧 Features

### Backend Features
- ✅ Express.js REST API
- ✅ MongoDB database with Mongoose ODM
- ✅ Gemini AI integration (server-side)
- ✅ Automatic user detail extraction
- ✅ Conversation history tracking
- ✅ Lead management system
- ✅ CORS enabled for frontend
- ✅ Error handling middleware
- ✅ Request logging
- ✅ SSE streaming support

### Frontend Changes
- ✅ Updated to use backend API endpoints
- ✅ Removed direct Gemini API calls
- ✅ API calls through fetch
- ✅ Session management

## 🧪 Testing the API

### Using curl

**Test Health Check:**
```bash
curl http://localhost:5000/api/health
```

**Send a Chat Message:**
```bash
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"Hello, I need help with my teeth\",\"sessionId\":\"test-session-123\"}"
```

**Get All Users:**
```bash
curl http://localhost:5000/api/users
```

### Using Postman
1. Import the API endpoints
2. Set base URL: `http://localhost:5000/api`
3. Test each endpoint

## 📊 Monitoring

The backend logs important events:
- 🚀 Server startup
- 💬 Message processing
- ✅ User details extraction
- 📋 Database operations
- ❌ Errors

Check the console for real-time logs.

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **API Keys**: Keep Gemini API key secure
3. **CORS**: Configure `CLIENT_URL` for production
4. **MongoDB**: Use authentication in production
5. **Rate Limiting**: Consider adding rate limiting middleware

## 🚀 Production Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-domain.com
GEMINI_API_KEY=your_production_key
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/adamanti-support
```

### Recommended Additions
- Add rate limiting (express-rate-limit)
- Add request validation (express-validator)
- Add authentication/authorization
- Use PM2 for process management
- Set up logging service (Winston, Morgan)
- Add monitoring (New Relic, DataDog)

## 📝 Notes

- The server runs on port 5000 by default
- MongoDB must be running before starting the server
- User details are automatically extracted and saved to the database
- All conversations are persisted
- The frontend has been updated to communicate with the backend API

## 🐛 Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- Server will continue running without DB connectivity

**CORS Error:**
- Verify `CLIENT_URL` in `server/.env`
- Check frontend `REACT_APP_API_URL`

**Port Already in Use:**
- Change `PORT` in `server/.env`
- Or kill the process using port 5000

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Google Gemini API](https://ai.google.dev/)
