const mongoose = require('mongoose');

const CATEGORIES = [
  'Food',
  'Transportation',
  'Education',
  'Shopping',
  'Entertainment',
  'Hostel',
  'Bills',
  'Health',
  'Other'
];

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: [true, 'Please enter an expense amount'],
      min: [0.01, 'Amount must be a positive number greater than 0']
    },
    category: {
      type: String,
      required: [true, 'Please select an expense category'],
      enum: {
        values: CATEGORIES,
        message: '{VALUE} is not a valid category'
      }
    },
    date: {
      type: Date,
      required: [true, 'Please specify the expense date'],
      default: Date.now
    },
    description: {
      type: String,
      required: [true, 'Please enter a description'],
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters']
    }
  },
  {
    timestamps: true
  }
);

// Compound index for user query performance with date
expenseSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);
module.exports.CATEGORIES = CATEGORIES;
