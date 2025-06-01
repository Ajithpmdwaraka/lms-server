const Assignment = require('../models/Assignment');
const Book = require('../models/Book');
const User = require('../models/User');

// Issue a book to user
const issueBook = async (req, res) => {
  try {
    const { bookId, userId } = req.body;

    // Check if book exists and is available
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Book is not available for issue'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user already has this book issued
    const existingAssignment = await Assignment.findOne({
      bookId,
      userId,
      status: 'issued'
    });

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: 'User has already borrowed this book'
      });
    }

    // Calculate due date (14 days from now)
    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    // Create assignment
    const assignment = new Assignment({
      bookId,
      userId,
      issueDate,
      dueDate,
      status: 'issued'
    });

    await assignment.save();

    // Update book's available copies
    book.availableCopies -= 1;
    await book.save();

    // Populate the assignment with book and user details
    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('bookId', 'title author isbn')
      .populate('userId', 'name email studentId');

    res.status(201).json({
      success: true,
      message: 'Book issued successfully',
      data: populatedAssignment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error issuing book',
      error: error.message
    });
  }
};

// Return a book
const returnBook = async (req, res) => {
  try {
    const assignmentId = req.params.id;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    if (assignment.status === 'returned') {
      return res.status(400).json({
        success: false,
        message: 'Book has already been returned'
      });
    }

    // Update assignment status
    assignment.status = 'returned';
    assignment.returnDate = new Date();
    await assignment.save();

    // Update book's available copies
    const book = await Book.findById(assignment.bookId);
    if (book) {
      book.availableCopies += 1;
      await book.save();
    }

    // Populate the assignment with book and user details
    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('bookId', 'title author isbn')
      .populate('userId', 'name email studentId');

    res.status(200).json({
      success: true,
      message: 'Book returned successfully',
      data: populatedAssignment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error returning book',
      error: error.message
    });
  }
};

// Get all active assignments
const getActiveAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ status: 'issued' })
      .populate('bookId', 'title author isbn')
      .populate('userId', 'name email studentId')
      .sort({ issueDate: -1 });

    res.status(200).json({
      success: true,
      message: 'Active assignments retrieved successfully',
      data: assignments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving active assignments',
      error: error.message
    });
  }
};

// Get assignment history
const getAssignmentHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const assignments = await Assignment.find()
      .populate('bookId', 'title author isbn')
      .populate('userId', 'name email studentId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Assignment.countDocuments();

    res.status(200).json({
      success: true,
      message: 'Assignment history retrieved successfully',
      data: {
        assignments,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalAssignments: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving assignment history',
      error: error.message
    });
  }
};

// Get all assignments (for admin view)
const getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('bookId', 'title author isbn')
      .populate('userId', 'name email studentId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'All assignments retrieved successfully',
      data: assignments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving assignments',
      error: error.message
    });
  }
};

module.exports = {
  issueBook,
  returnBook,
  getActiveAssignments,
  getAssignmentHistory,
  getAllAssignments
};