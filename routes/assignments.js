const express = require('express');
const router = express.Router();
const {
  issueBook,
  returnBook,
  getActiveAssignments,
  getAssignmentHistory,
  getAllAssignments
} = require('../controllers/assignmentController');
const {
  validateAssignment,
  validateObjectId
} = require('../middleware/validation');

// Get all assignments (admin view)
router.get('/', getAllAssignments);

// Get active assignments only
router.get('/active', getActiveAssignments);

// Get assignment history with pagination
router.get('/history', getAssignmentHistory);

// Issue a book to user
router.post('/issue', validateAssignment, issueBook);

// Return a book
router.put('/return/:id', validateObjectId, returnBook);

module.exports = router;