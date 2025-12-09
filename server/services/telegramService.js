const TelegramBot = require('node-telegram-bot-api');

class TelegramService {
  constructor() {
    this.bot = null;
    this.chatId = process.env.TELEGRAM_CHAT_ID;
    this.enabled = false;

    // Initialize bot if token is provided
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      try {
        // CRITICAL: Use polling: false to prevent memory leaks
        // We only send messages, we don't need to receive them
        this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { 
          polling: false,
          filepath: false // Disable file download to save memory
        });
        this.enabled = true;
        console.log('✅ Telegram bot initialized (send-only mode)');
      } catch (error) {
        console.error('❌ Failed to initialize Telegram bot:', error.message);
      }
    } else {
      console.log('ℹ️ Telegram bot disabled (credentials not set)');
    }
  }

  /**
   * Send a notification when user provides phone number
   */
  async sendPhoneNumberNotification(userDetails) {
    if (!this.enabled || !this.chatId) {
      console.log('⚠️ Telegram notification skipped (not configured)');
      return false;
    }

    try {
      const { name, phone, address, originalMessage, timestamp, sessionId } = userDetails;

      // Format the message with escaped special characters for Markdown
      const escapedMessage = (originalMessage || '').replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
      
      let message = '📱 *New Phone Number Received*\n\n';
      
      if (name) {
        message += `👤 *Name:* ${name}\n`;
      }
      
      message += `📞 *Phone:* \`${phone}\`\n`;
      
      if (address) {
        message += `📍 *Address:* ${address}\n`;
      }
      
      message += `\n📝 *Original Message:*\n${escapedMessage.substring(0, 200)}\n`;
      message += `\n🕐 *Time:* ${timestamp || new Date().toLocaleString()}`;
      
      // Add chat link if sessionId is provided
      if (sessionId) {
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        message += `\n\n🔗 [View Chat](${clientUrl}/chat/${sessionId})`;
      }

      // Send message with timeout to prevent hanging
      const sendPromise = this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'Markdown',
        disable_web_page_preview: false,
        disable_notification: false
      });

      // Add timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Telegram request timeout')), 10000)
      );

      await Promise.race([sendPromise, timeoutPromise]);

      console.log('✅ Telegram notification sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Error sending Telegram notification:', error.message);
      return false;
    }
  }

  /**
   * Send a general notification
   */
  async sendNotification(message) {
    if (!this.enabled || !this.chatId) {
      return false;
    }

    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      );
      
      const sendPromise = this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      });

      await Promise.race([sendPromise, timeoutPromise]);
      return true;
    } catch (error) {
      console.error('❌ Error sending Telegram notification:', error.message);
      return false;
    }
  }

  /**
   * Reinitialize the bot (useful for updating credentials without restart)
   */
  reinitialize() {
    // Reload environment variables from .env file
    require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
    
    this.bot = null;
    this.enabled = false;
    this.chatId = process.env.TELEGRAM_CHAT_ID;

    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      try {
        this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { 
          polling: false,
          filepath: false
        });
        this.enabled = true;
        console.log('✅ Telegram bot reinitialized successfully');
        console.log('📱 Bot Token:', process.env.TELEGRAM_BOT_TOKEN.substring(0, 15) + '...');
        console.log('💬 Chat ID:', this.chatId);
        return { success: true, message: 'Bot reinitialized' };
      } catch (error) {
        console.error('❌ Failed to reinitialize Telegram bot:', error.message);
        return { success: false, message: error.message };
      }
    } else {
      console.log('ℹ️ Telegram bot credentials not found');
      return { success: false, message: 'Credentials not found in environment' };
    }
  }

  /**
   * Test the bot connection
   */
  async testConnection() {
    // Try to reinitialize if not enabled
    if (!this.enabled) {
      const result = this.reinitialize();
      if (!result.success) {
        return { success: false, message: 'Telegram bot not configured' };
      }
    }

    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      
      const botInfoPromise = this.bot.getMe();
      const botInfo = await Promise.race([botInfoPromise, timeoutPromise]);
      
      await this.sendNotification(`✅ *Test Message*\n\nBot is working\\! Bot name: ${botInfo.first_name}`);
      return { 
        success: true, 
        message: 'Test message sent successfully',
        botInfo 
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.message 
      };
    }
  }

  /**
   * Cleanup method to prevent memory leaks
   */
  destroy() {
    if (this.bot) {
      try {
        // Close any open connections
        if (this.bot._polling) {
          this.bot.stopPolling();
        }
        this.bot = null;
        this.enabled = false;
        console.log('🧹 Telegram service cleaned up');
      } catch (error) {
        console.error('Error cleaning up Telegram service:', error.message);
      }
    }
  }
}

// Export singleton instance
module.exports = new TelegramService();
