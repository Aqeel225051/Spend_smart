import React, { useState, useEffect, useCallback } from 'react';
import {
  PiggyBank,
  Calendar,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  PlusCircle,
  Save,
  ArrowRight
} from 'lucide-react';

import { budgetAPI } from '../services/api';
import BudgetProgressBar from '../components/BudgetProgressBar';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrency, MONTH_NAMES } from '../utils/constants';

export const Budgets = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [amount, setAmount] = useState('');

  const [currentBudget, setCurrentBudget] = useState(null);
  const [budgetList, setBudgetList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchBudgetData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [currentRes, listRes] = await Promise.all([
        budgetAPI.getCurrent(),
        budgetAPI.getAll()
      ]);

      if (currentRes.data?.success) {
        setCurrentBudget(currentRes.data.data);
        if (currentRes.data.data?.budgetAmount) {
          setAmount(currentRes.data.data.budgetAmount.toString());
        }
      }
      if (listRes.data?.success) {
        setBudgetList(listRes.data.budgets || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch budget information.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudgetData();
  }, [fetchBudgetData]);

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Budget amount must be a positive number greater than 0.');
      return;
    }

    try {
      setSaving(true);
      const res = await budgetAPI.setBudget({
        month: selectedMonth,
        year: selectedYear,
        amount: parsedAmount
      });

      if (res.data?.success) {
        setSuccessMessage(
          `Monthly budget of ${formatCurrency(parsedAmount)} saved for ${
            MONTH_NAMES[selectedMonth - 1]
          } ${selectedYear}!`
        );
        fetchBudgetData();
      }
    } catch (err) {
      setError(err.message || 'Failed to save monthly budget.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Fetching budget records..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Monthly Budgets</h1>
        <p className="text-xs text-slate-500">
          Establish monthly limits to discipline your student spending and avoid end-of-semester shortfalls
        </p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />}

      {/* Current Month Overview Card */}
      {currentBudget && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                <PiggyBank className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  {MONTH_NAMES[currentBudget.month - 1]} {currentBudget.year} Spending Target
                </h2>
                <p className="text-xs text-slate-400">
                  {currentBudget.budgetExists
                    ? `Current active budget with real-time expense calculations`
                    : `No budget has been configured for the current month yet`}
                </p>
              </div>
            </div>

            {currentBudget.budgetExists && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  currentBudget.status === 'exceeded'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : currentBudget.status === 'warning'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {currentBudget.status === 'exceeded'
                  ? 'Exceeded'
                  : currentBudget.status === 'warning'
                  ? '80% Warning'
                  : 'On Track'}
              </span>
            )}
          </div>

          {currentBudget.budgetExists ? (
            <div className="pt-2">
              <BudgetProgressBar
                spent={currentBudget.totalSpent}
                budget={currentBudget.budgetAmount}
                percentage={currentBudget.percentageSpent}
              />
            </div>
          ) : (
            <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
              Configure your monthly budget below to automatically track spending limits and receive alerts when you approach 80% or exceed your threshold.
            </p>
          )}
        </div>
      )}

      {/* Set / Update Budget Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 mb-1">
          Configure Monthly Budget Limit
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          Select the month and specify your maximum planned expenditure limit.
        </p>

        <form onSubmit={handleSaveBudget} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Target Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition"
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Target Year
              </label>
              <input
                type="number"
                min="2020"
                max="2035"
                required
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Budget Limit (INR ₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">₹</span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  placeholder="e.g. 5000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-xs disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Budget...' : 'Save Monthly Budget'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Past / Configured Budgets History */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Budget History & Status</h3>
        <p className="text-xs text-slate-400 mb-4">
          Review spending adherence across recorded academic months
        </p>

        {budgetList.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No monthly budgets configured yet. Create one above to begin.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 font-semibold">Period</th>
                  <th className="py-3 px-4 font-semibold">Budget Limit</th>
                  <th className="py-3 px-4 font-semibold">Total Spent</th>
                  <th className="py-3 px-4 font-semibold">Remaining</th>
                  <th className="py-3 px-4 font-semibold">% Used</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {budgetList.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                      {MONTH_NAMES[b.month - 1]} {b.year}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700 whitespace-nowrap">
                      {formatCurrency(b.amount)}
                    </td>
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      {formatCurrency(b.spent)}
                    </td>
                    <td
                      className={`py-3 px-4 font-semibold whitespace-nowrap ${
                        b.remaining < 0 ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {formatCurrency(b.remaining)}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700 whitespace-nowrap">
                      {b.percentageSpent}%
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                          b.status === 'exceeded'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : b.status === 'warning'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {b.status === 'exceeded'
                          ? 'Exceeded'
                          : b.status === 'warning'
                          ? 'Warning'
                          : 'Normal'}
                      </span>
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

export default Budgets;
