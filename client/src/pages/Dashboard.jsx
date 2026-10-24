import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  CreditCard,
  TrendingDown,
  Receipt,
  PlusCircle,
  PiggyBank,
  ArrowUpRight,
  Calendar,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

import { analyticsAPI, budgetAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import BudgetProgressBar from '../components/BudgetProgressBar';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Alert from '../components/Alert';
import {
  formatCurrency,
  formatDate,
  CATEGORY_COLORS,
  CATEGORY_BG_CLASSES,
  MONTH_NAMES
} from '../utils/constants';

export const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, categoriesRes, trendsRes] = await Promise.all([
        analyticsAPI.getSummary(),
        analyticsAPI.getCategories(),
        analyticsAPI.getMonthlyTrends()
      ]);

      if (summaryRes.data?.success) {
        setSummary(summaryRes.data.data);
      }
      if (categoriesRes.data?.success) {
        setCategories(categoriesRes.data.categories || []);
      }
      if (trendsRes.data?.success) {
        setTrends(trendsRes.data.trends || []);
      }
    } catch (err) {
      setError(err.message || 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return <LoadingSpinner text="Fetching your financial summary..." />;
  }

  const currentMonthName = summary ? MONTH_NAMES[summary.month - 1] : '';
  const hasTransactions = summary && summary.transactionCount > 0;
  const hasLifetimeTransactions = summary && summary.lifetimeCount > 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-lg shadow-indigo-600/15">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-100 text-xs font-medium mb-2 border border-indigo-400/20">
            <Calendar className="w-3.5 h-3.5" />
            <span>{currentMonthName} {summary?.year} Period</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Hi, {user?.name || 'Student'}! 👋
          </h1>
          <p className="text-indigo-100 text-xs sm:text-sm mt-1">
            {summary?.budgetAmount > 0
              ? `You've spent ${summary?.percentageSpent}% of your monthly student budget.`
              : 'Keep track of college expenses and set a monthly budget to stay financially smart.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/expenses/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-700 text-xs sm:text-sm font-semibold hover:bg-indigo-50 transition shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Expense</span>
          </Link>
          <Link
            to="/budgets"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-900/60 hover:bg-indigo-900/80 text-white text-xs sm:text-sm font-semibold border border-indigo-400/30 transition shadow-sm"
          >
            <PiggyBank className="w-4 h-4" />
            <span>Set Budget</span>
          </Link>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* No Transactions At All: Friendly First-Time Onboarding State */}
      {!hasLifetimeTransactions ? (
        <EmptyState
          icon={Receipt}
          title="Welcome to SpendSmart!"
          description="You haven't recorded any expenses yet. Record your daily campus expenses like food, books, or transport to start seeing live spending analytics and budget tracking."
          actionLabel="Record Your First Expense"
          onAction={() => (window.location.href = '/expenses/new')}
        />
      ) : (
        <>
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Spent This Month"
              value={formatCurrency(summary?.currentMonthExpense || 0)}
              subtitle={`${summary?.transactionCount || 0} transactions in ${currentMonthName}`}
              icon={TrendingDown}
              variant="primary"
            />
            <StatCard
              title="Monthly Budget"
              value={
                summary?.budgetAmount > 0
                  ? formatCurrency(summary.budgetAmount)
                  : 'Not Set'
              }
              subtitle={
                summary?.budgetAmount > 0
                  ? `For ${currentMonthName} ${summary?.year}`
                  : 'Click Set Budget to configure'
              }
              icon={Wallet}
              variant={summary?.budgetAmount > 0 ? 'default' : 'warning'}
            />
            <StatCard
              title="Remaining Budget"
              value={
                summary?.budgetAmount > 0
                  ? formatCurrency(summary.remainingBudget)
                  : '—'
              }
              subtitle={
                summary?.budgetAmount > 0
                  ? summary.remainingBudget >= 0
                    ? 'Available to spend'
                    : 'Over monthly limit'
                  : 'Budget required'
              }
              icon={CreditCard}
              variant={
                summary?.budgetAmount > 0
                  ? summary.remainingBudget < 0
                    ? 'danger'
                    : summary.percentageSpent >= 80
                    ? 'warning'
                    : 'success'
                  : 'default'
              }
              badgeText={
                summary?.budgetAmount > 0
                  ? `${summary.percentageSpent}% spent`
                  : undefined
              }
              badgeVariant={
                summary?.percentageSpent >= 100
                  ? 'danger'
                  : summary?.percentageSpent >= 80
                  ? 'warning'
                  : 'success'
              }
            />
            <StatCard
              title="Total Transactions"
              value={summary?.transactionCount || 0}
              subtitle={`Lifetime: ${summary?.lifetimeCount || 0} expenses`}
              icon={Receipt}
              variant="default"
            />
          </div>

          {/* Budget Progress Card */}
          {summary?.budgetAmount > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <BudgetProgressBar
                spent={summary.currentMonthExpense}
                budget={summary.budgetAmount}
                percentage={summary.percentageSpent}
              />
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-amber-900 text-xs sm:text-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">No budget set for {currentMonthName} {summary?.year}</p>
                  <p className="text-amber-700 text-xs">
                    Setting a monthly allowance helps keep student expenses under control and activates automated budget warning alerts.
                  </p>
                </div>
              </div>
              <Link
                to="/budgets"
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition shrink-0"
              >
                Set Budget
              </Link>
            </div>
          )}

          {/* Visual Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category-wise Spending Donut Chart */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Category Spending ({currentMonthName})
                  </h3>
                  <p className="text-xs text-slate-400">Distribution across student expense categories</p>
                </div>
                <Link
                  to="/analytics"
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                >
                  Details <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {categories.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs flex-1 flex items-center justify-center">
                  No expenses recorded in {currentMonthName} yet.
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categories}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        {categories.map((entry) => (
                          <Cell
                            key={`cell-${entry.category}`}
                            fill={CATEGORY_COLORS[entry.category] || '#64748b'}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val) => [formatCurrency(val), 'Spent']}
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '0.75rem',
                          color: '#fff',
                          border: 'none',
                          fontSize: '12px'
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Monthly Trend Comparison Bar Chart */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Spending vs. Budget (Last 6 Months)
                  </h3>
                  <p className="text-xs text-slate-400">Monthly expense history and target limit</p>
                </div>
                <Link
                  to="/analytics"
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                >
                  Reports <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={trends}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickFormatter={(v) => `₹${v}`}
                    />
                    <Tooltip
                      formatter={(val, name) => [
                        formatCurrency(val),
                        name === 'spent' ? 'Expenses' : 'Budget'
                      ]}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '0.75rem',
                        color: '#fff',
                        border: 'none',
                        fontSize: '12px'
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    />
                    <Bar
                      dataKey="spent"
                      name="Spent"
                      fill="#6366f1"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="budget"
                      name="Budget"
                      fill="#cbd5e1"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Transactions List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Recent Transactions</h3>
                <p className="text-xs text-slate-400">Latest expense entries recorded on your account</p>
              </div>
              <Link
                to="/transactions"
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {summary?.recentTransactions && summary.recentTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[11px]">
                      <th className="pb-3 font-semibold">Date</th>
                      <th className="pb-3 font-semibold">Category</th>
                      <th className="pb-3 font-semibold">Description</th>
                      <th className="pb-3 font-semibold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summary.recentTransactions.map((tx) => (
                      <tr key={tx._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 text-slate-500 whitespace-nowrap">
                          {formatDate(tx.date)}
                        </td>
                        <td className="py-3 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-lg font-medium border text-[11px] ${
                              CATEGORY_BG_CLASSES[tx.category] || 'bg-slate-50 text-slate-700'
                            }`}
                          >
                            {tx.category}
                          </span>
                        </td>
                        <td className="py-3 text-slate-800 font-medium max-w-xs truncate">
                          {tx.description}
                        </td>
                        <td className="py-3 text-right font-bold text-slate-900 whitespace-nowrap">
                          {formatCurrency(tx.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">
                No recent transactions found.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
