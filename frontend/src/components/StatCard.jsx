import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'cyan', // 'cyan', 'purple', 'green', 'pink'
}) {
  const colorStyles = {
    cyan: {
      border: 'border-cyan-500/20 hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-400/30',
      shadow: 'hover:shadow-neon-cyan',
      text: 'text-cyan-400',
    },
    purple: {
      border: 'border-purple-500/20 hover:border-purple-500/40',
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-400/30',
      shadow: 'hover:shadow-neon-purple',
      text: 'text-purple-400',
    },
    green: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-400/30',
      shadow: 'hover:shadow-neon-green',
      text: 'text-emerald-400',
    },
    pink: {
      border: 'border-pink-500/20 hover:border-pink-500/40',
      iconBg: 'bg-pink-500/10 text-pink-400 border-pink-400/30',
      shadow: 'hover:shadow-[0_0_20px_rgba(255,0,127,0.35)]',
      text: 'text-pink-400',
    },
  }[color] || colorStyles.cyan;

  return (
    <div className={`p-5 rounded-2xl bg-slate-900/60 border ${colorStyles.border} ${colorStyles.shadow} backdrop-blur-xl transition-all`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-black text-white mt-1 font-mono">{value}</h3>
          {subtitle && (
            <p className={`text-[11px] font-medium mt-1 ${colorStyles.text}`}>{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border ${colorStyles.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
