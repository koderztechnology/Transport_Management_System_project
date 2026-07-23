import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [timeframe, setTimeframe] = useState('This Month');
  const [notifications, setNotifications] = useState([]);

  const userRole = localStorage.getItem('user_role') || 'Admin';
  const username = localStorage.getItem('admin_username') || '';

  useEffect(() => {
    if (dashboardData) {
      setNotifications(dashboardData.notifications || []);
    }
  }, [dashboardData]);

  const handleMarkAllRead = () => {
    setNotifications([]);
  };

  const formatChartValue = (value) => {
    if (value === 0) return '₹0';
    return '₹' + Math.round(value).toLocaleString('en-IN');
  };

  const formatIndianCurrency = (amount) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return amount;
    return '₹' + num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  useEffect(() => {
    document.title = `${userRole} Dashboard | TMS Pro`;
    const fetchDashboardData = async () => {
      try {
        const response = await api.get(`/dashboard/?username=${username}&role=${userRole}`);
        setDashboardData(response.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [userRole, username]);
  // Top Summary Cards (KPIs)
  const kpiCards = dashboardData?.kpiCards || [];



  // Trip Status Data
  const tripStatusData = dashboardData?.tripStatusData || [];

  // Recent Trips
  const recentTrips = dashboardData?.recentTrips || [];

  // Financial Data
  const monthlyFinancial = dashboardData?.monthlyFinancial || [];

  const displayFinancialData = (() => {
    if (!monthlyFinancial.length) return [];
    if (timeframe === 'This Month') {
      return [monthlyFinancial[monthlyFinancial.length - 1]];
    }
    if (timeframe === 'Last Month') {
      return monthlyFinancial.length > 1 ? [monthlyFinancial[monthlyFinancial.length - 2]] : [];
    }
    return monthlyFinancial; // YTD shows all
  })();

  const topCostHeads = dashboardData?.topCostHeads || [];

  // Expense Breakdown
  const expenseBreakdown = dashboardData?.expenseBreakdown || [];

  const getHexColor = (colorStr) => {
    if (colorStr.includes('red-500')) return '#ef4444';
    if (colorStr.includes('blue-500')) return '#3b82f6';
    if (colorStr.includes('yellow-500')) return '#eab308';
    if (colorStr.includes('green-500')) return '#10b981';
    if (colorStr.includes('purple-500')) return '#a855f7';
    return '#6366f1';
  };

  const pieData = (expenseBreakdown || []).map(e => ({
    name: e.category,
    value: parseFloat(e.amount.replace(/[₹,]/g, '')) || 0,
    color: e.color
  }));

  const totalExpensesSum = pieData.reduce((sum, item) => sum + item.value, 0);

  // Activity Log
  const activityLog = dashboardData?.activityLog || [];





  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="p-4 bg-red-100 text-red-700 rounded-lg max-w-lg text-center">
          <span className="material-symbols-outlined text-4xl mb-2">error</span>
          <p className="font-semibold">{error}</p>
          <p className="mt-2 text-sm">Please ensure the backend is running via <code className="bg-red-50 px-1 rounded">npm run dev:all</code>.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Page Heading */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {userRole === 'Admin' ? 'Admin Dashboard' :
             userRole === 'Vendor' ? 'Vendor Dashboard' :
             userRole === 'Driver' ? 'Driver Dashboard' :
             userRole === 'Manager' ? 'Manager Dashboard' :
             `${userRole} Dashboard`}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Monitor your transportation management system
          </p>
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



      {/* Trip Status Section */}
      {userRole !== 'Vendor' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Trip Status Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Trip Status</h3>
            <div className="flex flex-col items-center justify-center py-4">
              {/* Dynamic Recharts Pie Chart Representation */}
              <div className="relative w-40 h-40 mb-4">
                <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
                  <PieChart>
                    <Pie
                      data={tripStatusData.map(item => ({
                        name: item.status,
                        value: item.count || 0
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {tripStatusData.map((entry, index) => {
                        let fillHex = '#6366f1';
                        if (entry.status === 'Running') fillHex = '#3b82f6';
                        else if (entry.status === 'Completed') fillHex = '#10b981';
                        else if (entry.status === 'Cancelled' || entry.status === 'Failed') fillHex = '#ef4444';
                        return <Cell key={`cell-${index}`} fill={fillHex} />;
                      })}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{dashboardData?.totalTrips || 0}</p>
                    <p className="text-xs text-slate-500 uppercase font-medium">Total</p>
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
              <button onClick={() => navigate('/trip-management')} className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline font-medium cursor-pointer transition">View All</button>
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
                      <td className="p-3 text-sm text-slate-700 max-w-[150px] truncate" title={trip.route}>{trip.route}</td>
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
      )}

      {/* Financial Overview & Expense Breakdown */}
      {userRole !== 'Driver' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Monthly Income vs Expenses */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Financial Overview</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setTimeframe('This Month')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    timeframe === 'This Month'
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  This Month
                </button>
                <button
                  onClick={() => setTimeframe('Last Month')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    timeframe === 'Last Month'
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Last Month
                </button>
                <button
                  onClick={() => setTimeframe('YTD')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    timeframe === 'YTD'
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  YTD
                </button>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
                <BarChart
                  data={displayFinancialData}
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
                    tickFormatter={formatChartValue}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value, name) => [
                      formatChartValue(value), 
                      name
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
                    minPointSize={5}
                    label={{ position: 'top', formatter: (val) => val > 0 ? formatChartValue(val) : '', fontSize: 9, fill: '#475569', fontWeight: 500 }}
                  />
                  <Bar 
                    dataKey="expenses" 
                    fill="#ef4444" 
                    name="Expenses"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                    minPointSize={5}
                    label={{ position: 'top', formatter: (val) => val > 0 ? formatChartValue(val) : '', fontSize: 9, fill: '#475569', fontWeight: 500 }}
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
                <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getHexColor(entry.color)} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [formatIndianCurrency(value), 'Amount']}
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-900 truncate max-w-[110px]">{formatChartValue(totalExpensesSum)}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-medium">Total</p>
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
      )}

      {/* Top Cost Heads & Quick Actions */}
      {userRole !== 'Driver' && userRole !== 'Vendor' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top 5 Cost Heads */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Top 5 Cost Heads</h3>
            <div className="space-y-4">
              {(() => {
                const parsedCosts = topCostHeads.map(cost => {
                  const val = parseFloat(cost.amount.replace(/[₹,]/g, '')) || 0;
                  return { ...cost, value: val };
                });
                const maxCost = Math.max(...parsedCosts.map(c => c.value), 1);
                
                return parsedCosts.map((cost, index) => {
                  const proportionalWidth = (cost.value / maxCost) * 100;
                  return (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-slate-700">{cost.name}</span>
                        <span className="text-sm font-semibold text-slate-900">{cost.amount}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${proportionalWidth}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button onClick={() => navigate('/trip-management?action=add')} className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                <span className="font-medium">Add Trip</span>
              </button>
              <button onClick={() => navigate('/lr-bilty-billing?action=add')} className="w-full flex items-center gap-3 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                <span className="font-medium">Create LR</span>
              </button>
              <button onClick={() => navigate('/accounts-finance?action=addExpense')} className="w-full flex items-center gap-3 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">payments</span>
                <span className="font-medium">Add Expense</span>
              </button>
              <button onClick={() => navigate('/accounts-finance?action=addIncome')} className="w-full flex items-center gap-3 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">description</span>
                <span className="font-medium">Generate Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Log */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Activity Log</h3>
          {userRole !== 'Driver' && userRole !== 'Vendor' && (
            <button onClick={() => navigate('/tracking-analytics')} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer">View All</button>
          )}
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
    </main>
  );
};

export default Dashboard;

