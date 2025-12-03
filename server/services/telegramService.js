const TelegramBot = require('node-telegram-bot-api');

class TelegramService {
  constructor() {
    this.bot = null;
    this.chatId = process.env.TELEGRAM_CHAT_ID;
    this.enabled = false;

    // Initialize bot if token is provided
    if (process.env.TELEGRAM_BOT_TOKEN) {
      try {
        this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
        this.enabled = true;
        console.log('✅ Telegram bot initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize Telegram bot:', error.message);
      }
    } else {
      console.log('ℹ️ Telegram bot disabled (TELEGRAM_BOT_TOKEN not set)');
    }
  }

  /**
   * Send a notification when user provides phone number
   */
  async sendPhoneNumberNotification(userDetails) {
    if (!this.enabled || !this.chatId) {
      console.log('⚠️ Telegram notification skipped (not configured)');
      return;
    }

    try {
      const { name, phone, address, originalMessage, timestamp } = userDetails;

      // Format the message
      let message = '📱 *New Phone Number Received*\n\n';
      
      if (name) {
        message += `👤 *Name:* ${name}\n`;
      }
      
      message += `📞 *Phone:* \`${phone}\`\n`;
      
      if (address) {
        message += `📍 *Address:* ${address}\n`;
      }
      
      message += `\n📝 *Original Message:*\n_"${originalMessage}"_\n`;
      message += `\n🕐 *Time:* ${timestamp || new Date().toLocaleString()}`;

      // Send message with Markdown formatting
      await this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      });

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
      return;
    }

    try {
      await this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'Markdown'
      });
      return true;
    } catch (error) {
      console.error('❌ Error sending Telegram notification:', error.message);
      return false;
    }
  }

  /**
   * Test the bot connection
   */
  async testConnection() {
    if (!this.enabled) {
      return { success: false, message: 'Telegram bot not configured' };
    }

    try {
      const botInfo = await this.bot.getMe();
      await this.sendNotification(`✅ *Test Message*\n\nBot is working! Bot name: ${botInfo.first_name}`);
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
}

// Export singleton instance
module.exports = new TelegramService();
