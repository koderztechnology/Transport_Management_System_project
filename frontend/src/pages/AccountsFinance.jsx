import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';

const formatApiError = (err, defaultMsg) => {
  if (err.response && err.response.data) {
    const data = err.response.data;
    if (typeof data === 'object') {
      return Object.entries(data)
        .map(([field, msgs]) => {
          const fieldName = field.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          return `${fieldName}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`;
        })
        .join('\n');
    }
    if (typeof data === 'string') return data;
  }
  return err.message || defaultMsg;
};

const AccountsFinance = () => {
  const location = useLocation();
  const userRole = localStorage.getItem('user_role') || 'Admin';
  // ========================================
  // STATE MANAGEMENT
  // ========================================

  // Main transactions data array
  const [transactions, setTransactions] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    document.title = "Accounts & Finance";
  }, []);

  useEffect(() => {
    fetchTransactions();
    fetchRelatedData();
  }, []);

  const fetchRelatedData = async () => {
    try {
      const [vRes, tRes, venRes] = await Promise.all([
        api.get('/vehicles/?options=true'),
        api.get('/trips/?options=true'),
        api.get('/vendors/?options=true')
      ]);
      setVehicles(vRes.data);
      setTrips(tRes.data);
      setVendors(venRes.data);
    } catch (error) {
      console.error("Error fetching related data", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/finance-transactions/');
      const mapped = res.data.map(t => ({
        id: t.id,
        date: t.date || '',
        type: t.type || 'Income',
        description: t.description || '',
        amount: parseFloat(t.amount) || 0,
        status: t.status || 'Completed',
        category: t.category || '',
        vehicle: t.vehicle || '',
        trip: t.trip || '',
        vendor: t.vendor || '',
      }));
      setTransactions(mapped);
    } catch (err) {
      console.error(err);
    }
  };

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState(null);
  const [modalType, setModalType] = useState(''); // 'income' or 'expense'
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState(null);

  // Form data state
  const [formData, setFormData] = useState({
    date: '',
    type: 'Income',
    description: '',
    amount: '',
    status: 'Completed',
    category: '',
    vehicle: '',
    trip: '',
    vendor: '',
  });

  // Form validation errors
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // ========================================
  // COMPUTED VALUES
  // ========================================

  // Calculate summary values dynamically
  const totalIncome = transactions
    .filter(t => t.type === 'Income' && t.status === 'Completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'Expense' && t.status === 'Completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpenses;

  const pendingInvoices = transactions
    .filter(t => t.type === 'Income' && t.status === 'Pending')
    .reduce((sum, t) => sum + t.amount, 0);

  // Format currency (Adjusted for INR)
  const formatCurrency = (amount) => {
    const absAmount = Math.abs(amount);
    let formatted;
  
    if (absAmount >= 10000000) { // Crore
      formatted = (absAmount / 10000000).toFixed(2) + ' Cr';
    } else if (absAmount >= 100000) { // Lakh
      formatted = (absAmount / 100000).toFixed(2) + ' L';
    } else {
      formatted = absAmount.toLocaleString('en-IN');
    }
  
    return `₹${amount < 0 ? '-' : ''}${formatted}`;
  };

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(txn => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || 
        String(txn.description || "").toLowerCase().includes(q) ||
        String(txn.category || "").toLowerCase().includes(q) ||
        String(txn.type || "").toLowerCase().includes(q) ||
        String(txn.status || "").toLowerCase().includes(q) ||
        String(txn.amount || "").toLowerCase().includes(q) ||
        String(txn.id || "").toLowerCase().includes(q);
      
      const matchesType = filterType === 'All' || txn.type === filterType;
      const matchesStatus = filterStatus === 'All' || txn.status === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [transactions, searchQuery, filterType, filterStatus]);

  const handleDownloadReport = () => {
    const headers = ["Transaction ID", "Date", "Type", "Description", "Amount", "Status", "Category"];
    const rows = [headers];
    filteredTransactions.forEach((t) => {
      rows.push([
        t.id,
        t.date,
        t.type,
        t.description,
        t.amount,
        t.status,
        t.category,
      ]);
    });
    const csvContent = rows.map((e) => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "finance_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert("Finance report downloaded successfully!");
  };

  // Get status class
  const getStatusClass = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  // Calculate expense categories dynamically
  const getExpenseCategories = () => {
    const categories = {};
    const completedExpenses = transactions.filter(t => t.type === 'Expense' && t.status === 'Completed');
    
    completedExpenses.forEach(txn => {
      let cat = txn.category || 'Misc';
      if (cat.trim().toLowerCase().replace(' ', '') === 'freightexpence') {
        cat = 'Freight Expense';
      }
      if (categories[cat]) {
        categories[cat] += txn.amount;
      } else {
        categories[cat] = txn.amount;
      }
    });

    const total = Object.values(categories).reduce((sum, val) => sum + val, 0);
    
    return Object.entries(categories).map(([category, amount]) => ({
      category,
      amount: formatCurrency(amount),
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
    })).sort((a, b) => b.percentage - a.percentage);
  };

  const expenseCategoriesData = getExpenseCategories();

  // ========================================
  // FORM HANDLING FUNCTIONS
  // ========================================

  // Open modal for adding income
  const handleAddIncome = () => {
    setModalType('income');
    setIsEditMode(false);
    setEditingTransactionId(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: 'Income',
      description: '',
      amount: '',
      status: 'Completed',
      category: 'Trip Payments',
      vehicle: '',
      trip: '',
      vendor: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open modal for adding expense
  const handleAddExpense = () => {
    setModalType('expense');
    setIsEditMode(false);
    setEditingTransactionId(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: 'Expense',
      description: '',
      amount: '',
      status: 'Completed',
      category: 'Fuel',
      vehicle: '',
      trip: '',
      vendor: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open modal for editing transaction
  const handleEditTransaction = (txn) => {
    setModalType(String(txn.type || "").toLowerCase());
    setIsEditMode(true);
    setEditingTransactionId(txn.id);
    setFormData({
      date: txn.date,
      type: txn.type,
      description: txn.description,
      amount: txn.amount.toString(),
      status: txn.status,
      category: txn.category,
      vehicle: txn.vehicle || '',
      trip: txn.trip || '',
      vendor: txn.vendor || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingTransactionId(null);
    setModalType('');
    setFormData({
      date: '',
      type: 'Income',
      description: '',
      amount: '',
      status: 'Completed',
      category: '',
      vehicle: '',
      trip: '',
      vendor: '',
    });
    setFormErrors({});
  };

  // Handle query parameter actions
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get('action');
    if (action === 'addExpense') {
      handleAddExpense();
    } else if (action === 'addIncome' || action === 'addTransaction') {
      handleAddIncome();
    }
  }, [location.search]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    const amountValue = Number(formData.amount);

    if (!formData.date) {
      errors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const minDate = new Date('2025-01-01');
      if (selectedDate < minDate) {
        errors.date = 'Historical dates before Jan 1, 2025 are not allowed';
      }
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (!/^[a-zA-Z\s,.-]+$/.test(formData.description.trim())) {
      errors.description = 'Description cannot contain numbers, math characters, or special signs';
    }

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      errors.amount = 'Amount must be a positive number';
    }

    if (!formData.category) {
      errors.category = 'Category is required';
    }

    if (modalType === 'expense' && ['Fuel', 'Toll', 'Maintenance'].includes(formData.category)) {
      if (!formData.vehicle) {
        errors.vehicle = 'Vehicle is required for Fuel/Toll/Maintenance expenses';
      }
      if (!formData.trip) {
        errors.trip = 'Trip is required for Fuel/Toll/Maintenance expenses';
      }
      if (!formData.vendor) {
        errors.vendor = 'Vendor is required for Fuel/Toll/Maintenance expenses';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit form
  const handleSubmitForm = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      date: formData.date,
      type: formData.type,
      description: formData.description.trim(),
      amount: parseFloat(formData.amount),
      status: formData.status,
      category: formData.category,
      vehicle: formData.vehicle || null,
      trip: formData.trip || null,
      vendor: formData.vendor || null,
    };

    setSubmitting(true);
    try {
      if (isEditMode) {
        // UPDATE existing transaction
        await api.put(`/finance-transactions/${editingTransactionId}/`, payload);
        alert('Transaction updated successfully!');
      } else {
        // ADD new transaction
        await api.post('/finance-transactions/', payload);
        alert('Transaction added successfully!');
      }
      fetchTransactions();
      handleCloseModal();
    } catch (err) {
      console.error('Error saving transaction', err);
      alert(formatApiError(err, 'Failed to save transaction'));
    } finally {
      setSubmitting(false);
    }
  };

  // ========================================
  // DELETE FUNCTIONALITY
  // ========================================

  const handleDeleteTransaction = (txn) => {
    setDeletingTransaction(txn);
    setShowDeleteModal(true);
  };

  const handleConfirmDeleteTransaction = async () => {
    if (!deletingTransaction) return;

    if (!navigator.onLine) {
      alert("Network Connection Failure: You are currently offline. Please check your internet connection and try again.");
      return;
    }

    setSubmitting(true);
    try {
      await api.delete(`/finance-transactions/${deletingTransaction.id}/`);
      fetchTransactions();
      setShowDeleteModal(false);
      setDeletingTransaction(null);
      alert('Transaction deleted successfully.');
    } catch (err) {
      console.error('Error deleting transaction', err);
      const isNetworkError = !err.response || err.message === "Network Error" || err.code === "ERR_NETWORK";
      const errMsg = isNetworkError 
        ? "Network interruption occurred. Delete operation failed. Please check your network and try again." 
        : formatApiError(err, 'Failed to delete transaction');
      alert(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // ========================================
  // SUMMARY CARDS DATA
  // ========================================

  const summaryCards = [
    {
      title: 'Total Income',
      value: formatCurrency(totalIncome),
      icon: 'account_balance_wallet',
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-500',
      change: '+18.2%',
      trend: 'up',
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(totalExpenses),
      icon: 'payment',
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-500',
      change: '+12.5%',
      trend: 'up',
    },
    {
      title: 'Net Profit',
      value: formatCurrency(netProfit),
      icon: 'trending_up',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      change: '+25.7%',
      trend: netProfit >= 0 ? 'up' : 'down',
    },
    {
      title: 'Pending Invoices',
      value: formatCurrency(pendingInvoices),
      icon: 'receipt_long',
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-500',
      change: '-8.3%',
      trend: 'down',
    },
  ];

  // Income and expense category options for dropdown
  const incomeCategoryOptions = ['Trip Payments', 'Loading Charges', 'Unloading Charges', 'Other Income'];
  const expenseCategoryOptions = ['Fuel', 'Toll', 'Maintenance', 'Salaries', 'Insurance', 'Misc'];

  // ========================================
  // RENDER COMPONENT
  // ========================================

  return (
    <main className="flex-1 p-4 lg:p-6 xl:p-8 bg-slate-50 min-h-screen">
      
      {/* Page Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-slate-900 text-2xl lg:text-3xl font-bold">
            Accounts & Finance
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage income, expenses, and financial reports
          </p>
        </div>
        
        {/* Primary actions in header */}
        <div className="flex items-center gap-3">
          {userRole !== 'Vendor' && (
            <button 
              onClick={handleDownloadReport}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">download</span>
              Download Report
            </button>
          )}
          <button 
            onClick={handleAddExpense}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">remove</span>
            {userRole === 'Vendor' ? 'Update Payment' : 'Add Expense'}
          </button>
          <button 
            onClick={handleAddIncome}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add</span>
            {userRole === 'Vendor' ? 'Invoice' : 'Add Income'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryCards.map((card, index) => (
          <div
            key={index}
            className="relative flex flex-col gap-3 rounded-xl p-5 bg-white shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100"
          >
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-lg ${card.iconBg}`}>
                <span className={`material-symbols-outlined text-2xl ${card.iconColor}`}>
                  {card.icon}
                </span>
              </div>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  card.trend === 'up'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {card.trend === 'up' ? 'trending_up' : 'trending_down'}
                </span>
                {card.change}
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">{card.title}</p>
              <p className="text-slate-900 text-2xl font-bold mt-1">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Transactions & Expense Categories */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Recent Transactions Table */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Transactions</h3>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                search
              </span>
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-4 pr-10 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="All">All Types</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-4 pr-10 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="All">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
            <button
              onClick={() => {
                setFilterType('All');
                setFilterStatus('All');
                setSearchQuery('');
              }}
              disabled={filterType === 'All' && filterStatus === 'All' && searchQuery === ''}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-700 disabled:text-slate-400 font-semibold border border-red-200 disabled:border-slate-200 rounded-lg bg-red-50 disabled:bg-slate-50 hover:bg-red-100 transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-base">filter_alt_off</span>
              Reset
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-max text-left">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="p-3 text-xs font-semibold text-slate-700">Date</th>
                  <th className="p-3 text-xs font-semibold text-slate-700">Description</th>
                  <th className="p-3 text-xs font-semibold text-slate-700">Type</th>
                  <th className="p-3 text-xs font-semibold text-slate-700">Amount</th>
                  <th className="p-3 text-xs font-semibold text-slate-700">Status</th>
                  <th className="p-3 text-xs font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.slice((currentPage - 1) * 10, currentPage * 10).map((txn) => (
                    <tr
                      key={txn.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-3 text-sm text-slate-700">{txn.date}</td>
                      <td className="p-3 text-sm text-slate-700 font-medium">{txn.description}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                            txn.type === 'Income'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {txn.type === 'Income' ? 'arrow_downward' : 'arrow_upward'}
                          </span>
                          {txn.type}
                        </span>
                      </td>
                      <td className="p-3 text-sm font-semibold text-slate-900">
                        {formatCurrency(txn.amount)}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(txn.status)}`}>
                          {txn.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditTransaction(txn)}
                            className="p-1 hover:bg-slate-200 rounded transition-colors"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-slate-600 text-xl">
                              edit
                            </span>
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(txn)}
                            className="p-1 hover:bg-red-100 rounded transition-colors"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-red-600 text-xl">
                              delete
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200">
            <span className="text-sm text-slate-500">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button className="px-3 py-1 text-sm font-medium bg-indigo-600 text-white rounded-lg">
                {currentPage}
              </button>
              <button 
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage * 10 >= filteredTransactions.length}
                className="px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Expense Categories */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Expense Categories</h3>
          <div className="space-y-4">
            {expenseCategoriesData.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                No expense data available
              </p>
            ) : (
              expenseCategoriesData.map((expense, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">{expense.category}</span>
                    <span className="text-sm font-semibold text-slate-900">{expense.amount}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${expense.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-500 mt-1">{expense.percentage}% of total</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Profit & Loss Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Profit & Loss Summary</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Income Total */}
          <div className="p-6 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <span className="material-symbols-outlined text-green-600 text-2xl">
                  arrow_downward
                </span>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Income Total</p>
                <p className="text-3xl font-bold text-slate-900">
                  {formatCurrency(totalIncome)}
                </p>
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Completed</span>
                <span className="font-semibold text-slate-900">
                  {transactions.filter(t => t.type === 'Income' && t.status === 'Completed').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Pending</span>
                <span className="font-semibold text-slate-900">
                  {transactions.filter(t => t.type === 'Income' && t.status === 'Pending').length}
                </span>
              </div>
            </div>
          </div>

          {/* Expense Total */}
          <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-red-500/10 rounded-lg">
                <span className="material-symbols-outlined text-red-600 text-2xl">
                  arrow_upward
                </span>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">Expense Total</p>
                <p className="text-3xl font-bold text-slate-900">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Completed</span>
                <span className="font-semibold text-slate-900">
                  {transactions.filter(t => t.type === 'Expense' && t.status === 'Completed').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Categories</span>
                <span className="font-semibold text-slate-900">
                  {expenseCategoriesData.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Result */}
        <div className="mt-6 p-6 bg-blue-50 border-2 border-blue-500 rounded-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <span className="material-symbols-outlined text-blue-600 text-2xl">
                  account_balance
                </span>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">
                  Net {netProfit >= 0 ? 'Profit' : 'Loss'}
                </p>
                <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(netProfit)}
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm text-slate-600">Profit Margin</p>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0.0'}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ADD/EDIT TRANSACTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white p-5 border-b border-slate-200 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {(() => {
                    if (userRole === 'Vendor') {
                      if (isEditMode) {
                        return `Edit ${modalType === 'income' ? 'Invoice' : 'Payment'}`;
                      } else {
                        return `Add ${modalType === 'income' ? 'Invoice' : 'Payment'}`;
                      }
                    }
                    return isEditMode 
                      ? `Edit ${modalType === 'income' ? 'Income' : 'Expense'}` 
                      : `Add ${modalType === 'income' ? 'Income' : 'Expense'}`;
                  })()}
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  {isEditMode ? 'Update the transaction details below' : 'Fill in the transaction details'}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-slate-100:bg-slate-700 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-slate-600">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="p-5 space-y-5 overflow-y-auto">
              
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-2 border rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 ${
                    formErrors.date 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-slate-200 focus:ring-primary/50'
                  }`}
                />
                {formErrors.date && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.date}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder={modalType === 'income' ? 'e.g., Trip payment - ABC Logistics' : 'e.g., Fuel - HP Petrol Pump'}
                  className={`w-full px-4 py-2 border rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 ${
                    formErrors.description 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-slate-200 focus:ring-primary/50'
                  }`}
                />
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full pl-4 pr-10 py-2 border rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 ${
                    formErrors.category 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-slate-200 focus:ring-primary/50'
                  }`}
                >
                  <option value="">Select a category</option>
                  {(modalType === 'income' ? incomeCategoryOptions : expenseCategoryOptions).map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
                {formErrors.category && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.category}</p>
                )}
              </div>

              {/* Related Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Vehicle {modalType === 'expense' && ['Fuel', 'Toll', 'Maintenance'].includes(formData.category) ? <span className="text-red-500">*</span> : '(Optional)'}
                  </label>
                  <select
                    name="vehicle"
                    value={formData.vehicle}
                    onChange={handleInputChange}
                    className={`w-full pl-4 pr-10 py-2 border rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 ${
                      formErrors.vehicle ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-primary/50'
                    }`}
                  >
                    <option value="">Select Vehicle</option>
                    {vehicles.slice(0, 100).map(v => (
                      <option key={v.vehicle_id} value={String(v.vehicle_id)}>{v.vehicle_number || `Vehicle ${v.vehicle_id}`}</option>
                    ))}
                  </select>
                  {formErrors.vehicle && <p className="text-red-500 text-xs mt-1">{formErrors.vehicle}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Trip {modalType === 'expense' && ['Fuel', 'Toll', 'Maintenance'].includes(formData.category) ? <span className="text-red-500">*</span> : '(Optional)'}
                  </label>
                  <select
                    name="trip"
                    value={formData.trip}
                    onChange={handleInputChange}
                    className={`w-full pl-4 pr-10 py-2 border rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 ${
                      formErrors.trip ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-primary/50'
                    }`}
                  >
                    <option value="">Select Trip</option>
                    {trips.slice(0, 100).map(t => (
                      <option key={t.trip_id} value={String(t.trip_id)}>
                        {t.start_location} to {t.end_location} (ID: {t.trip_id})
                      </option>
                    ))}
                  </select>
                  {formErrors.trip && <p className="text-red-500 text-xs mt-1">{formErrors.trip}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Vendor {modalType === 'expense' && ['Fuel', 'Toll', 'Maintenance'].includes(formData.category) ? <span className="text-red-500">*</span> : '(Optional)'}
                  </label>
                  <select
                    name="vendor"
                    value={formData.vendor}
                    onChange={handleInputChange}
                    className={`w-full pl-4 pr-10 py-2 border rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 ${
                      formErrors.vendor ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-primary/50'
                    }`}
                  >
                    <option value="">Select Vendor</option>
                    {vendors.slice(0, 100).map(ven => (
                      <option key={ven.vendor_id} value={String(ven.vendor_id)}>{ven.name}</option>
                    ))}
                  </select>
                  {formErrors.vendor && <p className="text-red-500 text-xs mt-1">{formErrors.vendor}</p>}
                </div>
              </div>

              {/* Amount and Status - Side by Side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={`w-full px-4 py-2 border rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 ${
                      formErrors.amount 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-slate-200 focus:ring-primary/50'
                    }`}
                  />
                  {formErrors.amount && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.amount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full pl-4 pr-10 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                    modalType === 'income' ? 'bg-green-600' : 'bg-red-600'
                  }`}
                >
                  {submitting ? 'Saving...' : (isEditMode 
                    ? `Update ${modalType === 'income' ? 'Income' : 'Expense'}` 
                    : `Add ${modalType === 'income' ? 'Income' : 'Expense'}`)
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && deletingTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Transaction Confirmation</h3>
            <p className="text-sm text-slate-600 mb-4">
              Are you sure you want to delete transaction <strong className="text-slate-900">{deletingTransaction.description}</strong> of amount <strong className="text-slate-900">{formatCurrency(deletingTransaction.amount)}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingTransaction(null);
                }}
                disabled={submitting}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTransaction}
                disabled={submitting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition cursor-pointer disabled:bg-red-400 flex items-center gap-1.5"
              >
                {submitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AccountsFinance;
