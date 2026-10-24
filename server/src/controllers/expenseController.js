const Expense = require('../models/Expense');

// @desc    Get all user expenses with filters, search, sort, and pagination
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res, next) => {
  try {
    const {
      search,
      category,
      startDate,
      endDate,
      sortBy = 'date',
      order = 'desc',
      page = 1,
      limit = 10,
      all = 'false'
    } = req.query;

    const query = { user: req.user._id };

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Search by description (case-insensitive regex)
    if (search && search.trim() !== '') {
      query.description = { $regex: search.trim(), $options: 'i' };
    }

    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set to end of the day for inclusive filtering
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Sorting
    const sortField = ['date', 'amount', 'category', 'description'].includes(sortBy)
      ? sortBy
      : 'date';
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = { [sortField]: sortOrder };

    // If 'all' is true, return all matching items without pagination (useful for CSV export)
    if (all === 'true') {
      const expenses = await Expense.find(query).sort(sortOptions);
      return res.status(200).json({
        success: true,
        count: expenses.length,
        expenses
      });
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await Expense.countDocuments(query);
    const expenses = await Expense.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: expenses.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      expenses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single expense by ID
// @route   GET /api/expenses/:id
// @access  Private
const getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Enforce ownership
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not own this expense record'
      });
    }

    res.status(200).json({
      success: true,
      expense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res, next) => {
  try {
    const { amount, category, date, description } = req.body;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number greater than 0'
      });
    }

    const expense = await Expense.create({
      user: req.user._id,
      amount: parsedAmount,
      category,
      date: date ? new Date(date) : new Date(),
      description
    });

    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      expense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update existing expense
// @route   PATCH /api/expenses/:id
// @access  Private
const updateExpense = async (req, res, next) => {
  try {
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Enforce ownership
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You cannot edit an expense that does not belong to you'
      });
    }

    const { amount, category, date, description } = req.body;

    if (amount !== undefined) {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be a positive number greater than 0'
        });
      }
      expense.amount = parsedAmount;
    }

    if (category) expense.category = category;
    if (date) expense.date = new Date(date);
    if (description !== undefined) expense.description = description;

    const updatedExpense = await expense.save();

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      expense: updatedExpense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Enforce ownership
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You cannot delete an expense that does not belong to you'
      });
    }

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export expenses as CSV
// @route   GET /api/expenses/export/csv
// @access  Private
const exportExpensesCSV = async (req, res, next) => {
  try {
    const { category, startDate, endDate } = req.query;
    const query = { user: req.user._id };

    if (category && category !== 'All') {
      query.category = category;
    }
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const expenses = await Expense.find(query).sort({ date: -1 });

    // Format into CSV lines
    const headers = ['Date', 'Category', 'Description', 'Amount (INR)'];
    const rows = expenses.map(exp => {
      const formattedDate = new Date(exp.date).toISOString().split('T')[0];
      const escapedDesc = `"${exp.description.replace(/"/g, '""')}"`;
      return [formattedDate, exp.category, escapedDesc, exp.amount.toFixed(2)].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="spendsmart_expenses.csv"');
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  exportExpensesCSV
};
