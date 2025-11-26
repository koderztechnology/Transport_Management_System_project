import React, { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  XAxis,
  YAxis,
  Bar,
  CartesianGrid,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

export default function TransportFuelTollPage() {
  const [fuelData, setFuelData] = useState([
    { id: 1, vehicle: "MH12AB1234", litres: 45, pricePerLitre: 98.5, date: "2025-11-01" },
    { id: 2, vehicle: "MH12CD5678", litres: 30, pricePerLitre: 100.0, date: "2025-11-05" },
  ]);

  const [tollData, setTollData] = useState([
    { id: 1, vehicle: "MH12AB1234", tollName: "Expressway Toll", amount: 250, date: "2025-11-03" },
    { id: 2, vehicle: "MH12CD5678", tollName: "Bridge Toll", amount: 120, date: "2025-11-06" },
  ]);

  const [showAddFuel, setShowAddFuel] = useState(false);
  const [showAddToll, setShowAddToll] = useState(false);
  const [editingFuelId, setEditingFuelId] = useState(null);
  const [editingTollId, setEditingTollId] = useState(null);

  const [newFuel, setNewFuel] = useState({ vehicle: "", litres: "", pricePerLitre: "", date: "" });
  const [newToll, setNewToll] = useState({ vehicle: "", tollName: "", amount: "", date: "" });
  const [filterDates, setFilterDates] = useState({ start: "", end: "" });

  const totalFuelCost = fuelData.reduce((s, f) => s + f.litres * f.pricePerLitre, 0);
  const totalToll = tollData.reduce((s, t) => s + t.amount, 0);
  const totalLitres = fuelData.reduce((s, f) => s + f.litres, 0);
  const avgFuelPrice = (totalFuelCost / Math.max(1, totalLitres)).toFixed(2);

  // Add / Update Fuel
  const handleAddFuel = (e) => {
    e.preventDefault();
    if (!newFuel.vehicle || !newFuel.litres || !newFuel.pricePerLitre || !newFuel.date) return;

    if (editingFuelId) {
      setFuelData(fuelData.map(f => f.id === editingFuelId ? { ...f, ...newFuel, litres: +newFuel.litres, pricePerLitre: +newFuel.pricePerLitre } : f));
      setEditingFuelId(null);
    } else {
      const id = fuelData.length ? fuelData[fuelData.length - 1].id + 1 : 1;
      setFuelData([...fuelData, { id, ...newFuel, litres: +newFuel.litres, pricePerLitre: +newFuel.pricePerLitre }]);
    }
    setNewFuel({ vehicle: "", litres: "", pricePerLitre: "", date: "" });
    setShowAddFuel(false);
  };

  // Add / Update Toll
  const handleAddToll = (e) => {
    e.preventDefault();
    if (!newToll.vehicle || !newToll.tollName || !newToll.amount || !newToll.date) return;

    if (editingTollId) {
      setTollData(tollData.map(t => t.id === editingTollId ? { ...t, ...newToll, amount: +newToll.amount } : t));
      setEditingTollId(null);
    } else {
      const id = tollData.length ? tollData[tollData.length - 1].id + 1 : 1;
      setTollData([...tollData, { id, ...newToll, amount: +newToll.amount }]);
    }
    setNewToll({ vehicle: "", tollName: "", amount: "", date: "" });
    setShowAddToll(false);
  };

  const deleteFuel = (id) => setFuelData(fuelData.filter(f => f.id !== id));
  const deleteToll = (id) => setTollData(tollData.filter(t => t.id !== id));

  const editFuel = (f) => {
    setNewFuel({ ...f });
    setEditingFuelId(f.id);
    setShowAddFuel(true);
  };
  const editToll = (t) => {
    setNewToll({ ...t });
    setEditingTollId(t.id);
    setShowAddToll(true);
  };

  const filterDataByDate = (data) => {
    if (!filterDates.start || !filterDates.end) return data;
    return data.filter((item) => item.date >= filterDates.start && item.date <= filterDates.end);
  };
  const filteredFuel = filterDataByDate(fuelData);
  const filteredToll = filterDataByDate(tollData);

  const barData = useMemo(() => {
    const allDates = [...new Set([...fuelData.map(f => f.date), ...tollData.map(t => t.date)])].sort();
    return allDates.map(date => ({
      date,
      Fuel: fuelData.filter(f => f.date === date).reduce((s, f) => s + f.litres * f.pricePerLitre, 0),
      Toll: tollData.filter(t => t.date === date).reduce((s, t) => s + t.amount, 0),
    }));
  }, [fuelData, tollData]);
  const pieData = [
    { name: "Fuel Cost", value: totalFuelCost },
    { name: "Toll Cost", value: totalToll },
  ];
  const COLORS = ["#2563eb", "#f97316"];

  const exportReport = () => {
    const rows = [["Type", "Vehicle", "Litres/Amount", "Price/L", "Date"]];
    fuelData.forEach(f => rows.push(["Fuel", f.vehicle, f.litres, f.pricePerLitre, f.date]));
    tollData.forEach(t => rows.push(["Toll", t.vehicle, t.amount, "", t.date]));
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "fuel_toll_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Fuel & Toll Management
            </h1>
            <p className="text-sm text-slate-500 mt-2">Monitor and track fuel consumption and toll expenses efficiently</p>
          </div>
          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export CSV
          </button>
        </header>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { title: "Total Fuel Cost", value: `₹${totalFuelCost.toFixed(0)}`, icon: "local_gas_station", color: "text-blue-600", bg: "bg-blue-500/10", trend: "+12.5%" },
            { title: "Total Toll Paid", value: `₹${totalToll}`, icon: "toll", color: "text-orange-600", bg: "bg-orange-500/10", trend: "+8.2%" },
            { title: "Avg Fuel Price", value: `₹${avgFuelPrice}/L`, icon: "monitoring", color: "text-emerald-600", bg: "bg-emerald-500/10", trend: "-2.1%" },
          ].map((card, i) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -3, scale: 1.01 }} 
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 hover:shadow-lg hover:border-slate-300 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-3 rounded-xl ${card.bg}`}>
                  <span className={`material-symbols-outlined text-[26px] ${card.color}`}>{card.icon}</span>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${i === 2 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  {card.trend}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-500 mb-1">{card.title}</p>
              <p className="text-3xl font-bold text-slate-900">{card.value}</p>
            </motion.div>
          ))}
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-7 shadow-sm border border-slate-200/60 hover:shadow-md transition-all">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-1">Expense Breakdown</h2>
              <p className="text-sm text-slate-500">Distribution of fuel vs toll costs</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl p-7 shadow-sm border border-slate-200/60 hover:shadow-md transition-all">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-1">Daily Expense Comparison</h2>
              <p className="text-sm text-slate-500">Fuel and toll expenses over time</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  stroke="#64748b"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="Fuel" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Toll" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* FUEL SECTION */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-visible">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-7 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-1">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <span className="material-symbols-outlined text-[22px] text-blue-600">local_gas_station</span>
                </div>
                Fuel Transactions
              </h2>
              <p className="text-sm text-slate-500">Manage fuel purchases and consumption</p>
            </div>
            <button 
              onClick={() => setShowAddFuel(!showAddFuel)} 
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md text-sm font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">{showAddFuel ? "close" : "add"}</span>
              {showAddFuel ? "Cancel" : "Add Entry"}
            </button>
          </div>

          <div className="p-7 pt-6">
            {showAddFuel && (
              <form onSubmit={handleAddFuel} className="mb-6 p-5 bg-slate-50/50 rounded-xl border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <input 
                    placeholder="Vehicle Number" 
                    value={newFuel.vehicle} 
                    onChange={(e) => setNewFuel({ ...newFuel, vehicle: e.target.value })} 
                    className="px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white"
                    required
                  />
                  <input 
                    placeholder="Litres" 
                    type="number" 
                    step="0.01"
                    value={newFuel.litres} 
                    onChange={(e) => setNewFuel({ ...newFuel, litres: e.target.value })} 
                    className="px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white"
                    required
                  />
                  <input 
                    placeholder="Price per Litre (₹)" 
                    type="number" 
                    step="0.01"
                    value={newFuel.pricePerLitre} 
                    onChange={(e) => setNewFuel({ ...newFuel, pricePerLitre: e.target.value })} 
                    className="px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white"
                    required
                  />
                  <input 
                    type="date" 
                    value={newFuel.date} 
                    onChange={(e) => setNewFuel({ ...newFuel, date: e.target.value })} 
                    className="px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white"
                    required
                  />
                  <button 
                    type="submit"
                    className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-semibold text-sm shadow-sm hover:shadow-md"
                  >
                    {editingFuelId ? "Update Entry" : "Save Entry"}
                  </button>
                </div>
              </form>
            )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-bold text-slate-600 uppercase tracking-wide">#</th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-slate-600 uppercase tracking-wide">Vehicle</th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-slate-600 uppercase tracking-wide">Litres</th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-slate-600 uppercase tracking-wide">Price/L</th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-slate-600 uppercase tracking-wide">Date</th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-slate-600 uppercase tracking-wide">Total</th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-slate-600 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFuel.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="p-4 bg-slate-100 rounded-full mb-3">
                          <span className="material-symbols-outlined text-5xl text-slate-400">local_gas_station</span>
                        </div>
                        <p className="text-slate-500 font-medium">No fuel transactions found</p>
                        <p className="text-slate-400 text-sm mt-1">Add your first fuel entry to get started</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredFuel.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="py-4 px-6 text-slate-600 font-medium">{idx + 1}</td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-slate-900 px-3 py-1 bg-slate-100 rounded-md">{row.vehicle}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-blue-600">{row.litres}L</span>
                      </td>
                      <td className="py-4 px-6 text-slate-700 font-medium">₹{row.pricePerLitre}</td>
                      <td className="py-4 px-6 text-slate-600">{row.date}</td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-slate-900">₹{(row.litres * row.pricePerLitre).toFixed(2)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2 transition-opacity">
                          <button 
                            onClick={() => editFuel(row)} 
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button 
                            onClick={() => deleteFuel(row.id)} 
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          </div>
        </section>

        {/* TOLL SECTION */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-visible">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-7 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-1">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <span className="material-symbols-outlined text-[22px] text-orange-600">toll</span>
                </div>
                Toll Transactions
              </h2>
              <p className="text-sm text-slate-500">Track toll payments and gate expenses</p>
            </div>
            <button 
              onClick={() => setShowAddToll(!showAddToll)} 
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md text-sm font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">{showAddToll ? "close" : "add"}</span>
              {showAddToll ? "Cancel" : "Add Entry"}
            </button>
          </div>

          <div className="p-7 pt-6">
            {showAddToll && (
              <form onSubmit={handleAddToll} className="mb-6 p-5 bg-slate-50/50 rounded-xl border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <input 
                    placeholder="Vehicle Number" 
                    value={newToll.vehicle} 
                    onChange={(e) => setNewToll({ ...newToll, vehicle: e.target.value })} 
                    className="px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white"
                    required
                  />
                  <input 
                    placeholder="Toll Name" 
                    value={newToll.tollName} 
                    onChange={(e) => setNewToll({ ...newToll, tollName: e.target.value })} 
                    className="px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white"
                    required
                  />
                  <input 
                    placeholder="Amount (₹)" 
                    type="number" 
                    step="0.01"
                    value={newToll.amount} 
                    onChange={(e) => setNewToll({ ...newToll, amount: e.target.value })} 
                    className="px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white"
                    required
                  />
                  <input 
                    type="date" 
                    value={newToll.date} 
                    onChange={(e) => setNewToll({ ...newToll, date: e.target.value })} 
                    className="px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white"
                    required
                  />
                  <button 
                    type="submit"
                    className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-semibold text-sm shadow-sm hover:shadow-md"
                  >
                    {editingTollId ? "Update Entry" : "Save Entry"}
                  </button>
                </div>
              </form>
            )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-bold text-slate-600 uppercase tracking-wide">#</th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-slate-600 uppercase tracking-wide">Vehicle</th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-slate-600 uppercase tracking-wide">Toll Name</th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-slate-600 uppercase tracking-wide">Date</th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-slate-600 uppercase tracking-wide">Amount</th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-slate-600 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredToll.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="p-4 bg-slate-100 rounded-full mb-3">
                          <span className="material-symbols-outlined text-5xl text-slate-400">toll</span>
                        </div>
                        <p className="text-slate-500 font-medium">No toll transactions found</p>
                        <p className="text-slate-400 text-sm mt-1">Add your first toll entry to get started</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredToll.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="py-4 px-6 text-slate-600 font-medium">{idx + 1}</td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-slate-900 px-3 py-1 bg-slate-100 rounded-md">{row.vehicle}</span>
                      </td>
                      <td className="py-4 px-6 text-slate-700 font-medium">{row.tollName}</td>
                      <td className="py-4 px-6 text-slate-600">{row.date}</td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-orange-600">₹{row.amount}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2 transition-opacity">
                          <button 
                            onClick={() => editToll(row)} 
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button 
                            onClick={() => deleteToll(row.id)} 
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          </div>
        </section>

      </div>
    </div>
  );
}
