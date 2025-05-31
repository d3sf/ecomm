/**
 * Format a number as INR currency (₹)
 * @param {number|string} amount - The amount to format
 * @returns {string} - Formatted currency string
 */
export function formatCurrency(amount) {
  // Convert to number if it's a string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Return formatted currency
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
}

/**
 * Format a number as INR currency without the symbol
 * @param {number|string} amount - The amount to format
 * @returns {string} - Formatted currency string without the ₹ symbol
 */
export function formatAmountWithoutSymbol(amount) {
  // Convert to number if it's a string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Return formatted amount
  return numAmount.toFixed(2);
} 