const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Book validation rules
const validateBook = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  
  body('author')
    .trim()
    .notEmpty()
    .withMessage('Author is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Author name must be between 1 and 100 characters'),
  
  body('isbn')
    .trim()
    .notEmpty()
    .withMessage('ISBN is required')
    .matches(/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/)
    .withMessage('Please provide a valid ISBN'),
  
  body('totalCopies')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Total copies must be a number between 1 and 1000'),
  
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Category must be between 1 and 50 characters'),
  
  handleValidationErrors
];

// Book update validation rules (fields are optional)
const validateBookUpdate = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  
  body('author')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Author cannot be empty')
    .isLength({ min: 1, max: 100 })
    .withMessage('Author name must be between 1 and 100 characters'),
  
  body('isbn')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('ISBN cannot be empty')
    .matches(/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/)
    .withMessage('Please provide a valid ISBN'),
  
  body('totalCopies')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Total copies must be a number between 1 and 1000'),
  
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty')
    .isLength({ min: 1, max: 50 })
    .withMessage('Category must be between 1 and 50 characters'),
  
  handleValidationErrors
];

// User validation rules
const validateUser = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('studentId')
    .trim()
    .notEmpty()
    .withMessage('Student ID is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('Student ID must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9]+$/)
    .withMessage('Student ID can only contain letters and numbers'),
  
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[+]?[0-9]{10,15}$/)
    .withMessage('Please provide a valid phone number (10-15 digits)'),
  
  handleValidationErrors
];

// User update validation rules (fields are optional)
const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Email cannot be empty')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('studentId')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Student ID cannot be empty')
    .isLength({ min: 3, max: 20 })
    .withMessage('Student ID must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9]+$/)
    .withMessage('Student ID can only contain letters and numbers'),
  
  body('phone')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Phone number cannot be empty')
    .matches(/^[+]?[0-9]{10,15}$/)
    .withMessage('Please provide a valid phone number (10-15 digits)'),
  
  handleValidationErrors
];

// Assignment validation rules
const validateAssignment = [
  body('bookId')
    .notEmpty()
    .withMessage('Book ID is required')
    .isMongoId()
    .withMessage('Please provide a valid book ID'),
  
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Please provide a valid user ID'),
  
  handleValidationErrors
];

// MongoDB ObjectId validation
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  next();
};

module.exports = {
  validateBook,
  validateBookUpdate,
  validateUser,
  validateUserUpdate,
  validateAssignment,
  validateObjectId,
  handleValidationErrors
};