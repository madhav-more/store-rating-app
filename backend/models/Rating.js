const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: [true, 'Store is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating must not exceed 5'],
    validate: {
      validator: function(value) {
        return Number.isInteger(value);
      },
      message: 'Rating must be an integer between 1 and 5'
    }
  },
  comment: {
    type: String,
    maxlength: [500, 'Comment must not exceed 500 characters'],
    trim: true,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure one rating per user per store
ratingSchema.index({ userId: 1, storeId: 1 }, { unique: true });

// Update timestamp on save
ratingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Post-save middleware to update store rating
ratingSchema.post('save', async function(doc) {
  try {
    const Store = mongoose.model('Store');
    const store = await Store.findById(doc.storeId);
    if (store) {
      await store.updateRating();
    }
  } catch (error) {
    console.error('Error updating store rating after rating save:', error);
  }
});

// Post-remove middleware to update store rating
ratingSchema.post('deleteOne', { document: true, query: false }, async function(doc) {
  try {
    const Store = mongoose.model('Store');
    const store = await Store.findById(doc.storeId);
    if (store) {
      await store.updateRating();
    }
  } catch (error) {
    console.error('Error updating store rating after rating deletion:', error);
  }
});

// Virtual for populated user
ratingSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Virtual for populated store
ratingSchema.virtual('store', {
  ref: 'Store',
  localField: 'storeId',
  foreignField: '_id',
  justOne: true
});

// Enable virtuals when converting to JSON
ratingSchema.set('toJSON', { virtuals: true });
ratingSchema.set('toObject', { virtuals: true });

// Additional indexes for queries
ratingSchema.index({ storeId: 1 });
ratingSchema.index({ userId: 1 });
ratingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Rating', ratingSchema);
