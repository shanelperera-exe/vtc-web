import { CheckCircleIcon, Cog6ToothIcon, TruckIcon, GiftIcon } from '@heroicons/react/24/outline';
import { FiCheck, FiClock, FiRefreshCw, FiTruck, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import React from "react";

const statusSteps = ["Order placed", "Processing", "Shipped", "Delivered"];
const statusIcons = [
  CheckCircleIcon, // Order placed
  Cog6ToothIcon,   // Processing
  TruckIcon,       // Shipped
  GiftIcon         // Delivered
];

const OrderStatusBar = ({ progress = 0, statusLabel, statusDetail, orderStatus, statusTimes = {}, headerActions = null }) => {
  // progress: 0 = first step, 3 = last step
  const maxStep = statusIcons.length - 1;
  // Progress bar fill: reach end for last step
  const progressRatio = progress >= maxStep ? 1 : (progress * 2 + 1) / (maxStep * 2);
  const ICON_SIZE = 40; // keep in sync with icon container size
  const ICON_HALF = ICON_SIZE / 2;

  const getIconForStatus = (s) => {
    if (!s) return FiCheck;
    const st = s.toLowerCase();
    if (st.includes('pending')) return FiClock;
    if (st.includes('processing')) return FiRefreshCw;
    if (st.includes('shipped')) return FiTruck;
    if (st.includes('delivered')) return FiCheckCircle;
    if (st.includes('cancel')) return FiXCircle;
    return FiCheck;
  };

  const renderBadge = () => {
    const label = statusLabel || orderStatus || '';
    const Icon = getIconForStatus(label);
    const sLower = label.toLowerCase();
    const badgeClasses = sLower.includes('pending')
      ? 'bg-yellow-100 text-yellow-700'
      : sLower.includes('placed')
        ? 'bg-teal-100 text-teal-800'
      : sLower.includes('processing')
        ? 'bg-blue-100 text-blue-700'
        : sLower.includes('shipped')
          ? 'bg-purple-100 text-purple-700'
          : sLower.includes('delivered')
            ? 'bg-green-100 text-green-700'
            : sLower.includes('cancel') ? 'bg-red-100 text-red-700' : 'bg-red-100 text-red-700';
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badgeClasses}`}>
        <Icon className="inline-block mr-2 text-sm" />
        {label}
      </span>
    );
  };

  return (
    <div className="w-full pb-3">
      {/* If a statusLabel/detail is provided, render the heading, badge and detail. Otherwise render only the progress bar. */}
      {statusLabel || statusDetail ? (
        <section aria-labelledby="order-status-heading" className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 id="order-status-heading" className="text-3xl font-semibold inline-flex items-center gap-2">
                <FiCheckCircle className="w-6 h-6 text-emerald-700" aria-hidden="true" />
                <span>Order status</span>
              </h2>
              {renderBadge()}
            </div>
            {headerActions ? (
              <div className="ml-4">
                {headerActions}
              </div>
            ) : null}
          </div>
          {statusDetail && (
            <div className="mb-3">
              <p className="text-sm text-gray-700">
                <span className='font-medium text-black'>Current Status: </span>
                {statusDetail}
              </p>
            </div>
          )}
          {/* If cancelled, show cancelled timestamp */}
          {(orderStatus || '').toLowerCase().includes('cancel') && statusTimes && statusTimes.cancelled && (
            <div className="mb-2">
              <p className="text-sm text-red-700 font-medium">Cancelled on {statusTimes.cancelled.date} {statusTimes.cancelled.time}</p>
            </div>
          )}
        </section>
      ) : null}

      {/* Progress bar (evenly spaced endpoints) */}
      <div aria-hidden="true" className="w-full">
        <div className="relative w-full px-10 pt-10 pb-4" style={{ '--track-width': `calc(100% - ${ICON_SIZE}px)`, '--icon-half': `${ICON_HALF}px` }}>
          {/* Track background inset by half icon so ends are covered by first/last circles */}
          <div
            className="absolute top-5 h-2 bg-gray-200 rounded-md"
            style={{ left: 'var(--icon-half)', right: 'var(--icon-half)' }}
          />
          {/* Track progress inside same inset bounds */}
          <div
            className="absolute top-5 h-2 rounded-md"
            style={{ left: ICON_HALF, right: ICON_HALF, background: (orderStatus || '').toLowerCase().includes('cancel') ? '#fdecea' : undefined }}
          />
          {/* Track progress inside same inset bounds. If cancelled, show red full-width marker */}
          { (orderStatus || '').toLowerCase().includes('cancel') ? (
            <div
              className="absolute top-5 h-2 bg-red-500 rounded-md"
              style={{ left: ICON_HALF, width: `calc(var(--track-width))` }}
            />
          ) : (
            <div
              className="absolute top-5 h-2 bg-[#0bd964] rounded-md transition-all duration-300"
              style={{ left: ICON_HALF, width: `calc(var(--track-width) * ${progressRatio})` }}
            />
          )}
          {/* Steps absolutely positioned so first and last align to ends */}
          {statusIcons.map((Icon, idx) => {
            const leftPct = (idx / maxStep);
            const bg = idx <= progress ? '#0bd964' : 'white';
            const border = 'border-gray-900';
            const iconColor = idx <= progress ? 'text-gray-900' : 'text-gray-400';
            return (
              <div
                key={statusSteps[idx]}
                className="absolute flex flex-col items-center"
                style={{ top: 0, left: `calc(var(--icon-half) + var(--track-width) * ${leftPct})`, transform: 'translateX(-50%)' }}
              >
                <div
                  className={`flex items-center justify-center border-3 shadow-sm ${border}`}
                  style={{ width: '40px', height: '40px', background: bg }}
                >
                  <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                <div className="w-28 mt-2" style={{ textAlign: 'center' }}>
                  <div
                    className={
                      idx === progress
                        ? 'font-semibold text-black text-sm'
                        : idx < progress
                        ? 'text-gray-700 text-sm'
                        : 'text-gray-500 text-sm'
                    }
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {statusSteps[idx]}
                  </div>
                  {idx <= progress && (() => {
                    const keyMap = ['placed', 'processing', 'shipped', 'delivered'];
                    const key = keyMap[idx];
                    const ts = statusTimes && statusTimes[key];
                    if (!ts) return null;
                    const display = ts.time ? `${ts.date} ${ts.time}` : ts.date || null;
                    if (!display) return null;
                    return (
                      <div className="text-xs text-gray-600 mt-1">
                        {display}
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderStatusBar;
