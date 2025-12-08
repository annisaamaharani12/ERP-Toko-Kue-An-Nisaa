// Enums for standardizing status and types
export enum ProductType {
  RAW_MATERIAL = 'Raw Material',
  FINISHED_GOOD = 'Finished Good',
  PACKAGING = 'Packaging'
}

export enum UnitOfMeasure {
  KG = 'kg',
  GRAM = 'g',
  LITER = 'l',
  UNIT = 'unit',
  SACK = 'sack'
}

export enum TransactionType {
  SALE = 'SALE',
  PURCHASE = 'PURCHASE',
  ADJUSTMENT = 'ADJUSTMENT'
}

// Accounting Types
export enum AccountType {
  ASSET = 'Asset',
  LIABILITY = 'Liability',
  EQUITY = 'Equity',
  REVENUE = 'Revenue',
  EXPENSE = 'Expense'
}

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  referenceId: string; // Links to PO or Sales Order
}

// Inventory & SCM Types
export interface Batch {
  id: string;
  batchCode: string;
  quantity: number;
  expiryDate: string;
  costPrice: number; // For COGS calculation
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  type: ProductType;
  unit: UnitOfMeasure;
  sellingPrice: number;
  minStockLevel: number;
  batches: Batch[];
}

// Sales Types
export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  cost: number; // Tracked for immediate profit calc
}

export interface SalesOrder {
  id: string;
  date: string;
  customerName: string; // Simplified CRM
  items: CartItem[];
  totalAmount: number;
  totalCost: number; // For Gross Profit
}

// AI Analysis Types
export interface DemandForecast {
  productId: string;
  productName: string;
  predictedDemand: number;
  confidence: string;
  reasoning: string;
}

export interface DashboardMetric {
  label: string;
  value: string | number;
  trend: 'up' | 'down' | 'neutral';
  percentage: string;
}