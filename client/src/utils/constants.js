export const CATEGORIES = [
  'Food',
  'Transportation',
  'Education',
  'Shopping',
  'Entertainment',
  'Hostel',
  'Bills',
  'Health',
  'Other'
];

export const CATEGORY_COLORS = {
  Food: '#f97316',          // orange-500
  Transportation: '#0284c7',// sky-600
  Education: '#6366f1',     // indigo-500
  Shopping: '#ec4899',      // pink-500
  Entertainment: '#8b5cf6', // purple-500
  Hostel: '#eab308',        // yellow-500
  Bills: '#ef4444',         // red-500
  Health: '#10b981',        // emerald-500
  Other: '#64748b'          // slate-500
};

export const CATEGORY_BG_CLASSES = {
  Food: 'bg-orange-50 text-orange-700 border-orange-200',
  Transportation: 'bg-sky-50 text-sky-700 border-sky-200',
  Education: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Shopping: 'bg-pink-50 text-pink-700 border-pink-200',
  Entertainment: 'bg-purple-50 text-purple-700 border-purple-200',
  Hostel: 'bg-amber-50 text-amber-700 border-amber-200',
  Bills: 'bg-red-50 text-red-700 border-red-200',
  Health: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Other: 'bg-slate-50 text-slate-700 border-slate-200'
};

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
