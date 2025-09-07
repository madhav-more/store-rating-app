const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    minlength: [10, 'Name must be at least 10 characters'],
    maxlength: [60, 'Name must not exceed 60 characters'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    validate: {
      validator: function(password) {
        // Skip validation if password is already hashed (starts with $2a or similar)
        if (password.startsWith('$2a') || password.startsWith('$2b')) {
          return true;
        }
        // For plain text passwords, check length and complexity
        if (password.length < 8 || password.length > 16) {
          return false;
        }
        // Must include at least one uppercase letter and one special character
        return /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password);
      },
      message: 'Password must be 8-16 characters and include at least one uppercase letter and one special character'
    }
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    maxlength: [400, 'Address must not exceed 400 characters'],
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'storeOwner'],
    default: 'user',
    required: true
  },
  // For store owners - reference to their store
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    default: null
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

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update timestamp on save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get user info without password
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ name: 1 });

module.exports = mongoose.model('User', userSchema);
