const Book = require('../models/Book');
const Assignment = require('../models/Assignment');

// Get all books with pagination
const getAllBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const books = await Book.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments();

    res.status(200).json({
      success: true,
      message: 'Books retrieved successfully',
      data: {
        books,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalBooks: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving books',
      error: error.message
    });
  }
};

// Get single book
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Book retrieved successfully',
      data: book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving book',
      error: error.message
    });
  }
};

// Add new book
const createBook = async (req, res) => {
  try {
    const { title, author, isbn, totalCopies, category } = req.body;

    // Check if book with same ISBN already exists
    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res.status(400).json({
        success: false,
        message: 'Book with this ISBN already exists'
      });
    }

    const book = new Book({
      title,
      author,
      isbn,
      totalCopies,
      availableCopies: totalCopies, // Initially all copies are available
      category
    });

    await book.save();

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating book',
      error: error.message
    });
  }
};

// Update book
const updateBook = async (req, res) => {
  try {
    const { title, author, isbn, totalCopies, category } = req.body;
    
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if ISBN is being changed and if it conflicts with another book
    if (isbn && isbn !== book.isbn) {
      const existingBook = await Book.findOne({ isbn, _id: { $ne: req.params.id } });
      if (existingBook) {
        return res.status(400).json({
          success: false,
          message: 'Book with this ISBN already exists'
        });
      }
    }

    // Update available copies if total copies changed
    const issuedCopies = book.totalCopies - book.availableCopies;
    const newAvailableCopies = totalCopies ? totalCopies - issuedCopies : book.availableCopies;

    if (newAvailableCopies < 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reduce total copies below currently issued books'
      });
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      {
        title: title || book.title,
        author: author || book.author,
        isbn: isbn || book.isbn,
        totalCopies: totalCopies || book.totalCopies,
        availableCopies: newAvailableCopies,
        category: category || book.category
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      data: updatedBook
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating book',
      error: error.message
    });
  }
};

// Delete book
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if book has active assignments
    const activeAssignments = await Assignment.countDocuments({
      bookId: req.params.id,
      status: 'issued'
    });

    if (activeAssignments > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete book with active assignments'
      });
    }

    await Book.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting book',
      error: error.message
    });
  }
};

// Get available books only
const getAvailableBooks = async (req, res) => {
  try {
    const books = await Book.find({ availableCopies: { $gt: 0 } })
      .sort({ title: 1 });

    res.status(200).json({
      success: true,
      message: 'Available books retrieved successfully',
      data: books
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving available books',
      error: error.message
    });
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getAvailableBooks
};