import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Dashboard = () => {
  // Top Summary Cards (KPIs)
  const kpiCards = [
    {
      title: 'Active Trips',
      value: '24',
      change: '+12.5%',
      trend: 'up',
      icon: 'local_shipping',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      status: 'good',
    },
    {
      title: 'Available Vehicles',
      value: '48',
      change: '+8.3%',
      trend: 'up',
      icon: 'garage',
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-500',
      status: 'good',
    },
    {
      title: 'Drivers on Duty',
      value: '67',
      change: '+5.2%',
      trend: 'up',
      icon: 'badge',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
      status: 'good',
    },
    {
      title: 'Pending Payments',
      value: '₹8.5L',
      change: '-15.2%',
      trend: 'down',
      icon: 'payments',
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-500',
      status: 'warning',
    },
    {
      title: 'Monthly Profit',
      value: '₹12.3L',
      change: '+18.7%',
      trend: 'up',
      icon: 'trending_up',
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-500',
      status: 'good',
    },
  ];

  // Vehicle Alerts
  const vehicleAlerts = [
    {
      type: 'Insurance Expiring',
      vehicle: 'MH12AB3456',
      daysLeft: 5,
      severity: 'high',
      icon: 'shield',
    },
    {
      type: 'PUC Renewal Due',
      vehicle: 'GJ01CD7890',
      daysLeft: 12,
      severity: 'medium',
      icon: 'verified',
    },
    {
      type: 'Service Due',
      vehicle: 'DL08EF1234',
      daysLeft: 3,
      severity: 'high',
      icon: 'build',
    },
    {
      type: 'Loan EMI Due',
      vehicle: 'MH14GH5678',
      daysLeft: 2,
      severity: 'critical',
      icon: 'account_balance',
    },
  ];

  // Trip Status Data
  const tripStatusData = [
    { status: 'Running', count: 24, color: 'bg-blue-500', percentage: 48 },
    { status: 'Completed', count: 18, color: 'bg-green-500', percentage: 36 },
    { status: 'Cancelled', count: 8, color: 'bg-red-500', percentage: 16 },
  ];

  // Recent Trips
  const recentTrips = [
    {
      tripId: 'TMS102',
      vehicle: 'MH12AB3456',
      driver: 'Rahul Kumar',
      route: 'Mumbai → Delhi',
      status: 'Running',
      profit: '₹45,000',
      statusColor: 'bg-blue-100 text-blue-800',
    },
    {
      tripId: 'TMS101',
      vehicle: 'GJ01CD7890',
      driver: 'Amit Sharma',
      route: 'Ahmedabad → Bangalore',
      status: 'Completed',
      profit: '₹52,000',
      statusColor: 'bg-green-100 text-green-800',
    },
    {
      tripId: 'TMS100',
      vehicle: 'DL08EF1234',
      driver: 'Vikram Singh',
      route: 'Delhi → Chennai',
      status: 'Running',
      profit: '₹38,000',
      statusColor: 'bg-blue-100 text-blue-800',
    },
    {
      tripId: 'TMS099',
      vehicle: 'MH14GH5678',
      driver: 'Suresh Patil',
      route: 'Pune → Kolkata',
      status: 'Cancelled',
      profit: '₹0',
      statusColor: 'bg-red-100 text-red-800',
    },
  ];

  // Financial Data
  const monthlyFinancial = [
    { month: 'Jan', income: 850, expenses: 620 },
    { month: 'Feb', income: 920, expenses: 680 },
    { month: 'Mar', income: 780, expenses: 590 },
    { month: 'Apr', income: 1050, expenses: 720 },
    { month: 'May', income: 1230, expenses: 850 },
  ];

  const topCostHeads = [
    { name: 'Fuel', amount: '₹3.2L', percentage: 35 },
    { name: 'Toll', amount: '₹1.8L', percentage: 20 },
    { name: 'Maintenance', amount: '₹1.5L', percentage: 17 },
    { name: 'Loan EMI', amount: '₹1.2L', percentage: 13 },
    { name: 'Vendor', amount: '₹1.1L', percentage: 15 },
  ];

  // Expense Breakdown
  const expenseBreakdown = [
    { category: 'Fuel', amount: '₹3.2L', percentage: 35, color: 'from-red-500 to-red-400' },
    { category: 'Maintenance', amount: '₹1.5L', percentage: 17, color: 'from-blue-500 to-blue-400' },
    { category: 'Toll', amount: '₹1.8L', percentage: 20, color: 'from-yellow-500 to-yellow-400' },
    { category: 'Salaries', amount: '₹1.3L', percentage: 14, color: 'from-green-500 to-green-400' },
    { category: 'Others', amount: '₹1.2L', percentage: 14, color: 'from-purple-500 to-purple-400' },
  ];

  // Activity Log
  const activityLog = [
    {
      message: 'Trip #TMS102 completed by Driver Rahul Kumar',
      time: '10 mins ago',
      icon: 'check_circle',
      iconColor: 'text-green-500',
    },
    {
      message: 'PUC expired for MH12AB3456',
      time: '25 mins ago',
      icon: 'warning',
      iconColor: 'text-orange-500',
    },
    {
      message: 'Invoice INV-2025 generated for ABC Logistics',
      time: '1 hour ago',
      icon: 'receipt',
      iconColor: 'text-blue-500',
    },
    {
      message: 'New trip assigned to Driver Vikram Singh',
      time: '2 hours ago',
      icon: 'assignment',
      iconColor: 'text-purple-500',
    },
    {
      message: 'Payment of ₹45,000 received from XYZ Corp',
      time: '3 hours ago',
      icon: 'payments',
      iconColor: 'text-green-500',
    },
  ];

  // Notifications
  const notifications = [
    {
      title: 'Document Expiry Alert',
      message: 'Insurance for 3 vehicles expiring this week',
      severity: 'high',
      time: '5 mins ago',
    },
    {
      title: 'Low Stock Warning',
      message: 'Spare parts inventory below threshold',
      severity: 'medium',
      time: '1 hour ago',
    },
    {
      title: 'Vendor Payment Due',
      message: 'Payment due for SKY Fuel Station - ₹85,000',
      severity: 'high',
      time: '2 hours ago',
    },
    {
      title: 'Driver Attendance',
      message: '5 drivers marked absent today',
      severity: 'low',
      time: '4 hours ago',
    },
  ];

  const expenseData = [
    { category: 'Fuel', amount: '$45.2k', height: '60%', color: 'from-primary to-primary/60' },
    { category: 'Maint.', amount: '$28.1k', height: '40%', color: 'from-green-500 to-green-400' },
    { category: 'Insurance', amount: '$52.3k', height: '70%', color: 'from-yellow-500 to-yellow-400' },
    { category: 'Tires', amount: '$15.7k', height: '25%', color: 'from-orange-500 to-orange-400' },
    { category: 'Tolls', amount: '$67.8k', height: '85%', color: 'from-red-500 to-red-400' },
  ];

  const recentActivities = [
    {
      activity: 'Trip #TRP-1025 completed',
      user: 'Jane Smith',
      vehicle: 'Vehicle: V-04',
      timestamp: '2 hours ago',
      status: 'Completed',
      statusClass: 'bg-green-100 text-green-800',
      iconBg: 'bg-green-100',
      icon: 'person',
      iconColor: 'text-green-600',
    },
    {
      activity: 'New vehicle V-12 added',
      user: 'John Doe',
      vehicle: 'Administrator',
      timestamp: '5 hours ago',
      status: 'System',
      statusClass: 'bg-blue-100 text-blue-800',
      iconBg: 'bg-blue-100',
      icon: 'admin_panel_settings',
      iconColor: 'text-blue-600',
    },
    {
      activity: 'Trip #TRP-1028 started',
      user: 'Mike Ross',
      vehicle: 'Vehicle: V-07',
      timestamp: '1 day ago',
      status: 'In Progress',
      statusClass: 'bg-yellow-100 text-yellow-800',
      iconBg: 'bg-yellow-100',
      icon: 'person',
      iconColor: 'text-yellow-600',
    },
    {
      activity: 'Maintenance alert for V-02',
      user: 'Vehicle: V-02',
      vehicle: 'Automatic Alert',
      timestamp: '2 days ago',
      status: 'Alert',
      statusClass: 'bg-red-100 text-red-800',
      iconBg: 'bg-red-100',
      icon: 'local_shipping',
      iconColor: 'text-red-600',
    },
  ];

  return (
    <main className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Page Heading */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard Overview
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Monitor your transportation management system
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-sm">Last updated: 2 mins ago</span>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpiCards.map((card, index) => (
          <div
            key={index}
            className="relative flex flex-col gap-3 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-all border border-slate-100"
          >
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-lg ${card.iconBg}`}>
                <span className={`material-symbols-outlined text-[22px] ${card.iconColor}`}>
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
                <span className="material-symbols-outlined text-[14px]">
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

      {/* Vehicle Alerts Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-orange-500">warning</span>
            Vehicle Alerts
          </h3>
          <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View All Alerts</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {vehicleAlerts.map((alert, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                alert.severity === 'critical'
                  ? 'bg-red-50 border-red-500'
                  : alert.severity === 'high'
                  ? 'bg-orange-50 border-orange-500'
                  : 'bg-yellow-50 border-yellow-500'
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`material-symbols-outlined text-xl ${
                    alert.severity === 'critical'
                      ? 'text-red-600'
                      : alert.severity === 'high'
                      ? 'text-orange-600'
                      : 'text-yellow-600'
                  }`}
                >
                  {alert.icon}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 text-sm">{alert.type}</p>
                  <p className="text-xs text-slate-600 mt-1">{alert.vehicle}</p>
                  <p className="text-xs font-semibold text-slate-700 mt-2">
                    {alert.daysLeft} days left
                  </p>
                  <button className="text-xs text-primary hover:underline mt-2">View Details →</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trip Status Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Trip Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Trip Status</h3>
          <div className="flex flex-col items-center justify-center py-4">
            {/* Simple Pie Chart Representation */}
            <div className="relative w-40 h-40 mb-4">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                {/* Running - 48% */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="20"
                  strokeDasharray="120 251"
                  strokeDashoffset="0"
                />
                {/* Completed - 36% */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="20"
                  strokeDasharray="90 251"
                  strokeDashoffset="-120"
                />
                {/* Cancelled - 16% */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="20"
                  strokeDasharray="40 251"
                  strokeDashoffset="-210"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">50</p>
                  <p className="text-xs text-slate-600">Total</p>
                </div>
              </div>
            </div>
            {/* Legend */}
            <div className="space-y-2 w-full">
              {tripStatusData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm text-slate-700">{item.status}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Trips Table */}
          <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Recent Trips</h3>
            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="p-3 text-xs font-semibold text-slate-700">Trip ID</th>
                  <th className="p-3 text-xs font-semibold text-slate-700">Vehicle</th>
                  <th className="p-3 text-xs font-semibold text-slate-700">Driver</th>
                  <th className="p-3 text-xs font-semibold text-slate-700">Route</th>
                  <th className="p-3 text-xs font-semibold text-slate-700">Status</th>
                  <th className="p-3 text-xs font-semibold text-slate-700">Profit</th>
                </tr>
              </thead>
              <tbody>
                {recentTrips.map((trip, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="p-3 text-sm font-medium text-indigo-600">{trip.tripId}</td>
                    <td className="p-3 text-sm text-slate-700">{trip.vehicle}</td>
                    <td className="p-3 text-sm text-slate-700">{trip.driver}</td>
                    <td className="p-3 text-sm text-slate-700">{trip.route}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${trip.statusColor}`}>
                        {trip.status}
                      </span>
                    </td>
                    <td className="p-3 text-sm font-semibold text-slate-900">{trip.profit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Financial Overview & Expense Breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Monthly Income vs Expenses */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Financial Overview</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">This Month</button>
              <button className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                Last Month
              </button>
              <button className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                YTD
              </button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyFinancial}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
                barCategoryGap={20}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickFormatter={(value) => `₹${(value / 100).toFixed(0)}K`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value, name) => [
                    `₹${(value / 100).toFixed(0)}K`, 
                    name === 'income' ? 'Income' : 'Expenses'
                  ]}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Legend 
                  wrapperStyle={{
                    paddingTop: '20px'
                  }}
                  iconType="rect"
                />
                <Bar 
                  dataKey="income" 
                  fill="#10b981" 
                  name="Income"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={60}
                />
                <Bar 
                  dataKey="expenses" 
                  fill="#ef4444" 
                  name="Expenses"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown Donut */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Expense Breakdown</h3>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Donut Chart */}
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="15"
                  strokeDasharray="77 220"
                  strokeDashoffset="0"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="15"
                  strokeDasharray="37 220"
                  strokeDashoffset="-77"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="none"
                  stroke="#eab308"
                  strokeWidth="15"
                  strokeDasharray="44 220"
                  strokeDashoffset="-114"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="15"
                  strokeDasharray="31 220"
                  strokeDashoffset="-158"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="15"
                  strokeDasharray="31 220"
                  strokeDashoffset="-189"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">₹9.0L</p>
                  <p className="text-xs text-slate-600">Total</p>
                </div>
              </div>
            </div>
            {/* Legend */}
            <div className="space-y-3 flex-1">
              {expenseBreakdown.map((expense, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-linear-to-r ${expense.color}`}></div>
                    <span className="text-sm text-slate-700">{expense.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{expense.amount}</p>
                    <p className="text-xs text-slate-500">{expense.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Cost Heads & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 5 Cost Heads */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Top 5 Cost Heads</h3>
          <div className="space-y-4">
            {topCostHeads.map((cost, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-slate-700">{cost.name}</span>
                  <span className="text-sm font-semibold text-slate-900">{cost.amount}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${cost.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              <span className="font-medium">Add Trip</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
              <span className="font-medium">Create LR</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors">
              <span className="material-symbols-outlined text-[20px]">payments</span>
              <span className="font-medium">Add Expense</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              <span className="material-symbols-outlined text-[20px]">description</span>
              <span className="font-medium">Generate Invoice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Activity Log & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Log */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Activity Log</h3>
            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View All</button>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {activityLog.map((activity, index) => (
              <div key={index} className="flex gap-3">
                <span className={`material-symbols-outlined ${activity.iconColor} mt-1`}>{activity.icon}</span>
                <div className="flex-1">
                  <p className="text-sm text-slate-700">{activity.message}</p>
                  <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-red-500">notifications</span>
              Notifications
            </h3>
            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">Mark All Read</button>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notifications.map((notification, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  notification.severity === 'high'
                    ? 'bg-red-50 border-red-500'
                    : notification.severity === 'medium'
                    ? 'bg-yellow-50 border-yellow-500'
                    : 'bg-blue-50 border-blue-500'
                }`}
              >
                <p className="font-medium text-sm text-slate-900">{notification.title}</p>
                <p className="text-xs text-slate-600 mt-1">{notification.message}</p>
                <p className="text-xs text-slate-500 mt-2">{notification.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;

