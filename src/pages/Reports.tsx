import { useState, useMemo, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getSales, formatCurrency, deleteSalesByTransaction } from '@/lib/sales';
import { getGroups, getInventory, saveInventory } from '@/lib/inventory';
import { DollarSign, Package, TrendingUp, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';
import { ParticleBackground } from '@/components/ParticleBackground';

const Reports = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customerIdFilter, setCustomerIdFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('All');
  const [sales, setSales] = useState(getSales());
  const [groups, setGroups] = useState<string[]>(getGroups());

  // Refresh groups and sales from localStorage periodically for synchronization
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedGroups = getGroups();
      const updatedSales = getSales();
      
      if (JSON.stringify(updatedGroups) !== JSON.stringify(groups)) {
        setGroups(updatedGroups);
      }
      if (JSON.stringify(updatedSales) !== JSON.stringify(sales)) {
        setSales(updatedSales);
      }
    }, 1000); // Check every second
    
    return () => clearInterval(interval);
  }, [groups, sales]);

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && saleDate < start) return false;
      if (end && saleDate > end) return false;
      if (customerIdFilter && !sale.customerId.toLowerCase().includes(customerIdFilter.toLowerCase())) return false;
      if (groupFilter !== 'All' && sale.group !== groupFilter) return false;
      return true;
    });
  }, [sales, startDate, endDate, customerIdFilter, groupFilter]);

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
  const totalItemsSold = filteredSales.reduce((sum, sale) => sum + sale.quantitySold, 0);

  const groupStats = useMemo(() => {
    const stats: Record<string, { revenue: number; sold: number }> = {};
    filteredSales.forEach(sale => {
      if (!stats[sale.group]) {
        stats[sale.group] = { revenue: 0, sold: 0 };
      }
      stats[sale.group].revenue += sale.totalPrice;
      stats[sale.group].sold += sale.quantitySold;
    });
    return stats;
  }, [filteredSales]);

  const categoryStats = useMemo(() => {
    const stats: Record<string, { revenue: number; sold: number }> = {};
    filteredSales.forEach(sale => {
      if (!stats[sale.category]) {
        stats[sale.category] = { revenue: 0, sold: 0 };
      }
      stats[sale.category].revenue += sale.totalPrice;
      stats[sale.category].sold += sale.quantitySold;
    });
    return stats;
  }, [filteredSales]);

  const transactionGroups = useMemo(() => {
    const groups: Record<string, typeof filteredSales> = {};
    filteredSales.forEach(sale => {
      if (!groups[sale.transactionId]) {
        groups[sale.transactionId] = [];
      }
      groups[sale.transactionId].push(sale);
    });
    return groups;
  }, [filteredSales]);

  const handleDeleteTransaction = (transactionId: string) => {
    const deletedSales = deleteSalesByTransaction(transactionId);
    
    // Restore inventory quantities
    if (deletedSales.length > 0) {
      const currentInventory = getInventory();
      const updatedInventory = currentInventory.map(product => {
        // Find all deleted sales for this product
        const restoredItems = deletedSales.filter(sale => sale.itemName === product.name);
        
        if (restoredItems.length > 0) {
          const totalRestored = restoredItems.reduce((sum, sale) => sum + sale.quantitySold, 0);
          return {
            ...product,
            quantity: product.quantity + totalRestored,
            sold: product.sold - totalRestored,
          };
        }
        return product;
      });
      
      saveInventory(updatedInventory);
    }
    
    setSales(getSales());
    toast.success('Transaction deleted and inventory restored successfully');
  };

  const exportToExcel = () => {
    // Create workbook
    const wb = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
      ['Yorukaze POS System - Sales Report'],
      ['Generated:', new Date().toLocaleString()],
      ['Date Range:', `${startDate || 'All'} to ${endDate || 'All'}`],
      ['Customer Filter:', customerIdFilter || 'All'],
      ['Group Filter:', groupFilter],
      [],
      ['Summary Statistics'],
      ['Total Revenue', totalRevenue],
      ['Total Items Sold', totalItemsSold],
      ['Total Transactions', Object.keys(transactionGroups).length],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    // Sales by Group Sheet
    const groupData = [
      ['Sales by Group'],
      ['Group', 'Items Sold', 'Revenue'],
      ...Object.entries(groupStats).map(([group, stats]) => [
        group,
        stats.sold,
        stats.revenue,
      ]),
    ];
    const wsGroup = XLSX.utils.aoa_to_sheet(groupData);
    XLSX.utils.book_append_sheet(wb, wsGroup, 'Sales by Group');

    // Sales by Category Sheet
    const categoryData = [
      ['Sales by Category'],
      ['Category', 'Items Sold', 'Revenue'],
      ...Object.entries(categoryStats).map(([category, stats]) => [
        category,
        stats.sold,
        stats.revenue,
      ]),
    ];
    const wsCategory = XLSX.utils.aoa_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(wb, wsCategory, 'Sales by Category');

    // Detailed Transactions Sheet
    const transactionData = [
      ['Transaction Details'],
      ['Transaction ID', 'Date', 'Customer ID', 'Staff Name', 'Group', 'Category', 'Item Name', 'Quantity', 'Total Price'],
      ...filteredSales.map(sale => [
        sale.transactionId,
        new Date(sale.date).toLocaleString(),
        sale.customerId,
        sale.staffName || 'N/A',
        sale.group,
        sale.category,
        sale.itemName,
        sale.quantitySold,
        sale.totalPrice,
      ]),
    ];
    const wsTransactions = XLSX.utils.aoa_to_sheet(transactionData);
    XLSX.utils.book_append_sheet(wb, wsTransactions, 'Transactions');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `Yorukaze_Sales_Report_${timestamp}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
    toast.success('Report exported successfully!');
  };

  return (
    <Layout>
      {/* Snow Particle Animation */}
      <ParticleBackground variant="snow" />
      
      <div className="space-y-6">
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Sales Reports</h2>
            <p className="text-muted-foreground">View your sales analytics</p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={exportToExcel}
              style={{ backgroundColor: '#2D3561' }}
              size="lg"
            >
              <Download className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <Card className="p-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="customerId">Customer ID</Label>
              <Input
                id="customerId"
                placeholder="e.g. CUST-001"
                value={customerIdFilter}
                onChange={(e) => setCustomerIdFilter(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="group">Group</Label>
              <Select value={groupFilter} onValueChange={setGroupFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Groups</SelectItem>
                  {groups.map(group => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
        </motion.div>

        <motion.div 
          className="grid sm:grid-cols-3 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, staggerChildren: 0.1 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring" as const, stiffness: 300, damping: 24, delay: 0.25 }}
            whileHover={{ scale: 1.03, y: -4 }}
          >
            <Card className="p-6 transition-shadow hover:shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
            </div>
          </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring" as const, stiffness: 300, damping: 24, delay: 0.35 }}
            whileHover={{ scale: 1.03, y: -4 }}
          >
            <Card className="p-6 transition-shadow hover:shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Items Sold</p>
                <p className="text-2xl font-bold text-foreground">{totalItemsSold}</p>
              </div>
            </div>
          </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring" as const, stiffness: 300, damping: 24, delay: 0.45 }}
            whileHover={{ scale: 1.03, y: -4 }}
          >
            <Card className="p-6 transition-shadow hover:shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold text-foreground">
                  {Object.keys(transactionGroups).length}
                </p>
              </div>
            </div>
          </Card>
          </motion.div>
        </motion.div>

        <Card className="p-6">
          <h3 className="text-xl font-bold text-foreground mb-4">Sales by Group</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group</TableHead>
                <TableHead className="text-right">Items Sold</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(groupStats).map(([group, stats]) => (
                <TableRow key={group}>
                  <TableCell className="font-medium">{group}</TableCell>
                  <TableCell className="text-right">{stats.sold}</TableCell>
                  <TableCell className="text-right">{formatCurrency(stats.revenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold text-foreground mb-4">Sales by Category</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Items Sold</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(categoryStats).map(([category, stats]) => (
                <TableRow key={category}>
                  <TableCell className="font-medium">{category}</TableCell>
                  <TableCell className="text-right">{stats.sold}</TableCell>
                  <TableCell className="text-right">{formatCurrency(stats.revenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold text-foreground mb-4">Transactions</h3>
          <div className="space-y-4">
            {Object.entries(transactionGroups).slice(0, 20).map(([transactionId, salesInTxn]) => {
              const totalAmount = salesInTxn.reduce((sum, sale) => sum + sale.totalPrice, 0);
              const firstSale = salesInTxn[0];
              
              return (
                <Card key={transactionId} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-foreground">
                        Transaction ID: {transactionId}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Customer: {firstSale.customerId} | Group: {firstSale.group}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Staff: {firstSale.staffName || 'N/A'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(firstSale.date).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-lg font-bold text-primary">
                        {formatCurrency(totalAmount)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTransaction(transactionId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesInTxn.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell>{sale.category}</TableCell>
                          <TableCell>{sale.itemName}</TableCell>
                          <TableCell className="text-right">{sale.quantitySold}</TableCell>
                          <TableCell className="text-right">{formatCurrency(sale.totalPrice)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              );
            })}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Reports;
