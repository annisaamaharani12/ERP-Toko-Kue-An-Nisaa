import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import POS from './components/POS';
import Financials from './components/Financials';
import { Product, ProductType, UnitOfMeasure, SalesOrder, JournalEntry, CartItem } from './types';

// MOCK INITIAL DATA
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    sku: 'FLR-001',
    name: 'Premium Cake Flour',
    type: ProductType.RAW_MATERIAL,
    unit: UnitOfMeasure.KG,
    sellingPrice: 2.50,
    minStockLevel: 50,
    batches: [
      { id: 'b1', batchCode: 'B-OCT-01', quantity: 20, expiryDate: '2023-11-01', costPrice: 1.20 },
      { id: 'b2', batchCode: 'B-NOV-15', quantity: 100, expiryDate: '2023-12-15', costPrice: 1.30 }
    ]
  },
  {
    id: 'p2',
    sku: 'COC-DARK',
    name: 'Dark Chocolate 70%',
    type: ProductType.RAW_MATERIAL,
    unit: UnitOfMeasure.KG,
    sellingPrice: 15.00,
    minStockLevel: 20,
    batches: [
      { id: 'b3', batchCode: 'B-EXP-SOON', quantity: 5, expiryDate: '2023-10-28', costPrice: 8.00 },
      { id: 'b4', batchCode: 'B-FRESH', quantity: 50, expiryDate: '2024-05-01', costPrice: 8.50 }
    ]
  },
  {
    id: 'p3',
    sku: 'BUT-UNS',
    name: 'Unsalted Butter',
    type: ProductType.RAW_MATERIAL,
    unit: UnitOfMeasure.KG,
    sellingPrice: 8.00,
    minStockLevel: 30,
    batches: [
      { id: 'b5', batchCode: 'B-BUT-01', quantity: 40, expiryDate: '2023-12-01', costPrice: 4.00 }
    ]
  }
];

// Initial Dummy Sales History for Forecasting
const INITIAL_SALES_HISTORY: SalesOrder[] = Array.from({ length: 10 }).map((_, i) => ({
    id: `hist-${i}`,
    date: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
    customerName: 'Walk-in',
    totalAmount: 50 + Math.random() * 100,
    totalCost: 30 + Math.random() * 50,
    items: [
        { productId: 'p1', productName: 'Premium Cake Flour', quantity: 5 + Math.floor(Math.random() * 10), price: 2.50, cost: 1.20 }
    ]
})).reverse();


function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(INITIAL_SALES_HISTORY);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  // CORE LOGIC: Handle Sale, Inventory Deduction (FEFO), and Journal Creation
  const handleCompleteSale = (cartItems: CartItem[]) => {
    const transactionId = `TXN-${Date.now()}`;
    const date = new Date().toISOString();
    
    let saleTotal = 0;
    let saleTotalCost = 0;
    const newJournalEntries: JournalEntry[] = [];

    // 1. Inventory Deduction Logic (Simulating FEFO)
    const updatedProducts = products.map(product => {
      const cartItem = cartItems.find(c => c.productId === product.id);
      if (!cartItem) return product;

      let remainingToDeduct = cartItem.quantity;
      let productCostForSale = 0;

      // Sort batches by expiry date (FEFO)
      const sortedBatches = [...product.batches].sort((a, b) => 
        new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
      );

      const updatedBatches = sortedBatches.map(batch => {
        if (remainingToDeduct <= 0) return batch;

        const deductAmount = Math.min(batch.quantity, remainingToDeduct);
        remainingToDeduct -= deductAmount;
        productCostForSale += (deductAmount * batch.costPrice);

        return { ...batch, quantity: batch.quantity - deductAmount };
      }).filter(b => b.quantity > 0); // Remove empty batches

      saleTotal += (cartItem.price * cartItem.quantity);
      saleTotalCost += productCostForSale;

      return { ...product, batches: updatedBatches };
    });

    // 2. Create Sales Order Record
    const newOrder: SalesOrder = {
      id: transactionId,
      date: date,
      customerName: 'Walk-in Customer',
      items: cartItems,
      totalAmount: saleTotal,
      totalCost: saleTotalCost
    };

    // 3. Create Accounting Journal Entries (Double Entry)
    // Entry A: Recognize Revenue
    newJournalEntries.push({
      id: `JE-${Date.now()}-1`,
      date,
      description: `Sales Revenue - Order #${transactionId}`,
      debitAccount: 'Cash/Bank',
      creditAccount: 'Sales Revenue',
      amount: saleTotal,
      referenceId: transactionId
    });

    // Entry B: Recognize COGS and Reduce Inventory Asset
    newJournalEntries.push({
      id: `JE-${Date.now()}-2`,
      date,
      description: `COGS - Order #${transactionId}`,
      debitAccount: 'COGS',
      creditAccount: 'Inventory Asset',
      amount: saleTotalCost,
      referenceId: transactionId
    });

    // Update State
    setProducts(updatedProducts);
    setSalesOrders(prev => [...prev, newOrder]);
    setJournalEntries(prev => [...prev, ...newJournalEntries]);
    
    // Alert user
    alert("Transaction processed successfully! Inventory updated and Journal Entries created.");
    setActiveTab('dashboard');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard orders={salesOrders} journalEntries={journalEntries} />;
      case 'inventory':
        return <Inventory products={products} salesHistory={salesOrders} />;
      case 'pos':
        return <POS products={products} onCompleteSale={handleCompleteSale} />;
      case 'finance':
        return <Financials journalEntries={journalEntries} />;
      default:
        return <div className="p-10 text-center text-slate-500">Module under development</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f3f4f6]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="ml-64 flex-1 p-8 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;