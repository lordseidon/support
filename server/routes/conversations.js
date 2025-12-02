const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');

// GET /api/conversations - Get all conversations
router.get('/', async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;

    const conversations = await Conversation.find(filter)
      .populate('userId')
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Conversation.countDocuments(filter);

    res.json({
      success: true,
      data: conversations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: error.message
    });
  }
});

// GET /api/conversations/:sessionId - Get conversation by session ID
router.get('/:sessionId', async (req, res) => {
  try {
    const conversation = await Conversation.findOne({ 
      sessionId: req.params.sessionId 
    }).populate('userId');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversation',
      error: error.message
    });
  }
});

// POST /api/conversations - Create new conversation
router.post('/', async (req, res) => {
  try {
    const { sessionId, userId, metadata } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    // Check if conversation already exists
    const existing = await Conversation.findOne({ sessionId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Conversation with this session ID already exists',
        data: existing
      });
    }

    const conversation = new Conversation({
      sessionId,
      userId: userId || null,
      messages: [],
      status: 'active',
      metadata
    });

    await conversation.save();

    console.log(`✅ New conversation created: ${conversation.sessionId}`);

    res.status(201).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating conversation',
      error: error.message
    });
  }
});

// POST /api/conversations/:sessionId/messages - Add message to conversation
router.post('/:sessionId/messages', async (req, res) => {
  try {
    const { text, isUser } = req.body;

    if (!text || isUser === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Text and isUser fields are required'
      });
    }

    let conversation = await Conversation.findOne({ 
      sessionId: req.params.sessionId 
    });

    if (!conversation) {
      // Create new conversation if it doesn't exist
      conversation = new Conversation({
        sessionId: req.params.sessionId,
        messages: [],
        status: 'active'
      });
    }

    await conversation.addMessage(text, isUser);

    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding message',
      error: error.message
    });
  }
});

// PATCH /api/conversations/:sessionId/status - Update conversation status
router.patch('/:sessionId/status', async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['active', 'closed', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const conversation = await Conversation.findOneAndUpdate(
      { sessionId: req.params.sessionId },
      { status },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    console.log(`✅ Conversation ${conversation.sessionId} status updated to: ${status}`);

    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Error updating conversation status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating conversation status',
      error: error.message
    });
  }
});

// DELETE /api/conversations/:sessionId - Delete conversation
router.delete('/:sessionId', async (req, res) => {
  try {
    const conversation = await Conversation.findOneAndDelete({ 
      sessionId: req.params.sessionId 
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    console.log(`🗑️ Conversation deleted: ${conversation.sessionId}`);

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting conversation',
      error: error.message
    });
  }
});

module.exports = router;
