const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.',
        error: 'NO_TOKEN'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists and is active
    const user = await User.findById(decoded.userId).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        message: 'Access denied. User not found or inactive.',
        error: 'USER_NOT_FOUND'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Access denied. Invalid token.',
        error: 'INVALID_TOKEN'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Access denied. Token expired.',
        error: 'TOKEN_EXPIRED'
      });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Server error during authentication',
      error: 'SERVER_ERROR'
    });
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Access denied. User not authenticated.',
        error: 'NOT_AUTHENTICATED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.',
        error: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { 
      userId, 
      role,
      iat: Math.floor(Date.now() / 1000)
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: '24h',
      issuer: 'store-rating-app',
      audience: 'store-rating-users'
    }
  );
};

// Verify store owner access to their own store
const verifyStoreOwner = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      return next(); // Admins can access any store
    }

    if (req.user.role !== 'storeOwner') {
      return res.status(403).json({ 
        message: 'Access denied. Only store owners can perform this action.',
        error: 'NOT_STORE_OWNER'
      });
    }

    const storeId = req.params.storeId || req.body.storeId;
    if (!storeId) {
      return res.status(400).json({ 
        message: 'Store ID is required',
        error: 'MISSING_STORE_ID'
      });
    }

    const Store = require('../models/Store');
    const store = await Store.findById(storeId);

    if (!store) {
      return res.status(404).json({ 
        message: 'Store not found',
        error: 'STORE_NOT_FOUND'
      });
    }

    if (store.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Access denied. You can only access your own store.',
        error: 'NOT_YOUR_STORE'
      });
    }

    req.store = store;
    next();
  } catch (error) {
    console.error('Store owner verification error:', error);
    res.status(500).json({ 
      message: 'Server error during store ownership verification',
      error: 'SERVER_ERROR'
    });
  }
};

module.exports = {
  authenticateToken,
  authorize,
  generateToken,
  verifyStoreOwner
};
