const User = require('../models/User');
const Assignment = require('../models/Assignment');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving users',
      error: error.message
    });
  }
};

// Get single user
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving user',
      error: error.message
    });
  }
};

// Create new user
const createUser = async (req, res) => {
  try {
    const { name, email, studentId, phone } = req.body;

    // Check if user with same email or studentId exists
    const existingUser = await User.findOne({
      $or: [{ email }, { studentId }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or student ID already exists'
      });
    }

    const user = new User({
      name,
      email,
      studentId,
      phone
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { name, email, studentId, phone } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email or studentId conflicts with another user
    if (email || studentId) {
      const conflictUser = await User.findOne({
        $or: [
          { email: email || user.email },
          { studentId: studentId || user.studentId }
        ],
        _id: { $ne: req.params.id }
      });

      if (conflictUser) {
        return res.status(400).json({
          success: false,
          message: 'Email or Student ID already exists for another user'
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: name || user.name,
        email: email || user.email,
        studentId: studentId || user.studentId,
        phone: phone || user.phone
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has active assignments
    const activeAssignments = await Assignment.countDocuments({
      userId: req.params.id,
      status: 'issued'
    });

    if (activeAssignments > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user with active book assignments'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// Get user's assignments
const getUserAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ userId: req.params.id })
      .populate('bookId', 'title author isbn')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'User assignments retrieved successfully',
      data: assignments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving user assignments',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserAssignments
};