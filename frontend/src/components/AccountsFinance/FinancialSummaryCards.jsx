import { useState } from 'react';

const FinancialSummaryCards = () => {
  const [cardsData] = useState([
    {
      id: 1,
      title: 'Total Income',
      amount: '₹8,45,200',
      change: '+12.5%',
      trend: 'up',
      icon: 'payments',
      color: 'green',
      period: 'This Month'
    },
    {
      id: 2,
      title: 'Total Expenses',
      amount: '₹5,32,800',
      change: '+8.2%',
      trend: 'up',
      icon: 'credit_card',
      color: 'red',
      period: 'This Month'
    },
    {
      id: 3,
      title: 'Net Profit',
      amount: '₹3,12,400',
      change: '+18.7%',
      trend: 'up',
      icon: 'trending_up',
      color: 'blue',
      period: 'This Month'
    },
    {
      id: 4,
      title: 'Outstanding Invoices',
      amount: '₹1,25,600',
      change: '-5.3%',
      trend: 'down',
      icon: 'receipt_long',
      color: 'orange',
      period: 'Pending'
    },
    {
      id: 5,
      title: 'Pending Vendor Payments',
      amount: '₹89,300',
      change: '-12.1%',
      trend: 'down',
      icon: 'account_balance',
      color: 'purple',
      period: 'Due Soon'
    },
  ]);

  const getColorClasses = (color) => {
    const colors = {
      green: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        icon: 'text-green-600 dark:text-green-400',
        trend: 'text-green-600 dark:text-green-400'
      },
      red: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        icon: 'text-red-600 dark:text-red-400',
        trend: 'text-red-600 dark:text-red-400'
      },
      blue: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        icon: 'text-blue-600 dark:text-blue-400',
        trend: 'text-blue-600 dark:text-blue-400'
      },
      orange: {
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        icon: 'text-orange-600 dark:text-orange-400',
        trend: 'text-orange-600 dark:text-orange-400'
      },
      purple: {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        icon: 'text-purple-600 dark:text-purple-400',
        trend: 'text-purple-600 dark:text-purple-400'
      }
    };
    return colors[color];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
      {cardsData.map((card) => {
        const colorClasses = getColorClasses(card.color);
        return (
          <div
            key={card.id}
            className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
          >
            {/* Icon and Period */}
            <div className="flex items-start justify-between mb-3">
              <div className={`p-3 rounded-lg ${colorClasses.bg}`}>
                <span className={`material-symbols-outlined ${colorClasses.icon} text-2xl`}>
                  {card.icon}
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {card.period}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
              {card.title}
            </h3>

            {/* Amount */}
            <p className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {card.amount}
            </p>

            {/* Trend Indicator */}
            <div className="flex items-center gap-1">
              <span className={`material-symbols-outlined text-sm ${
                card.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {card.trend === 'up' ? 'trending_up' : 'trending_down'}
              </span>
              <span className={`text-sm font-semibold ${
                card.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {card.change}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                vs last month
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FinancialSummaryCards;
