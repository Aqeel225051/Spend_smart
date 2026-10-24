import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  PlusCircle,
  Trash2,
  Edit2,
  Calendar,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Receipt
} from 'lucide-react';

import { expenseAPI } from '../services/api';
import Modal from '../components/Modal';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  CATEGORIES,
  CATEGORY_BG_CLASSES,
  formatCurrency,
  formatDate
} from '../utils/constants';

export const Transactions = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalExpenses, setTotalExpenses] = useState(0);

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Export CSV State
  const [exporting, setExporting] = useState(false);

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        search,
        category,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sortBy,
        order,
        page,
        limit: 10
      };

      const res = await expenseAPI.getAll(params);
      if (res.data?.success) {
        setExpenses(res.data.expenses || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalExpenses(res.data.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch expenses.');
    } finally {
      setLoading(false);
    }
  }, [search, category, startDate, endDate, sortBy, order, page]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Handle Delete Confirmation
  const handleDeleteClick = (expense) => {
    setExpenseToDelete(expense);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!expenseToDelete) return;
    try {
      setDeleting(true);
      const res = await expenseAPI.delete(expenseToDelete._id);
      if (res.data?.success) {
        setSuccessMessage('Expense deleted successfully.');
        setDeleteModalOpen(false);
        setExpenseToDelete(null);
        fetchExpenses();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete expense.');
    } finally {
      setDeleting(false);
    }
  };

  // Handle CSV Export
  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const params = {
        category: category !== 'All' ? category : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      };

      const response = await expenseAPI.exportCSV(params);
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `spendsmart_expenses_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setSuccessMessage('Expense data exported successfully as CSV.');
    } catch (err) {
      setError('Failed to export CSV: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setStartDate('');
    setEndDate('');
    setSortBy('date');
    setOrder('desc');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Expense Transactions</h1>
          <p className="text-xs text-slate-500">
            {totalExpenses} total records recorded
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            disabled={exporting || totalExpenses === 0}
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition shadow-xs disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
          <Link
            to="/expenses/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Expense</span>
          </Link>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />}

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search by Description */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <input
              type="date"
              title="Start Date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition"
            />
          </div>

          {/* End Date */}
          <div>
            <input
              type="date"
              title="End Date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Sort and Reset controls row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="category">Category</option>
              <option value="description">Description</option>
            </select>
            <button
              type="button"
              onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
              className="p-1 px-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs font-medium flex items-center gap-1"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>{order.toUpperCase()}</span>
            </button>
          </div>

          {(search || category !== 'All' || startDate || endDate) && (
            <button
              onClick={handleResetFilters}
              type="button"
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Expense List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading transactions..." />
        ) : expenses.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Receipt}
              title="No expenses match your criteria"
              description="Try adjusting your search query, clearing filters, or adding a new expense record."
              actionLabel="Add New Expense"
              onAction={() => (window.location.href = '/expenses/new')}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 font-semibold">Date</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Description</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Amount</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {formatDate(expense.date)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-lg font-medium border text-[11px] ${
                          CATEGORY_BG_CLASSES[expense.category] || 'bg-slate-50 text-slate-700'
                        }`}
                      >
                        {expense.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-medium max-w-sm truncate">
                      {expense.description}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          to={`/expenses/edit/${expense._id}`}
                          title="Edit Expense"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(expense)}
                          type="button"
                          title="Delete Expense"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Page {page} of {totalPages} ({totalExpenses} items)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                type="button"
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                type="button"
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Expense Deletion"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-900">Are you sure you want to delete this expense?</p>
              <p className="mt-1">
                This transaction record will be permanently removed from your history and monthly budget calculation.
              </p>
            </div>
          </div>

          {expenseToDelete && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <p>
                <strong className="text-slate-600">Description:</strong> {expenseToDelete.description}
              </p>
              <p>
                <strong className="text-slate-600">Category:</strong> {expenseToDelete.category}
              </p>
              <p>
                <strong className="text-slate-600">Amount:</strong> {formatCurrency(expenseToDelete.amount)}
              </p>
              <p>
                <strong className="text-slate-600">Date:</strong> {formatDate(expenseToDelete.date)}
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => setDeleteModalOpen(false)}
              type="button"
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleting}
              type="button"
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete Expense'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Transactions;
