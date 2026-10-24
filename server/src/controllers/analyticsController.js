const Expense = require('../models/Expense');
const Budget = require('../models/Budget');

// Helper to get month boundaries in UTC
const getMonthRange = (year, month) => {
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return { start, end };
};

// @desc    Get dashboard summary (current month metrics and recent transactions)
// @route   GET /api/analytics/summary
// @access  Private
const getDashboardSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12

    const { start: currentMonthStart, end: currentMonthEnd } = getMonthRange(
      currentYear,
      currentMonth
    );

    // Current month total expense aggregation
    const monthlyExpenses = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: currentMonthStart, $lte: currentMonthEnd }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const currentMonthExpense = monthlyExpenses.length > 0 ? monthlyExpenses[0].total : 0;
    const currentMonthTransactions = monthlyExpenses.length > 0 ? monthlyExpenses[0].count : 0;

    // Current month budget
    const budgetDoc = await Budget.findOne({
      user: req.user._id,
      month: currentMonth,
      year: currentYear
    });

    const budgetAmount = budgetDoc ? budgetDoc.amount : 0;
    const remainingBudget = budgetAmount - currentMonthExpense;
    const percentageSpent = budgetAmount > 0 ? (currentMonthExpense / budgetAmount) * 100 : 0;

    let budgetStatus = 'normal';
    if (budgetAmount > 0) {
      if (percentageSpent >= 100) budgetStatus = 'exceeded';
      else if (percentageSpent >= 80) budgetStatus = 'warning';
    }

    // Recent 5 transactions
    const recentTransactions = await Expense.find({ user: req.user._id })
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    // Total lifetime expenses
    const lifetimeAggregate = await Expense.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);
    const lifetimeTotal = lifetimeAggregate.length > 0 ? lifetimeAggregate[0].total : 0;
    const lifetimeCount = lifetimeAggregate.length > 0 ? lifetimeAggregate[0].count : 0;

    res.status(200).json({
      success: true,
      data: {
        month: currentMonth,
        year: currentYear,
        currentMonthExpense: Math.round(currentMonthExpense * 100) / 100,
        budgetAmount: Math.round(budgetAmount * 100) / 100,
        remainingBudget: Math.round(remainingBudget * 100) / 100,
        percentageSpent: Math.round(percentageSpent * 10) / 10,
        transactionCount: currentMonthTransactions,
        budgetStatus,
        recentTransactions,
        lifetimeTotal: Math.round(lifetimeTotal * 100) / 100,
        lifetimeCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category-wise spending breakdown
// @route   GET /api/analytics/categories
// @access  Private
const getCategoryBreakdown = async (req, res, next) => {
  try {
    const { startDate, endDate, month, year } = req.query;
    const matchQuery = { user: req.user._id };

    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchQuery.date.$lte = end;
      }
    } else if (month && year) {
      const { start, end } = getMonthRange(parseInt(year, 10), parseInt(month, 10));
      matchQuery.date = { $gte: start, $lte: end };
    } else {
      // Default to current month
      const now = new Date();
      const { start, end } = getMonthRange(now.getFullYear(), now.getMonth() + 1);
      matchQuery.date = { $gte: start, $lte: end };
    }

    const categoryStats = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    const totalPeriodSpent = categoryStats.reduce((acc, curr) => acc + curr.totalAmount, 0);

    const categories = categoryStats.map(item => ({
      category: item._id,
      amount: Math.round(item.totalAmount * 100) / 100,
      count: item.count,
      percentage: totalPeriodSpent > 0
        ? Math.round((item.totalAmount / totalPeriodSpent) * 1000) / 10
        : 0
    }));

    res.status(200).json({
      success: true,
      totalSpent: Math.round(totalPeriodSpent * 100) / 100,
      categories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly expense trends, comparison, and highest-spending category
// @route   GET /api/analytics/monthly
// @access  Private
const getMonthlyTrends = async (req, res, next) => {
  try {
    const now = new Date();
    const monthsData = [];

    // Fetch data for the last 6 months (chronological)
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth() + 1; // 1-12
      const monthName = targetDate.toLocaleString('default', { month: 'short' });
      const label = `${monthName} ${year}`;

      const { start, end } = getMonthRange(year, month);

      const [expenseAgg, budgetDoc] = await Promise.all([
        Expense.aggregate([
          {
            $match: {
              user: req.user._id,
              date: { $gte: start, $lte: end }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' }
            }
          }
        ]),
        Budget.findOne({
          user: req.user._id,
          month,
          year
        })
      ]);

      const totalSpent = expenseAgg.length > 0 ? expenseAgg[0].total : 0;
      const budgetAmount = budgetDoc ? budgetDoc.amount : 0;

      monthsData.push({
        month,
        year,
        label,
        spent: Math.round(totalSpent * 100) / 100,
        budget: Math.round(budgetAmount * 100) / 100
      });
    }

    // Comparison between current month and previous month
    const currentMonthData = monthsData[monthsData.length - 1];
    const prevMonthData = monthsData[monthsData.length - 2];

    const currentSpent = currentMonthData ? currentMonthData.spent : 0;
    const prevSpent = prevMonthData ? prevMonthData.spent : 0;
    const diff = currentSpent - prevSpent;
    const percentChange = prevSpent > 0 ? ((diff / prevSpent) * 100) : 0;

    // Highest spending category across all expenses or current month
    const currentMonthRange = getMonthRange(now.getFullYear(), now.getMonth() + 1);
    const topCategoryCurrent = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: currentMonthRange.start, $lte: currentMonthRange.end }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 1 }
    ]);

    const topCategoryAllTime = await Expense.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 1 }
    ]);

    res.status(200).json({
      success: true,
      trends: monthsData,
      comparison: {
        currentMonth: currentMonthData?.label,
        currentSpent,
        previousMonth: prevMonthData?.label,
        previousSpent: prevSpent,
        difference: Math.round(diff * 100) / 100,
        percentChange: Math.round(percentChange * 10) / 10,
        trend: diff > 0 ? 'increase' : diff < 0 ? 'decrease' : 'neutral'
      },
      highestCategory: {
        currentMonth: topCategoryCurrent[0]
          ? { category: topCategoryCurrent[0]._id, amount: Math.round(topCategoryCurrent[0].total * 100) / 100 }
          : null,
        allTime: topCategoryAllTime[0]
          ? { category: topCategoryAllTime[0]._id, amount: Math.round(topCategoryAllTime[0].total * 100) / 100 }
          : null
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  getCategoryBreakdown,
  getMonthlyTrends
};
