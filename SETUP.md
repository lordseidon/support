# AI Chatbot with React, Firebase & Gemini API

A modern, responsive chatbot application built with React.js, Firebase, and Google's Gemini AI. Features a sleek UI with smooth animations and can be easily integrated into Shopify websites.

## 🚀 Features

- **Modern UI**: Clean, gradient-based design with smooth animations using Framer Motion
- **Real-time Chat**: Streaming responses from Gemini AI for ChatGPT-like performance
- **Chat History**: Persistent storage using Firebase Firestore
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Widget Mode**: Embeddable chatbot widget for Shopify and other websites
- **Markdown Support**: Rich text formatting in chat responses
- **Typing Indicators**: Visual feedback during AI response generation

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js (v14 or higher) installed
- A Google Cloud account with Gemini API access
- A Firebase project set up

## 🛠️ Installation

1. **Install Node.js** (if not already installed):
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **Install dependencies**:
   ```bash
   npm install
   ```

## ⚙️ Configuration

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Firestore Database:
   - Go to Firestore Database
   - Click "Create database"
   - Start in production mode
   - Choose your location
4. Get your Firebase config:
   - Go to Project Settings
   - Scroll to "Your apps" section
   - Copy the config object

### 2. Gemini API Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key

### 3. Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your credentials in `.env`:
   ```env
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_GEMINI_API_KEY=your_gemini_api_key
   ```

## 🚀 Running the Application

### Development Mode

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
```

This creates an optimized build in the `build` folder.

## 🛍️ Shopify Integration

### Method 1: Embedded App (Recommended)

1. **Build the widget version**:
   ```bash
   npm run build
   ```

2. **Upload to hosting**:
   - Upload the contents of the `build` folder to your hosting service (Netlify, Vercel, etc.)
   - Note the URL of your hosted app

3. **Add to Shopify**:
   - Go to Shopify Admin > Online Store > Themes
   - Click "Actions" > "Edit code"
   - Open `theme.liquid`
   - Add before `</body>`:
   ```html
   <div id="chatbot-widget-root"></div>
   <script src="https://your-domain.com/static/js/main.js"></script>
   <link href="https://your-domain.com/static/css/main.css" rel="stylesheet">
   ```

### Method 2: Widget Mode

1. **Use the Widget Component**:
   ```javascript
   import ChatBotWidget from './components/ChatBotWidget';
   
   function YourShopifyApp() {
     return (
       <div>
         <YourContent />
         <ChatBotWidget />
       </div>
     );
   }
   ```

2. The widget appears as a floating button in the bottom-right corner

## 📁 Project Structure

```
src/
├── components/
│   ├── ChatBot.js          # Main chatbot component
│   ├── ChatBot.css         # Chatbot styles
│   └── ChatBotWidget.js    # Widget wrapper for embedding
├── config/
│   └── firebase.js         # Firebase configuration
├── services/
│   ├── geminiService.js    # Gemini AI integration
│   └── chatService.js      # Chat history management
├── App.js                  # Main app component
├── index.js               # App entry point
└── widget.js              # Widget entry point
```

## 🎨 Customization

### Colors and Styling

Edit `src/components/ChatBot.css` to customize:
- Gradient colors
- Border radius
- Animations
- Font styles

### AI Behavior

Modify `src/services/geminiService.js`:
- Temperature (creativity level)
- Max tokens (response length)
- Model selection

### Widget Position

Change widget position in `src/components/ChatBot.css`:
```css
.chatbot-widget {
  bottom: 20px;  /* Distance from bottom */
  right: 20px;   /* Distance from right */
}
```

## 🔧 Troubleshooting

### "npm is not recognized"
- Install Node.js from nodejs.org
- Restart your terminal/command prompt

### Firebase Connection Issues
- Verify your Firebase config in `.env`
- Check Firestore security rules
- Ensure your Firebase project is active

### Gemini API Errors
- Verify your API key is correct
- Check API quotas in Google Cloud Console
- Ensure billing is enabled

### Build Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `npm cache clean --force`

## 📱 Widget Features

- **Floating Button**: Minimized state shows a chat icon
- **Expandable Window**: Click to open full chat interface
- **Mobile Responsive**: Adapts to screen size
- **Persistent Sessions**: Chat history maintained across page reloads

## 🔐 Security Notes

1. **Never commit `.env` file** - It contains sensitive keys
2. **Use environment variables** - Don't hardcode API keys
3. **Set Firestore rules** - Secure your database:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /chats/{document=**} {
         allow read, write: if true; // Adjust based on your needs
       }
     }
   }
   ```

## 📊 Performance

- **Streaming Responses**: Real-time token streaming like ChatGPT
- **Optimized Rendering**: React memoization and lazy loading
- **Efficient Storage**: Firestore indexes for fast queries
- **Lightweight**: Minimal bundle size with code splitting

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review Firebase and Gemini API documentation
3. Open an issue on GitHub

---

Built with ❤️ using React, Firebase, and Gemini AI
