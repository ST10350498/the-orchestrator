import React from 'react';

function StatsCard({ title, value, icon, color = 'primary', subtitle }) {
  const colors = {
    primary: 'from-primary to-indigo-700',
    green: 'from-green-500 to-emerald-600',
    yellow: 'from-yellow-500 to-orange-600',
    red: 'from-red-500 to-rose-600',
    teal: 'from-teal-500 to-cyan-600',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color] || colors.primary} rounded-xl shadow-lg p-6 text-white`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-white/80 text-sm">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {subtitle && <p className="text-white/70 text-xs mt-1">{subtitle}</p>}
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  );
}

export default StatsCard;