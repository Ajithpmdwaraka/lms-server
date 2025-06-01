const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book ID is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  issueDate: {
    type: Date,
    required: [true, 'Issue date is required'],
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
    validate: {
      validator: function(v) {
        return v > this.issueDate;
      },
      message: 'Due date must be after issue date'
    }
  },
  returnDate: {
    type: Date,
    default: null,
    validate: {
      validator: function(v) {
        return !v || v >= this.issueDate;
      },
      message: 'Return date must be after issue date'
    }
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['issued', 'returned'],
      message: 'Status must be either issued or returned'
    },
    default: 'issued'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for checking if book is overdue
assignmentSchema.virtual('isOverdue').get(function() {
  if (this.status === 'returned') return false;
  return new Date() > this.dueDate;
});

// Virtual for days overdue
assignmentSchema.virtual('daysOverdue').get(function() {
  if (this.status === 'returned' || !this.isOverdue) return 0;
  const diffTime = Math.abs(new Date() - this.dueDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for assignment duration
assignmentSchema.virtual('assignmentDuration').get(function() {
  const endDate = this.returnDate || new Date();
  const diffTime = Math.abs(endDate - this.issueDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Compound index to prevent duplicate active assignments
assignmentSchema.index({ bookId: 1, userId: 1, status: 1 });

// Index for better query performance
assignmentSchema.index({ status: 1, issueDate: -1 });
assignmentSchema.index({ userId: 1, status: 1 });
assignmentSchema.index({ bookId: 1, status: 1 });
assignmentSchema.index({ dueDate: 1, status: 1 });

// Pre-save middleware to set due date if not provided
assignmentSchema.pre('save', function(next) {
  if (this.isNew && !this.dueDate) {
    this.dueDate = new Date(this.issueDate.getTime() + (14 * 24 * 60 * 60 * 1000)); // 14 days
  }
  
  // Set return date when status changes to returned
  if (this.status === 'returned' && !this.returnDate) {
    this.returnDate = new Date();
  }
  
  next();
});

// Compound unique index to prevent same user from borrowing same book multiple times simultaneously
assignmentSchema.index(
  { bookId: 1, userId: 1 },
  { 
    unique: true,
    partialFilterExpression: { status: 'issued' }
  }
);

module.exports = mongoose.model('Assignment', assignmentSchema);