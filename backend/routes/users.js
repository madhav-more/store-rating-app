const express = require('express');
const User = require('../models/User');
const Store = require('../models/Store');
const Rating = require('../models/Rating');
const { authenticateToken, authorize } = require('../middleware/auth');
const { 
  validateAdminUserCreation, 
  validatePagination, 
  validateSearch, 
  validateObjectId 
} = require('../middleware/validation');

const router = express.Router();

// Get dashboard statistics (admin only)
router.get('/dashboard/stats', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Store.countDocuments({ isActive: true }),
      Rating.countDocuments()
    ]);

    res.json({
      message: 'Dashboard statistics retrieved successfully',
      stats: {
        totalUsers,
        totalStores,
        totalRatings
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      message: 'Server error retrieving dashboard statistics',
      error: 'SERVER_ERROR'
    });
  }
});

// Create new user (admin only)
router.post('/', authenticateToken, authorize('admin'), validateAdminUserCreation, async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists with this email',
        error: 'USER_EXISTS'
      });
    }

    const user = new User({
      name,
      email,
      password,
      address,
      role
    });

    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('User creation error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        message: 'Validation failed',
        errors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        message: 'User already exists with this email',
        error: 'DUPLICATE_EMAIL'
      });
    }

    res.status(500).json({
      message: 'Server error during user creation',
      error: 'SERVER_ERROR'
    });
  }
});

// Get all users with filtering (admin only)
router.get('/', authenticateToken, authorize('admin'), validatePagination, validateSearch, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { isActive: true };
    
    if (req.query.name) {
      filter.name = { $regex: req.query.name, $options: 'i' };
    }
    if (req.query.email) {
      filter.email = { $regex: req.query.email, $options: 'i' };
    }
    if (req.query.address) {
      filter.address = { $regex: req.query.address, $options: 'i' };
    }
    if (req.query.role) {
      filter.role = req.query.role;
    }

    const [users, totalCount] = await Promise.all([
      User.find(filter)
        .populate('storeId', 'name averageRating')
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      message: 'Users retrieved successfully',
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Users retrieval error:', error);
    res.status(500).json({
      message: 'Server error retrieving users',
      error: 'SERVER_ERROR'
    });
  }
});

// Get user by ID (admin only)
router.get('/:userId', authenticateToken, authorize('admin'), validateObjectId('userId'), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('storeId', 'name email address averageRating totalRatings')
      .select('-password');

    if (!user || !user.isActive) {
      return res.status(404).json({
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }

    // If user is a store owner, get additional store statistics
    let additionalData = {};
    if (user.role === 'storeOwner' && user.storeId) {
      const ratingsCount = await Rating.countDocuments({ storeId: user.storeId });
      const recentRatings = await Rating.find({ storeId: user.storeId })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(5);

      additionalData = {
        store: {
          ...user.storeId.toObject(),
          ratingsCount,
          recentRatings
        }
      };
    }

    res.json({
      message: 'User retrieved successfully',
      user,
      ...additionalData
    });
  } catch (error) {
    console.error('User retrieval error:', error);
    res.status(500).json({
      message: 'Server error retrieving user',
      error: 'SERVER_ERROR'
    });
  }
});

// Update user (admin only)
router.put('/:userId', authenticateToken, authorize('admin'), validateObjectId('userId'), async (req, res) => {
  try {
    const { name, email, address, role, isActive } = req.body;

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({
          message: 'Email already exists',
          error: 'EMAIL_EXISTS'
        });
      }
    }

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (address) user.address = address;
    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        isActive: user.isActive,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('User update error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      message: 'Server error updating user',
      error: 'SERVER_ERROR'
    });
  }
});

// Delete user (soft delete - admin only)
router.delete('/:userId', authenticateToken, authorize('admin'), validateObjectId('userId'), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }

    // Soft delete by setting isActive to false
    user.isActive = false;
    await user.save();

    res.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('User deletion error:', error);
    res.status(500).json({
      message: 'Server error deleting user',
      error: 'SERVER_ERROR'
    });
  }
});

module.exports = router;
