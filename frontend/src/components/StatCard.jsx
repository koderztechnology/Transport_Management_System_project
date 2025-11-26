import React from 'react';

const StatCard = ({ icon, title, label, value, color, iconBg, iconColor }) => {
  const displayLabel = title || label; // Support both title and label props
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`${iconBg || color} p-3 rounded-lg`}>
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        <div>
          <p className="text-sm text-slate-500 font-medium mb-1">{displayLabel}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
