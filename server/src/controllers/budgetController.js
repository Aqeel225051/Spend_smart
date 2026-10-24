const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

// Helper to get start and end dates for a month (1-indexed month)
const getMonthDateRange = (year, month) => {
  // month is 1-12
  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return { startDate, endDate };
};

// @desc    Get all budgets for user
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res, next) => {
  try {
    const { year } = req.query;
    const query = { user: req.user._id };

    if (year) {
      query.year = parseInt(year, 10);
    }

    const budgets = await Budget.find(query).sort({ year: -1, month: -1 });

    // Calculate spent and remaining for each budget
    const enrichedBudgets = await Promise.all(
      budgets.map(async (b) => {
        const { startDate, endDate } = getMonthDateRange(b.year, b.month);
        const expenseAgg = await Expense.aggregate([
          {
            $match: {
              user: req.user._id,
              date: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: null,
              totalSpent: { $sum: '$amount' }
            }
          }
        ]);

        const spent = expenseAgg.length > 0 ? expenseAgg[0].totalSpent : 0;
        const remaining = b.amount - spent;
        const percentageSpent = b.amount > 0 ? (spent / b.amount) * 100 : 0;

        return {
          _id: b._id,
          month: b.month,
          year: b.year,
          amount: b.amount,
          spent: Math.round(spent * 100) / 100,
          remaining: Math.round(remaining * 100) / 100,
          percentageSpent: Math.round(percentageSpent * 10) / 10,
          status:
            percentageSpent >= 100
              ? 'exceeded'
              : percentageSpent >= 80
              ? 'warning'
              : 'normal',
          createdAt: b.createdAt,
          updatedAt: b.updatedAt
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enrichedBudgets.length,
      budgets: enrichedBudgets
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get or calculate current month's budget status
// @route   GET /api/budgets/current
// @access  Private
const getCurrentMonthBudget = async (req, res, next) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12

    let budget = await Budget.findOne({
      user: req.user._id,
      month: currentMonth,
      year: currentYear
    });

    const { startDate, endDate } = getMonthDateRange(currentYear, currentMonth);

    const expenseAgg = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalSpent = expenseAgg.length > 0 ? expenseAgg[0].totalSpent : 0;
    const transactionCount = expenseAgg.length > 0 ? expenseAgg[0].count : 0;

    const budgetAmount = budget ? budget.amount : 0;
    const remaining = budgetAmount - totalSpent;
    const percentageSpent = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        budgetExists: !!budget,
        budgetId: budget ? budget._id : null,
        month: currentMonth,
        year: currentYear,
        budgetAmount,
        totalSpent: Math.round(totalSpent * 100) / 100,
        remaining: Math.round(remaining * 100) / 100,
        percentageSpent: Math.round(percentageSpent * 10) / 10,
        transactionCount,
        status:
          percentageSpent >= 100
            ? 'exceeded'
            : percentageSpent >= 80
            ? 'warning'
            : 'normal'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set or update a monthly budget
// @route   POST /api/budgets
// @access  Private
const setBudget = async (req, res, next) => {
  try {
    const { month, year, amount } = req.body;

    const parsedMonth = parseInt(month, 10);
    const parsedYear = parseInt(year, 10);
    const parsedAmount = parseFloat(amount);

    if (!parsedMonth || parsedMonth < 1 || parsedMonth > 12) {
      return res.status(400).json({
        success: false,
        message: 'Month must be an integer between 1 and 12'
      });
    }

    if (!parsedYear || parsedYear < 2000 || parsedYear > 2100) {
      return res.status(400).json({
        success: false,
        message: 'Year must be a valid 4-digit year'
      });
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Budget amount must be a positive number greater than 0'
      });
    }

    // Upsert budget: if already exists for this user, month, year -> update it; otherwise create
    const budget = await Budget.findOneAndUpdate(
      {
        user: req.user._id,
        month: parsedMonth,
        year: parsedYear
      },
      {
        amount: parsedAmount
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    res.status(201).json({
      success: true,
      message: 'Monthly budget saved successfully',
      budget
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update budget by ID
// @route   PATCH /api/budgets/:id
// @access  Private
const updateBudget = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Budget amount must be a positive number greater than 0'
      });
    }

    let budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget record not found'
      });
    }

    // Enforce ownership
    if (budget.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not own this budget record'
      });
    }

    budget.amount = parsedAmount;
    await budget.save();

    res.status(200).json({
      success: true,
      message: 'Budget updated successfully',
      budget
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBudgets,
  getCurrentMonthBudget,
  setBudget,
  updateBudget
};
