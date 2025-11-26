import React, { useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Legend
} from "recharts";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { motion } from "framer-motion";

// Custom truck icon
const truckIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1995/1995574.png",
  iconSize: [35, 35],
  iconAnchor: [17, 34],
  popupAnchor: [0, -30],
});

// 🚛 Fleet data
const FLEET = [
  {
    id: "VH-1001",
    reg: "MH12AB1234",
    type: "Truck",
    capacity: "10 ton",
    driver: "Ravi",
    status: "Active",
    lastService: "2025-10-12",
    fuelEfficiency: 4.2,
    location: [18.5204, 73.8567], // Pune
  },
  {
    id: "VH-1002",
    reg: "MH14CD5678",
    type: "Trailer",
    capacity: "20 ton",
    driver: "Anita",
    status: "In Transit",
    lastService: "2025-08-05",
    fuelEfficiency: 3.8,
    location: [19.076, 72.8777], // Mumbai
  },
  {
    id: "VH-1003",
    reg: "MH10EF9012",
    type: "Truck",
    capacity: "8 ton",
    driver: "Suresh",
    status: "Maintenance",
    lastService: "2025-11-01",
    fuelEfficiency: 0,
    location: [17.385, 78.4867], // Hyderabad
  },
  {
    id: "VH-1004",
    reg: "MH20GH3456",
    type: "Van",
    capacity: "2 ton",
    driver: "Priya",
    status: "Idle",
    lastService: "2025-06-18",
    fuelEfficiency: 6.5,
    location: [15.2993, 74.124], // Goa
  },
  {
    id: "VH-1005",
    reg: "MH09IJ7890",
    type: "Truck",
    capacity: "12 ton",
    driver: "Aman",
    status: "Active",
    lastService: "2025-09-25",
    fuelEfficiency: 4.7,
    location: [19.9975, 73.7898], // Nashik
  },
];

const utilization = [
  { day: "Mon", utilization: 62 },
  { day: "Tue", utilization: 70 },
  { day: "Wed", utilization: 68 },
  { day: "Thu", utilization: 75 },
  { day: "Fri", utilization: 80 },
  { day: "Sat", utilization: 55 },
  { day: "Sun", utilization: 50 },
];

const fuelCosts = [
  { name: "Week 1", cost: 4200 },
  { name: "Week 2", cost: 3800 },
  { name: "Week 3", cost: 4500 },
  { name: "Week 4", cost: 4100 },
];

export default function FleetDashboard() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortKey, setSortKey] = useState("id");
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = useMemo(() => {
    const filteredData = FLEET.filter((v) => {
      const matchesQuery =
        query === "" ||
        v.id.toLowerCase().includes(query.toLowerCase()) ||
        v.reg.toLowerCase().includes(query.toLowerCase()) ||
        v.driver.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "All" || v.status === statusFilter;
      return matchesQuery && matchesStatus;
    });

    return [...filteredData].sort((a, b) => {
      if (sortKey === "fuelEfficiency") {
        return sortAsc ? a.fuelEfficiency - b.fuelEfficiency : b.fuelEfficiency - a.fuelEfficiency;
      } else if (sortKey === "lastService") {
        return sortAsc
          ? new Date(a.lastService) - new Date(b.lastService)
          : new Date(b.lastService) - new Date(a.lastService);
      } else {
        return sortAsc
          ? a[sortKey].localeCompare(b[sortKey])
          : b[sortKey].localeCompare(a[sortKey]);
      }
    });
  }, [query, statusFilter, sortKey, sortAsc]);

  const counts = useMemo(() => {
    const total = FLEET.length;
    const active = FLEET.filter((f) => f.status === "Active").length;
    const inTransit = FLEET.filter((f) => f.status === "In Transit").length;
    const maintenance = FLEET.filter((f) => f.status === "Maintenance").length;
    const idle = FLEET.filter((f) => f.status === "Idle").length;
    return { total, active, inTransit, maintenance, idle };
  }, []);

  const handleSort = (key) => {
    if (key === sortKey) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Fleet Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Real-time vehicle tracking, fuel, and maintenance overview
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span className="text-sm">Export Report</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span className="text-sm">Add Vehicle</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <AnimatedCard 
            title="Total Vehicles" 
            value={counts.total} 
            icon="local_shipping" 
            iconBg="bg-indigo-500/10" 
            iconColor="text-indigo-500" 
          />
          <AnimatedCard 
            title="Active" 
            value={counts.active} 
            icon="check_circle" 
            iconBg="bg-green-500/10" 
            iconColor="text-green-500" 
          />
          <AnimatedCard 
            title="In Transit" 
            value={counts.inTransit} 
            icon="local_shipping" 
            iconBg="bg-amber-500/10" 
            iconColor="text-amber-500" 
          />
          <AnimatedCard 
            title="Maintenance" 
            value={counts.maintenance} 
            icon="build" 
            iconBg="bg-red-500/10" 
            iconColor="text-red-500" 
          />
          <AnimatedCard 
            title="Idle" 
            value={counts.idle} 
            icon="schedule" 
            iconBg="bg-slate-500/10" 
            iconColor="text-slate-500" 
          />
        </div>

        {/* Charts + Map Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            {/* Utilization Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Fleet Utilization</h2>
                <p className="text-sm text-slate-500">Last 7 days performance</p>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={utilization}>
                    <defs>
                      <linearGradient id="colorUtil" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748b', fontSize: 12}} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748b', fontSize: 12}} 
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#fff', 
                        borderRadius: '8px', 
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="utilization" 
                      stroke="#4f46e5" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorUtil)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Fuel Cost Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Fuel Cost Analysis</h2>
                <p className="text-sm text-slate-500">Monthly expenditure breakdown</p>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fuelCosts}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748b', fontSize: 12}} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748b', fontSize: 12}} 
                    />
                    <Tooltip 
                      cursor={{fill: '#f1f5f9'}}
                      contentStyle={{
                        backgroundColor: '#fff', 
                        borderRadius: '8px', 
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Bar dataKey="cost" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col h-full">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-indigo-600">location_on</span>
                Live Tracking
              </h2>
            </div>
            <div className="flex-1 min-h-[400px] lg:min-h-0 p-1">
              <MapContainer
                center={[18.5204, 73.8567]}
                zoom={6}
                style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="© OpenStreetMap contributors"
                />
                {filtered.map((v) => (
                  <Marker key={v.id} position={v.location} icon={truckIcon}>
                    <Popup>
                      <div className="text-sm font-sans">
                        <strong className="block text-slate-800 mb-1">{v.reg}</strong>
                        <span className="text-slate-600">Driver: {v.driver}</span>
                        <div className="mt-2">
                          <StatusBadge status={v.status} />
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>

        {/* Fleet Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100">
          {/* Table Header & Filters */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-1">
                  Fleet Vehicles
                </h2>
                <p className="text-sm text-slate-500">
                  Manage and monitor all vehicles ({filtered.length} total)
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <div className="flex-1 relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  search
                </span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search vehicle ID, reg or driver..."
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="In Transit">In Transit</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Idle">Idle</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    { key: "id", label: "Vehicle ID" },
                    { key: "driver", label: "Driver" },
                    { key: "type", label: "Type" },
                    { key: "capacity", label: "Capacity" },
                    { key: "status", label: "Status" },
                    { key: "fuelEfficiency", label: "Fuel (km/l)" },
                    { key: "lastService", label: "Last Service" },
                  ].map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="px-5 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        <span className="material-symbols-outlined text-[16px]">unfold_more</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-5 py-8 text-center text-slate-500">
                      No vehicles found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((v) => (
                    <tr
                      key={v.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-4 text-sm font-medium text-slate-900">
                        {v.id}
                        <div className="text-xs text-slate-500 font-normal">{v.reg}</div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-700">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-700">
                            {v.driver.charAt(0)}
                          </div>
                          {v.driver}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-700">
                        {v.type}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-700">
                        {v.capacity}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={v.status} />
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-700">
                        {v.fuelEfficiency ? `${v.fuelEfficiency}` : "—"}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-700">
                        {v.lastService}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Components
function StatusBadge({ status }) {
  const colorMap = {
    Active: "bg-green-100 text-green-800",
    "In Transit": "bg-amber-100 text-amber-800",
    Maintenance: "bg-red-100 text-red-800",
    Idle: "bg-slate-100 text-slate-800",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorMap[status] || ""}`}>
      {status}
    </span>
  );
}

function AnimatedCard({ title, value, icon, iconBg, iconColor }) {
  return (
    <motion.div
      className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer"
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-500 mb-2">
            {title}
          </p>
          <p className="text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>
        <div className={`${iconBg} p-3 rounded-lg`}>
          <span className={`material-symbols-outlined text-[20px] ${iconColor}`}>
            {icon}
          </span>
        </div>
      </div>
    </motion.div>
  );
}