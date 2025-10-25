import React from 'react';

export default function StatusCard({ label, value, gradient = 'from-emerald-400 to-emerald-600', extra, Icon, compact = false, iconPosition = 'top-right' }) {
  const padding = compact ? 'p-4' : 'p-4';
  const valueText = compact ? 'text-4xl' : 'text-4xl';
  const iconOverlaySize = compact ? 'text-8xl' : 'text-9xl';
  const inlineIconSize = compact ? 'text-xl' : 'text-2xl';
  const containerHeight = compact ? 'min-h-[96px] h-full' : 'min-h-[120px]';
  // Map iconPosition to Tailwind classes. Supports: top-right, top-left, bottom-right, bottom-left, center, inside-top-right
  const posMap = {
    'top-right': '-top-6 -right-8',
    'top-left': '-top-12 -left-12',
    'bottom-right': '-bottom-12 -right-12',
    'bottom-left': '-bottom-12 -left-12',
    'center': 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
    'inside-top-right': 'top-2 right-2'
  };
  const iconPosClass = posMap[iconPosition] || posMap['top-right'];

  return (
    <div className={`relative overflow-hidden bg-white group flex flex-col ${containerHeight}`}>
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} mix-blend-multiply z-0`} />
      {Icon && (
        <Icon className={`absolute ${iconOverlaySize} ${iconPosClass} text-white opacity-80 transform transition-transform duration-500 ease-in-out group-hover:text-white group-hover:opacity-100 group-hover:rotate-12 group-hover:-translate-y-2 z-40 pointer-events-none will-change-transform`} />
      )}
      <div className="absolute inset-0 transform translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-in-out bg-black/100 z-20 will-change-transform" />
      <div className={`relative ${padding} flex flex-col gap-1 z-30 flex-1 justify-center`}>
        <div className="flex items-center gap-2">
          {Icon && <Icon className={`${inlineIconSize} text-black/60 group-hover:text-white transition-colors duration-300 z-50`} />}
          <span className="text-[12px] font-semibold uppercase tracking-wide text-black/70 group-hover:text-white transition-colors duration-300 truncate">{label}</span>
        </div>
        <span className={`${valueText} font-bold leading-none text-black drop-shadow-sm group-hover:text-white transition-colors duration-300`}>{value}</span>
        {extra && <div className="mt-0.5 text-[12px] text-black/70 group-hover:text-white/80 transition-colors duration-300 leading-snug">{extra}</div>}
      </div>
    </div>
  );
}
