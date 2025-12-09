const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  isUser: {
    type: Boolean,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  images: {
    type: [String],
    default: []
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'text-with-images'],
    default: 'text'
  }
});

const conversationSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  messages: [messageSchema],
  status: {
    type: String,
    enum: ['active', 'closed', 'archived'],
    default: 'active'
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    language: String
  }
}, {
  timestamps: true
});

// Index for faster queries
conversationSchema.index({ createdAt: -1 });
conversationSchema.index({ status: 1 });

// Method to add a message to the conversation
conversationSchema.methods.addMessage = function(text, isUser, images = []) {
  const messageType = images.length > 0 ? (text ? 'text-with-images' : 'image') : 'text';
  this.messages.push({
    text,
    isUser,
    timestamp: new Date(),
    images,
    messageType
  });
  return this.save();
};

// Method to get recent messages
conversationSchema.methods.getRecentMessages = function(limit = 10) {
  return this.messages.slice(-limit);
};

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
