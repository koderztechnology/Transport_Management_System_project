
const QuickActionsPanel = () => {
  const actions = [
    {
      id: 1,
      title: 'Add Expense',
      icon: 'add_card',
      color: 'red',
      description: 'Record new expense',
    },
    {
      id: 2,
      title: 'Add Income',
      icon: 'account_balance',
      color: 'green',
      description: 'Record new income',
    },
    {
      id: 3,
      title: 'Generate Invoice',
      icon: 'receipt_long',
      color: 'blue',
      description: 'Create customer invoice',
    },
    {
      id: 4,
      title: 'Record Payment',
      icon: 'payments',
      color: 'purple',
      description: 'Log payment received',
    },
    {
      id: 5,
      title: 'Download Report',
      icon: 'download',
      color: 'orange',
      description: 'Export financial data',
    },
    {
      id: 6,
      title: 'Bank Reconciliation',
      icon: 'account_balance_wallet',
      color: 'teal',
      description: 'Match bank statements',
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      red: {
        bg: 'bg-red-600 hover:bg-red-700',
        light: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      },
      green: {
        bg: 'bg-green-600 hover:bg-green-700',
        light: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      },
      blue: {
        bg: 'bg-blue-600 hover:bg-blue-700',
        light: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      },
      purple: {
        bg: 'bg-purple-600 hover:bg-purple-700',
        light: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      },
      orange: {
        bg: 'bg-orange-600 hover:bg-orange-700',
        light: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      },
      teal: {
        bg: 'bg-teal-600 hover:bg-teal-700',
        light: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
      },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="sticky top-24 space-y-4">
      {/* Quick Actions Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">bolt</span>
            Quick Actions
          </h3>
        </div>

        <div className="p-4 space-y-2">
          {actions.map((action) => {
            const colorClasses = getColorClasses(action.color);
            return (
              <button
                key={action.id}
                className={`w-full p-3 ${colorClasses.bg} text-white rounded-lg hover:shadow-md transition-all duration-300 flex items-center gap-3`}
              >
                <span className="material-symbols-outlined text-xl">{action.icon}</span>
                <div className="text-left flex-1">
                  <p className="text-sm font-semibold">{action.title}</p>
                  <p className="text-xs opacity-90">{action.description}</p>
                </div>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-600">history</span>
            Recent Activities
          </h3>
        </div>

        <div className="p-4 space-y-3">
          {[
            { type: 'expense', text: 'Fuel expense added', amount: '₹45,000', time: '2 hours ago', color: 'red' },
            { type: 'income', text: 'Payment received', amount: '₹1,50,000', time: '5 hours ago', color: 'green' },
            { type: 'invoice', text: 'Invoice generated', amount: '₹95,000', time: '1 day ago', color: 'blue' },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <div className={`p-2 rounded-lg ${getColorClasses(activity.color).light}`}>
                <span className="material-symbols-outlined text-base">
                  {activity.type === 'expense' ? 'remove_circle' : activity.type === 'income' ? 'add_circle' : 'description'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {activity.text}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{activity.time}</p>
              </div>
              <span className={`text-sm font-bold ${
                activity.color === 'green' ? 'text-green-600 dark:text-green-400' : 
                activity.color === 'red' ? 'text-red-600 dark:text-red-400' : 
                'text-blue-600 dark:text-blue-400'
              }`}>
                {activity.amount}
              </span>
            </div>
          ))}
        </div>

        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700">
          <button className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
            View All Activities →
          </button>
        </div>
      </div>

      {/* Financial Health Score */}
      <div className="bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl shadow-md p-5 text-white">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-2xl">monitoring</span>
          <h3 className="text-base font-bold">Financial Health</h3>
        </div>
        
        <div className="text-center mb-4">
          <div className="text-5xl font-bold mb-1">85</div>
          <p className="text-sm opacity-90">Excellent Score</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="opacity-90">Liquidity Ratio</span>
            <span className="font-semibold">2.1</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="opacity-90">Profit Margin</span>
            <span className="font-semibold">37%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="opacity-90">Debt Ratio</span>
            <span className="font-semibold">0.45</span>
          </div>
        </div>

        <button className="w-full mt-4 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
          View Details
        </button>
      </div>

      {/* Support Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg">
            <span className="material-symbols-outlined">help</span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
              Need Help?
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
              Contact our financial support team
            </p>
            <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
              Get Support →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsPanel;
