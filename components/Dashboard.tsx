import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { SalesOrder, JournalEntry } from '../types';
import { analyzeFinancialHealth } from '../services/geminiService';

interface DashboardProps {
  orders: SalesOrder[];
  journalEntries: JournalEntry[];
}

const Dashboard: React.FC<DashboardProps> = ({ orders, journalEntries }) => {
  const [aiInsight, setAiInsight] = useState<string>("Loading AI financial analysis...");
  
  // Calculate aggregate metrics
  const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);
  const totalCost = orders.reduce((acc, order) => acc + order.totalCost, 0);
  const grossProfit = totalRevenue - totalCost;
  const margin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0';

  // Prepare chart data (Last 7 days simplified)
  const chartData = orders.slice(-7).map((order, idx) => ({
    name: `Day ${idx + 1}`,
    sales: order.totalAmount,
    profit: order.totalAmount - order.totalCost
  }));

  useEffect(() => {
    // Simulate AI analysis triggering on mount
    const fetchAnalysis = async () => {
        if(journalEntries.length > 0) {
             const analysis = await analyzeFinancialHealth(journalEntries, "Current Month");
             setAiInsight(analysis);
        } else {
            setAiInsight("Insufficient data for AI analysis.");
        }
    };
    fetchAnalysis();
  }, [journalEntries]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Executive Dashboard</h2>
          <p className="text-slate-500">Real-time overview of enterprise performance</p>
        </div>
        <div className="text-right">
             <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded border border-blue-400">
                AI Agent Active
            </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Total Revenue</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <span className="text-green-500 text-xs font-medium">↑ 12% vs last week</span>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Gross Profit</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            ${grossProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <span className="text-slate-400 text-xs">Margin: {margin}%</span>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Transactions</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{orders.length}</p>
          <span className="text-blue-500 text-xs">Since reboot</span>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm font-medium text-slate-500">Low Stock Alerts</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">3</p>
            <span className="text-xs text-orange-400">Attention needed</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Area */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Revenue & Profit Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insight Panel */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
          </div>
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-4">
                <div className="h-2 w-2 bg-blue-400 rounded-full animate-ping"></div>
                <h3 className="text-lg font-semibold text-blue-100">AI Financial Analyst</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-4 italic">
              "{aiInsight}"
            </p>
            <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors border border-white/10">
              Generate Deep Dive Report
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;