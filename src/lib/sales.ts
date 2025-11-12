// Sales tracking
import { getCollection, updateCollection } from './database';

export interface Sale {
  id: string;
  transactionId: string;
  date: string;
  customerId: string;
  group: string;
  category: string;
  itemName: string;
  quantitySold: number;
  totalPrice: number;
  staffName: string;
}

export const getSales = (): Sale[] => {
  return getCollection('sales');
};

export const addSale = (sale: Omit<Sale, 'id' | 'date'>): Sale => {
  const sales = getSales();
  const newSale: Sale = {
    ...sale,
    id: `sale-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    date: new Date().toISOString(),
  };
  sales.push(newSale);
  updateCollection('sales', sales);
  return newSale;
};

export const deleteSalesByTransaction = (transactionId: string): Sale[] => {
  const sales = getSales();
  const deletedSales = sales.filter(s => s.transactionId === transactionId);
  const updated = sales.filter(s => s.transactionId !== transactionId);
  updateCollection('sales', updated);
  return deletedSales;
};

export const formatCurrency = (amount: number): string => {
  return `Rp ${amount.toLocaleString('id-ID')}`;
};
