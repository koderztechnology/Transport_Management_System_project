import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';

const IncomeExpenseChart = ({ dateRange }) => {
  const [data] = useState([
    { month: 'Jan', income: 650000, expenses: 420000 },
    { month: 'Feb', income: 720000, expenses: 480000 },
    { month: 'Mar', income: 680000, expenses: 450000 },
    { month: 'Apr', income: 790000, expenses: 520000 },
    { month: 'May', income: 850000, expenses: 540000 },
    { month: 'Jun', income: 845200, expenses: 532800 },
  ]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
          <p className="font-semibold text-slate-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ₹{entry.value.toLocaleString('en-IN')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Income vs Expenses Overview
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Monthly comparison of revenue and costs
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
            Weekly
          </button>
          <button className="px-3 py-1.5 text-xs font-medium bg-blue-900 text-white rounded-lg">
            Monthly
          </button>
          <button className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
            Yearly
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="month" 
            stroke="#64748b"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#64748b"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Bar 
            dataKey="income" 
            fill="#10b981" 
            name="Income" 
            radius={[8, 8, 0, 0]}
            barSize={40}
          />
          <Bar 
            dataKey="expenses" 
            fill="#ef4444" 
            name="Expenses" 
            radius={[8, 8, 0, 0]}
            barSize={40}
          />
          <Line 
            type="monotone" 
            dataKey="income" 
            stroke="#059669" 
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Avg Income</p>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">₹7,55,867</p>
        </div>
        <div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Avg Expenses</p>
          <p className="text-lg font-bold text-red-600 dark:text-red-400">₹4,90,800</p>
        </div>
        <div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Avg Profit</p>
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">₹2,65,067</p>
        </div>
      </div>
    </div>
  );
};

export default IncomeExpenseChart;
