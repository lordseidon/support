const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/userinfo - Get all users with their information
router.get('/', async (req, res) => {
  try {
    const users = await User.find({})
      .select('name phone address email location issues leadStatus metadata createdAt phoneMessage nameMessage addressMessage')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      users,
      count: users.length
    });
  } catch (error) {
    console.error('❌ Error fetching user info:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user information',
      error: error.message
    });
  }
});

// GET /api/userinfo/:id - Get a specific user's information
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('conversationIds')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user information',
      error: error.message
    });
  }
});

// POST /api/userinfo - Create or update user information
router.post('/', async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    if (!name && !phone && !address) {
      return res.status(400).json({
        success: false,
        message: 'At least one field (name, phone, or address) is required'
      });
    }

    let user = null;

    // Try to find existing user by phone
    if (phone) {
      user = await User.findOne({ phone });
    }

    if (user) {
      // Update existing user
      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (address) user.address = address;
      user.metadata.lastContact = new Date();
      await user.save();

      console.log(`✅ Updated user: ${user._id}`);
    } else {
      // Create new user
      user = new User({
        name,
        phone,
        address,
        metadata: {
          source: 'direct',
          firstContact: new Date(),
          lastContact: new Date()
        }
      });
      await user.save();

      console.log(`✅ Created new user: ${user._id}`);
    }

    res.json({
      success: true,
      user,
      created: !user
    });
  } catch (error) {
    console.error('❌ Error saving user info:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving user information',
      error: error.message
    });
  }
});

// PUT /api/userinfo/:id - Update user information
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    user.metadata.lastContact = new Date();

    await user.save();

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('❌ Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user information',
      error: error.message
    });
  }
});

// DELETE /api/userinfo/:id - Delete a user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
});

module.exports = router;
