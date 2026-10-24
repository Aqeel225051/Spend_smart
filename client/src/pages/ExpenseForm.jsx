import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Calendar,
  Tag,
  DollarSign,
  FileText,
  AlertCircle
} from 'lucide-react';

import { expenseAPI } from '../services/api';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import { CATEGORIES, CATEGORY_BG_CLASSES } from '../utils/constants';

export const ExpenseForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // If editing, fetch initial expense details
  useEffect(() => {
    if (isEditing) {
      const fetchExpense = async () => {
        try {
          setLoading(true);
          const res = await expenseAPI.getById(id);
          if (res.data?.success && res.data?.expense) {
            const exp = res.data.expense;
            setAmount(exp.amount.toString());
            setCategory(exp.category);
            setDate(new Date(exp.date).toISOString().split('T')[0]);
            setDescription(exp.description);
          }
        } catch (err) {
          setError(err.message || 'Failed to load expense details');
        } finally {
          setLoading(false);
        }
      };
      fetchExpense();
    }
  }, [id, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be a valid positive number greater than 0.');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a brief description for this expense.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        amount: parsedAmount,
        category,
        date,
        description: description.trim()
      };

      if (isEditing) {
        await expenseAPI.update(id, payload);
      } else {
        await expenseAPI.create(payload);
      }

      navigate('/transactions');
    } catch (err) {
      setError(err.message || 'Failed to save expense. Please verify the inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading expense information..." />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button and page header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          type="button"
          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            {isEditing ? 'Edit Expense Record' : 'Record New Expense'}
          </h1>
          <p className="text-xs text-slate-500">
            {isEditing
              ? 'Update the transaction amount, category, or notes'
              : 'Add your college, food, hostel, or personal spending'}
          </p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Expense Amount (INR ₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-slate-400 font-bold text-base">₹</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-semibold text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Enter the exact amount paid (e.g., 150 for lunch or 2500 for books)
            </p>
          </div>

          {/* Category Chip Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Category <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-medium text-left transition flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{cat}</span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Date of Expense <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Description / Notes <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <textarea
                rows={3}
                required
                maxLength={200}
                placeholder="e.g. Canteen lunch with classmates, Semester textbook, Metro card recharge..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition"
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>Brief note to easily identify this item later</span>
              <span>{description.length} / 200</span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => navigate('/transactions')}
              type="button"
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-xs disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : isEditing ? 'Update Expense' : 'Save Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
