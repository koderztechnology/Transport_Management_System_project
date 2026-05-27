import { useState } from 'react';

const BalanceSheet = () => {
  const [expanded, setExpanded] = useState({
    currentAssets: true,
    fixedAssets: true,
    currentLiabilities: true,
    longTermLiabilities: true,
  });

  const toggleSection = (section) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const balanceSheetData = {
    assets: {
      currentAssets: {
        title: 'Current Assets',
        items: [
          { name: 'Cash & Bank Balance', amount: 371500 },
          { name: 'Accounts Receivable', amount: 353000 },
          { name: 'Inventory (Spare Parts)', amount: 125000 },
          { name: 'Prepaid Expenses', amount: 45000 },
        ],
      },
      fixedAssets: {
        title: 'Fixed Assets',
        items: [
          { name: 'Vehicles', amount: 4500000 },
          { name: 'Less: Accumulated Depreciation', amount: -450000, isNegative: true },
          { name: 'Office Equipment', amount: 180000 },
          { name: 'Less: Accumulated Depreciation', amount: -36000, isNegative: true },
          { name: 'Land & Building', amount: 2500000 },
        ],
      },
    },
    liabilities: {
      currentLiabilities: {
        title: 'Current Liabilities',
        items: [
          { name: 'Accounts Payable', amount: 139300 },
          { name: 'Salaries Payable', amount: 95000 },
          { name: 'Short-term Loans', amount: 250000 },
          { name: 'Tax Payable', amount: 78000 },
        ],
      },
      longTermLiabilities: {
        title: 'Long-term Liabilities',
        items: [
          { name: 'Vehicle Loans', amount: 1800000 },
          { name: 'Term Loan', amount: 1200000 },
        ],
      },
    },
  };

  // Calculate totals
  const currentAssetsTotal = balanceSheetData.assets.currentAssets.items.reduce((sum, item) => sum + item.amount, 0);
  const fixedAssetsTotal = balanceSheetData.assets.fixedAssets.items.reduce((sum, item) => sum + item.amount, 0);
  const totalAssets = currentAssetsTotal + fixedAssetsTotal;

  const currentLiabilitiesTotal = balanceSheetData.liabilities.currentLiabilities.items.reduce((sum, item) => sum + item.amount, 0);
  const longTermLiabilitiesTotal = balanceSheetData.liabilities.longTermLiabilities.items.reduce((sum, item) => sum + item.amount, 0);
  const totalLiabilities = currentLiabilitiesTotal + longTermLiabilitiesTotal;

  const equity = totalAssets - totalLiabilities;

  const Section = ({ title, items, total, sectionKey }) => (
    <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4 mb-4">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between mb-3 hover:opacity-80 transition-opacity"
      >
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">
          {title}
        </h3>
        <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">
          {expanded[sectionKey] ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {expanded[sectionKey] && (
        <>
          <div className="space-y-2 ml-4">
            {items.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-1.5">
                <span className={`text-sm ${
                  item.isNegative 
                    ? 'text-red-600 dark:text-red-400 italic' 
                    : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {item.name}
                </span>
                <span className={`text-sm font-semibold ${
                  item.isNegative 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-slate-900 dark:text-white'
                }`}>
                  ₹{Math.abs(item.amount).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-3 mt-3 border-t-2 border-slate-300 dark:border-slate-600">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Total {title}
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              ₹{total.toLocaleString('en-IN')}
            </span>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">account_balance_wallet</span>
              Balance Sheet
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Financial position as of November 12, 2024
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-lg">download</span>
            Generate Report
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Assets */}
          <div>
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-4 mb-4">
              <h2 className="text-lg font-bold text-blue-900 dark:text-blue-400 flex items-center gap-2">
                <span className="material-symbols-outlined">trending_up</span>
                ASSETS
              </h2>
            </div>

            <Section
              title={balanceSheetData.assets.currentAssets.title}
              items={balanceSheetData.assets.currentAssets.items}
              total={currentAssetsTotal}
              sectionKey="currentAssets"
            />

            <Section
              title={balanceSheetData.assets.fixedAssets.title}
              items={balanceSheetData.assets.fixedAssets.items}
              total={fixedAssetsTotal}
              sectionKey="fixedAssets"
            />

            {/* Total Assets */}
            <div className="bg-blue-600 dark:bg-blue-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-white uppercase">
                  TOTAL ASSETS
                </span>
                <span className="text-2xl font-bold text-white">
                  ₹{totalAssets.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column - Liabilities & Equity */}
          <div>
            <div className="bg-orange-100 dark:bg-orange-900/30 rounded-lg p-4 mb-4">
              <h2 className="text-lg font-bold text-orange-900 dark:text-orange-400 flex items-center gap-2">
                <span className="material-symbols-outlined">account_balance</span>
                LIABILITIES & EQUITY
              </h2>
            </div>

            <Section
              title={balanceSheetData.liabilities.currentLiabilities.title}
              items={balanceSheetData.liabilities.currentLiabilities.items}
              total={currentLiabilitiesTotal}
              sectionKey="currentLiabilities"
              isRightColumn={true}
            />

            <Section
              title={balanceSheetData.liabilities.longTermLiabilities.title}
              items={balanceSheetData.liabilities.longTermLiabilities.items}
              total={longTermLiabilitiesTotal}
              sectionKey="longTermLiabilities"
              isRightColumn={true}
            />

            {/* Equity Section */}
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-bold text-green-900 dark:text-green-400 uppercase tracking-wide mb-3">
                OWNER'S EQUITY
              </h3>
              <div className="space-y-2 ml-4">
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-slate-700 dark:text-slate-300">Capital</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    ₹{(equity - 312400).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-slate-700 dark:text-slate-300">Retained Earnings</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    ₹312,400
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 mt-3 border-t-2 border-green-400 dark:border-green-600">
                <span className="text-sm font-bold text-green-900 dark:text-green-400">
                  Total Equity
                </span>
                <span className="text-lg font-bold text-green-700 dark:text-green-400">
                  ₹{equity.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Total Liabilities & Equity */}
            <div className="bg-orange-600 dark:bg-orange-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-white uppercase">
                  TOTAL LIABILITIES & EQUITY
                </span>
                <span className="text-2xl font-bold text-white">
                  ₹{(totalLiabilities + equity).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Verification */}
        <div className={`mt-6 p-4 rounded-lg ${
          totalAssets === (totalLiabilities + equity)
            ? 'bg-green-100 dark:bg-green-900/30 border border-green-600'
            : 'bg-red-100 dark:bg-red-900/30 border border-red-600'
        }`}>
          <div className="flex items-center justify-center gap-2">
            <span className={`material-symbols-outlined ${
              totalAssets === (totalLiabilities + equity)
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {totalAssets === (totalLiabilities + equity) ? 'check_circle' : 'error'}
            </span>
            <span className={`font-semibold ${
              totalAssets === (totalLiabilities + equity)
                ? 'text-green-700 dark:text-green-400'
                : 'text-red-700 dark:text-red-400'
            }`}>
              {totalAssets === (totalLiabilities + equity)
                ? 'Balance Sheet is Balanced ✓'
                : 'Balance Sheet is Not Balanced'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceSheet;
