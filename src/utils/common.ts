import decimal from 'decimal.js';

// Helper function to truly truncate decimals without rounding and return formatted string
export const truncate = <T extends number | decimal>(num: T): T => {
  // Convert to decimal if it's not already
  const decimalNum = num instanceof decimal ? num : new decimal(num);
  
  // Use decimal.js truncation to 2 decimal places without rounding
  const truncated = decimalNum.toDecimalPlaces(2, decimal.ROUND_DOWN);
  
  // Convert back to the original type
  return (typeof num === 'number' ? truncated.toNumber() : truncated) as T;
}

// Helper function to truly truncate decimals without rounding and return formatted string
export const truncateDecimals = (num: number | decimal): string => {
  // Convert to decimal if it's not already
  const decimalNum = num instanceof decimal ? num : new decimal(num);
  
  // Use decimal.js truncation to 2 decimal places without rounding
  const truncated = decimalNum.toDecimalPlaces(2, decimal.ROUND_DOWN).toNumber();
  
  // Format with commas and ensure 2 decimal places
  return truncated.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Helper function to truly truncate decimals without rounding and return formatted string
export const truncateDecimalsStr = (num: number | decimal): string => {
  // Convert to decimal if it's not already
  const decimalNum = num instanceof decimal ? num : new decimal(num);
  
  // Use decimal.js truncation to 2 decimal places without rounding
  return decimalNum.toDecimalPlaces(2, decimal.ROUND_DOWN).toString();
}

// Helper function to truly truncate decimals without rounding using decimal.js

export const truncateNumber = (num: number | decimal): number => {
  // Convert to decimal if it's not already
  const decimalNum = num instanceof decimal ? num : new decimal(num);
  
  // Use decimal.js truncation to 2 decimal places without rounding
  return decimalNum.toDecimalPlaces(2, decimal.ROUND_DOWN).toNumber();
}

