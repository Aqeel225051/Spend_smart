import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Plus, User, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview of your monthly expenses and budget' },
  '/transactions': { title: 'Transactions', subtitle: 'Manage and review your expense records' },
  '/expenses/new': { title: 'Add Expense', subtitle: 'Record a new student expense' },
  '/budgets': { title: 'Monthly Budgets', subtitle: 'Set and track monthly spending targets' },
  '/analytics': { title: 'Analytics & Reports', subtitle: 'Visual insights and spending trends' },
  '/settings': { title: 'Account Settings', subtitle: 'Manage your profile and preferences' }
};

export const Navbar = ({ onOpenMobile }) => {
  const { user } = useAuth();
  const location = useLocation();

  const currentPath = location.pathname.startsWith('/expenses/edit')
    ? '/expenses/new'
    : location.pathname;

  const pageInfo = PAGE_TITLES[currentPath] || {
    title: 'SpendSmart',
    subtitle: 'Student Expense Tracker'
  };

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobile}
            type="button"
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight leading-tight">
              {pageInfo.title}
            </h2>
            <p className="hidden sm:block text-xs text-slate-500 font-medium">
              {pageInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Quick CTA & User Avatar */}
        <div className="flex items-center gap-3">
          {location.pathname !== '/expenses/new' && (
            <Link
              to="/expenses/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition shadow-xs hover:shadow"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Expense</span>
            </Link>
          )}

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="hidden md:block text-xs font-medium text-slate-700">
              {user?.name?.split(' ')[0] || 'Student'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
