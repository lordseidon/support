const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const telegramService = require('../services/telegramService');
const { shouldShowImages } = require('../services/geminiDecisionService');

// Read system prompt from markdown file
const SYSTEM_PROMPT_PATH = path.join(__dirname, '..', 'system_prompt.md');
let SYSTEM_PROMPT = "You are Adam, the AI assistant for Adamanti Smile Studios. You MUST always respond in Italian only, regardless of what language the user speaks. Be concise, empathetic, and professional.";

console.log('🔍 Attempting to load system prompt from:', SYSTEM_PROMPT_PATH);
console.log('📁 File exists:', fs.existsSync(SYSTEM_PROMPT_PATH));

try {
  SYSTEM_PROMPT = fs.readFileSync(SYSTEM_PROMPT_PATH, 'utf8');
  console.log('✅ System prompt loaded from system_prompt.md');
  console.log(`📏 Prompt length: ${SYSTEM_PROMPT.length} characters`);
  console.log(`📝 First 100 chars: ${SYSTEM_PROMPT.substring(0, 100)}...`);
} catch (error) {
  console.error('⚠️ Could not load system_prompt.md:', error.message);
  console.error('❌ Using default prompt instead');
}

// Function to reload system prompt (for development)
const reloadSystemPrompt = () => {
  try {
    SYSTEM_PROMPT = fs.readFileSync(SYSTEM_PROMPT_PATH, 'utf8');
    console.log('🔄 System prompt reloaded from system_prompt.md');
    return true;
  } catch (error) {
    console.error('⚠️ Could not reload system_prompt.md:', error.message);
    return false;
  }
};

// POST /api/chat/message - Send a message and get AI response
router.post('/message', async (req, res) => {
  try {
    const { message, sessionId, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'OpenAI API key not configured'
      });
    }

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Build messages array for OpenAI
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Add conversation history
    conversationHistory.forEach(msg => {
      messages.push({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text
      });
    });

    // Add current message
    messages.push({ role: 'user', content: message });

    // Check if message contains a phone number and send immediate notification
    const detectedPhone = detectPhoneNumber(message);
    if (detectedPhone) {
      console.log(`📱 Phone number detected in message: ${detectedPhone}`);
      // Send immediate Telegram notification
      telegramService.sendPhoneNumberNotification({
        name: null,
        phone: detectedPhone,
        address: null,
        originalMessage: message,
        timestamp: new Date().toLocaleString()
      }).catch(err => console.error('Error sending Telegram notification:', err));
    }

    // Check if images should be shown using Gemini
    console.log('🤔 Checking if images should be shown...');
    const showImages = await shouldShowImages(message);
    console.log(`📸 Show images: ${showImages}`);

    // Generate response
    console.log(`💬 Processing message: ${message.substring(0, 50)}...`);
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: messages,
      temperature: 0.7,
      max_tokens: 2048
    });

    const text = completion.choices[0].message.content;

    console.log(`✅ Generated response: ${text.substring(0, 50)}...`);

    // Extract user details from the conversation
    const extractedDetails = extractUserDetails(message, text);

    // Save to database if sessionId provided
    let conversation = null;
    let savedUser = null;

    if (sessionId) {
      // Find or create conversation
      conversation = await Conversation.findOne({ sessionId });
      
      if (!conversation) {
        conversation = new Conversation({
          sessionId,
          messages: [],
          status: 'active'
        });
      }

      // Add messages to conversation
      await conversation.addMessage(message, true); // User message
      await conversation.addMessage(text, false); // AI response

      // If user details were extracted, save them
      if (extractedDetails) {
        const { name, phone, address, issue, originalMessage } = extractedDetails;
        
        // Try to find existing user by phone or create new one
        if (phone) {
          savedUser = await User.findOne({ phone });
        }

        if (!savedUser) {
          savedUser = new User({
            name,
            phone,
            address,
            phoneMessage: phone ? originalMessage : null,
            nameMessage: name ? originalMessage : null,
            addressMessage: address ? originalMessage : null,
            conversationIds: [conversation._id]
          });
        } else {
          // Update existing user
          if (name && !savedUser.name) {
            savedUser.name = name;
            savedUser.nameMessage = originalMessage;
          }
          if (phone && !savedUser.phoneMessage) {
            savedUser.phoneMessage = originalMessage;
          }
          if (address && !savedUser.address) {
            savedUser.address = address;
            savedUser.addressMessage = originalMessage;
          }
          if (!savedUser.conversationIds.includes(conversation._id)) {
            savedUser.conversationIds.push(conversation._id);
          }
        }

        // Add issue if present
        if (issue) {
          await savedUser.addIssue(issue);
        }

        await savedUser.save();

        // Link user to conversation
        conversation.userId = savedUser._id;
        await conversation.save();

        console.log('\n═══════════════════════════════════════════');
        console.log('📋 USER DETAILS SAVED TO DATABASE');
        console.log('═══════════════════════════════════════════');
        console.log(`User ID: ${savedUser._id}`);
        console.log(`Name: ${savedUser.name || 'Not provided'}`);
        console.log(`Phone: ${savedUser.phone || 'Not provided'}`);
        console.log(`Address: ${savedUser.address || 'Not provided'}`);
        console.log(`Latest Issue: ${issue || 'Not provided'}`);
        console.log('═══════════════════════════════════════════\n');
      }
    }

    // Prepare image list if needed - send only 3 random images
    let images = [];
    if (showImages) {
      const imageDir = path.join(__dirname, '..', '..', 'src', 'img', 'Before & After');
      if (fs.existsSync(imageDir)) {
        const allFiles = fs.readdirSync(imageDir)
          .filter(file => file.match(/\.(jpg|jpeg|png|gif)$/i));
        
        // Fisher-Yates shuffle for proper randomization
        const shuffled = [...allFiles];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        images = shuffled.slice(0, 3).map(file => `/img/Before & After/${file}`);
        console.log(`📸 Selected ${images.length} images:`, images.map(p => p.split('/').pop()));
      }
    }

    res.json({
      success: true,
      text,
      userDetails: extractedDetails,
      conversationId: conversation?._id,
      userId: savedUser?._id,
      showImages,
      images
    });

  } catch (error) {
    console.error('❌ Error processing message:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing message',
      error: error.message
    });
  }
});

// POST /api/chat/stream - Stream AI response
router.post('/stream', async (req, res) => {
  try {
    const { message, sessionId, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'OpenAI API key not configured'
      });
    }

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Build messages array for OpenAI
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Add conversation history
    conversationHistory.forEach(msg => {
      messages.push({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text
      });
    });

    // Add current message
    messages.push({ role: 'user', content: message });

    // Check if message contains a phone number and send immediate notification
    const detectedPhone = detectPhoneNumber(message);
    if (detectedPhone) {
      console.log(`📱 Phone number detected in message: ${detectedPhone}`);
      // Send immediate Telegram notification
      telegramService.sendPhoneNumberNotification({
        name: null,
        phone: detectedPhone,
        address: null,
        originalMessage: message,
        timestamp: new Date().toLocaleString()
      }).catch(err => console.error('Error sending Telegram notification:', err));
    }

    // Check if images should be shown using Gemini
    console.log('🤔 Checking if images should be shown...');
    const showImages = await shouldShowImages(message);
    console.log(`📸 Show images: ${showImages}`);

    console.log(`💬 Streaming message: ${message.substring(0, 50)}...`);
    const stream = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: messages,
      temperature: 0.7,
      max_tokens: 2048,
      stream: true
    });
    
    let fullText = '';

    for await (const chunk of stream) {
      const chunkText = chunk.choices[0]?.delta?.content || '';
      if (chunkText) {
        fullText += chunkText;
        
        // Send chunk as SSE
        res.write(`data: ${JSON.stringify({ chunk: chunkText, fullText })}\n\n`);
      }
    }

    // Prepare image list if needed - send only 3 random images
    let images = [];
    if (showImages) {
      const imageDir = path.join(__dirname, '..', '..', 'src', 'img', 'Before & After');
      if (fs.existsSync(imageDir)) {
        const allFiles = fs.readdirSync(imageDir)
          .filter(file => file.match(/\.(jpg|jpeg|png|gif)$/i));
        
        // Fisher-Yates shuffle for proper randomization
        const shuffled = [...allFiles];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        images = shuffled.slice(0, 3).map(file => `/img/Before & After/${file}`);
        console.log(`📸 Selected ${images.length} images:`, images.map(p => p.split('/').pop()));
      }
    }

    // Send completion signal with images
    res.write(`data: ${JSON.stringify({ done: true, fullText, showImages, images })}\n\n`);
    
    console.log(`✅ Streaming complete: ${fullText.substring(0, 50)}...`);

    // Save to database if sessionId provided
    if (sessionId) {
      let conversation = await Conversation.findOne({ sessionId });
      
      if (!conversation) {
        conversation = new Conversation({
          sessionId,
          messages: [],
          status: 'active'
        });
      }

      await conversation.addMessage(message, true);
      await conversation.addMessage(fullText, false);

      // Extract and save user details
      const extractedDetails = extractUserDetails(message, fullText);
      if (extractedDetails) {
        const { name, phone, address, issue, originalMessage } = extractedDetails;
        
        let savedUser = phone ? await User.findOne({ phone }) : null;

        if (!savedUser) {
          savedUser = new User({
            name,
            phone,
            address,
            phoneMessage: phone ? originalMessage : null,
            nameMessage: name ? originalMessage : null,
            addressMessage: address ? originalMessage : null,
            conversationIds: [conversation._id]
          });
        } else {
          if (name && !savedUser.name) {
            savedUser.name = name;
            savedUser.nameMessage = originalMessage;
          }
          if (phone && !savedUser.phoneMessage) {
            savedUser.phoneMessage = originalMessage;
          }
          if (address && !savedUser.address) {
            savedUser.address = address;
            savedUser.addressMessage = originalMessage;
          }
          if (!savedUser.conversationIds.includes(conversation._id)) {
            savedUser.conversationIds.push(conversation._id);
          }
        }

        if (issue) await savedUser.addIssue(issue);
        await savedUser.save();

        conversation.userId = savedUser._id;
        await conversation.save();
      }
    }

    res.end();

  } catch (error) {
    console.error('❌ Error streaming message:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

// GET /api/chat/reload-prompt - Reload system prompt from file
router.get('/reload-prompt', (req, res) => {
  try {
    const success = reloadSystemPrompt();
    if (success) {
      res.json({
        success: true,
        message: 'System prompt reloaded successfully',
        length: SYSTEM_PROMPT.length
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to reload system prompt'
      });
    }
  } catch (error) {
    console.error('❌ Error reloading prompt:', error);
    res.status(500).json({
      success: false,
      message: 'Error reloading system prompt',
      error: error.message
    });
  }
});

// Helper function to detect if message contains a phone number
function detectPhoneNumber(message) {
  const phonePatterns = [
    /(?:\+?39)?\s*[0-9]{3}\s*[0-9]{3}\s*[0-9]{4}/,
    /(?:\+?39)?\s*[0-9]{10}/,
    /(?:\+?\d{1,3})?\s*\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/,
    /(?:\+?\d{1,4})?[\s.-]?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/
  ];

  for (const pattern of phonePatterns) {
    const match = message.match(pattern);
    if (match && match[0]) {
      return match[0].replace(/\s+/g, ' ').trim();
    }
  }
  return null;
}

// Helper function to extract user details
function extractUserDetails(userMessage, aiResponse) {
  const details = {
    name: null,
    phone: null,
    address: null,
    issue: null,
    originalMessage: userMessage
  };

  // Extract name - Italian patterns
  const namePatterns = [
    // Italian: "mi chiamo", "sono", "il mio nome è"
    /(?:mi chiamo|sono|il mio nome è|nome[:\s]+)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    // English: "my name is", "i'm", "i am"
    /(?:my name is|i'm|i am|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    // Just a capitalized name
    /(?:^|\s)([A-Z][a-z]+\s+[A-Z][a-z]+)(?:\s|$)/,
    // Single word name
    /(?:name[:\s]+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i
  ];

  for (const pattern of namePatterns) {
    const match = userMessage.match(pattern);
    if (match && match[1]) {
      details.name = match[1].trim();
      break;
    }
  }

  // Extract phone number
  const phonePatterns = [
    /(?:\+?39)?\s*[0-9]{3}\s*[0-9]{3}\s*[0-9]{4}/g,
    /(?:\+?39)?\s*[0-9]{10}/g,
    /(?:\+?\d{1,3})?\s*\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g
  ];

  for (const pattern of phonePatterns) {
    const match = userMessage.match(pattern);
    if (match && match[0]) {
      details.phone = match[0].replace(/\s+/g, '').trim();
      break;
    }
  }

  // Extract address - Italian and English patterns
  const addressPatterns = [
    // Italian: "abito a", "vivo a", "indirizzo", "via", "corso", "piazza"
    /(?:abito a|vivo a|vivo in|indirizzo[:\s]+|address[:\s]+)(.*?(?:via|corso|piazza|strada|viale)[^,.!?]*)/i,
    /(?:via|corso|piazza|strada|viale)\s+[A-Za-z\s]+\d+/i,
    // English: "I live at", "my address is"
    /(?:i live at|my address is|address[:\s]+)([^,.!?]+)/i,
    // Generic street address pattern
    /\d+\s+[A-Za-z\s]+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|way|court|ct)/i
  ];

  for (const pattern of addressPatterns) {
    const match = userMessage.match(pattern);
    if (match && match[1]) {
      details.address = match[1].trim();
      break;
    } else if (match && match[0]) {
      details.address = match[0].trim();
      break;
    }
  }

  // Extract issue
  const issueKeywords = [
    'problem', 'issue', 'pain', 'hurt', 'need', 'want', 'help', 
    'tooth', 'teeth', 'smile', 'dental', 'implant', 'veneer',
    'swelling', 'infection', 'broken', 'chipped', 'missing'
  ];

  const messageLower = userMessage.toLowerCase();
  const foundKeywords = issueKeywords.filter(keyword => messageLower.includes(keyword));
  
  if (foundKeywords.length > 0 || messageLower.length > 20) {
    details.issue = userMessage.substring(0, 200).trim();
  }

  const hasInfo = details.name || details.phone || details.address || details.issue;
  return hasInfo ? details : null;
}

module.exports = router;
