const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const SYSTEM_PROMPT_PATH = path.join(__dirname, '..', 'system_prompt.md');

// GET /api/system-prompt - Get current system prompt
router.get('/', async (req, res) => {
  try {
    console.log('📖 Reading system prompt from:', SYSTEM_PROMPT_PATH);
    
    if (!fs.existsSync(SYSTEM_PROMPT_PATH)) {
      return res.status(404).json({
        success: false,
        message: 'System prompt file not found'
      });
    }

    const prompt = fs.readFileSync(SYSTEM_PROMPT_PATH, 'utf8');
    
    console.log(`✅ System prompt loaded (${prompt.length} characters)`);

    res.json({
      success: true,
      prompt: prompt,
      length: prompt.length,
      lastModified: fs.statSync(SYSTEM_PROMPT_PATH).mtime
    });
  } catch (error) {
    console.error('❌ Error reading system prompt:', error);
    res.status(500).json({
      success: false,
      message: 'Error reading system prompt',
      error: error.message
    });
  }
});

// PUT /api/system-prompt - Update system prompt
router.put('/', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt content is required'
      });
    }

    console.log('💾 Saving system prompt...');
    console.log(`📏 New prompt length: ${prompt.length} characters`);

    // Create backup of current prompt
    if (fs.existsSync(SYSTEM_PROMPT_PATH)) {
      const backupPath = path.join(__dirname, '..', `system_prompt_backup_${Date.now()}.md`);
      fs.copyFileSync(SYSTEM_PROMPT_PATH, backupPath);
      console.log(`📦 Backup created: ${backupPath}`);
    }

    // Write new prompt
    fs.writeFileSync(SYSTEM_PROMPT_PATH, prompt, 'utf8');
    
    console.log('✅ System prompt saved successfully');
    console.log('🔄 Changes will apply to new conversations immediately');

    res.json({
      success: true,
      message: 'System prompt updated successfully',
      length: prompt.length,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('❌ Error saving system prompt:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving system prompt',
      error: error.message
    });
  }
});

// GET /api/system-prompt/backups - List backup files
router.get('/backups', async (req, res) => {
  try {
    const backupDir = path.join(__dirname, '..');
    const files = fs.readdirSync(backupDir);
    
    const backups = files
      .filter(file => file.startsWith('system_prompt_backup_'))
      .map(file => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          created: stats.mtime,
          size: stats.size
        };
      })
      .sort((a, b) => b.created - a.created);

    res.json({
      success: true,
      backups: backups
    });
  } catch (error) {
    console.error('❌ Error listing backups:', error);
    res.status(500).json({
      success: false,
      message: 'Error listing backups',
      error: error.message
    });
  }
});

module.exports = router;
