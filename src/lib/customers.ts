// Customer ID management with automatic gap filling
import { getSales } from './sales';

/**
 * Gets all existing customer IDs from sales records
 * @returns Array of customer IDs sorted numerically
 */
export const getExistingCustomerIds = (): string[] => {
  const sales = getSales();
  const customerIds = new Set<string>();
  
  sales.forEach(sale => {
    customerIds.add(sale.customerId);
  });
  
  return Array.from(customerIds).sort();
};

/**
 * Extracts the numeric portion from a customer ID
 * Example: "CF20-001" -> 1, "AR15-042" -> 42
 */
const extractNumber = (customerId: string): number => {
  const parts = customerId.split('-');
  const numberPart = parts[parts.length - 1];
  return parseInt(numberPart, 10) || 0;
};

/**
 * Gets all used customer numbers from existing IDs
 */
const getUsedNumbers = (): Set<number> => {
  const customerIds = getExistingCustomerIds();
  const usedNumbers = new Set<number>();
  
  customerIds.forEach(id => {
    const num = extractNumber(id);
    if (num > 0) {
      usedNumbers.add(num);
    }
  });
  
  return usedNumbers;
};

/**
 * Finds the next available customer number
 * Fills gaps first (e.g., if 001, 003, 004 exist, returns 002)
 * Otherwise increments from the highest number
 * Maximum: 999
 */
export const getNextCustomerNumber = (): string => {
  const usedNumbers = getUsedNumbers();
  
  // If no customers exist, start at 001
  if (usedNumbers.size === 0) {
    return '001';
  }
  
  // Find the first gap up to 999
  let nextNumber = 1;
  while (usedNumbers.has(nextNumber) && nextNumber < 999) {
    nextNumber++;
  }
  
  // If we've reached the maximum
  if (nextNumber > 999) {
    throw new Error('Maximum customer limit (999) reached!');
  }
  
  // Format with leading zeros (001, 002, ..., 999)
  return nextNumber.toString().padStart(3, '0');
};

/**
 * Checks if a customer number is already in use
 */
export const isCustomerNumberTaken = (customerDetails: string, customerNumber: string): boolean => {
  const fullId = `${customerDetails}-${customerNumber}`;
  const existingIds = getExistingCustomerIds();
  return existingIds.includes(fullId);
};

/**
 * Gets available customer numbers to show in dropdown
 * Returns array of available numbers (gaps + next available)
 */
export const getAvailableCustomerNumbers = (limit: number = 10): string[] => {
  const usedNumbers = getUsedNumbers();
  const available: string[] = [];
  
  // Find gaps and next available numbers
  let num = 1;
  while (available.length < limit) {
    if (!usedNumbers.has(num)) {
      available.push(num.toString().padStart(3, '0'));
    }
    num++;
  }
  
  return available;
};
