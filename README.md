# 🤖 AI Chatbot - React + Firebase + Gemini AI

A modern, high-performance chatbot application with ChatGPT-like capabilities, built with React.js, Firebase, and Google's Gemini AI. Features a sleek, animated UI and easy Shopify integration.

![Chatbot Demo](https://img.shields.io/badge/React-19.2.0-blue) ![Firebase](https://img.shields.io/badge/Firebase-10.13-orange) ![Gemini](https://img.shields.io/badge/Gemini-AI-green)

## ✨ Key Features

- 💬 **Real-time Streaming**: ChatGPT-like response streaming
- 🎨 **Modern UI**: Gradient design with smooth Framer Motion animations
- 💾 **Persistent History**: Firebase Firestore for chat storage
- 📱 **Fully Responsive**: Optimized for mobile and desktop
- 🔌 **Easy Integration**: Widget mode for Shopify websites
- 🎯 **Smart Context**: Maintains conversation history
- ⚡ **High Performance**: Optimized rendering and lazy loading

## 🚀 Quick Start

### Prerequisites

You need Node.js installed. If you don't have it:
1. Download from [nodejs.org](https://nodejs.org/)
2. Install and restart your terminal

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your API keys
# Then start the app
npm start
```

## 📖 Full Setup Guide

See [SETUP.md](./SETUP.md) for detailed instructions including:
- Firebase configuration
- Gemini API setup
- Shopify integration steps
- Customization options
- Troubleshooting guide

## 🎯 Usage

### Standalone App
Run `npm start` and open [http://localhost:3000](http://localhost:3000)

### Widget for Shopify
```javascript
import ChatBotWidget from './components/ChatBotWidget';

function App() {
  return <ChatBotWidget />;
}
```

The widget appears as a floating button that expands into a full chat interface.

## 📁 Project Structure

```
src/
├── components/
│   ├── ChatBot.js          # Main chat interface
│   ├── ChatBot.css         # Styles and animations
│   └── ChatBotWidget.js    # Embeddable widget
├── services/
│   ├── geminiService.js    # AI integration
│   └── chatService.js      # Firebase operations
└── config/
    └── firebase.js         # Firebase setup
```

## 🎨 Customization

### Change Colors
Edit the gradient in `ChatBot.css`:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Adjust AI Behavior
Modify parameters in `geminiService.js`:
```javascript
temperature: 0.9,  // Creativity (0-1)
maxOutputTokens: 2048  // Response length
```

## 🛍️ Shopify Integration

Two methods available:

**Method 1: Widget Embed** (Easiest)
- Build: `npm run build`
- Upload build files to your hosting
- Add script tag to Shopify theme

**Method 2: Custom Integration**
- Use ChatBotWidget component
- Full control over placement and styling

See [SETUP.md](./SETUP.md) for step-by-step instructions.

## 🔧 Scripts

```bash
npm start      # Development server
npm build      # Production build
npm test       # Run tests
```

## 🔐 Environment Variables

Required in `.env`:
```
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_GEMINI_API_KEY=
```

## 📊 Performance Features

- ⚡ Streaming responses for instant feedback
- 🎯 Context-aware conversations
- 💾 Efficient Firestore queries
- 🎨 Optimized animations with Framer Motion
- 📦 Code splitting for faster loads

## 🆘 Need Help?

Check [SETUP.md](./SETUP.md) for:
- Detailed setup instructions
- Troubleshooting common issues
- Shopify integration guide
- Security best practices

## 📄 License

MIT License - feel free to use in your projects!

---

Built with ❤️ using React, Firebase, and Gemini AI
