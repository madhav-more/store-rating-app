const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Store name is required'],
    minlength: [10, 'Store name must be at least 10 characters'],
    maxlength: [60, 'Store name must not exceed 60 characters'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Store email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  address: {
    type: String,
    required: [true, 'Store address is required'],
    maxlength: [400, 'Address must not exceed 400 characters'],
    trim: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Store owner is required']
  },
  // Calculated average rating
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
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

// Update timestamp on save
storeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to calculate and update average rating
storeSchema.methods.updateRating = async function() {
  const Rating = mongoose.model('Rating');
  
  const stats = await Rating.aggregate([
    { $match: { storeId: this._id } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    this.averageRating = Math.round(stats[0].averageRating * 10) / 10; // Round to 1 decimal
    this.totalRatings = stats[0].totalRatings;
  } else {
    this.averageRating = 0;
    this.totalRatings = 0;
  }

  await this.save();
};

// Virtual for populated owner
storeSchema.virtual('owner', {
  ref: 'User',
  localField: 'ownerId',
  foreignField: '_id',
  justOne: true
});

// Enable virtuals when converting to JSON
storeSchema.set('toJSON', { virtuals: true });
storeSchema.set('toObject', { virtuals: true });

// Indexes for better query performance
storeSchema.index({ name: 1 });
storeSchema.index({ address: 1 });
storeSchema.index({ ownerId: 1 });
storeSchema.index({ averageRating: -1 });

module.exports = mongoose.model('Store', storeSchema);
