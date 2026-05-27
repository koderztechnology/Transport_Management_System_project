
const FinancialReports = () => {
  const reports = [
    {
      id: 1,
      title: 'Income Statement',
      description: 'Detailed revenue and expense report',
      icon: 'payments',
      color: 'green',
      lastGenerated: '2024-11-10',
      format: ['PDF', 'Excel'],
    },
    {
      id: 2,
      title: 'Expense Summary',
      description: 'Category-wise expense breakdown',
      icon: 'credit_card',
      color: 'red',
      lastGenerated: '2024-11-10',
      format: ['PDF', 'Excel', 'CSV'],
    },
    {
      id: 3,
      title: 'Vendor Payment Report',
      description: 'All vendor transactions and payables',
      icon: 'store',
      color: 'purple',
      lastGenerated: '2024-11-09',
      format: ['PDF', 'Excel'],
    },
    {
      id: 4,
      title: 'Trip-Wise Profit Report',
      description: 'Profitability analysis per trip',
      icon: 'local_shipping',
      color: 'blue',
      lastGenerated: '2024-11-08',
      format: ['PDF', 'Excel'],
    },
    {
      id: 5,
      title: 'Balance Sheet',
      description: 'Assets, liabilities, and equity statement',
      icon: 'account_balance_wallet',
      color: 'orange',
      lastGenerated: '2024-11-10',
      format: ['PDF'],
    },
    {
      id: 6,
      title: 'Cash Flow Statement',
      description: 'Operating, investing, and financing activities',
      icon: 'currency_exchange',
      color: 'teal',
      lastGenerated: '2024-11-07',
      format: ['PDF', 'Excel'],
    },
    {
      id: 7,
      title: 'Tax Report',
      description: 'GST and tax calculations',
      icon: 'receipt_long',
      color: 'indigo',
      lastGenerated: '2024-11-05',
      format: ['PDF', 'Excel'],
    },
    {
      id: 8,
      title: 'Customer Invoice Report',
      description: 'All customer invoices and receivables',
      icon: 'description',
      color: 'cyan',
      lastGenerated: '2024-11-09',
      format: ['PDF', 'Excel'],
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      teal: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
      indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
      cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">description</span>
              Financial Reports
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Download and manage financial reports
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-lg">add</span>
            Custom Report
          </button>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-5 border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-lg transition-all duration-300"
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-lg ${getColorClasses(report.color)} flex items-center justify-center mb-4`}>
                <span className="material-symbols-outlined text-2xl">
                  {report.icon}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {report.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 min-h-10">
                {report.description}
              </p>

              {/* Last Generated */}
              <div className="flex items-center gap-1 mb-4">
                <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-sm">
                  schedule
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Last: {report.lastGenerated}
                </span>
              </div>

              {/* Download Buttons */}
              <div className="flex gap-2">
                {report.format.map((format, index) => (
                  <button
                    key={index}
                    className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    {format}
                  </button>
                ))}
              </div>

              {/* Generate Button */}
              <button className="w-full mt-3 px-3 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-sm">refresh</span>
                Generate New
              </button>
            </div>
          ))}
        </div>

        {/* Schedule Reports Section */}
        <div className="mt-8 p-6 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-600 text-white rounded-lg">
              <span className="material-symbols-outlined text-2xl">schedule_send</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Schedule Automated Reports
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Set up automatic report generation and email delivery on a weekly, monthly, or custom schedule.
              </p>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                Configure Schedule
              </button>
            </div>
          </div>
        </div>

        {/* Email Reports Section */}
        <div className="mt-4 p-6 bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-600 text-white rounded-lg">
              <span className="material-symbols-outlined text-2xl">mail</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Email Reports
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Send any report directly to stakeholders via email with custom message.
              </p>
              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="Enter email addresses..."
                  className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">send</span>
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialReports;
