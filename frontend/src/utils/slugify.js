// Shared slug utilities for categories and URLs
// Rules: lowercase, trim, replace & with 'and', non-alphanumerics -> '-', collapse and trim '-'
export function slugifyCategory(name = '') {
  return String(name || '')
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function deslugifyCategory(slug = '') {
  const s = String(slug || '').replace(/-/g, ' ').trim();
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}
