import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'primary' }) => {
  const colorSchemes = {
    primary: 'bg-primary-50 text-primary-600 dark:bg-primary-950/20 dark:text-primary-400',
    green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400',
    orange: 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400'
  };

  const activeColor = colorSchemes[color] || colorSchemes.primary;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-3xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden select-none">
      
      {/* Background shadow glow */}
      <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-950 blur-xl pointer-events-none"></div>

      <div className="space-y-1.5 z-10">
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">{title}</span>
        <span className="text-3xl font-black font-display tracking-tight text-slate-850 dark:text-white">
          {value}
        </span>
      </div>

      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${activeColor}`}>
        <Icon className="w-5 h-5" />
      </div>

    </div>
  );
};

export default StatCard;
