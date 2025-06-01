const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters'],
    validate: {
      validator: function(v) {
        return /^[a-zA-Z\s]+$/.test(v);
      },
      message: 'Name can only contain letters and spaces'
    }
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please provide a valid email address'
    }
  },
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    unique: true,
    trim: true,
    uppercase: true,
    minlength: [3, 'Student ID must be at least 3 characters'],
    maxlength: [20, 'Student ID cannot exceed 20 characters'],
    validate: {
      validator: function(v) {
        return /^[a-zA-Z0-9]+$/.test(v);
      },
      message: 'Student ID can only contain letters and numbers'
    }
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^[+]?[0-9]{10,15}$/.test(v);
      },
      message: 'Please provide a valid phone number (10-15 digits)'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full contact info
userSchema.virtual('fullContact').get(function() {
  return `${this.name} (${this.email}, ${this.phone})`;
});

// Index for better search performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ studentId: 1 }, { unique: true });
userSchema.index({ name: 'text', email: 'text', studentId: 'text' });

// Pre-save middleware to format data
userSchema.pre('save', function(next) {
  // Capitalize first letter of each word in name
  this.name = this.name.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
  
  next();
});

module.exports = mongoose.model('User', userSchema);