import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../utils/api";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import StatCard from "../components/StatCard";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const TripManagement = () => {
  const location = useLocation();
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const [currentPage, setCurrentPage] = useState(1);
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    fetchTrips();
    fetchRelatedData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("search");
    if (q) {
      setSearchTerm(q);
    }
    const action = params.get("action");
    if (action === "add") {
      setIsDrawerOpen(true);
      setIsEditMode(false);
      setCurrentTrip({
        id: null,
        vehicleId: "",
        driverName: "",
        startLocation: "",
        endLocation: "",
        startTime: "",
        endTime: "",
        status: "Scheduled",
        distance: 0,
        fuelConsumed: 0,
      });
      setFormErrors({});
    }
  }, [location.search]);

  const fetchRelatedData = async () => {
    try {
      const [vRes, dRes] = await Promise.all([
        api.get("/vehicles/"),
        api.get("/drivers/")
      ]);
      setVehicles(vRes.data);
      setDrivers(dRes.data);
    } catch (error) {
      console.error("Error fetching vehicles/drivers:", error);
    }
  };

  const fetchTrips = async () => {
    try {
      const res = await api.get("/trips/");
      const mappedTrips = res.data.map(t => ({
        id: t.trip_id,
        vehicleId: t.vehicle || "",
        driverName: t.driver || "",
        startLocation: t.start_location || "",
        endLocation: t.end_location || "",
        startTime: t.start_time ? t.start_time.slice(0,16) : "",
        endTime: t.end_time ? t.end_time.slice(0,16) : "",
        status: t.status || "Scheduled",
        distance: t.distance || 0,
        fuelConsumed: t.fuel_consumed || 0,
      }));
      setTrips(mappedTrips);
    } catch (err) {
      console.error("Error fetching trips:", err);
    }
  };

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [activeLocationField, setActiveLocationField] = useState(null); // 'start' or 'end'
  const [formErrors, setFormErrors] = useState({});

  const getVehicleNumber = (vId) => {
    const found = vehicles.find(v => String(v.vehicle_id) === String(vId));
    return found ? found.vehicle_number : (vId ? `Vehicle ${vId}` : 'Unassigned');
  };

  const getDriverName = (dId) => {
    const found = drivers.find(d => String(d.driver_id) === String(dId));
    return found ? found.name : (dId ? `Driver ${dId}` : 'Unassigned');
  };

  // ---------------------------------------------------------------------------
  // Derived Data
  // ---------------------------------------------------------------------------
  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const matchesSearch =
        String(getVehicleNumber(trip.vehicleId)).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(getDriverName(trip.driverName)).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(trip.startLocation).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(trip.endLocation).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || trip.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [trips, vehicles, drivers, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const totalTrips = trips.length;
    const activeTrips = trips.filter((t) => t.status === "In Progress").length;
    const completedTrips = trips.filter((t) => t.status === "Completed").length;
    const scheduledTrips = trips.filter((t) => t.status === "Scheduled").length;
    return { totalTrips, activeTrips, completedTrips, scheduledTrips };
  }, [trips]);

  const chartData = useMemo(() => {
    const data = [
      { name: "Completed", value: stats.completedTrips },
      { name: "In Progress", value: stats.activeTrips },
      { name: "Scheduled", value: stats.scheduledTrips },
    ];
    return data;
  }, [stats]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const validateTripForm = () => {
    const errors = {};
    if (!String(currentTrip?.vehicleId || "").trim()) {
      errors.vehicleId = "Please select a vehicle.";
    }
    if (!String(currentTrip?.driverName || "").trim()) {
      errors.driverName = "Please select a driver.";
    }
    if (!String(currentTrip?.startLocation || "").trim()) {
      errors.startLocation = "Start location is required.";
    }
    if (!String(currentTrip?.endLocation || "").trim()) {
      errors.endLocation = "End location is required.";
    }
    if (!currentTrip?.startTime) {
      errors.startTime = "Start time is required.";
    }
    if (!currentTrip?.endTime) {
      errors.endTime = "End time is required.";
    }
    if (currentTrip?.startTime && currentTrip?.endTime) {
      const start = new Date(currentTrip.startTime);
      const end = new Date(currentTrip.endTime);
      if (end < start) {
        errors.endTime = "End time cannot be earlier than the start time.";
      }
    }
    return errors;
  };

  const handleAddNew = () => {
    setFormErrors({});
    setCurrentTrip({
      id: null,
      vehicleId: "",
      driverName: "",
      startLocation: "",
      endLocation: "",
      startTime: "",
      endTime: "",
      status: "Scheduled",
      distance: 0,
      fuelConsumed: 0,
    });
    setIsEditMode(false);
    setIsDrawerOpen(true);
  };

  const handleEdit = (trip) => {
    setCurrentTrip({ ...trip });
    setIsEditMode(true);
    setFormErrors({});
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this trip?")) {
      try {
        await api.delete(`/trips/${id}/`);
        fetchTrips();
      } catch (err) {
        console.error("Delete Error", err);
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const validationErrors = validateTripForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }
    setFormErrors({});

    const payload = {
      vehicle: currentTrip.vehicleId || null,
      driver: currentTrip.driverName || null,
      start_location: currentTrip.startLocation,
      end_location: currentTrip.endLocation,
      start_time: currentTrip.startTime || null,
      end_time: currentTrip.endTime || null,
      status: currentTrip.status,
      distance: currentTrip.distance || 0,
      fuel_consumed: currentTrip.fuelConsumed || 0,
    };

    try {
      const formattedPayload = {
        ...payload,
        start_time: currentTrip.startTime ? currentTrip.startTime : null,
        end_time: currentTrip.endTime ? currentTrip.endTime : null,
      };

      if (isEditMode) {
        await api.put(`/trips/${currentTrip.id}/`, formattedPayload);
      } else {
        await api.post("/trips/", formattedPayload);
      }
      fetchTrips();
      setIsDrawerOpen(false);
      alert('Trip created successfully!');
    } catch (err) {
      console.error("Save Error", err);
      if (err.response) {
        alert("Backend Validation Error: " + JSON.stringify(err.response.data));
      } else {
        alert("Network Error: " + err.message + "\nAre you sure the backend server is running?");
      }
    }
  };

  const handleLocationSearch = async (query, field) => {
    setActiveLocationField(field);
    if (query.length > 2) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
        );
        const data = await response.json();
        setLocationSuggestions(data);
      } catch (error) {
        console.error("Error fetching location suggestions:", error);
      }
    } else {
      setLocationSuggestions([]);
    }
  };

  const handleSelectLocation = (location) => {
    if (activeLocationField === "start") {
      setCurrentTrip({ ...currentTrip, startLocation: location.display_name });
    } else {
      setCurrentTrip({ ...currentTrip, endLocation: location.display_name });
    }
    setLocationSuggestions([]);
  };

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Vehicle ID",
      "Driver Name",
      "Start Location",
      "End Location",
      "Start Time",
      "End Time",
      "Status",
      "Distance",
      "Fuel Consumed",
    ];
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...trips.slice(0, 100).map((t) =>
          [
            t.id,
            t.vehicleId,
            t.driverName,
            `"${t.startLocation}"`,
            `"${t.endLocation}"`,
            t.startTime,
            t.endTime,
            t.status,
            t.distance,
            t.fuelConsumed,
          ].join(",")
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "trips.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const csvText = evt.target.result;
        const lines = csvText.split("\n");
        const newTrips = [];
        // Skip header row
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line) {
            // Simple CSV parsing (doesn't handle quoted commas well, but sufficient for demo)
            const cols = line.split(",");
            if (cols.length >= 10) {
              newTrips.push({
                id: Date.now() + i,
                vehicleId: cols[1],
                driverName: cols[2],
                startLocation: cols[3].replace(/"/g, ""),
                endLocation: cols[4].replace(/"/g, ""),
                startTime: cols[5],
                endTime: cols[6],
                status: cols[7],
                distance: parseFloat(cols[8]) || 0,
                fuelConsumed: parseFloat(cols[9]) || 0,
              });
            }
          }
        }
        setTrips([...trips, ...newTrips]);
      };
      reader.readAsText(file);
    }
  };

  // Close drawer on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setIsDrawerOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Trip Management</h1>
          <p className="text-slate-500">
            Schedule, track, and manage vehicle trips
          </p>
        </div>
        <div className="flex gap-3">
          <label className="btn btn-outline gap-2 cursor-pointer bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg flex items-center transition-colors">
            <span className="material-symbols-outlined text-xl">
              upload_file
            </span>
            Import CSV
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleImportCSV}
            />
          </label>
          <button
            onClick={handleExportCSV}
            className="btn btn-outline gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <span className="material-symbols-outlined text-xl">
              download
            </span>
            Export CSV
          </button>
          <button
            onClick={handleAddNew}
            className="btn btn-primary gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            New Trip
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Trips"
          value={stats.totalTrips}
          icon="local_shipping"
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Active Trips"
          value={stats.activeTrips}
          icon="directions_car"
          color="bg-green-50 text-green-600"
        />
        <StatCard
          title="Completed"
          value={stats.completedTrips}
          icon="check_circle"
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          title="Scheduled"
          value={stats.scheduledTrips}
          icon="schedule"
          color="bg-orange-50 text-orange-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List & Filters */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                search
              </span>
              <input
                type="text"
                placeholder="Search by start/end location, vehicle, driver..."
                className="w-full pl-10 pr-10 py-2 h-11 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white text-slate-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              )}
            </div>
            <div className="flex gap-2 w-full sm:w-auto items-center">
              <select
                className="select select-bordered w-full sm:w-48 pl-4 pr-10 py-2 h-11 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-slate-900"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              {(statusFilter !== "All" || searchTerm !== "") && (
                <button
                  onClick={() => {
                    setStatusFilter("All");
                    setSearchTerm("");
                  }}
                  className="px-4 py-2.5 h-11 text-sm text-red-600 hover:text-red-700 font-semibold border border-red-200 rounded-lg bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-base">filter_alt_off</span>
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Trips List */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm uppercase">
                    <th className="p-4 font-medium">Vehicle / Driver</th>
                    <th className="p-4 font-medium">Route</th>
                    <th className="p-4 font-medium">Timing</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTrips.length > 0 ? (
                    filteredTrips.slice((currentPage - 1) * 10, currentPage * 10).map((trip) => (
                      <tr
                        key={trip.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="font-medium text-slate-900">
                            {getVehicleNumber(trip.vehicleId)}
                          </div>
                          <div className="text-sm text-slate-500">
                            {getDriverName(trip.driverName)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span
                              className="truncate max-w-[100px]"
                              title={trip.startLocation}
                            >
                              {trip.startLocation}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm mt-1">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            <span
                              className="truncate max-w-[100px]"
                              title={trip.endLocation}
                            >
                              {trip.endLocation}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-600">
                          <div>
                            {new Date(trip.startTime).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-slate-400">
                            {new Date(trip.startTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                              trip.status === "Completed"
                                ? "bg-green-50 text-green-700 border-green-100"
                                : trip.status === "In Progress"
                                ? "bg-blue-50 text-blue-700 border-blue-100"
                                : "bg-orange-50 text-orange-700 border-orange-100"
                            }`}
                          >
                            {trip.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(trip)}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined text-xl">
                                edit
                              </span>
                            </button>
                            <button
                              onClick={() => handleDelete(trip.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <span className="material-symbols-outlined text-xl">
                                delete
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-8 text-center text-slate-500"
                      >
                        No trips found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination Footer */}
            <div className="flex justify-between items-center mt-4 p-4 border-t border-slate-200">
              <span className="text-sm text-slate-500">
                Showing {Math.min(filteredTrips.length, (currentPage - 1) * 10 + 1)} to {Math.min(filteredTrips.length, currentPage * 10)} of {filteredTrips.length} trips
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
                  disabled={currentPage * 10 >= filteredTrips.length}
                  className="px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Charts & Map */}
        <div className="space-y-6">
          {/* Status Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-900 mb-6">Trip Status</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          index === 0
                            ? "#22c55e"
                            : index === 1
                            ? "#3b82f6"
                            : "#f97316"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mini Map Preview */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-900 mb-4">Live Map</h3>
            <div className="h-[250px] rounded-lg overflow-hidden border border-slate-200 relative z-0">
              <MapContainer
                center={[20.5937, 78.9629]}
                zoom={4}
                style={{ height: "100%", width: "100%" }}
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {trips
                  .filter((t) => t.status === "In Progress")
                  .map((trip) => (
                    <Marker key={trip.id} position={[20.5937, 78.9629]}>
                      <Popup>
                        <div className="text-xs font-medium">
                          {getVehicleNumber(trip.vehicleId)}
                        </div>
                        <div className="text-xs text-slate-500">
                          {getDriverName(trip.driverName)}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer / Modal */}
      {isDrawerOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white shadow-xl rounded-xl p-6 w-full max-w-lg">
            {/* FORM START */}
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Vehicle
                </label>
                <select
                  required
                  className="w-full pl-4 pr-10 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  value={currentTrip.vehicleId}
                  onChange={(e) =>
                    setCurrentTrip({
                      ...currentTrip,
                      vehicleId: e.target.value,
                    })
                  }
                >
                  <option value="">Select a Vehicle</option>
                  {vehicles.slice(0, 100).map(v => (
                    <option key={v.vehicle_id} value={v.vehicle_id}>
                      {v.vehicle_number || `Vehicle ${v.vehicle_id}`}
                    </option>
                  ))}
                </select>
                {formErrors.vehicleId && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.vehicleId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Driver
                </label>
                <select
                  required
                  className="w-full pl-4 pr-10 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  value={currentTrip.driverName}
                  onChange={(e) =>
                    setCurrentTrip({
                      ...currentTrip,
                      driverName: e.target.value,
                    })
                  }
                >
                  <option value="">Select a Driver</option>
                  {drivers.slice(0, 100).map(d => (
                    <option key={d.driver_id} value={d.driver_id}>
                      {d.name || `Driver ${d.driver_id}`}
                    </option>
                  ))}
                </select>
                {formErrors.driverName && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.driverName}</p>
                )}
              </div>

              {/* Start Location */}
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Start Location
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 rounded-lg border"
                  value={currentTrip.startLocation}
                  onChange={(e) => {
                    setCurrentTrip({
                      ...currentTrip,
                      startLocation: e.target.value,
                    });
                    handleLocationSearch(e.target.value, "start");
                  }}
                />
                {formErrors.startLocation && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.startLocation}</p>
                )}
              </div>

              {/* End Location */}
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  End Location
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 rounded-lg border"
                  value={currentTrip.endLocation}
                  onChange={(e) => {
                    setCurrentTrip({
                      ...currentTrip,
                      endLocation: e.target.value,
                    });
                    handleLocationSearch(e.target.value, "end");
                  }}
                />
                {formErrors.endLocation && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.endLocation}</p>
                )}
                {activeLocationField === "end" &&
                  locationSuggestions.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-slate-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                      {" "}
                      {locationSuggestions.map((loc, idx) => (
                        <li
                          key={idx}
                          className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm text-slate-700"
                          onClick={() => handleSelectLocation(loc)}
                        >
                          {" "}
                          {loc.display_name}{" "}
                        </li>
                      ))}{" "}
                    </ul>
                  )}
              </div>

              {/* Times */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 rounded-lg border"
                    value={currentTrip.startTime}
                    onChange={(e) =>
                      setCurrentTrip({
                        ...currentTrip,
                        startTime: e.target.value,
                      })
                    }
                  />
                  {formErrors.startTime && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.startTime}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 rounded-lg border"
                    value={currentTrip.endTime || ""}
                    onChange={(e) =>
                      setCurrentTrip({
                        ...currentTrip,
                        endTime: e.target.value,
                      })
                    }
                  />
                  {formErrors.endTime && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.endTime}</p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Status
                </label>
                <select
                  className="w-full pl-4 pr-10 py-2 rounded-lg border"
                  value={currentTrip.status}
                  onChange={(e) =>
                    setCurrentTrip({ ...currentTrip, status: e.target.value })
                  }
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {isEditMode ? "Update Trip" : "Create Trip"}
                </button>
              </div>
            </form>
            {/* FORM END */}
          </div>
        </div>
      )}
    </div>
  );
};

export default TripManagement;
