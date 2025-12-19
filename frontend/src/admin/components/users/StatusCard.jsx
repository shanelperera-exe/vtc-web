import React from 'react';

export default function StatusCard({ label, value, extra, Icon, compact = false, iconPosition = 'top-right' }) {
  const padding = compact ? 'p-4' : 'p-5';
  const valueText = compact ? 'text-3xl' : 'text-4xl';
  const iconOverlaySize = compact ? 'text-8xl' : 'text-9xl';
  const inlineIconSize = compact ? 'text-xl' : 'text-2xl';
  const containerHeight = compact ? 'min-h-[96px] h-full' : 'min-h-[120px]';

  const posMap = {
    'top-right': '-top-3 -right-3',
    'top-left': '-top-10 -left-10',
    'bottom-right': '-bottom-10 -right-10',
    'bottom-left': '-bottom-10 -left-10',
    'center': 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
    'inside-top-right': 'top-4 right-4',
  };
  const iconPosClass = posMap[iconPosition] || posMap['top-right'];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-black border border-green-600/25 shadow-sm flex flex-col ${containerHeight}`}
    >
      {Icon && (
        <Icon
          className={`absolute ${iconOverlaySize} ${iconPosClass} text-green-800/50 pointer-events-none`}
        />
      )}
      <div className={`relative ${padding} flex flex-col gap-1 flex-1 justify-center`}>
        <div className="flex items-center gap-2">
          {Icon && <Icon className={`${inlineIconSize} text-green-500`} />}
          <span className="text-[12px] font-semibold uppercase tracking-wide text-white/80 truncate">
            {label}
          </span>
        </div>
        <span className={`${valueText} font-bold leading-none text-white`}>{value}</span>
        {extra && <div className="mt-0.5 text-[12px] text-white/70 leading-snug">{extra}</div>}
      </div>
    </div>
  );
}
