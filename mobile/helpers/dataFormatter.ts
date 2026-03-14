/**
 * Data formatting helper functions
 */

/**
 * Generate a URL-friendly slug from a string
 * Converts to lowercase, replaces spaces with hyphens, removes special characters
 * 
 * @param text - The input text to convert to slug
 * @returns A URL-friendly slug string
 * 
 * @example
 * generateSlug("Hello World!") // returns "hello-world"
 * generateSlug("Product Name 123") // returns "product-name-123"
 */
export const generateSlug = (text: string): string => {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
};

/**
 * Format a number as currency
 * 
 * @param value - The number to format
 * @param currency - The currency code (default: "USD")
 * @param locale - The locale string (default: "en-US")
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number,
  currency: string = "USD",
  locale: string = "en-US"
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
};

/**
 * Format a number with thousand separators
 * 
 * @param value - The number to format
 * @param locale - The locale string (default: "en-US")
 * @returns Formatted number string
 */
export const formatNumber = (value: number, locale: string = "en-US"): string => {
  return new Intl.NumberFormat(locale).format(value);
};

/**
 * Truncate text to a maximum length with ellipsis
 * 
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
};

export default {
  generateSlug,
  formatCurrency,
  formatNumber,
  truncateText,
};
