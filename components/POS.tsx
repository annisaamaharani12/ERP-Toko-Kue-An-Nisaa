import React, { useState } from 'react';
import { Product, CartItem } from '../types';

interface POSProps {
  products: Product[];
  onCompleteSale: (items: CartItem[]) => void;
}

const POS: React.FC<POSProps> = ({ products, onCompleteSale }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');

  const addToCart = (product: Product) => {
    // FEFO Logic Check: Always assumes we pull from the batch that expires soonest implicitly
    // In a real DB, we would lock specific batch IDs. Here we simplify.
    
    // Calculate effective cost (average or FIFO based on top batch) - simplified to first batch cost
    const currentCost = product.batches.length > 0 ? product.batches[0].costPrice : 0;

    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.sellingPrice,
        cost: currentCost
      }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-2rem)] flex gap-6">
      {/* Product Grid */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <input
            type="text"
            placeholder="Search products by Name or SKU..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => {
                const stock = product.batches.reduce((a,b) => a+b.quantity, 0);
                return (
                    <button
                        key={product.id}
                        onClick={() => addToCart(product)}
                        disabled={stock <= 0}
                        className={`p-4 rounded-xl border text-left transition-all ${stock <= 0 ? 'opacity-50 cursor-not-allowed bg-slate-100' : 'hover:shadow-md hover:border-blue-300 bg-white border-slate-100'}`}
                    >
                        <div className="h-24 bg-slate-100 rounded-lg mb-3 flex items-center justify-center text-3xl">
                            🧁
                        </div>
                        <h4 className="font-semibold text-slate-800 truncate">{product.name}</h4>
                        <div className="flex justify-between items-center mt-2">
                            <span className="font-bold text-blue-600">${product.sellingPrice}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${stock < 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                {stock} left
                            </span>
                        </div>
                    </button>
                )
            })}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-96 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800">Current Order</h3>
          <p className="text-xs text-slate-500">Transaction ID: #{Math.floor(Math.random() * 100000)}</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center text-slate-400 mt-10">
              <p>Cart is empty</p>
              <p className="text-xs">Select items to begin transaction</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.productId} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                <div>
                    <h4 className="font-medium text-sm text-slate-800">{item.productName}</h4>
                    <p className="text-xs text-slate-500">${item.price} x {item.quantity}</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-700">${(item.price * item.quantity).toFixed(2)}</span>
                    <button 
                        onClick={() => removeFromCart(item.productId)}
                        className="text-red-400 hover:text-red-600"
                    >
                        ✕
                    </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-bold text-slate-800">${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mb-6">
            <span className="text-slate-600">Tax (10%)</span>
            <span className="font-bold text-slate-800">${(total * 0.1).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mb-6 text-xl font-bold text-blue-900">
            <span>Total</span>
            <span>${(total * 1.1).toFixed(2)}</span>
          </div>
          <button
            onClick={() => { onCompleteSale(cart); setCart([]); }}
            disabled={cart.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 ${
              cart.length === 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Process Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;