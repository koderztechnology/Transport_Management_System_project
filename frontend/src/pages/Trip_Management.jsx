import React, { useEffect, useMemo, useState } from "react";
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
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const [trips, setTrips] = useState([
    {
      id: 1,
      vehicleId: "KA-01-HH-1234",
      driverName: "Ramesh Kumar",
      startLocation: "Bangalore",
      endLocation: "Mumbai",
      startTime: "2023-10-01T06:00",
      endTime: "2023-10-02T18:00",
      status: "Completed",
      distance: 980,
      fuelConsumed: 150,
    },
    {
      id: 2,
      vehicleId: "KA-02-JK-5678",
      driverName: "Suresh Singh",
      startLocation: "Chennai",
      endLocation: "Pune",
      startTime: "2023-10-03T08:00",
      endTime: null,
      status: "In Progress",
      distance: 450,
      fuelConsumed: 70,
    },
    {
      id: 3,
      vehicleId: "KA-03-LM-9012",
      driverName: "Mahesh Babu",
      startLocation: "Hyderabad",
      endLocation: "Delhi",
      startTime: "2023-10-05T05:00",
      endTime: null,
      status: "Scheduled",
      distance: 0,
      fuelConsumed: 0,
    },
  ]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [activeLocationField, setActiveLocationField] = useState(null); // 'start' or 'end'

  // ---------------------------------------------------------------------------
  // Derived Data
  // ---------------------------------------------------------------------------
  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const matchesSearch =
        trip.vehicleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.startLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.endLocation.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || trip.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [trips, searchTerm, statusFilter]);

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
  const handleAddNew = () => {
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
    setIsDrawerOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this trip?")) {
      setTrips(trips.filter((t) => t.id !== id));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (isEditMode) {
      setTrips(
        trips.map((t) => (t.id === currentTrip.id ? { ...currentTrip } : t))
      );
    } else {
      setTrips([...trips, { ...currentTrip, id: Date.now() }]);
    }
    setIsDrawerOpen(false);
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
        ...trips.map((t) =>
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
            <span className="material-symbols-outlined text-[20px]">
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
            <span className="material-symbols-outlined text-[20px]">
              download
            </span>
            Export CSV
          </button>
          <button
            onClick={handleAddNew}
            className="btn btn-primary gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
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
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search trips..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="select select-bordered w-full sm:w-48 px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Trips List */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm uppercase tracking-wider">
                    <th className="p-4 font-medium">Vehicle / Driver</th>
                    <th className="p-4 font-medium">Route</th>
                    <th className="p-4 font-medium">Timing</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTrips.length > 0 ? (
                    filteredTrips.map((trip) => (
                      <tr
                        key={trip.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="font-medium text-slate-900">
                            {trip.vehicleId}
                          </div>
                          <div className="text-sm text-slate-500">
                            {trip.driverName}
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
                              <span className="material-symbols-outlined text-[20px]">
                                edit
                              </span>
                            </button>
                            <button
                              onClick={() => handleDelete(trip.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <span className="material-symbols-outlined text-[20px]">
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
          </div>
        </div>

        {/* Right Column: Charts & Map */}
        <div className="space-y-6">
          {/* Status Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-900 mb-6">Trip Status</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
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
                          {trip.vehicleId}
                        </div>
                        <div className="text-xs text-slate-500">
                          {trip.driverName}
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
                  Vehicle ID
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={currentTrip.vehicleId}
                  onChange={(e) =>
                    setCurrentTrip({
                      ...currentTrip,
                      vehicleId: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Driver Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={currentTrip.driverName}
                  onChange={(e) =>
                    setCurrentTrip({
                      ...currentTrip,
                      driverName: e.target.value,
                    })
                  }
                />
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full px-4 py-2 rounded-lg border"
                    value={currentTrip.startTime}
                    onChange={(e) =>
                      setCurrentTrip({
                        ...currentTrip,
                        startTime: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-2 rounded-lg border"
                    value={currentTrip.endTime || ""}
                    onChange={(e) =>
                      setCurrentTrip({
                        ...currentTrip,
                        endTime: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Status
                </label>
                <select
                  className="w-full px-4 py-2 rounded-lg border"
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
