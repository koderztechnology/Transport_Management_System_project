import { useState } from 'react';

const ProfitLoss = () => {
  const [period, setPeriod] = useState('month');

  const plData = {
    revenue: {
      tripRevenue: 845200,
      otherIncome: 15000,
    },
    directCosts: {
      fuel: 185000,
      toll: 68000,
      maintenance: 42000,
    },
    operatingExpenses: {
      driverSalaries: 95000,
      officeSalaries: 45000,
      insurance: 18000,
      rent: 25000,
      utilities: 8500,
      depreciation: 22000,
    },
    otherExpenses: {
      interest: 12000,
      miscellaneous: 12300,
    },
  };

  const totalRevenue = Object.values(plData.revenue).reduce((sum, val) => sum + val, 0);
  const totalDirectCosts = Object.values(plData.directCosts).reduce((sum, val) => sum + val, 0);
  const grossProfit = totalRevenue - totalDirectCosts;
  const grossProfitMargin = ((grossProfit / totalRevenue) * 100).toFixed(1);
  
  const totalOperatingExpenses = Object.values(plData.operatingExpenses).reduce((sum, val) => sum + val, 0);
  const operatingProfit = grossProfit - totalOperatingExpenses;
  const operatingMargin = ((operatingProfit / totalRevenue) * 100).toFixed(1);
  
  const totalOtherExpenses = Object.values(plData.otherExpenses).reduce((sum, val) => sum + val, 0);
  const netProfit = operatingProfit - totalOtherExpenses;
  const netProfitMargin = ((netProfit / totalRevenue) * 100).toFixed(1);

  const Section = ({ title, items, total, isProfit = false, isSubtotal = false, bgColor = 'bg-slate-50' }) => (
    <div className={`${bgColor} dark:bg-slate-700/30 rounded-lg p-4 mb-4`}>
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wide">
        {title}
      </h3>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between py-1.5">
            <span className="text-sm text-slate-700 dark:text-slate-300">{item.label}</span>
            <span className={`text-sm font-semibold ${
              item.negative ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'
            }`}>
              ₹{item.value.toLocaleString('en-IN')}
            </span>
          </div>
        ))}
        {total && (
          <div className={`flex items-center justify-between pt-3 mt-2 border-t-2 ${
            isProfit ? 'border-green-600' : 'border-slate-300 dark:border-slate-600'
          }`}>
            <span className={`text-sm font-bold ${
              isProfit ? 'text-green-700 dark:text-green-400' : 'text-slate-900 dark:text-white'
            }`}>
              {total.label}
            </span>
            <span className={`text-lg font-bold ${
              isProfit ? 'text-green-700 dark:text-green-400' : 'text-slate-900 dark:text-white'
            }`}>
              ₹{total.value.toLocaleString('en-IN')}
            </span>
          </div>
        )}
        {isSubtotal && total.margin && (
          <div className="text-right">
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Margin: {total.margin}%
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-green-600">trending_up</span>
              Profit & Loss Statement
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Comprehensive income statement for {period}
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
              PDF
            </button>
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              <span className="material-symbols-outlined text-lg">table_chart</span>
              Excel
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Revenue Section */}
          <Section
            title="Revenue"
            bgColor="bg-green-50"
            items={[
              { label: 'Trip Revenue', value: plData.revenue.tripRevenue },
              { label: 'Other Income', value: plData.revenue.otherIncome },
            ]}
            total={{ label: 'Total Revenue', value: totalRevenue }}
          />

          {/* Direct Costs */}
          <Section
            title="Direct Costs (Cost of Services)"
            bgColor="bg-red-50"
            items={[
              { label: 'Fuel Expenses', value: plData.directCosts.fuel, negative: true },
              { label: 'Toll Charges', value: plData.directCosts.toll, negative: true },
              { label: 'Vehicle Maintenance', value: plData.directCosts.maintenance, negative: true },
            ]}
            total={{ label: 'Total Direct Costs', value: totalDirectCosts }}
          />

          {/* Gross Profit */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-blue-900 dark:text-blue-400">
                GROSS PROFIT
              </span>
              <div className="text-right">
                <span className="text-2xl font-bold text-blue-900 dark:text-blue-400">
                  ₹{grossProfit.toLocaleString('en-IN')}
                </span>
                <p className="text-xs text-blue-700 dark:text-blue-500 mt-1">
                  Margin: {grossProfitMargin}%
                </p>
              </div>
            </div>
          </div>

          {/* Operating Expenses */}
          <Section
            title="Operating Expenses"
            bgColor="bg-orange-50"
            items={[
              { label: 'Driver Salaries', value: plData.operatingExpenses.driverSalaries, negative: true },
              { label: 'Office Salaries', value: plData.operatingExpenses.officeSalaries, negative: true },
              { label: 'Insurance', value: plData.operatingExpenses.insurance, negative: true },
              { label: 'Rent', value: plData.operatingExpenses.rent, negative: true },
              { label: 'Utilities', value: plData.operatingExpenses.utilities, negative: true },
              { label: 'Depreciation', value: plData.operatingExpenses.depreciation, negative: true },
            ]}
            total={{ label: 'Total Operating Expenses', value: totalOperatingExpenses }}
          />

          {/* Operating Profit */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-indigo-900 dark:text-indigo-400">
                OPERATING PROFIT (EBIT)
              </span>
              <div className="text-right">
                <span className="text-2xl font-bold text-indigo-900 dark:text-indigo-400">
                  ₹{operatingProfit.toLocaleString('en-IN')}
                </span>
                <p className="text-xs text-indigo-700 dark:text-indigo-500 mt-1">
                  Margin: {operatingMargin}%
                </p>
              </div>
            </div>
          </div>

          {/* Other Expenses */}
          <Section
            title="Other Expenses"
            bgColor="bg-slate-50"
            items={[
              { label: 'Interest Expense', value: plData.otherExpenses.interest, negative: true },
              { label: 'Miscellaneous', value: plData.otherExpenses.miscellaneous, negative: true },
            ]}
            total={{ label: 'Total Other Expenses', value: totalOtherExpenses }}
          />

          {/* Net Profit */}
          <div className="bg-linear-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl p-6 shadow-lg border-2 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-bold text-green-900 dark:text-green-400 uppercase tracking-wide">
                  NET PROFIT
                </span>
                <p className="text-sm text-green-700 dark:text-green-500 mt-1">
                  After all expenses and taxes
                </p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-bold text-green-700 dark:text-green-400">
                  ₹{netProfit.toLocaleString('en-IN')}
                </span>
                <p className="text-sm text-green-700 dark:text-green-500 mt-2 font-semibold">
                  Net Margin: {netProfitMargin}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitLoss;
