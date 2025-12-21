import React from 'react'
import { CheckIcon as CheckOutlineIcon } from '@heroicons/react/24/outline'
import { checkoutSteps } from './checkoutSteps'

export function Stepper({ active, onStepClick }) {
  return (
    <div className="w-full mb-6 md:mb-10">
      <ol className="mx-auto max-w-3xl grid grid-cols-3 md:grid-cols-5 items-center gap-x-1 md:gap-x-2 list-none">
        {checkoutSteps.map(({ id, label, Icon }, idx) => {
          const isActive = active === id
          const isComplete = active > id
          return (
            <React.Fragment key={id}>
              <li className="relative flex items-center justify-self-center">
                <button
                  type="button"
                  onClick={() => onStepClick?.(id)}
                  className={[
                    'group flex items-center',
                    'transition-colors',
                    isActive ? 'text-emerald-700' : isComplete ? 'text-emerald-700' : 'text-gray-500',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'flex h-12 w-12 items-center justify-center rounded-xl border shadow-sm transition-colors',
                      isComplete
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : isActive
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                          : 'border-black/10 bg-white text-gray-600',
                    ].join(' ')}
                  >
                    {isComplete ? (
                      <CheckOutlineIcon className="h-5 w-5" strokeWidth={3} />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </span>
                </button>

                {/* Label positioned under the icon box so it doesn't affect layout of the boxes/lines */}
                <span className="absolute left-1/2 top-full translate-y-2 -translate-x-1/2 text-xs font-semibold text-gray-900 whitespace-nowrap">
                  {label}
                </span>
              </li>
              {idx < checkoutSteps.length - 1 && (
                <li aria-hidden="true" className="hidden md:flex items-center w-full">
                  <div
                    className={[
                      'h-0.75 flex-1 transition-colors -mx-6',
                      isComplete ? 'bg-emerald-600' : 'bg-black/10',
                    ].join(' ')}
                  />
                </li>
              )}
            </React.Fragment>
          )
        })}
      </ol>
    </div>
  )
}
