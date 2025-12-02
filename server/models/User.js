const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    default: null
  },
  phone: {
    type: String,
    trim: true,
    sparse: true,
    index: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true,
    index: true
  },
  location: {
    city: String,
    nearestStudio: {
      type: String,
      enum: ['Lucca', 'Montecatini Terme', 'Empoli', 'Pistoia', 'Prato', null],
      default: null
    }
  },
  issues: [{
    description: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  leadStatus: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'appointment_scheduled', 'converted', 'inactive'],
    default: 'new'
  },
  preferredCallbackTime: String,
  conversationIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation'
  }],
  notes: [{
    text: String,
    createdBy: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    source: {
      type: String,
      enum: ['website', 'shopify', 'direct', 'other'],
      default: 'website'
    },
    firstContact: {
      type: Date,
      default: Date.now
    },
    lastContact: Date
  }
}, {
  timestamps: true
});

// Indexes for faster queries
userSchema.index({ createdAt: -1 });
userSchema.index({ leadStatus: 1 });
userSchema.index({ 'location.nearestStudio': 1 });

// Method to add an issue
userSchema.methods.addIssue = function(description) {
  this.issues.push({
    description,
    timestamp: new Date()
  });
  this.metadata.lastContact = new Date();
  return this.save();
};

// Method to add a note
userSchema.methods.addNote = function(text, createdBy = 'system') {
  this.notes.push({
    text,
    createdBy,
    timestamp: new Date()
  });
  return this.save();
};

// Method to update lead status
userSchema.methods.updateLeadStatus = function(status) {
  this.leadStatus = status;
  this.metadata.lastContact = new Date();
  return this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;
