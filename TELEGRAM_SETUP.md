# Telegram Notification Setup Guide

This guide will help you set up Telegram notifications for when users provide their phone numbers.

## Step 1: Create a Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Start a chat and send `/newbot`
3. Follow the instructions:
   - Choose a name for your bot (e.g., "Adamanti Support Alerts")
   - Choose a username for your bot (must end in 'bot', e.g., "adamanti_support_bot")
4. BotFather will give you a **Bot Token** - copy this token
5. Save the token in your `.env` file:
   ```
   TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   ```

## Step 2: Get Your Chat ID

You need to get your personal Chat ID so the bot knows where to send messages.

### Method 1: Using the Bot
1. Start a chat with your newly created bot (search for its username in Telegram)
2. Send any message to the bot (e.g., "Hello")
3. Open this URL in your browser (replace `YOUR_BOT_TOKEN` with your actual token):
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
   ```
4. Look for `"chat":{"id":123456789` in the response
5. Copy the number after `"id":` - that's your Chat ID
6. Add it to your `.env` file:
   ```
   TELEGRAM_CHAT_ID=123456789
   ```

### Method 2: Using @userinfobot
1. Search for **@userinfobot** in Telegram
2. Start a chat and send `/start`
3. The bot will reply with your user information, including your ID
4. Copy the ID and add it to your `.env` file

## Step 3: Update Your .env File

Your `.env` file should now look like this:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Client Configuration
CLIENT_URL=http://localhost:3000

# OpenAI API Key
OPENAI_API_KEY=sk-proj-...

# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://...

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789
```

## Step 4: Restart the Server

After adding the Telegram credentials, restart your server:

```bash
npm run server
```

You should see this message in the console:
```
✅ Telegram bot initialized successfully
```

## Step 5: Test the Integration

1. Go to your chatbot
2. Send a message with a phone number (e.g., "My phone is 1234567890")
3. You should receive a Telegram notification with:
   - Name (if provided)
   - Phone number
   - Address (if provided)
   - The original message
   - Timestamp

## Notification Format

When a user provides their phone number, you'll receive a message like this:

```
📱 New Phone Number Received

👤 Name: John Doe
📞 Phone: 1234567890
📍 Address: 123 Main St, Rome

📝 Original Message:
"Hi, my name is John Doe, you can reach me at 1234567890. I live at 123 Main St, Rome"

🕐 Time: 12/3/2025, 10:30:00 AM
```

## Troubleshooting

### Bot not sending messages?
- Check that both `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are set in `.env`
- Make sure you've started a chat with your bot (send at least one message)
- Restart the server after changing `.env`

### Can't find Chat ID?
- Make sure you sent a message to your bot first
- Try the @userinfobot method
- Check the browser URL is correct (no spaces in the token)

### Messages not being detected?
- The system looks for phone numbers in the user's message
- Phone numbers should be in formats like: `1234567890`, `123-456-7890`, `+39 123 456 7890`

## Security Notes

- Never commit your `.env` file to version control
- Keep your bot token secret
- Only share your Chat ID with trusted people
- You can revoke the bot token anytime via @BotFather if compromised

## Additional Features

The Telegram service supports:
- Custom notifications for other events
- Testing the connection (via API endpoint)
- Automatic formatting with Markdown

Enjoy your Telegram notifications! 🎉
