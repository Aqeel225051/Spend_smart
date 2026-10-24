import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../utils/constants';

export const BudgetProgressBar = ({
  spent = 0,
  budget = 0,
  percentage = 0,
  showWarningBanner = true
}) => {
  const cappedPercentage = Math.min(Math.max(percentage, 0), 100);
  const isExceeded = percentage >= 100;
  const isWarning = percentage >= 80 && !isExceeded;

  let barColor = 'bg-emerald-500';
  let badgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';

  if (isExceeded) {
    barColor = 'bg-rose-500';
    badgeColor = 'text-rose-700 bg-rose-50 border-rose-200';
  } else if (isWarning) {
    barColor = 'bg-amber-500';
    badgeColor = 'text-amber-700 bg-amber-50 border-amber-200';
  }

  const remaining = budget - spent;

  return (
    <div className="space-y-3">
      {/* Top Labels */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-700">Budget Progress</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${badgeColor}`}>
            {percentage.toFixed(1)}% spent
          </span>
        </div>
        <span className="text-slate-500 font-medium">
          {formatCurrency(spent)} <span className="text-slate-400">/ {formatCurrency(budget)}</span>
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
        <div
          className={`h-full transition-all duration-500 rounded-full ${barColor}`}
          style={{ width: `${cappedPercentage}%` }}
        />
      </div>

      {/* Bottom Summary & Alert Banners */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <span>
          {isExceeded ? (
            <span className="text-rose-600 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 inline" /> Exceeded by {formatCurrency(Math.abs(remaining))}
            </span>
          ) : (
            <span className="text-slate-600 font-medium">
              Remaining: <span className="font-semibold text-slate-800">{formatCurrency(remaining)}</span>
            </span>
          )}
        </span>
        <span className="text-slate-400">Limit: {formatCurrency(budget)}</span>
      </div>

      {showWarningBanner && isExceeded && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>
            <strong>Warning: Budget Exceeded!</strong> You have spent{' '}
            {percentage.toFixed(1)}% of your monthly allowance. Consider cutting down on non-essential categories.
          </span>
        </div>
      )}

      {showWarningBanner && isWarning && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Attention:</strong> You have reached {percentage.toFixed(1)}% of your monthly budget. Slow down spending to stay within your goal.
          </span>
        </div>
      )}
    </div>
  );
};

export default BudgetProgressBar;
