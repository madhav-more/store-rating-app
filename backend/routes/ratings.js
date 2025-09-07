const express = require('express');
const Rating = require('../models/Rating');
const Store = require('../models/Store');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateRating, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// Submit or update rating (normal users only)
router.post('/', authenticateToken, authorize('user'), validateRating, async (req, res) => {
  try {
    const { storeId, rating, comment = '' } = req.body;

    // Verify store exists and is active
    const store = await Store.findById(storeId);
    if (!store || !store.isActive) {
      return res.status(404).json({
        message: 'Store not found',
        error: 'STORE_NOT_FOUND'
      });
    }

    // Check if user already rated this store
    let existingRating = await Rating.findOne({
      userId: req.user._id,
      storeId
    });

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.comment = comment;
      await existingRating.save();

      res.json({
        message: 'Rating updated successfully',
        rating: {
          id: existingRating._id,
          rating: existingRating.rating,
          comment: existingRating.comment,
          storeId: existingRating.storeId,
          updatedAt: existingRating.updatedAt
        }
      });
    } else {
      // Create new rating
      const newRating = new Rating({
        userId: req.user._id,
        storeId,
        rating,
        comment
      });

      await newRating.save();

      res.status(201).json({
        message: 'Rating submitted successfully',
        rating: {
          id: newRating._id,
          rating: newRating.rating,
          comment: newRating.comment,
          storeId: newRating.storeId,
          createdAt: newRating.createdAt
        }
      });
    }
  } catch (error) {
    console.error('Rating submission error:', error);
    
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
      message: 'Server error during rating submission',
      error: 'SERVER_ERROR'
    });
  }
});

// Get user's rating for a specific store
router.get('/store/:storeId/user', authenticateToken, authorize('user'), validateObjectId('storeId'), async (req, res) => {
  try {
    const rating = await Rating.findOne({
      userId: req.user._id,
      storeId: req.params.storeId
    }).populate('storeId', 'name averageRating');

    if (!rating) {
      return res.status(404).json({
        message: 'No rating found for this store',
        error: 'RATING_NOT_FOUND'
      });
    }

    res.json({
      message: 'Rating retrieved successfully',
      rating
    });
  } catch (error) {
    console.error('Rating retrieval error:', error);
    res.status(500).json({
      message: 'Server error retrieving rating',
      error: 'SERVER_ERROR'
    });
  }
});

// Get all ratings for a store (store owner and admin only)
router.get('/store/:storeId', authenticateToken, authorize('admin', 'storeOwner'), validateObjectId('storeId'), async (req, res) => {
  try {
    // For store owners, verify they own the store
    if (req.user.role === 'storeOwner') {
      const store = await Store.findById(req.params.storeId);
      if (!store || store.ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message: 'Access denied. You can only view ratings for your own store.',
          error: 'ACCESS_DENIED'
        });
      }
    }

    const ratings = await Rating.find({ storeId: req.params.storeId })
      .populate('userId', 'name email')
      .populate('storeId', 'name')
      .sort({ createdAt: -1 });

    res.json({
      message: 'Store ratings retrieved successfully',
      ratings,
      totalRatings: ratings.length
    });
  } catch (error) {
    console.error('Store ratings retrieval error:', error);
    res.status(500).json({
      message: 'Server error retrieving store ratings',
      error: 'SERVER_ERROR'
    });
  }
});

// Get user's all ratings (user only)
router.get('/user/my-ratings', authenticateToken, authorize('user'), async (req, res) => {
  try {
    const ratings = await Rating.find({ userId: req.user._id })
      .populate('storeId', 'name email address averageRating')
      .sort({ createdAt: -1 });

    res.json({
      message: 'User ratings retrieved successfully',
      ratings,
      totalRatings: ratings.length
    });
  } catch (error) {
    console.error('User ratings retrieval error:', error);
    res.status(500).json({
      message: 'Server error retrieving user ratings',
      error: 'SERVER_ERROR'
    });
  }
});

// Update rating (normal users only - can only update their own ratings)
router.put('/:ratingId', authenticateToken, authorize('user'), validateObjectId('ratingId'), async (req, res) => {
  try {
    const { rating, comment = '' } = req.body;

    // Validate rating value
    if (rating && (rating < 1 || rating > 5 || !Number.isInteger(rating))) {
      return res.status(400).json({
        message: 'Rating must be an integer between 1 and 5',
        error: 'INVALID_RATING'
      });
    }

    const existingRating = await Rating.findById(req.params.ratingId);
    
    if (!existingRating) {
      return res.status(404).json({
        message: 'Rating not found',
        error: 'RATING_NOT_FOUND'
      });
    }

    // Check if the rating belongs to the current user
    if (existingRating.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Access denied. You can only update your own ratings.',
        error: 'ACCESS_DENIED'
      });
    }

    // Update rating
    if (rating) existingRating.rating = rating;
    if (comment !== undefined) existingRating.comment = comment;

    await existingRating.save();

    res.json({
      message: 'Rating updated successfully',
      rating: {
        id: existingRating._id,
        rating: existingRating.rating,
        comment: existingRating.comment,
        storeId: existingRating.storeId,
        updatedAt: existingRating.updatedAt
      }
    });
  } catch (error) {
    console.error('Rating update error:', error);
    
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
      message: 'Server error updating rating',
      error: 'SERVER_ERROR'
    });
  }
});

// Delete rating (normal users can delete their own, admin can delete any)
router.delete('/:ratingId', authenticateToken, validateObjectId('ratingId'), async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.ratingId);
    
    if (!rating) {
      return res.status(404).json({
        message: 'Rating not found',
        error: 'RATING_NOT_FOUND'
      });
    }

    // Check permissions
    const canDelete = req.user.role === 'admin' || 
                     (req.user.role === 'user' && rating.userId.toString() === req.user._id.toString());

    if (!canDelete) {
      return res.status(403).json({
        message: 'Access denied. You can only delete your own ratings.',
        error: 'ACCESS_DENIED'
      });
    }

    await Rating.findByIdAndDelete(req.params.ratingId);

    res.json({
      message: 'Rating deleted successfully'
    });
  } catch (error) {
    console.error('Rating deletion error:', error);
    res.status(500).json({
      message: 'Server error deleting rating',
      error: 'SERVER_ERROR'
    });
  }
});

// Get rating statistics (admin only)
router.get('/stats/overview', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const [totalRatings, averageRatingStats] = await Promise.all([
      Rating.countDocuments(),
      Rating.aggregate([
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalRatings: { $sum: 1 },
            ratingDistribution: {
              $push: '$rating'
            }
          }
        }
      ])
    ]);

    // Calculate rating distribution
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (averageRatingStats.length > 0) {
      averageRatingStats[0].ratingDistribution.forEach(rating => {
        ratingDistribution[rating]++;
      });
    }

    // Get top rated stores
    const topStores = await Store.find({ isActive: true })
      .sort({ averageRating: -1, totalRatings: -1 })
      .limit(10)
      .select('name averageRating totalRatings');

    res.json({
      message: 'Rating statistics retrieved successfully',
      stats: {
        totalRatings,
        overallAverageRating: averageRatingStats.length > 0 ? 
          Math.round(averageRatingStats[0].averageRating * 10) / 10 : 0,
        ratingDistribution,
        topStores
      }
    });
  } catch (error) {
    console.error('Rating stats error:', error);
    res.status(500).json({
      message: 'Server error retrieving rating statistics',
      error: 'SERVER_ERROR'
    });
  }
});

module.exports = router;
