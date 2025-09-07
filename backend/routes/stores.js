const express = require('express');
const Store = require('../models/Store');
const User = require('../models/User');
const Rating = require('../models/Rating');
const { authenticateToken, authorize, verifyStoreOwner } = require('../middleware/auth');
const { 
  validateStore, 
  validatePagination, 
  validateSearch, 
  validateObjectId 
} = require('../middleware/validation');

const router = express.Router();

// Create new store (admin only)
router.post('/', authenticateToken, authorize('admin'), validateStore, async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    // Check if store with email already exists
    const existingStore = await Store.findOne({ email });
    if (existingStore) {
      return res.status(400).json({
        message: 'Store already exists with this email',
        error: 'STORE_EXISTS'
      });
    }

    // Verify owner exists and is a store owner
    const owner = await User.findById(ownerId);
    if (!owner || owner.role !== 'storeOwner') {
      return res.status(400).json({
        message: 'Invalid store owner',
        error: 'INVALID_OWNER'
      });
    }

    // Check if owner already has a store
    const existingOwnerStore = await Store.findOne({ ownerId });
    if (existingOwnerStore) {
      return res.status(400).json({
        message: 'Store owner already has a store',
        error: 'OWNER_HAS_STORE'
      });
    }

    const store = new Store({
      name,
      email,
      address,
      ownerId
    });

    await store.save();

    // Update user's storeId
    owner.storeId = store._id;
    await owner.save();

    res.status(201).json({
      message: 'Store created successfully',
      store: {
        id: store._id,
        name: store.name,
        email: store.email,
        address: store.address,
        ownerId: store.ownerId,
        averageRating: store.averageRating,
        totalRatings: store.totalRatings,
        createdAt: store.createdAt
      }
    });
  } catch (error) {
    console.error('Store creation error:', error);
    
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
        message: 'Store already exists with this email',
        error: 'DUPLICATE_EMAIL'
      });
    }

    res.status(500).json({
      message: 'Server error during store creation',
      error: 'SERVER_ERROR'
    });
  }
});

// Get all stores (public for normal users, detailed for admin)
router.get('/', authenticateToken, validatePagination, validateSearch, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { isActive: true };
    
    if (req.query.name) {
      filter.name = { $regex: req.query.name, $options: 'i' };
    }
    if (req.query.address) {
      filter.address = { $regex: req.query.address, $options: 'i' };
    }

    let populateOptions = 'name email';
    if (req.user.role === 'admin') {
      populateOptions = 'name email address role';
    }

    const [stores, totalCount] = await Promise.all([
      Store.find(filter)
        .populate('ownerId', populateOptions)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Store.countDocuments(filter)
    ]);

    // For normal users, also get their ratings for each store
    let storesWithUserRatings = stores;
    if (req.user.role === 'user') {
      const userRatings = await Rating.find({ 
        userId: req.user._id,
        storeId: { $in: stores.map(store => store._id) }
      });

      const ratingsMap = {};
      userRatings.forEach(rating => {
        ratingsMap[rating.storeId.toString()] = rating;
      });

      storesWithUserRatings = stores.map(store => {
        const storeObject = store.toObject();
        const userRating = ratingsMap[store._id.toString()];
        return {
          ...storeObject,
          userRating: userRating ? {
            rating: userRating.rating,
            comment: userRating.comment,
            ratingId: userRating._id
          } : null
        };
      });
    }

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      message: 'Stores retrieved successfully',
      stores: storesWithUserRatings,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Stores retrieval error:', error);
    res.status(500).json({
      message: 'Server error retrieving stores',
      error: 'SERVER_ERROR'
    });
  }
});

// Get store by ID
router.get('/:storeId', authenticateToken, validateObjectId('storeId'), async (req, res) => {
  try {
    const store = await Store.findById(req.params.storeId)
      .populate('ownerId', 'name email address');

    if (!store || !store.isActive) {
      return res.status(404).json({
        message: 'Store not found',
        error: 'STORE_NOT_FOUND'
      });
    }

    let additionalData = {};

    // For normal users, get their rating for this store
    if (req.user.role === 'user') {
      const userRating = await Rating.findOne({
        userId: req.user._id,
        storeId: store._id
      });

      additionalData.userRating = userRating ? {
        rating: userRating.rating,
        comment: userRating.comment,
        ratingId: userRating._id
      } : null;
    }

    // For store owners (own store) and admins, get ratings list
    if ((req.user.role === 'storeOwner' && store.ownerId.toString() === req.user._id.toString()) || 
        req.user.role === 'admin') {
      const ratings = await Rating.find({ storeId: store._id })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(20);

      additionalData.ratings = ratings;
    }

    res.json({
      message: 'Store retrieved successfully',
      store,
      ...additionalData
    });
  } catch (error) {
    console.error('Store retrieval error:', error);
    res.status(500).json({
      message: 'Server error retrieving store',
      error: 'SERVER_ERROR'
    });
  }
});

// Get store dashboard (store owner only)
router.get('/:storeId/dashboard', authenticateToken, authorize('storeOwner', 'admin'), verifyStoreOwner, async (req, res) => {
  try {
    const store = req.store; // Set by verifyStoreOwner middleware

    // Get ratings with user details
    const ratings = await Rating.find({ storeId: store._id })
      .populate('userId', 'name email address')
      .sort({ createdAt: -1 });

    // Calculate rating distribution
    const ratingDistribution = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    };

    ratings.forEach(rating => {
      ratingDistribution[rating.rating]++;
    });

    // Get recent ratings (last 10)
    const recentRatings = ratings.slice(0, 10);

    res.json({
      message: 'Store dashboard retrieved successfully',
      dashboard: {
        store: {
          id: store._id,
          name: store.name,
          email: store.email,
          address: store.address,
          averageRating: store.averageRating,
          totalRatings: store.totalRatings
        },
        ratingDistribution,
        recentRatings,
        totalRaters: ratings.length
      }
    });
  } catch (error) {
    console.error('Store dashboard error:', error);
    res.status(500).json({
      message: 'Server error retrieving store dashboard',
      error: 'SERVER_ERROR'
    });
  }
});

// Update store (admin only)
router.put('/:storeId', authenticateToken, authorize('admin'), validateObjectId('storeId'), async (req, res) => {
  try {
    const { name, email, address } = req.body;

    const store = await Store.findById(req.params.storeId);
    if (!store) {
      return res.status(404).json({
        message: 'Store not found',
        error: 'STORE_NOT_FOUND'
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== store.email) {
      const existingStore = await Store.findOne({ email, _id: { $ne: store._id } });
      if (existingStore) {
        return res.status(400).json({
          message: 'Email already exists',
          error: 'EMAIL_EXISTS'
        });
      }
    }

    // Update store fields
    if (name) store.name = name;
    if (email) store.email = email;
    if (address) store.address = address;

    await store.save();

    res.json({
      message: 'Store updated successfully',
      store: {
        id: store._id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating: store.averageRating,
        totalRatings: store.totalRatings,
        updatedAt: store.updatedAt
      }
    });
  } catch (error) {
    console.error('Store update error:', error);
    
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
      message: 'Server error updating store',
      error: 'SERVER_ERROR'
    });
  }
});

// Delete store (soft delete - admin only)
router.delete('/:storeId', authenticateToken, authorize('admin'), validateObjectId('storeId'), async (req, res) => {
  try {
    const store = await Store.findById(req.params.storeId);
    if (!store) {
      return res.status(404).json({
        message: 'Store not found',
        error: 'STORE_NOT_FOUND'
      });
    }

    // Soft delete by setting isActive to false
    store.isActive = false;
    await store.save();

    // Update owner's storeId to null
    await User.findByIdAndUpdate(store.ownerId, { storeId: null });

    res.json({
      message: 'Store deleted successfully'
    });
  } catch (error) {
    console.error('Store deletion error:', error);
    res.status(500).json({
      message: 'Server error deleting store',
      error: 'SERVER_ERROR'
    });
  }
});

module.exports = router;
