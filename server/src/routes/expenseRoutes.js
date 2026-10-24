const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  exportExpensesCSV
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { CATEGORIES } = require('../models/Expense');

const expenseValidation = [
  body('amount')
    .notEmpty()
    .withMessage('Expense amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number greater than 0'),
  body('category')
    .notEmpty()
    .withMessage('Expense category is required')
    .isIn(CATEGORIES)
    .withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 200 })
    .withMessage('Description must not exceed 200 characters'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date string'),
  validate
];

const updateExpenseValidation = [
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number greater than 0'),
  body('category')
    .optional()
    .isIn(CATEGORIES)
    .withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Description must not exceed 200 characters'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date string'),
  validate
];

// All expense routes require authentication
router.use(protect);

router.get('/export/csv', exportExpensesCSV);
router.route('/')
  .get(getExpenses)
  .post(expenseValidation, createExpense);

router.route('/:id')
  .get(getExpenseById)
  .patch(updateExpenseValidation, updateExpense)
  .delete(deleteExpense);

module.exports = router;
