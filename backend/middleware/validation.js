const { body, validationResult, query, param } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      message: 'Validation failed',
      errors: formattedErrors
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 10, max: 60 })
    .withMessage('Name must be between 10 and 60 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters')
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .withMessage('Password must include at least one uppercase letter and one special character'),
  
  body('address')
    .trim()
    .isLength({ min: 1, max: 400 })
    .withMessage('Address is required and must not exceed 400 characters'),
  
  body('role')
    .optional()
    .isIn(['admin', 'user', 'storeOwner'])
    .withMessage('Role must be admin, user, or storeOwner'),
  
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

const validatePasswordUpdate = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8, max: 16 })
    .withMessage('New password must be between 8 and 16 characters')
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .withMessage('New password must include at least one uppercase letter and one special character'),
  
  handleValidationErrors
];

// Store validation rules
const validateStore = [
  body('name')
    .trim()
    .isLength({ min: 10, max: 60 })
    .withMessage('Store name must be between 10 and 60 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('address')
    .trim()
    .isLength({ min: 1, max: 400 })
    .withMessage('Store address is required and must not exceed 400 characters'),
  
  body('ownerId')
    .optional()
    .isMongoId()
    .withMessage('Invalid owner ID'),
  
  handleValidationErrors
];

// Rating validation rules
const validateRating = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment must not exceed 500 characters'),
  
  body('storeId')
    .isMongoId()
    .withMessage('Invalid store ID'),
  
  handleValidationErrors
];

// Query parameter validations
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

const validateSearch = [
  query('name')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search name must not be empty'),
  
  query('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format'),
  
  query('address')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search address must not be empty'),
  
  query('role')
    .optional()
    .isIn(['admin', 'user', 'storeOwner'])
    .withMessage('Invalid role'),
  
  handleValidationErrors
];

// MongoDB ObjectId validation
const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName}`),
  
  handleValidationErrors
];

// User creation by admin validation
const validateAdminUserCreation = [
  body('name')
    .trim()
    .isLength({ min: 10, max: 60 })
    .withMessage('Name must be between 10 and 60 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters')
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .withMessage('Password must include at least one uppercase letter and one special character'),
  
  body('address')
    .trim()
    .isLength({ min: 1, max: 400 })
    .withMessage('Address is required and must not exceed 400 characters'),
  
  body('role')
    .isIn(['admin', 'user', 'storeOwner'])
    .withMessage('Role must be admin, user, or storeOwner'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validatePasswordUpdate,
  validateStore,
  validateRating,
  validatePagination,
  validateSearch,
  validateObjectId,
  validateAdminUserCreation
};
