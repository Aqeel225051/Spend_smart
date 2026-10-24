const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  getBudgets,
  getCurrentMonthBudget,
  setBudget,
  updateBudget
} = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const budgetValidation = [
  body('month')
    .notEmpty()
    .withMessage('Month is required')
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  body('year')
    .notEmpty()
    .withMessage('Year is required')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Year must be between 2000 and 2100'),
  body('amount')
    .notEmpty()
    .withMessage('Budget amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Budget amount must be a positive number greater than 0'),
  validate
];

const updateBudgetValidation = [
  body('amount')
    .notEmpty()
    .withMessage('Budget amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Budget amount must be a positive number greater than 0'),
  validate
];

router.use(protect);

router.get('/current', getCurrentMonthBudget);

router.route('/')
  .get(getBudgets)
  .post(budgetValidation, setBudget);

router.route('/:id')
  .patch(updateBudgetValidation, updateBudget);

module.exports = router;
