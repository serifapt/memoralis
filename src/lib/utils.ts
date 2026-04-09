import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parse a "YYYY-MM-DD" string into a local Date at noon to avoid
 * timezone-boundary issues with react-day-picker / date-fns.
 */
export function parseDateString(dateStr: string): Date | null {
  if (!dateStr) return null;
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  // Use noon to avoid DST / timezone edge issues
  return new Date(+match[1], +match[2] - 1, +match[3], 12, 0, 0);
}
