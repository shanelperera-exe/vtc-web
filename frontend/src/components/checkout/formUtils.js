export function inputCls(hasError) {
  return [
    'block w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none',
    'placeholder:text-gray-400',
    hasError
      ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100'
      : 'border-black/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100',
  ].join(' ')
}
