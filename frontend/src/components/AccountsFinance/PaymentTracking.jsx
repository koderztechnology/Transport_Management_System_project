import { useState } from 'react';

const PaymentTracking = () => {
  const [activeView, setActiveView] = useState('vendors');

  const vendorPayments = [
    { id: 'VP001', vendor: 'ABC Diesel Station', amount: 45000, dueDate: '2024-11-15', status: 'pending', category: 'Fuel' },
    { id: 'VP002', vendor: 'XYZ Auto Repairs', amount: 28500, dueDate: '2024-11-12', status: 'overdue', category: 'Maintenance' },
    { id: 'VP003', vendor: 'City Tyres Co.', amount: 15800, dueDate: '2024-11-20', status: 'pending', category: 'Parts' },
    { id: 'VP004', vendor: 'FastTrack Logistics', amount: 32000, dueDate: '2024-11-08', status: 'paid', category: 'Service' },
  ];

  const customerInvoices = [
    { id: 'INV001', customer: 'TechCorp Industries', amount: 125000, dueDate: '2024-11-18', status: 'unpaid', tripId: 'TR1234' },
    { id: 'INV002', customer: 'Global Traders Ltd', amount: 95000, dueDate: '2024-11-10', status: 'paid', tripId: 'TR1235' },
    { id: 'INV003', customer: 'Metro Shipping Co', amount: 150000, dueDate: '2024-11-25', status: 'unpaid', tripId: 'TR1236' },
    { id: 'INV004', customer: 'Express Cargo', amount: 78000, dueDate: '2024-11-08', status: 'overdue', tripId: 'TR1237' },
  ];

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      unpaid: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return styles[status] || styles.pending;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Vendor Payments */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600">store</span>
                Vendor Payments
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Track payments to suppliers
              </p>
            </div>
            <button className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium flex items-center gap-1 transition-colors">
              <span className="material-symbols-outlined text-base">add</span>
              Add
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {vendorPayments.map((payment) => (
              <div
                key={payment.id}
                className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                      {payment.vendor}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {payment.id} • {payment.category}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(payment.status)}`}>
                    {payment.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Amount</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      ₹{payment.amount.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-600 dark:text-slate-400">Due Date</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {payment.dueDate}
                    </p>
                  </div>
                </div>

                {payment.status === 'pending' && (
                  <button className="w-full mt-3 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition-colors">
                    Mark as Paid
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Total Pending</span>
              <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                ₹{vendorPayments
                  .filter(p => p.status === 'pending' || p.status === 'overdue')
                  .reduce((sum, p) => sum + p.amount, 0)
                  .toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Invoices */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">receipt_long</span>
                Customer Invoices
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Track receivables from clients
              </p>
            </div>
            <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-1 transition-colors">
              <span className="material-symbols-outlined text-base">add</span>
              Add
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {customerInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                      {invoice.customer}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {invoice.id} • Trip: {invoice.tripId}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(invoice.status)}`}>
                    {invoice.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Amount</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      ₹{invoice.amount.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-600 dark:text-slate-400">Due Date</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {invoice.dueDate}
                    </p>
                  </div>
                </div>

                {(invoice.status === 'unpaid' || invoice.status === 'overdue') && (
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors">
                      Send Reminder
                    </button>
                    <button className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors">
                      Mark Paid
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Total Outstanding</span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                ₹{customerInvoices
                  .filter(i => i.status === 'unpaid' || i.status === 'overdue')
                  .reduce((sum, i) => sum + i.amount, 0)
                  .toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentTracking;
