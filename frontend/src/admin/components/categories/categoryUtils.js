// Utility helpers used by Category admin components
export function slugify(v) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function cap(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function today() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function niceDate(s) {
  try {
    if (!s) return "";
    // Support Java LocalDateTime strings like 2025-10-20T09:12:34.123456 without timezone
    if (typeof s === "string") {
      let str = s.trim();
      // Truncate fractional seconds to milliseconds (3 digits) for JS Date compatibility
      str = str.replace(/(\.\d{3})\d+/, "$1");
      // If it's ISO-like without timezone, assume UTC to avoid local offset ambiguity
      if (/^\d{4}-\d{2}-\d{2}T/.test(str) && !/[zZ]|[+-]\d{2}:?\d{2}$/.test(str)) {
        str += "Z";
      }
      const d1 = new Date(str);
      if (!isNaN(d1)) return d1.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
    }
    const d = new Date(s);
    return isNaN(d) ? String(s) : d.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return String(s ?? "");
  }
}
