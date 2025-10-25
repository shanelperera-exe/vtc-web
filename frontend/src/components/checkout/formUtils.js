export function inputCls(hasError) {
  return [
    'block w-full border-[3px] px-3 py-2 text-sm',
    'outline-none focus:ring-2 focus:ring-[#0bd964]',
    // When focused, always show normal border even if there was an error
    'focus:border-gray-300',
    hasError ? 'border-rose-400' : 'border-gray-300',
  ].join(' ')
}
