import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  badgeText,
  badgeVariant = 'default'
}) => {
  const variantStyles = {
    default: {
      card: 'bg-white border-slate-200/80',
      iconBg: 'bg-slate-100 text-slate-700'
    },
    primary: {
      card: 'bg-white border-indigo-100 shadow-indigo-50/50',
      iconBg: 'bg-indigo-50 text-indigo-600'
    },
    success: {
      card: 'bg-white border-emerald-100 shadow-emerald-50/50',
      iconBg: 'bg-emerald-50 text-emerald-600'
    },
    warning: {
      card: 'bg-white border-amber-200 shadow-amber-50/50',
      iconBg: 'bg-amber-50 text-amber-600'
    },
    danger: {
      card: 'bg-white border-rose-200 shadow-rose-50/50',
      iconBg: 'bg-rose-50 text-rose-600'
    }
  };

  const badgeStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  const currentVariant = variantStyles[variant] || variantStyles.default;

  return (
    <div
      className={`relative p-5 rounded-2xl border ${currentVariant.card} shadow-sm transition-all duration-200 hover:shadow-md flex flex-col justify-between`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </span>
          <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
            {value}
          </h3>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${currentVariant.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
        <span className="truncate">{subtitle}</span>
        {badgeText && (
          <span
            className={`px-2 py-0.5 rounded-full font-medium border text-[11px] ${
              badgeStyles[badgeVariant] || badgeStyles.default
            }`}
          >
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
