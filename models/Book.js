const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true,
    maxlength: [100, 'Author name cannot exceed 100 characters']
  },
  isbn: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/.test(v);
      },
      message: 'Please provide a valid ISBN'
    }
  },
  totalCopies: {
    type: Number,
    required: [true, 'Total copies is required'],
    min: [1, 'Total copies must be at least 1'],
    max: [1000, 'Total copies cannot exceed 1000']
  },
  availableCopies: {
    type: Number,
    required: true,
    min: [0, 'Available copies cannot be negative'],
    validate: {
      validator: function(v) {
        return v <= this.totalCopies;
      },
      message: 'Available copies cannot exceed total copies'
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters'],
    enum: {
      values: ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Mystery', 'Romance', 'Fantasy', 'Horror', 'Self-Help', 'Educational', 'Reference', 'Other'],
      message: 'Please select a valid category'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for issued copies
bookSchema.virtual('issuedCopies').get(function() {
  return this.totalCopies - this.availableCopies;
});

// Virtual for availability status
bookSchema.virtual('isAvailable').get(function() {
  return this.availableCopies > 0;
});

// Index for better search performance
bookSchema.index({ title: 'text', author: 'text', category: 1 });
bookSchema.index({ isbn: 1 }, { unique: true });
bookSchema.index({ availableCopies: 1 });

// Pre-save middleware to ensure data consistency
bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);