// ============================================================
// Utility Functions — Kinaja Entregador
// ============================================================

import { CURRENCY } from '../constants';

/**
 * Format a numeric value as Angolan Kwanza currency
 * @example formatCurrency(12500) → "Kz 12.500"
 * @example formatCurrency("1800.00") → "Kz 1.800"
 */
export function formatCurrency(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return `${CURRENCY.CODE} 0`;

  // Format with dots as thousand separators (Portuguese style)
  const formatted = num
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${CURRENCY.CODE} ${formatted}`;
}

/**
 * Format a date string into a readable time format
 * @example formatTime("2026-04-08T19:30:00") → "19:30"
 */
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('pt-PT', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format a date string into a readable date
 * @example formatDate("2026-04-08T19:30:00") → "08/04/2026"
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Calculate elapsed time since a date
 * @example timeAgo("2026-04-08T19:30:00") → "há 5 min"
 */
export function timeAgo(dateString: string): string {
  const now = new Date().getTime();
  const date = new Date(dateString).getTime();
  const diff = now - date;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return 'agora';
  if (minutes < 60) return `há ${minutes} min`;
  if (hours < 24) return `há ${hours}h`;
  return formatDate(dateString);
}

/**
 * Truncate a string to a maximum length
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Get initials from a name
 * @example getInitials("João Silva") → "JS"
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
