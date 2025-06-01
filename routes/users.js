const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserAssignments
} = require('../controllers/userController');
const {
  validateUser,
  validateUserUpdate,
  validateObjectId
} = require('../middleware/validation');

// Get all users
router.get('/', getAllUsers);

// Get single user by ID
router.get('/:id', validateObjectId, getUserById);

// Get user's assignments
router.get('/:id/assignments', validateObjectId, getUserAssignments);

// Create new user
router.post('/', validateUser, createUser);

// Update user
router.put('/:id', validateObjectId, validateUserUpdate, updateUser);

// Delete user
router.delete('/:id', validateObjectId, deleteUser);

module.exports = router;