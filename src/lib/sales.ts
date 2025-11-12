// Sales tracking
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
  const stored = localStorage.getItem('sales');
  return stored ? JSON.parse(stored) : [];
};

export const addSale = (sale: Omit<Sale, 'id' | 'date'>): Sale => {
  const sales = getSales();
  const newSale: Sale = {
    ...sale,
    id: `sale-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    date: new Date().toISOString(),
  };
  sales.push(newSale);
  localStorage.setItem('sales', JSON.stringify(sales));
  return newSale;
};

export const deleteSalesByTransaction = (transactionId: string): Sale[] => {
  const sales = getSales();
  const deletedSales = sales.filter(s => s.transactionId === transactionId);
  const updated = sales.filter(s => s.transactionId !== transactionId);
  localStorage.setItem('sales', JSON.stringify(updated));
  return deletedSales;
};

export const formatCurrency = (amount: number): string => {
  return `Rp ${amount.toLocaleString('id-ID')}`;
};
