const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    month: {
      type: Number,
      required: [true, 'Please specify the month (1-12)'],
      min: [1, 'Month must be between 1 and 12'],
      max: [12, 'Month must be between 1 and 12']
    },
    year: {
      type: Number,
      required: [true, 'Please specify the year'],
      min: [2000, 'Year must be 2000 or later'],
      max: [2100, 'Year must be realistic']
    },
    amount: {
      type: Number,
      required: [true, 'Please enter a budget amount'],
      min: [0.01, 'Budget amount must be greater than zero']
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate budgets for the same user and month/year combination
budgetSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
