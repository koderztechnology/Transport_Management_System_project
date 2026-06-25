import { useState } from 'react';

const JournalLedger = () => {
  const [activeTab, setActiveTab] = useState('journal');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const journalEntries = [
    { id: 'JE001', date: '2024-11-10', account: 'Cash', debit: 150000, credit: 0, description: 'Trip payment received', category: 'Income' },
    { id: 'JE002', date: '2024-11-10', account: 'Trip Revenue', debit: 0, credit: 150000, description: 'Trip payment received', category: 'Income' },
    { id: 'JE003', date: '2024-11-09', account: 'Fuel Expense', debit: 45000, credit: 0, description: 'Diesel purchase for fleet', category: 'Expense' },
    { id: 'JE004', date: '2024-11-09', account: 'Cash', debit: 0, credit: 45000, description: 'Diesel purchase for fleet', category: 'Expense' },
    { id: 'JE005', date: '2024-11-08', account: 'Maintenance Expense', debit: 28500, credit: 0, description: 'Vehicle repair - TN01AB1234', category: 'Expense' },
    { id: 'JE006', date: '2024-11-08', account: 'Vendor Payable', debit: 0, credit: 28500, description: 'Vehicle repair - TN01AB1234', category: 'Expense' },
  ];

  const ledgerAccounts = [
    { account: 'Cash', opening: 250000, debit: 195000, credit: 73500, closing: 371500 },
    { account: 'Trip Revenue', opening: 0, debit: 0, credit: 845200, closing: 845200 },
    { account: 'Fuel Expense', opening: 0, debit: 185000, credit: 0, closing: 185000 },
    { account: 'Maintenance Expense', opening: 0, debit: 125000, credit: 0, closing: 125000 },
    { account: 'Driver Salaries', opening: 0, debit: 95000, credit: 0, closing: 95000 },
    { account: 'Vendor Payable', opening: 50000, debit: 0, credit: 89300, closing: 139300 },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
      {/* Header with Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Journal & Ledger Management
            </h2>
            <button className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              <span className="material-symbols-outlined text-lg">add</span>
              New Entry
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('journal')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                activeTab === 'journal'
                  ? 'bg-blue-900 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              <span className="material-symbols-outlined text-lg">book</span>
              Journal Entries
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                activeTab === 'ledger'
                  ? 'bg-blue-900 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
              Ledger View
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 pb-4 flex gap-3">
          <input
            type="text"
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="pl-4 pr-10 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <button className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-lg">download</span>
            Export
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'journal' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Entry ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Account</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Description</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Debit</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Credit</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {journalEntries.map((entry, index) => (
                  <tr key={index} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400">{entry.id}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{entry.date}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{entry.account}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{entry.description}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-green-600 dark:text-green-400">
                      {entry.debit > 0 ? `₹${entry.debit.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-red-600 dark:text-red-400">
                      {entry.credit > 0 ? `₹${entry.credit.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Account</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Opening Balance</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Total Debit</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Total Credit</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Closing Balance</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ledgerAccounts.map((ledger, index) => (
                  <tr key={index} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{ledger.account}</td>
                    <td className="px-4 py-3 text-sm text-right text-slate-600 dark:text-slate-400">
                      ₹{ledger.opening.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-green-600 dark:text-green-400">
                      ₹{ledger.debit.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-red-600 dark:text-red-400">
                      ₹{ledger.credit.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-slate-900 dark:text-white">
                      ₹{ledger.closing.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                        <span className="material-symbols-outlined text-lg">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Showing 1 to {activeTab === 'journal' ? journalEntries.length : ledgerAccounts.length} entries
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors">
              Previous
            </button>
            <button className="px-3 py-1.5 bg-blue-900 text-white rounded-lg text-sm font-medium">
              1
            </button>
            <button className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalLedger;
