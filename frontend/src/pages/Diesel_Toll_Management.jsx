import React, { useState, useMemo, useEffect } from "react";
import api from "../utils/api";
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
const FUEL_API_URL = "/fuel/";
const TOLL_API_URL = "/toll/";


export default function TransportFuelTollPage() {
  // ------------------------------------------------------------------
  // STATE
  // ------------------------------------------------------------------
  const [fuelData, setFuelData] = useState([]);
  const [tollData, setTollData] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [showAddFuel, setShowAddFuel] = useState(false);
  const [showAddToll, setShowAddToll] = useState(false);
  const [editingFuelId, setEditingFuelId] = useState(null);
  const [editingTollId, setEditingTollId] = useState(null);
  const [fuelErrors, setFuelErrors] = useState({});
  const [tollErrors, setTollErrors] = useState({});

  const [newFuel, setNewFuel] = useState({
    vehicle: "",
    litres: "",
    price_per_litre: "",
    date: "",
    photo: null,
  });

  const [newToll, setNewToll] = useState({
    vehicle: "",
    toll_name: "",
    amount: "",
    date: "",
    photo: null,
  });

  const [filterDates] = useState({ start: "", end: "" });
  const [fuelPage, setFuelPage] = useState(1);
  const [tollPage, setTollPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // ------------------------------------------------------------------
  // FETCH FROM BACKEND ON MOUNT
  // ------------------------------------------------------------------
  useEffect(() => {
    const fetchFuelAndToll = async () => {
      try {
        const [fuelRes, tollRes, vehicleRes] = await Promise.all([
          api.get(FUEL_API_URL),
          api.get(TOLL_API_URL),
          api.get('/vehicles/'),
        ]);

        setFuelData(fuelRes.data || []);
        setTollData(tollRes.data || []);
        setVehicles(vehicleRes.data || []);
      } catch (err) {
        console.error("Error fetching fuel/toll data:", err.response?.data || err);
      }
    };

    fetchFuelAndToll();
  }, []);

  // ------------------------------------------------------------------
  // METRICS
  // ------------------------------------------------------------------
  const totalFuelCost = fuelData.reduce(
    (s, f) => s + (Number(f.litres) || 0) * (Number(f.price_per_litre) || 0),
    0
  );
  const totalToll = tollData.reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const totalLitres = fuelData.reduce((s, f) => s + (Number(f.litres) || 0), 0);
  const avgFuelPrice = (totalFuelCost / Math.max(1, totalLitres)).toFixed(2);

  // ------------------------------------------------------------------
  // HELPERS
  // ------------------------------------------------------------------
  const getVehicleNumber = (vId) => {
    const found = vehicles.find(v => String(v.vehicle_id) === String(vId));
    return found ? found.vehicle_number : `Vehicle ${vId}`;
  };

  const filteredFuel = useMemo(() => {
    let data = fuelData;
    if (filterDates.start && filterDates.end) {
      data = data.filter(item => item.date >= filterDates.start && item.date <= filterDates.end);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(item => 
        String(getVehicleNumber(item.vehicle)).toLowerCase().includes(q)
      );
    }
    return data;
  }, [fuelData, filterDates, searchQuery, vehicles]);

  const filteredToll = useMemo(() => {
    let data = tollData;
    if (filterDates.start && filterDates.end) {
      data = data.filter(item => item.date >= filterDates.start && item.date <= filterDates.end);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(item => 
        String(getVehicleNumber(item.vehicle)).toLowerCase().includes(q) ||
        String(item.toll_name || "").toLowerCase().includes(q)
      );
    }
    return data;
  }, [tollData, filterDates, searchQuery, vehicles]);

  const barData = useMemo(() => {
    const allDates = [
      ...new Set([
        ...fuelData.map((f) => f.date),
        ...tollData.map((t) => t.date),
      ]),
    ]
      .filter(Boolean)
      .sort();

    return allDates.map((date) => ({
      date,
      Fuel: fuelData
        .filter((f) => f.date === date)
        .reduce(
          (s, f) =>
            s +
            (Number(f.litres) || 0) * (Number(f.price_per_litre) || 0),
          0
        ),
      Toll: tollData
        .filter((t) => t.date === date)
        .reduce((s, t) => s + (Number(t.amount) || 0), 0),
    }));
  }, [fuelData, tollData]);

  const pieData = [
    { name: "Fuel Cost", value: totalFuelCost },
    { name: "Toll Cost", value: totalToll },
  ];
  const COLORS = ["#2563eb", "#f97316"];

  const exportReport = () => {
    const rows = [["Type", "Vehicle", "Litres/Amount", "Price/L", "Date"]];
    fuelData.forEach((f) =>
      rows.push([
        "Fuel",
        f.vehicle,
        f.litres,
        f.price_per_litre,
        f.date,
      ])
    );
    tollData.forEach((t) =>
      rows.push(["Toll", t.vehicle, t.amount, "", t.date])
    );
    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "fuel_toll_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const buildPhotoSrc = (photo) => {
    if (!photo) return null;
    if (typeof photo === "string") {
      // backend will return something like "/media/..."
      if (photo.startsWith("http")) return photo;
      return `https://transport.koderzgroup.com${photo}`;
    }
    return URL.createObjectURL(photo);
  };

  const renderPhotoPreview = (photo) => {
    const src = buildPhotoSrc(photo);
    if (!src) return null;

    return (
      <div className="mt-1">
        <img
          src={src}
          alt="Bill preview"
          className="h-16 w-auto rounded-md border border-slate-200 object-cover"
        />
      </div>
    );
  };

  // ------------------------------------------------------------------
  // FUEL: ADD / UPDATE
  // ------------------------------------------------------------------
  const validateFuelForm = () => {
    const errors = {};
    if (!String(newFuel.vehicle || "").trim()) errors.vehicle = "Please select a vehicle.";
    if (!String(newFuel.litres || "").trim()) errors.litres = "Litres are required.";
    else if (Number(newFuel.litres) <= 0) errors.litres = "Litres must be greater than zero.";
    if (!String(newFuel.price_per_litre || "").trim()) errors.price_per_litre = "Price is required.";
    else if (Number(newFuel.price_per_litre) <= 0) errors.price_per_litre = "Price must be greater than zero.";
    if (!String(newFuel.date || "").trim()) errors.date = "Date is required.";
    return errors;
  };

  const handleAddFuel = async (e) => {
    e.preventDefault();
    const errors = validateFuelForm();
    if (Object.keys(errors).length > 0) {
      setFuelErrors(errors);
      return;
    }
    setFuelErrors({});

    try {
      const formData = new FormData();
      formData.append("vehicle", newFuel.vehicle);
      formData.append("litres", newFuel.litres);
      formData.append("price_per_litre", newFuel.price_per_litre);
      formData.append("date", newFuel.date);
      if (newFuel.photo instanceof File) {
        formData.append("photo", newFuel.photo);
      }

      if (editingFuelId) {
        const res = await api.put(
          `${FUEL_API_URL}${editingFuelId}/`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        setFuelData((prev) =>
          prev.map((f) =>
            f.fuel_id === editingFuelId ? res.data : f
          )
        );
        setEditingFuelId(null);
      } else {
        const res = await api.post(FUEL_API_URL, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setFuelData((prev) => [res.data, ...prev]);
      }

      setNewFuel({
        vehicle: "",
        litres: "",
        price_per_litre: "",
        date: "",
        photo: null,
      });
      setShowAddFuel(false);
    } catch (err) {
      console.error("Error saving fuel:", err.response?.data || err);
      alert("Error saving fuel. Check console for details.");
    }
  };

  const deleteFuel = async (fuelId) => {
    try {
      await api.delete(`${FUEL_API_URL}${fuelId}/`);
      setFuelData((prev) => prev.filter((f) => f.fuel_id !== fuelId));
    } catch (err) {
      console.error("Error deleting fuel:", err.response?.data || err);
      alert("Error deleting fuel entry.");
    }
  };

  const editFuel = (f) => {
    setNewFuel({
      vehicle: f.vehicle || "",
      litres: f.litres || "",
      price_per_litre: f.price_per_litre || "",
      date: f.date || "",
      photo: f.photo || null,
    });
    setEditingFuelId(f.fuel_id);
    setShowAddFuel(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ------------------------------------------------------------------
  // TOLL: ADD / UPDATE
  // ------------------------------------------------------------------
  const validateTollForm = () => {
    const errors = {};
    if (!String(newToll.vehicle || "").trim()) errors.vehicle = "Please select a vehicle.";
    if (!String(newToll.toll_name || "").trim()) errors.toll_name = "Toll name is required.";
    if (!String(newToll.amount || "").trim()) errors.amount = "Amount is required.";
    else if (Number(newToll.amount) <= 0) errors.amount = "Amount must be greater than zero.";
    if (!String(newToll.date || "").trim()) errors.date = "Date is required.";
    return errors;
  };

  const handleAddToll = async (e) => {
    e.preventDefault();
    const errors = validateTollForm();
    if (Object.keys(errors).length > 0) {
      setTollErrors(errors);
      return;
    }
    setTollErrors({});

    try {
      const formData = new FormData();
      formData.append("vehicle", newToll.vehicle);
      formData.append("toll_name", newToll.toll_name);
      formData.append("amount", newToll.amount);
      formData.append("date", newToll.date);
      if (newToll.photo instanceof File) {
        formData.append("photo", newToll.photo);
      }

      if (editingTollId) {
        const res = await api.put(
          `${TOLL_API_URL}${editingTollId}/`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        setTollData((prev) =>
          prev.map((t) =>
            t.toll_id === editingTollId ? res.data : t
          )
        );
        setEditingTollId(null);
      } else {
        const res = await api.post(TOLL_API_URL, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setTollData((prev) => [res.data, ...prev]);
      }

      setNewToll({
        vehicle: "",
        toll_name: "",
        amount: "",
        date: "",
        photo: null,
      });
      setShowAddToll(false);
    } catch (err) {
      console.error("Error saving toll:", err.response?.data || err);
      alert("Error saving toll. Check console for details.");
    }
  };

  const deleteToll = async (tollId) => {
    try {
      await api.delete(`${TOLL_API_URL}${tollId}/`);
      setTollData((prev) => prev.filter((t) => t.toll_id !== tollId));
    } catch (err) {
      console.error("Error deleting toll:", err.response?.data || err);
      alert("Error deleting toll entry.");
    }
  };

  const editToll = (t) => {
    setNewToll({
      vehicle: t.vehicle || "",
      toll_name: t.toll_name || "",
      amount: t.amount || "",
      date: t.date || "",
      photo: t.photo || null,
    });
    setEditingTollId(t.toll_id);
    setShowAddToll(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ------------------------------------------------------------------
  // UI (UNCHANGED VISUALLY)
  // ------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Fuel & Toll Management
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Monitor and track fuel consumption and toll expenses efficiently
            </p>
          </div>
          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">
              download
            </span>
            Export CSV
          </button>
        </header>

        {/* SEARCH BAR */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/60 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
              search
            </span>
            <input
              type="text"
              placeholder="Search by Vehicle Number or Toll Plaza..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 h-11 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            )}
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="px-4 py-2.5 h-11 text-sm text-red-600 hover:text-red-700 font-semibold border border-red-200 rounded-lg bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-base">filter_alt_off</span>
              Reset
            </button>
          )}
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            {
              title: "Total Fuel Cost",
              value: `₹${totalFuelCost.toFixed(0)}`,
              icon: "local_gas_station",
              color: "text-blue-600",
              bg: "bg-blue-500/10",
              trend: "+12.5%",
            },
            {
              title: "Total Toll Paid",
              value: `₹${totalToll}`,
              icon: "toll",
              color: "text-orange-600",
              bg: "bg-orange-500/10",
              trend: "+8.2%",
            },
            {
              title: "Avg Fuel Price",
              value: `₹${avgFuelPrice}/L`,
              icon: "monitoring",
              color: "text-emerald-600",
              bg: "bg-emerald-500/10",
              trend: "-2.1%",
            },
          ].map((card, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 hover:shadow-lg hover:border-slate-300 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-3 rounded-xl ${card.bg}`}>
                  <span
                    className={`material-symbols-outlined text-[26px] ${card.color}`}
                  >
                    {card.icon}
                  </span>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    i === 2
                      ? "bg-red-50 text-red-600"
                      : "bg-green-50 text-green-600"
                  }`}
                >
                  {card.trend}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-500 mb-1">
                {card.title}
              </p>
              <p className="text-3xl font-bold text-slate-900">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* PIE */}
          <div className="bg-white rounded-2xl p-7 shadow-sm border border-slate-200/60 hover:shadow-md transition-all">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-1">
                Expense Breakdown
              </h2>
              <p className="text-sm text-slate-500">
                Distribution of fuel vs toll costs
              </p>
            </div>
            <ResponsiveContainer width="100%" height={300} minHeight={1} minWidth={1}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow:
                      "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* BAR */}
          <div className="bg-white rounded-2xl p-7 shadow-sm border border-slate-200/60 hover:shadow-md transition-all">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-1">
                Daily Expense Comparison
              </h2>
              <p className="text-sm text-slate-500">
                Fuel and toll expenses over time
              </p>
            </div>
            <ResponsiveContainer width="100%" height={300} minHeight={1} minWidth={1}>
              <BarChart data={barData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={{ stroke: "#e5e7eb" }}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={{ stroke: "#e5e7eb" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow:
                      "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="Fuel"
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="Toll"
                  fill="#f97316"
                  radius={[4, 4, 0, 0]}
                />
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
                  <span className="material-symbols-outlined text-[22px] text-blue-600">
                    local_gas_station
                  </span>
                </div>
                Fuel Transactions
              </h2>
              <p className="text-sm text-slate-500">
                Manage fuel purchases and consumption
              </p>
            </div>
            <button
              onClick={() => setShowAddFuel(!showAddFuel)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md text-sm font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">
                {showAddFuel ? "close" : "add"}
              </span>
              {showAddFuel ? "Cancel" : "Add Entry"}
            </button>
          </div>

          <div className="p-7 pt-6">
            {/* FORM (Fuel) */}
            {showAddFuel && (
              <form
                onSubmit={handleAddFuel}
                className="mb-6 p-6 bg-white rounded-xl border border-slate-200 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  {editingFuelId ? "Edit Fuel Entry" : "Add Fuel Entry"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Vehicle *
                    </label>
                    <select
                      value={newFuel.vehicle}
                      onChange={(e) =>
                        setNewFuel({
                          ...newFuel,
                          vehicle: e.target.value,
                        })
                      }
                      className={`mt-1 w-full pl-4 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/30 bg-white ${fuelErrors.vehicle ? 'border-red-500' : 'border-slate-300'}`}
                      required
                    >
                      <option value="">Select Vehicle</option>
                      {vehicles.slice(0, 100).map(v => (
                        <option key={v.vehicle_id} value={v.vehicle_id}>{v.vehicle_number || `Vehicle ${v.vehicle_id}`}</option>
                      ))}
                    </select>
                    {fuelErrors.vehicle && <p className="text-red-500 text-xs mt-1">{fuelErrors.vehicle}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Litres *
                    </label>
                    <input
                      placeholder="Enter litres"
                      type="number"
                      step="0.01"
                      value={newFuel.litres}
                      onChange={(e) =>
                        setNewFuel({
                          ...newFuel,
                          litres: e.target.value,
                        })
                      }
                      className={`mt-1 w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/30 ${fuelErrors.litres ? 'border-red-500' : 'border-slate-300'}`}
                      required
                    />
                    {fuelErrors.litres && <p className="text-red-500 text-xs mt-1">{fuelErrors.litres}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Price per Litre (₹) *
                    </label>
                    <input
                      placeholder="Enter price per litre"
                      type="number"
                      step="0.01"
                      value={newFuel.price_per_litre}
                      onChange={(e) =>
                        setNewFuel({
                          ...newFuel,
                          price_per_litre: e.target.value,
                        })
                      }
                      className={`mt-1 w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/30 ${fuelErrors.price_per_litre ? 'border-red-500' : 'border-slate-300'}`}
                      required
                    />
                    {fuelErrors.price_per_litre && <p className="text-red-500 text-xs mt-1">{fuelErrors.price_per_litre}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={newFuel.date}
                      onChange={(e) =>
                        setNewFuel({ ...newFuel, date: e.target.value })
                      }
                      className={`mt-1 w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/30 ${fuelErrors.date ? 'border-red-500' : 'border-slate-300'}`}
                      required
                    />
                    {fuelErrors.date && <p className="text-red-500 text-xs mt-1">{fuelErrors.date}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Upload Bill Photo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setNewFuel({
                          ...newFuel,
                          photo: e.target.files && e.target.files[0],
                        })
                      }
                      className="mt-1 w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 cursor-pointer"
                    />
                    {renderPhotoPreview(newFuel.photo)}
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-6 px-5 py-2.5 bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700"
                >
                  {editingFuelId ? "Update Entry" : "Save Entry"}
                </button>
              </form>
            )}

            {/* TABLE (Fuel) */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="py-4 px-6 text-left text-xs font-bold text-slate-600 uppercase tracking-wide">
                      #
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-bold text-slate-600 uppercase tracking-wide">
                      Vehicle
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-bold text-slate-600 uppercase tracking-wide">
                      Litres
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-bold text-slate-600 uppercase tracking-wide">
                      Price/L
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-bold text-slate-600 uppercase tracking-wide">
                      Date
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-bold text-slate-600 uppercase tracking-wide">
                      Total
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-bold text-slate-600 uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFuel.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="p-4 bg-slate-100 rounded-full mb-3">
                            <span className="material-symbols-outlined text-5xl text-slate-400">
                              local_gas_station
                            </span>
                          </div>
                          <p className="text-slate-500 font-medium">
                            No fuel transactions found
                          </p>
                          <p className="text-slate-400 text-sm mt-1">
                            Add your first fuel entry to get started
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredFuel.slice((fuelPage - 1) * 10, fuelPage * 10).map((row, idx) => (
                      <tr
                        key={row.fuel_id}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        <td className="py-4 px-6 text-slate-600 font-medium">
                          {(fuelPage - 1) * 10 + idx + 1}
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-semibold text-slate-900 px-3 py-1 bg-slate-100 rounded-md">
                            {vehicles.find(v => String(v.vehicle_id) === String(row.vehicle))?.vehicle_number || `Vehicle ${row.vehicle}`}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-bold text-blue-600">
                            {row.litres}L
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-700 font-medium">
                          ₹{row.price_per_litre}
                        </td>
                        <td className="py-4 px-6 text-slate-600">
                          {row.date}
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-bold text-slate-900">
                            ₹
                            {(
                              (Number(row.litres) || 0) *
                              (Number(row.price_per_litre) || 0)
                            ).toFixed(2)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2 transition-opacity">
                            <button
                              onClick={() => editFuel(row)}
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                edit
                              </span>
                            </button>
                            <button
                              onClick={() => deleteFuel(row.fuel_id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete"
                            >
                              <span className="material-symbols-outlined text-[18px]">
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
            {/* Fuel Pagination Footer */}
            <div className="flex justify-between items-center mt-4 p-4 border-t border-slate-200 bg-slate-50">
              <span className="text-sm text-slate-500">
                Showing {Math.min(filteredFuel.length, (fuelPage - 1) * 10 + 1)} to {Math.min(filteredFuel.length, fuelPage * 10)} of {filteredFuel.length} entries
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setFuelPage(Math.max(1, fuelPage - 1))}
                  disabled={fuelPage === 1}
                  className="px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button className="px-3 py-1 text-sm font-medium bg-indigo-600 text-white rounded-lg shadow-sm">
                  {fuelPage}
                </button>
                <button 
                  onClick={() => setFuelPage(fuelPage + 1)}
                  disabled={fuelPage * 10 >= filteredFuel.length}
                  className="px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* TOLL SECTION */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-visible">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-7 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-1">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <span className="material-symbols-outlined text-[22px] text-orange-600">
                    toll
                  </span>
                </div>
                Toll Transactions
              </h2>
              <p className="text-sm text-slate-500">
                Track toll payments and gate expenses
              </p>
            </div>
            <button
              onClick={() => setShowAddToll(!showAddToll)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md text-sm font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">
                {showAddToll ? "close" : "add"}
              </span>
              {showAddToll ? "Cancel" : "Add Entry"}
            </button>
          </div>

          <div className="p-7 pt-6">
            {/* FORM (Toll) */}
            {showAddToll && (
              <form
                onSubmit={handleAddToll}
                className="mb-6 p-6 bg-white rounded-xl border border-slate-200 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  {editingTollId ? "Edit Toll Entry" : "Add Toll Entry"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Vehicle *
                    </label>
                    <select
                      value={newToll.vehicle}
                      onChange={(e) =>
                        setNewToll({
                          ...newToll,
                          vehicle: e.target.value,
                        })
                      }
                      className={`mt-1 w-full pl-4 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/30 bg-white ${tollErrors.vehicle ? 'border-red-500' : 'border-slate-300'}`}
                      required
                    >
                      <option value="">Select Vehicle</option>
                      {vehicles.slice(0, 100).map(v => (
                        <option key={v.vehicle_id} value={v.vehicle_id}>{v.vehicle_number || `Vehicle ${v.vehicle_id}`}</option>
                      ))}
                    </select>
                    {tollErrors.vehicle && <p className="text-red-500 text-xs mt-1">{tollErrors.vehicle}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Toll Name *
                    </label>
                    <input
                      placeholder="Enter toll name"
                      value={newToll.toll_name}
                      onChange={(e) =>
                        setNewToll({
                          ...newToll,
                          toll_name: e.target.value,
                        })
                      }
                      className={`mt-1 w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/30 ${tollErrors.toll_name ? 'border-red-500' : 'border-slate-300'}`}
                      required
                    />
                    {tollErrors.toll_name && <p className="text-red-500 text-xs mt-1">{tollErrors.toll_name}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Amount (₹) *
                    </label>
                    <input
                      placeholder="Enter amount"
                      type="number"
                      step="0.01"
                      value={newToll.amount}
                      onChange={(e) =>
                        setNewToll({
                          ...newToll,
                          amount: e.target.value,
                        })
                      }
                      className={`mt-1 w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/30 ${tollErrors.amount ? 'border-red-500' : 'border-slate-300'}`}
                      required
                    />
                    {tollErrors.amount && <p className="text-red-500 text-xs mt-1">{tollErrors.amount}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={newToll.date}
                      onChange={(e) =>
                        setNewToll({
                          ...newToll,
                          date: e.target.value,
                        })
                      }
                      className={`mt-1 w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/30 ${tollErrors.date ? 'border-red-500' : 'border-slate-300'}`}
                      required
                    />
                    {tollErrors.date && <p className="text-red-500 text-xs mt-1">{tollErrors.date}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Upload Toll Receipt
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setNewToll({
                          ...newToll,
                          photo: e.target.files && e.target.files[0],
                        })
                      }
                      className="mt-1 w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 cursor-pointer"
                    />
                    {renderPhotoPreview(newToll.photo)}
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-6 px-5 py-2.5 bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700"
                >
                  {editingTollId ? "Update Entry" : "Save Entry"}
                </button>
              </form>
            )}

            {/* TABLE (Toll) */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="py-4 px-6 text-left text-xs font-bold text-slate-600 uppercase tracking-wide">
                      #
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-bold text-slate-600 uppercase tracking-wide">
                      Vehicle
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-bold text-slate-600 uppercase tracking-wide">
                      Toll Name
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-bold text-slate-600 uppercase tracking-wide">
                      Date
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-bold text-slate-600 uppercase tracking-wide">
                      Amount
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-bold text-slate-600 uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredToll.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="p-4 bg-slate-100 rounded-full mb-3">
                            <span className="material-symbols-outlined text-5xl text-slate-400">
                              toll
                            </span>
                          </div>
                          <p className="text-slate-500 font-medium">
                            No toll transactions found
                          </p>
                          <p className="text-slate-400 text-sm mt-1">
                            Add your first toll entry to get started
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredToll.slice((tollPage - 1) * 10, tollPage * 10).map((row, idx) => (
                      <tr
                        key={row.toll_id}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        <td className="py-4 px-6 text-slate-600 font-medium">
                          {(tollPage - 1) * 10 + idx + 1}
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-semibold text-slate-900 px-3 py-1 bg-slate-100 rounded-md">
                            {vehicles.find(v => String(v.vehicle_id) === String(row.vehicle))?.vehicle_number || `Vehicle ${row.vehicle}`}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-700 font-medium">
                          {row.toll_name}
                        </td>
                        <td className="py-4 px-6 text-slate-600">
                          {row.date}
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-bold text-orange-600">
                            ₹{row.amount}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2 transition-opacity">
                            <button
                              onClick={() => editToll(row)}
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                edit
                              </span>
                            </button>
                            <button
                              onClick={() => deleteToll(row.toll_id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete"
                            >
                              <span className="material-symbols-outlined text-[18px]">
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
            {/* Toll Pagination Footer */}
            <div className="flex justify-between items-center mt-4 p-4 border-t border-slate-200 bg-slate-50">
              <span className="text-sm text-slate-500">
                Showing {Math.min(filteredToll.length, (tollPage - 1) * 10 + 1)} to {Math.min(filteredToll.length, tollPage * 10)} of {filteredToll.length} entries
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setTollPage(Math.max(1, tollPage - 1))}
                  disabled={tollPage === 1}
                  className="px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button className="px-3 py-1 text-sm font-medium bg-indigo-600 text-white rounded-lg shadow-sm">
                  {tollPage}
                </button>
                <button 
                  onClick={() => setTollPage(tollPage + 1)}
                  disabled={tollPage * 10 >= filteredToll.length}
                  className="px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
