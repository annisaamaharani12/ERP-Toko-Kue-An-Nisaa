import React from 'react';
import { JournalEntry } from '../types';

interface FinancialsProps {
  journalEntries: JournalEntry[];
}

const Financials: React.FC<FinancialsProps> = ({ journalEntries }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800">General Ledger</h2>
        <button className="text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg border border-blue-200 text-sm font-medium">
          Export to CSV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Ref ID</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Account (Dr)</th>
              <th className="px-6 py-4">Account (Cr)</th>
              <th className="px-6 py-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {journalEntries.slice().reverse().map((entry) => (
              <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-slate-500">{new Date(entry.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 font-mono text-xs text-slate-400">{entry.referenceId.substring(0,8)}...</td>
                <td className="px-6 py-4 text-slate-700">{entry.description}</td>
                <td className="px-6 py-4 font-medium text-slate-800">{entry.debitAccount}</td>
                <td className="px-6 py-4 text-slate-500">{entry.creditAccount}</td>
                <td className="px-6 py-4 text-right font-mono font-medium">
                  ${entry.amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {journalEntries.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            No financial transactions recorded yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default Financials;