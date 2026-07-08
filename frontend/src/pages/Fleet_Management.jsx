import React, { useMemo, useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import api from "../utils/api";
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

// Custom SVG icon generator for vehicle status markers
const createVehicleMarker = (status) => {
  const colorMap = {
    Active: '#10b981',      // Green
    'In Transit': '#f59e0b', // Amber/Orange
    'In Trip': '#3b82f6',    // Blue
    Available: '#10b981',    // Green
    Maintenance: '#ef4444',  // Red
    'Under Maintenance': '#ef4444', // Red
    Idle: '#64748b'          // Slate
  };
  const color = colorMap[status] || '#6366f1';
  const svgTruck = `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
      <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm12 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm2-6.5h-3V9h3v3z"/>
    </svg>
  `;
  
  return L.divIcon({
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        ${svgTruck}
      </div>
    `,
    className: 'custom-vehicle-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

// Jitter location helper to prevent exact overlaps (with larger threshold for visible offset)
const jitterLocation = (lat, lng, index, array) => {
  let duplicateCount = 0;
  for (let i = 0; i < index; i++) {
    if (array[i].location && Math.abs(array[i].location[0] - lat) < 0.05 && Math.abs(array[i].location[1] - lng) < 0.05) {
      duplicateCount++;
    }
  }
  if (duplicateCount > 0) {
    const angle = (duplicateCount * 137.5) * (Math.PI / 180);
    const r = 0.08 * Math.sqrt(duplicateCount);
    return [lat + r * Math.cos(angle), lng + r * Math.sin(angle)];
  }
  return [lat, lng];
};

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
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trackingLogs, setTrackingLogs] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    vehicleType: 'Truck',
    modelName: '',
    capacity: '',
    driverId: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortKey, setSortKey] = useState("id");
  const [sortAsc, setSortAsc] = useState(true);

  const fetchData = async () => {
    try {
      const [vRes, dRes, tRes] = await Promise.all([
        api.get('/vehicles/'),
        api.get('/drivers/'),
        api.get('/tracking/')
      ]);
      setVehicles(vRes.data || []);
      setDrivers(dRes.data || []);
      setTrackingLogs(tRes.data || []);
    } catch (err) {
      console.error("Error fetching fleet data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const mapDbStatusToUi = (status) => {
    if (status === 'Available') return 'Active';
    if (status === 'In Trip') return 'In Transit';
    if (status === 'Under Maintenance') return 'Maintenance';
    return status;
  };

  const fleetList = useMemo(() => {
    return vehicles.map((v) => {
      const track = trackingLogs.find((t) => t.vehicle === v.vehicle_number);
      const drv = drivers.find((d) => d.driver_id === v.driver);
      
      let lat = 18.5204;
      let lng = 73.8567;
      if (track && track.latitude && track.longitude) {
        lat = parseFloat(track.latitude);
        lng = parseFloat(track.longitude);
      } else {
        const randSeed = (v.vehicle_id || 0) * 0.05;
        lat = 18.5204 + Math.sin(randSeed) * 2;
        lng = 73.8567 + Math.cos(randSeed) * 2;
      }
      
      return {
        id: `VH-${v.vehicle_id}`,
        dbId: v.vehicle_id,
        reg: v.vehicle_number || '',
        type: v.make || 'Truck',
        capacity: v.capacity || '10 ton',
        driver: drv ? drv.name : (v.driver ? `Driver ${v.driver}` : 'Unassigned'),
        status: mapDbStatusToUi(v.status || 'Available'),
        lastService: v.added_date ? v.added_date.split('T')[0] : 'Pending',
        fuelEfficiency: track ? parseFloat((4.0 + (track.speed / 20)).toFixed(1)) : 4.2,
        location: [lat, lng],
      };
    });
  }, [vehicles, drivers, trackingLogs]);

  const filtered = useMemo(() => {
    const filteredData = fleetList.filter((v) => {
      const matchesQuery =
        query === "" ||
        String(v.id || "").toLowerCase().includes(query.toLowerCase()) ||
        String(v.reg || "").toLowerCase().includes(query.toLowerCase()) ||
        String(v.driver || "").toLowerCase().includes(query.toLowerCase());
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
        const aVal = String(a[sortKey] || "");
        const bVal = String(b[sortKey] || "");
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
    });
  }, [query, statusFilter, sortKey, sortAsc, fleetList]);

  const counts = useMemo(() => {
    const total = fleetList.length;
    const active = fleetList.filter((f) => f.status === "Active").length;
    const inTransit = fleetList.filter((f) => f.status === "In Transit").length;
    const maintenance = fleetList.filter((f) => f.status === "Maintenance").length;
    const idle = fleetList.filter((f) => f.status === "Idle").length;
    return { total, active, inTransit, maintenance, idle };
  }, [fleetList]);

  const handleSort = (key) => {
    if (key === sortKey) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const handleExportReport = () => {
    const headers = ["Vehicle ID", "Registration Number", "Type", "Capacity", "Driver", "Status", "Last Service", "Fuel Efficiency"];
    const csvRows = [
      headers.join(","),
      ...filtered.map((v) =>
        [
          v.id,
          v.reg,
          v.type,
          v.capacity,
          `"${v.driver}"`,
          v.status,
          v.lastService,
          v.status === 'Maintenance' ? 'N/A' : v.fuelEfficiency
        ].join(",")
      ),
    ];
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "fleet_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.vehicleNumber.trim()) errors.vehicleNumber = "Vehicle number is required";
    if (!formData.modelName.trim()) errors.modelName = "Model name is required";
    if (!formData.capacity.trim()) errors.capacity = "Capacity is required";
    return errors;
  };

  const handleAddVehicleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setSubmitting(true);

    const payload = {
      vehicle_number: formData.vehicleNumber,
      make: formData.vehicleType,
      model: formData.modelName,
      capacity: formData.capacity,
      driver: formData.driverId || null,
      status: 'Available',
    };

    try {
      await api.post('/vehicles/', payload);
      fetchData();
      setShowAddModal(false);
      setFormData({
        vehicleNumber: '',
        vehicleType: 'Truck',
        modelName: '',
        capacity: '',
        driverId: '',
      });
      alert('Vehicle added successfully to fleet!');
    } catch (err) {
      console.error(err);
      alert(formatApiError(err, 'Error adding vehicle'));
    } finally {
      setSubmitting(false);
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
            <button
              onClick={handleExportReport}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              <span className="text-sm">Export Report</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">add</span>
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
                <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
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
                <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
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
                    <Bar dataKey="cost" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={40} label={{ position: 'top', fill: '#475569', fontSize: 10, formatter: (val) => `₹${val}` }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col h-full">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-xl text-indigo-600">location_on</span>
                Live Tracking
              </h2>
            </div>
            <div className="flex-1 min-h-[400px] lg:min-h-0 p-1 relative">
              <MapContainer
                center={[18.5204, 73.8567]}
                zoom={6}
                style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="© OpenStreetMap contributors"
                />
                {filtered.map((v, index) => (
                  <Marker key={v.id} position={jitterLocation(v.location[0], v.location[1], index, filtered)} icon={createVehicleMarker(v.status)}>
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
              {/* Legend overlay */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-md border border-slate-200 z-[1000] text-xs space-y-2">
                <p className="font-semibold text-slate-800 border-b pb-1 mb-1">Vehicle Status Legend</p>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#10b981]"></span>
                  <span className="text-slate-600 font-medium">Available / Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#f59e0b]"></span>
                  <span className="text-slate-600 font-medium">In Transit</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#ef4444]"></span>
                  <span className="text-slate-600 font-medium">Under Maintenance</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#64748b]"></span>
                  <span className="text-slate-600 font-medium">Idle</span>
                </div>
              </div>
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

            <div className="flex flex-col sm:flex-row gap-3 mt-4 items-center">
              <div className="flex-1 w-full relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                  search
                </span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by Vehicle ID, Registration Number, or Driver Name..."
                  className="w-full pl-10 pr-10 py-2.5 h-11 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                )}
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 pr-10 py-2.5 h-11 min-w-[140px] border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="In Transit">In Transit</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Idle">Idle</option>
              </select>
              <button
                onClick={() => {
                  setStatusFilter("All");
                  setQuery("");
                }}
                disabled={statusFilter === "All" && query === ""}
                className="px-4 py-2.5 h-11 text-sm text-red-600 hover:text-red-700 disabled:text-slate-400 font-semibold border border-red-200 disabled:border-slate-200 rounded-lg bg-red-50 disabled:bg-slate-100 hover:bg-red-100 transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-base">filter_alt_off</span>
                Reset Filters
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
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
                      className="px-5 py-3 text-left text-xs font-semibold text-slate-700 uppercase cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span>{col.label}</span>
                        <span className={`material-symbols-outlined text-sm transition-colors ${sortKey === col.key ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
                          {sortKey === col.key ? (sortAsc ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-5 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <span className="material-symbols-outlined text-4xl text-slate-300">local_shipping</span>
                        <p className="font-medium text-slate-700">No vehicles found matching the search or filter criteria.</p>
                        <button
                          type="button"
                          onClick={() => { setQuery(""); setStatusFilter("All"); }}
                          className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
                        >
                          Reset Filters
                        </button>
                      </div>
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
                        <div className="text-xs text-slate-900 font-semibold mt-0.5">{v.reg}</div>
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
                        {v.status === 'Maintenance' ? 'N/A' : (v.fuelEfficiency ? `${v.fuelEfficiency}` : 'N/A')}
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
      
      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Add Vehicle to Fleet</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddVehicleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Number *</label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleFormChange}
                  placeholder="e.g. MH12AB1234"
                  className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white ${formErrors.vehicleNumber ? 'border-red-500' : 'border-slate-200'}`}
                  required
                />
                {formErrors.vehicleNumber && <p className="text-red-500 text-xs mt-1">{formErrors.vehicleNumber}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Type</label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleFormChange}
                  className="w-full pl-4 pr-10 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                >
                  <option value="Truck">Truck</option>
                  <option value="Trailer">Trailer</option>
                  <option value="Van">Van</option>
                  <option value="Dumper">Dumper</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Model Name *</label>
                <input
                  type="text"
                  name="modelName"
                  value={formData.modelName}
                  onChange={handleFormChange}
                  placeholder="e.g. Prima 4923"
                  className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white ${formErrors.modelName ? 'border-red-500' : 'border-slate-200'}`}
                  required
                />
                {formErrors.modelName && <p className="text-red-500 text-xs mt-1">{formErrors.modelName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Capacity *</label>
                <input
                  type="text"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleFormChange}
                  placeholder="e.g. 10 ton"
                  className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white ${formErrors.capacity ? 'border-red-500' : 'border-slate-200'}`}
                  required
                />
                {formErrors.capacity && <p className="text-red-500 text-xs mt-1">{formErrors.capacity}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Driver</label>
                <select
                  name="driverId"
                  value={formData.driverId}
                  onChange={handleFormChange}
                  className="w-full pl-4 pr-10 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                >
                  <option value="">Select Driver</option>
                  {drivers.map(d => (
                    <option key={d.driver_id} value={d.driver_id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium transition cursor-pointer disabled:cursor-not-allowed"
                >
                  {submitting ? 'Adding...' : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
          <span className={`material-symbols-outlined text-xl ${iconColor}`}>
            {icon}
          </span>
        </div>
      </div>
    </motion.div>
  );
}