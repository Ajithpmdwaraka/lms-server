const express = require('express');
const router = express.Router();
const {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getAvailableBooks
} = require('../controllers/bookController');
const {
  validateBook,
  validateBookUpdate,
  validateObjectId
} = require('../middleware/validation');

// Get all books with pagination
router.get('/', getAllBooks);

// Get available books only
router.get('/available', getAvailableBooks);

// Get single book by ID
router.get('/:id', validateObjectId, getBookById);

// Create new book
router.post('/', validateBook, createBook);

// Update book
router.put('/:id', validateObjectId, validateBookUpdate, updateBook);

// Delete book
router.delete('/:id', validateObjectId, deleteBook);

module.exports = router;