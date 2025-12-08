import React, { useState } from 'react';
import { Product, Batch, SalesOrder } from '../types';
import { generateDemandForecast } from '../services/geminiService';

interface InventoryProps {
  products: Product[];
  salesHistory: SalesOrder[];
}

const Inventory: React.FC<InventoryProps> = ({ products, salesHistory }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [isLoadingForecast, setIsLoadingForecast] = useState(false);

  // Helper to calculate days until expiry
  const getDaysUntilExpiry = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const handleForecast = async (product: Product) => {
    setIsLoadingForecast(true);
    setForecast(null);
    const totalStock = product.batches.reduce((sum, b) => sum + b.quantity, 0);
    const result = await generateDemandForecast(product.name, salesHistory, totalStock);
    setForecast(result);
    setIsLoadingForecast(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800">Supply Chain Management</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm flex items-center">
          <span>+ Create Purchase Order</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-semibold text-slate-700">Stock Overview</h3>
            <span className="text-xs text-slate-500">Sorted by FEFO Priority</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-6 py-3 font-medium">SKU</th>
                  <th className="px-6 py-3 font-medium">Product Name</th>
                  <th className="px-6 py-3 font-medium">Total Stock</th>
                  <th className="px-6 py-3 font-medium">Next Expiry</th>
                  <th className="px-6 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => {
                  const totalStock = product.batches.reduce((a, b) => a + b.quantity, 0);
                  // Sort batches by expiry to find nearest
                  const sortedBatches = [...product.batches].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
                  const nextExpiry = sortedBatches[0];
                  const daysLeft = getDaysUntilExpiry(nextExpiry?.expiryDate || '');
                  
                  return (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-500 font-mono">{product.sku}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{product.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${totalStock < product.minStockLevel ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {totalStock} {product.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {nextExpiry ? (
                          <div className="flex items-center space-x-2">
                            <span className={`w-2 h-2 rounded-full ${daysLeft < 30 ? 'bg-red-500' : 'bg-green-500'}`}></span>
                            <span className={daysLeft < 30 ? 'text-red-600 font-medium' : 'text-slate-600'}>
                              {nextExpiry.expiryDate} ({daysLeft} days)
                            </span>
                          </div>
                        ) : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => { setSelectedProduct(product); handleForecast(product); }}
                          className="text-blue-600 hover:text-blue-800 font-medium text-xs border border-blue-200 px-3 py-1 rounded hover:bg-blue-50"
                        >
                          Analyze
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Detail Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-slate-700">AI Inventory Intelligence</h3>
          </div>
          <div className="p-6 flex-1">
            {selectedProduct ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-slate-800">{selectedProduct.name}</h4>
                  <p className="text-slate-500 text-sm">SKU: {selectedProduct.sku}</p>
                </div>

                {isLoadingForecast ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-sm text-slate-500 animate-pulse">Running Gemini Forecasting Models...</p>
                  </div>
                ) : forecast ? (
                  <div className="space-y-4 animate-fade-in">
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                      <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider mb-1">Predicted Demand (7 Days)</p>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-indigo-700">{forecast.predictedDemand}</span>
                        <span className="text-sm text-indigo-600">{selectedProduct.unit}</span>
                      </div>
                    </div>
                    
                    <div className={`p-4 rounded-lg border ${forecast.restockRecommendation === 'Urgent' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700'}`}>
                      <p className="text-sm font-bold flex items-center gap-2">
                        Recommendation: {forecast.restockRecommendation}
                      </p>
                      <p className="text-xs mt-1 opacity-90">{forecast.reasoning}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm italic">Analysis loaded.</p>
                )}

                <div className="pt-4 border-t border-slate-100">
                    <h5 className="font-medium text-slate-700 mb-2">Batch Details (FEFO)</h5>
                    <div className="space-y-2">
                        {selectedProduct.batches.map(b => (
                            <div key={b.id} className="flex justify-between text-sm p-2 bg-slate-50 rounded">
                                <span className="font-mono text-slate-500">{b.batchCode}</span>
                                <span>{b.quantity} {selectedProduct.unit}</span>
                                <span className="text-xs text-slate-400">Exp: {b.expiryDate}</span>
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
                <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                <p>Select a product to view AI insights</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;