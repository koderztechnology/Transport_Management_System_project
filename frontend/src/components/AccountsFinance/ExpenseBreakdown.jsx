import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const ExpenseBreakdown = () => {
  const [data] = useState([
    { name: 'Fuel', value: 185000, color: '#ef4444' },
    { name: 'Maintenance', value: 125000, color: '#f59e0b' },
    { name: 'Driver Salaries', value: 95000, color: '#3b82f6' },
    { name: 'Toll', value: 68000, color: '#8b5cf6' },
    { name: 'Vehicle EMI', value: 45000, color: '#ec4899' },
    { name: 'Others', value: 14800, color: '#6b7280' },
  ]);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / total) * 100).toFixed(1);
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
          <p className="font-semibold text-slate-900 dark:text-white">{payload[0].name}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            ₹{payload[0].value.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500">
            {percentage}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md border border-slate-200 dark:border-slate-700">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Expense Breakdown
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          By category this month
        </p>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 space-y-2">
        {data.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1);
          return (
            <div key={index} className="flex items-center justify-between py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg px-2 transition-colors">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                  {item.name}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  ₹{item.value.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {percentage}%
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Total Expenses
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            ₹{total.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExpenseBreakdown;
