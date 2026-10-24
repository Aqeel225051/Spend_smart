import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Award,
  Download,
  Filter,
  PieChart as PieIcon,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import { analyticsAPI, expenseAPI } from '../services/api';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  formatCurrency,
  CATEGORY_COLORS,
  CATEGORY_BG_CLASSES,
  MONTH_NAMES
} from '../utils/constants';

export const Analytics = () => {
  const [trendsData, setTrendsData] = useState(null);
  const [categoriesData, setCategoriesData] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);

  // Date range filter for custom analytics
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const [monthlyRes, catRes] = await Promise.all([
        analyticsAPI.getMonthlyTrends(),
        analyticsAPI.getCategories(params)
      ]);

      if (monthlyRes.data?.success) {
        setTrendsData(monthlyRes.data);
      }
      if (catRes.data?.success) {
        setCategoriesData(catRes.data.categories || []);
        setTotalSpent(catRes.data.totalSpent || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const params = {
        startDate: startDate || undefined,
        endDate: endDate || undefined
      };

      const res = await expenseAPI.exportCSV(params);
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', `spendsmart_analytics_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setSuccessMessage('Filtered expense report exported successfully.');
    } catch (err) {
      setError('Export failed: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Computing spending analytics..." />;
  }

  const comparison = trendsData?.comparison;
  const highestCategory = trendsData?.highestCategory;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Financial Analytics & Reports
          </h1>
          <p className="text-xs text-slate-500">
            Understand where your money goes, compare month-over-month habits, and export reports
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={exporting}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition shadow-xs disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{exporting ? 'Generating CSV...' : 'Export Filtered CSV'}</span>
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />}

      {/* Date Range Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-slate-600 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" /> Date Range:
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              type="button"
              className="text-xs text-indigo-600 font-semibold hover:underline"
            >
              Reset to Current Month
            </button>
          )}
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Spending in Selected Period */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Spending
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              {formatCurrency(totalSpent)}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {startDate || endDate ? 'Over selected date filter' : 'In current calendar month'}
            </p>
          </div>
        </div>

        {/* Month-over-Month Comparison */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Month-over-Month
            </span>
            <div
              className={`p-2 rounded-xl ${
                comparison?.difference > 0
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              {comparison?.difference > 0 ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                {comparison ? formatCurrency(Math.abs(comparison.difference)) : '₹0.00'}
              </h3>
              <span
                className={`text-xs font-semibold ${
                  comparison?.difference > 0 ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {comparison?.difference > 0 ? '+' : '-'}
                {comparison?.percentChange?.toFixed(1) || 0}%
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Compared to {comparison?.previousMonth || 'previous month'} ({formatCurrency(comparison?.previousSpent || 0)})
            </p>
          </div>
        </div>

        {/* Highest Spending Category */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Top Category
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {highestCategory?.currentMonth?.category || highestCategory?.allTime?.category || 'None yet'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {highestCategory?.currentMonth
                ? `${formatCurrency(highestCategory.currentMonth.amount)} spent this month`
                : highestCategory?.allTime
                ? `${formatCurrency(highestCategory.allTime.amount)} all-time top category`
                : 'No expense recorded'}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 6-Month Trend Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 mb-1">
            6-Month Spending vs Budget Trend
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Tracks total expenses alongside established budget targets
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={trendsData?.trends || []}
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
                <Bar dataKey="spent" name="Spent" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="budget" name="Budget" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 mb-1">
            Category Share Breakdown
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Percentage contribution of each category to overall expenses
          </p>

          {categoriesData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              No expenses recorded for this period.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoriesData}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoriesData.map((entry) => (
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
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Category Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 mb-1">
          Category Distribution Summary
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Detailed metrics showing amount and share of total spending
        </p>

        {categoriesData.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No category records to display.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Transactions</th>
                  <th className="py-3 px-4 font-semibold">Total Amount</th>
                  <th className="py-3 px-4 font-semibold">% of Spending</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categoriesData.map((cat) => (
                  <tr key={cat.category} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-lg font-medium border text-[11px] ${
                          CATEGORY_BG_CLASSES[cat.category] || 'bg-slate-50 text-slate-700'
                        }`}
                      >
                        {cat.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {cat.count} records
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(cat.amount)}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-indigo-600"
                            style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                          />
                        </div>
                        <span>{cat.percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
