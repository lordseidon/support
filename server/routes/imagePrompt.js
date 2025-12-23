const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { reloadImagePrompt } = require('../services/geminiDecisionService');

const IMAGE_PROMPT_PATH = path.join(__dirname, '..', 'image_prompt.md');
const BACKUP_DIR = path.join(__dirname, '..', 'image_prompt_backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// GET endpoint to fetch current image prompt
router.get('/', async (req, res) => {
  try {
    const promptContent = fs.readFileSync(IMAGE_PROMPT_PATH, 'utf8');
    res.json({ 
      success: true, 
      content: promptContent 
    });
  } catch (error) {
    console.error('Error reading image prompt:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to read image prompt file' 
    });
  }
});

// PUT endpoint to update image prompt
router.put('/', async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Content is required' 
      });
    }

    // Create backup of current prompt
    const timestamp = Date.now();
    const backupPath = path.join(BACKUP_DIR, `image_prompt_backup_${timestamp}.md`);
    
    try {
      const currentContent = fs.readFileSync(IMAGE_PROMPT_PATH, 'utf8');
      fs.writeFileSync(backupPath, currentContent, 'utf8');
      console.log(`✅ Backup created: ${backupPath}`);
    } catch (backupError) {
      console.warn('Warning: Could not create backup:', backupError);
    }

    // Update image prompt
    fs.writeFileSync(IMAGE_PROMPT_PATH, content, 'utf8');
    console.log('✅ Image prompt updated successfully');

    // Reload the prompt in memory
    reloadImagePrompt();

    res.json({ 
      success: true, 
      message: 'Image prompt updated successfully',
      backupCreated: true,
      backupPath: path.basename(backupPath)
    });
  } catch (error) {
    console.error('Error updating image prompt:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update image prompt file' 
    });
  }
});

// GET endpoint to list backups
router.get('/backups', async (req, res) => {
  try {
    const files = fs.readdirSync(BACKUP_DIR);
    const backups = files
      .filter(file => file.startsWith('image_prompt_backup_') && file.endsWith('.md'))
      .map(file => {
        const stats = fs.statSync(path.join(BACKUP_DIR, file));
        const timestamp = file.match(/image_prompt_backup_(\d+)\.md/)?.[1];
        return {
          filename: file,
          timestamp: timestamp ? parseInt(timestamp) : null,
          date: stats.mtime,
          size: stats.size
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp);

    res.json({ 
      success: true, 
      backups 
    });
  } catch (error) {
    console.error('Error listing backups:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to list backup files',
      backups: []
    });
  }
});

// GET endpoint to retrieve a specific backup
router.get('/backups/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const backupPath = path.join(BACKUP_DIR, filename);

    if (!filename.startsWith('image_prompt_backup_') || !filename.endsWith('.md')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid backup filename' 
      });
    }

    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({ 
        success: false, 
        message: 'Backup file not found' 
      });
    }

    const content = fs.readFileSync(backupPath, 'utf8');
    res.json({ 
      success: true, 
      content,
      filename 
    });
  } catch (error) {
    console.error('Error reading backup:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to read backup file' 
    });
  }
});

module.exports = router;
