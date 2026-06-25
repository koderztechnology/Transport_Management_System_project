// TrackingAnalyticsFull.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import "leaflet/dist/leaflet.css";

/*
  TrackingAnalyticsFull.jsx
  - Single-file dashboard with:
    * Real-time GPS API polling (with sample fallback)
    * Vehicle sidebar & click-to-focus
    * Driver performance analytics
    * Trip history table
    * Alerts (overspeed, low fuel, idle time)
  Notes:
  - Replace API endpoints in fetchData() with your real endpoints.
  - For production, replace polling with WebSocket or server-sent events for real realtime.
*/

const truckIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1995/1995574.png",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -28],
});

// thresholds for alerts
const OVERSPEED_KMPH = 80;
const LOW_FUEL_PCT = 20;
const IDLE_MINUTES = 15;

const SAMPLE_VEHICLES = [
  {
    id: "VH-101",
    reg: "MH12AB1234",
    driver: "Ravi",
    lat: 19.076,
    lng: 72.8777,
    speed: 65,
    fuel: 72,
    status: "Active",
    lastSeen: Date.now(),
  },
  {
    id: "VH-102",
    reg: "MH14CD5678",
    driver: "Anita",
    lat: 18.5204,
    lng: 73.8567,
    speed: 0,
    fuel: 15,
    status: "Idle",
    lastSeen: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
  },
  {
    id: "VH-103",
    reg: "MH10EF9012",
    driver: "Suresh",
    lat: 17.385,
    lng: 78.4867,
    speed: 92,
    fuel: 55,
    status: "In Transit",
    lastSeen: Date.now(),
  },
];

const SAMPLE_TRIPS = [
  { id: "T-1001", vehicle: "VH-101", driver: "Ravi", from: "Pune", to: "Mumbai", distKm: 150, durationMin: 180, fuelUsed: 25, date: "2025-11-01" },
  { id: "T-1002", vehicle: "VH-102", driver: "Anita", from: "Nashik", to: "Aurangabad", distKm: 120, durationMin: 150, fuelUsed: 18, date: "2025-11-03" },
  { id: "T-1003", vehicle: "VH-103", driver: "Suresh", from: "Hyderabad", to: "Vijayawada", distKm: 280, durationMin: 360, fuelUsed: 45, date: "2025-11-05" },
];

// Sample analytics (could be computed from trips)
const SAMPLE_TRIP_STATS = [
  { day: "Mon", trips: 12 },
  { day: "Tue", trips: 15 },
  { day: "Wed", trips: 9 },
  { day: "Thu", trips: 18 },
  { day: "Fri", trips: 20 },
  { day: "Sat", trips: 10 },
  { day: "Sun", trips: 6 },
];

export default function TrackingAnalyticsFull() {
  const [vehicles, setVehicles] = useState(SAMPLE_VEHICLES);
  const [trips] = useState(SAMPLE_TRIPS);
  const [tripStats] = useState(SAMPLE_TRIP_STATS);
  const [selectedTab, setSelectedTab] = useState("tracking"); // 'tracking' or 'analytics'
  const [focusedVehicle, setFocusedVehicle] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [searchVehicle, setSearchVehicle] = useState("");
  const [pollingIntervalMs] = useState(8000); // 8s poll (example)
  const mapRef = useRef(null);
  const pollRef = useRef(null);

  // Real-time fetching simulation:
  useEffect(() => {
    // Replace this function with your real API call(s)
    async function fetchData() {
      try {
        // Example: fetch('/api/vehicles') => returns array with {id, lat, lng, speed, fuel, driver, status, lastSeen}
        // const res = await fetch("/api/vehicles");
        // const data = await res.json();
        // setVehicles(data);

        // demo: simulate small random movement / updates on sample data
        setVehicles((prev) =>
          prev.map((v) => {
            // slight random movement and speed changes
            const jitter = (Math.random() - 0.5) * 0.02;
            const newLat = v.lat + jitter;
            const newLng = v.lng + jitter;
            const newSpeed = Math.max(0, Math.round((v.speed || 0) + (Math.random() - 0.5) * 10));
            const newFuel = Math.max(0, Math.round((v.fuel || 50) - Math.random() * 1.2));
            return { ...v, lat: newLat, lng: newLng, speed: newSpeed, fuel: newFuel, lastSeen: Date.now() };
          })
        );

        // optionally refresh trips/tripStats from API as well
      } catch (err) {
        console.error("Realtime fetch error — using sample local data", err);
        // keep using sample data
      }
    }

    // initial fetch
    fetchData();

    // set polling
    pollRef.current = setInterval(fetchData, pollingIntervalMs);

    return () => {
      clearInterval(pollRef.current);
    };
  }, [pollingIntervalMs]);

  // compute alerts whenever vehicles update
  useEffect(() => {
    const newAlerts = [];
    const now = Date.now();

    vehicles.forEach((v) => {
      if (v.speed > OVERSPEED_KMPH) {
        newAlerts.push({
          type: "Overspeed",
          vehicle: v.id,
          driver: v.driver,
          value: `${v.speed} km/h`,
          ts: now,
          level: "high",
        });
      }
      if (v.fuel <= LOW_FUEL_PCT) {
        newAlerts.push({
          type: "Low Fuel",
          vehicle: v.id,
          driver: v.driver,
          value: `${v.fuel}%`,
          ts: now,
          level: "medium",
        });
      }
      // idle detection: if lastSeen is older than IDLE_MINUTES and speed === 0
      if (v.speed === 0 && v.lastSeen && now - v.lastSeen > IDLE_MINUTES * 60 * 1000) {
        newAlerts.push({
          type: "Idle",
          vehicle: v.id,
          driver: v.driver,
          value: `${Math.round((now - v.lastSeen) / 60000)} min idle`,
          ts: now,
          level: "low",
        });
      }
    });

    // dedupe by vehicle+type (basic)
    const dedup = [];
    const seen = new Set();
    newAlerts.forEach((a) => {
      const key = `${a.vehicle}_${a.type}`;
      if (!seen.has(key)) {
        dedup.push(a);
        seen.add(key);
      }
    });

    setAlerts(dedup);
  }, [vehicles]);

  // focus / fly map to vehicle
  const focusOnVehicle = (v) => {
    setFocusedVehicle(v.id);
    if (mapRef.current) {
      try {
        mapRef.current.flyTo([v.lat, v.lng], 12, { duration: 1.0 });
      } catch {
        // ignore
      }
    }
  };

  // when map created store ref
  const onMapCreated = (mapInstance) => {
    mapRef.current = mapInstance;
  };

  // driver performance: derive from trips (basic)
  const driverPerf = useMemo(() => {
    const stats = {};
    trips.forEach((t) => {
      if (!stats[t.driver]) stats[t.driver] = { driver: t.driver, trips: 0, totalDist: 0, totalFuel: 0, avgSpeed: 0 };
      stats[t.driver].trips += 1;
      stats[t.driver].totalDist += t.distKm;
      stats[t.driver].totalFuel += t.fuelUsed;
      stats[t.driver].avgSpeed += (t.distKm / Math.max(1, t.durationMin / 60)); // km/h
    });
    return Object.values(stats).map((s) => ({
      ...s,
      avgSpeed: s.trips ? Math.round((s.avgSpeed / s.trips) * 10) / 10 : 0,
      fuelPerKm: s.totalFuel ? Math.round((s.totalFuel / s.totalDist) * 100) / 100 : 0,
    }));
  }, [trips]);

  // trip history: simple search & sort
  const [tripSearch, setTripSearch] = useState("");
  const [tripSort, setTripSort] = useState({ key: "date", dir: "desc" });
  const visibleTrips = useMemo(() => {
    const filtered = trips.filter((t) =>
      tripSearch === "" ||
      String(t.id || "").toLowerCase().includes(tripSearch.toLowerCase()) ||
      String(t.vehicle || "").toLowerCase().includes(tripSearch.toLowerCase()) ||
      String(t.driver || "").toLowerCase().includes(tripSearch.toLowerCase())
    );
    const sorted = filtered.sort((a, b) => {
      const k = tripSort.key;
      if (k === "date") {
        const diff = new Date(b.date) - new Date(a.date);
        return tripSort.dir === "asc" ? -diff : diff;
      } else {
        const diff = (b[k] || 0) - (a[k] || 0);
        return tripSort.dir === "asc" ? -diff : diff;
      }
    });
    return sorted;
  }, [trips, tripSearch, tripSort]);

  // small helper to clear alerts (dismiss)
  const dismissAlert = (index) => {
    setAlerts((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left: Sidebar - Vehicles + Alerts */}
        <aside className="col-span-1 space-y-4">
          {/* Vehicle Search */}
          <div className="bg-white p-4 rounded-xl shadow">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Vehicles</h3>
              <span className="text-xs text-slate-400">{vehicles.length}</span>
            </div>
            <input
              value={searchVehicle}
              onChange={(e) => setSearchVehicle(e.target.value)}
              placeholder="Search vehicle/reg/driver..."
              className="w-full border rounded-md px-3 py-2 mb-3"
            />

            <div className="h-64 overflow-auto space-y-2">
              {vehicles
                .filter((v) => {
                  if (!searchVehicle) return true;
                  const q = searchVehicle.toLowerCase();
                  return (
                    String(v.id || "").toLowerCase().includes(q) ||
                    String(v.reg || "").toLowerCase().includes(q) ||
                    String(v.driver || "").toLowerCase().includes(q)
                  );
                })
                .map((v) => (
                  <div
                    key={v.id}
                    className={`p-2 rounded-lg border cursor-pointer hover:shadow-sm flex items-center justify-between ${
                      focusedVehicle === v.id ? "bg-indigo-50 border-indigo-200" : "bg-white"
                    }`}
                    onClick={() => focusOnVehicle(v)}
                  >
                    <div>
                      <div className="text-sm font-medium">{v.reg} <span className="text-xs text-slate-400 ml-2">({v.id})</span></div>
                      <div className="text-xs text-slate-500">{v.driver} • {v.status}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{v.speed} km/h</div>
                      <div className="text-xs text-slate-500">{v.fuel}%</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white p-4 rounded-xl shadow">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Alerts</h3>
              <button onClick={() => setAlerts([])} className="text-xs text-slate-400 hover:text-slate-600">Clear</button>
            </div>
            <div className="h-44 overflow-auto space-y-2">
              {alerts.length === 0 && <div className="text-sm text-slate-400">No active alerts</div>}
              {alerts.map((a, idx) => (
                <div key={idx} className="flex items-start justify-between p-2 border rounded-md bg-red-50">
                  <div>
                    <div className="text-sm font-medium">{a.type} — {a.vehicle}</div>
                    <div className="text-xs text-slate-600">{a.driver} · {a.value}</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-slate-400">{new Date(a.ts).toLocaleTimeString()}</span>
                    <button onClick={() => dismissAlert(idx)} className="text-xs text-slate-600 mt-2">Dismiss</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Filters / Actions */}
          <div className="bg-white p-4 rounded-xl shadow space-y-2">
            <h4 className="font-medium">Quick Actions</h4>
            <button className="w-full px-3 py-2 rounded-md border hover:bg-slate-50">Center Map on All</button>
            <button className="w-full px-3 py-2 rounded-md border hover:bg-slate-50">Export Trip CSV</button>
            <button className="w-full px-3 py-2 rounded-md border hover:bg-slate-50">Send Bulk Message</button>
          </div>
        </aside>

        {/* Main: Map + Analytics */}
        <main className="col-span-3 space-y-4">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedTab("tracking")}
              className={`px-4 py-2 rounded-lg ${selectedTab === "tracking" ? "bg-indigo-600 text-white" : "bg-white"}`}
            >
              Tracking
            </button>
            <button
              onClick={() => setSelectedTab("analytics")}
              className={`px-4 py-2 rounded-lg ${selectedTab === "analytics" ? "bg-indigo-600 text-white" : "bg-white"}`}
            >
              Analytics
            </button>
            <div className="ml-auto text-sm text-slate-500">Realtime: polling every {pollingIntervalMs / 1000}s</div>
          </div>

          {/* Tracking Tab */}
          {selectedTab === "tracking" && (
            <div className="bg-white rounded-xl shadow p-4">
              <h3 className="font-semibold mb-3">Live Map</h3>
              <MapContainer
                whenCreated={onMapCreated}
                center={[19.076, 72.8777]}
                zoom={6}
                style={{ height: "520px", width: "100%" }}
                className="rounded-lg"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {vehicles.slice(0, 100).map((v) => (
                  <Marker
                    key={v.id}
                    position={[v.lat, v.lng]}
                    icon={truckIcon}
                    eventHandlers={{
                      click: () => {
                        focusOnVehicle(v);
                      },
                    }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <div className="font-semibold">{v.reg} ({v.id})</div>
                        <div>Driver: {v.driver}</div>
                        <div>Speed: {v.speed} km/h</div>
                        <div>Fuel: {v.fuel}%</div>
                        <div>Status: {v.status}</div>
                        <div className="text-xs text-slate-400 mt-1">{new Date(v.lastSeen).toLocaleString()}</div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}

          {/* Analytics Tab */}
          {selectedTab === "analytics" && (
            <div className="space-y-4">
              {/* Top summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm text-slate-500">Active Vehicles</div>
                  <div className="text-xl font-semibold">{vehicles.filter(v => v.status === "Active").length}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm text-slate-500">Trips (sample)</div>
                  <div className="text-xl font-semibold">{trips.length}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm text-slate-500">Avg Fuel (%)</div>
                  <div className="text-xl font-semibold">
                    {Math.round((vehicles.reduce((s, v) => s + (v.fuel || 0), 0) / Math.max(1, vehicles.length)) * 10) / 10}%
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm text-slate-500">Alerts Active</div>
                  <div className="text-xl font-semibold">{alerts.length}</div>
                </div>
              </div>

              {/* Charts and driver panel */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="col-span-2 bg-white p-4 rounded-lg shadow">
                  <h4 className="font-medium mb-3">Weekly Trips</h4>
                  <ResponsiveContainer width="100%" height={250} minHeight={1} minWidth={1}>
                    <BarChart data={tripStats}>
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="trips" fill="#4f46e5" />
                    </BarChart>
                  </ResponsiveContainer>

                  <h4 className="font-medium mt-6 mb-3">Fuel Levels</h4>
                  <ResponsiveContainer width="100%" height={200} minHeight={1} minWidth={1}>
                    <LineChart data={vehicles.slice(0, 100).map(v => ({ name: v.reg, fuel: v.fuel }))}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="fuel" stroke="#06b6d4" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                  <h4 className="font-medium mb-3">Driver Performance</h4>
                  <div className="space-y-3">
                    {driverPerf.length === 0 && <div className="text-sm text-slate-400">No trip data</div>}
                    {driverPerf.map((d) => (
                      <div key={d.driver} className="p-2 border rounded">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{d.driver}</div>
                            <div className="text-xs text-slate-500">Trips: {d.trips} • Avg speed: {d.avgSpeed} km/h</div>
                          </div>
                          <div className="text-sm">Fuel/km: {d.fuelPerKm}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Trip history + filters */}
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Trip History</h4>
                  <div className="flex items-center gap-2">
                    <input
                      placeholder="Search trip/vehicle/driver"
                      value={tripSearch}
                      onChange={(e) => setTripSearch(e.target.value)}
                      className="border rounded-md px-2 py-1"
                    />
                    <select
                      value={tripSort.key}
                      onChange={(e) => setTripSort((s) => ({ ...s, key: e.target.value }))}
                      className="border rounded-md pl-2 pr-10 py-1"
                    >
                      <option value="date">Date</option>
                      <option value="distKm">Distance</option>
                      <option value="fuelUsed">Fuel Used</option>
                    </select>
                    <button onClick={() => setTripSort((s) => ({ ...s, dir: s.dir === "asc" ? "desc" : "asc" }))} className="px-2 py-1 border rounded-md">
                      {tripSort.dir === "asc" ? "↑" : "↓"}
                    </button>
                  </div>
                </div>

                <div className="overflow-auto max-h-64">
                  <table className="w-full text-left text-sm">
                    <thead className="text-slate-500 sticky top-0 bg-white">
                      <tr>
                        <th className="py-2">Trip ID</th>
                        <th>Vehicle</th>
                        <th>Driver</th>
                        <th>From → To</th>
                        <th>Distance (km)</th>
                        <th>Duration</th>
                        <th>Fuel Used (L)</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleTrips.map((t) => (
                        <tr key={t.id} className="border-t hover:bg-slate-50">
                          <td className="py-2">{t.id}</td>
                          <td>{t.vehicle}</td>
                          <td>{t.driver}</td>
                          <td>{t.from} → {t.to}</td>
                          <td>{t.distKm}</td>
                          <td>{t.durationMin} min</td>
                          <td>{t.fuelUsed}</td>
                          <td>{t.date}</td>
                        </tr>
                      ))}
                      {visibleTrips.length === 0 && (
                        <tr><td colSpan={8} className="py-6 text-center text-slate-400">No trips found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/*  
  --- Enhanced UI Version (Option C) ---
  ✔ Same structure
  ✔ Same logic
  ✔ Better UI, spacing, responsiveness
  ✔ Cleaner cards / shadows / borders
*/

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import L from "leaflet";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   BarChart,
//   Bar,
// } from "recharts";
// import "leaflet/dist/leaflet.css";

// // --- Icons ---
// const truckIcon = new L.Icon({
//   iconUrl: "https://cdn-icons-png.flaticon.com/512/1995/1995574.png",
//   iconSize: [36, 36],
//   iconAnchor: [18, 36],
// });

// // --- Thresholds ---
// const OVERSPEED_KMPH = 80;
// const LOW_FUEL_PCT = 20;
// const IDLE_MINUTES = 15;

// // --- Sample Data (unchanged) ---
// const SAMPLE_VEHICLES = [ /* same as before */ ];
// const SAMPLE_TRIPS = [ /* same as before */ ];
// const SAMPLE_TRIP_STATS = [ /* same as before */ ];

// export default function TrackingAnalyticsFull() {
//   // --- State (unchanged) ---
//   const [vehicles, setVehicles] = useState(SAMPLE_VEHICLES);
//   const [trips, setTrips] = useState(SAMPLE_TRIPS);
//   const [tripStats, setTripStats] = useState(SAMPLE_TRIP_STATS);
//   const [selectedTab, setSelectedTab] = useState("tracking");
//   const [focusedVehicle, setFocusedVehicle] = useState(null);
//   const [alerts, setAlerts] = useState([]);
//   const [searchVehicle, setSearchVehicle] = useState("");
//   const [pollingIntervalMs] = useState(8000);
//   const mapRef = useRef(null);

//   // Real-time fetching ---
//   useEffect(() => {
//     const fetchData = async () => {
//       setVehicles(prev =>
//         prev.map(v => {
//           const jitter = (Math.random() - 0.5) * 0.02;
//           return {
//             ...v,
//             lat: v.lat + jitter,
//             lng: v.lng + jitter,
//             speed: Math.max(0, Math.round(v.speed + (Math.random() - 0.5) * 10)),
//             fuel: Math.max(0, Math.round(v.fuel - Math.random() * 1.2)),
//             lastSeen: Date.now(),
//           };
//         })  
//       );
//     };
//     fetchData();
//     const i = setInterval(fetchData, pollingIntervalMs);
//     return () => clearInterval(i);
//   }, []);

//   // Alerts updater ---
//   useEffect(() => {
//     const now = Date.now();
//     const newAlerts = [];

//     vehicles.forEach((v) => {
//       if (v.speed > OVERSPEED_KMPH) {
//         newAlerts.push({
//           type: "Overspeed",
//           vehicle: v.id,
//           driver: v.driver,
//           value: `${v.speed} km/h`,
//           ts: now,
//         });
//       }
//       if (v.fuel <= LOW_FUEL_PCT) {
//         newAlerts.push({
//           type: "Low Fuel",
//           vehicle: v.id,
//           driver: v.driver,
//           value: `${v.fuel}%`,
//           ts: now,
//         });
//       }
//     });

//     const seen = new Set();
//     const dedup = [];
//     newAlerts.forEach((a) => {
//       const key = `${a.vehicle}_${a.type}`;
//       if (!seen.has(key)) {
//         dedup.push(a);
//         seen.add(key);
//       }
//     });

//     setAlerts(dedup);
//   }, [vehicles]);

//   // Focus map ---
//   const focusOnVehicle = (v) => {
//     setFocusedVehicle(v.id);
//     if (mapRef.current) {
//       mapRef.current.flyTo([v.lat, v.lng], 12, { duration: 1 });
//     }
//   };

//   const onMapCreated = (m) => (mapRef.current = m);

//   // Driver performance ---
//   const driverPerf = useMemo(() => {
//     const stats = {};
//     trips.forEach((t) => {
//       if (!stats[t.driver]) stats[t.driver] = {
//         driver: t.driver, trips: 0, totalDist: 0,
//         totalFuel: 0, avgSpeed: 0
//       };
//       stats[t.driver].trips++;
//       stats[t.driver].totalDist += t.distKm;
//       stats[t.driver].totalFuel += t.fuelUsed;
//       stats[t.driver].avgSpeed += t.distKm / (t.durationMin / 60);
//     });

//     return Object.values(stats).map(s => ({
//       ...s,
//       avgSpeed: Number((s.avgSpeed / s.trips).toFixed(1)),
//       fuelPerKm: Number((s.totalFuel / s.totalDist).toFixed(2)),
//     }));
//   }, [trips]);

//   // Trip sorting & filtering ---
//   const [tripSearch, setTripSearch] = useState("");
//   const [tripSort, setTripSort] = useState({ key: "date", dir: "desc" });

//   const visibleTrips = useMemo(() => {
//     const filtered = trips.filter(t =>
//       tripSearch === "" ||
//       t.id.toLowerCase().includes(tripSearch.toLowerCase()) ||
//       t.vehicle.toLowerCase().includes(tripSearch.toLowerCase()) ||
//       t.driver.toLowerCase().includes(tripSearch.toLowerCase())
//     );

//     return filtered.sort((a, b) => {
//       const k = tripSort.key;
//       const diff =
//         k === "date"
//           ? new Date(b.date) - new Date(a.date)
//           : (b[k] || 0) - (a[k] || 0);

//       return tripSort.dir === "asc" ? -diff : diff;
//     });
//   }, [trips, tripSearch, tripSort]);

//   return (
//     <div className="min-h-screen bg-slate-50 p-4 md:p-6">
//       <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4">
        
//         {/* ------------------- SIDEBAR ------------------- */}
//         <aside className="col-span-1 space-y-4">
          
//           {/* Vehicle List */}
//           <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
//             <div className="flex items-center justify-between mb-3">
//               <h3 className="font-semibold text-slate-700">Vehicles</h3>
//               <span className="text-xs text-slate-500">
//                 {vehicles.length}
//               </span>
//             </div>

//             <input
//               value={searchVehicle}
//               onChange={(e) => setSearchVehicle(e.target.value)}
//               placeholder="Search vehicle/reg/driver..."
//               className="w-full border rounded-md px-3 py-2 mb-3 text-sm focus:ring-2 focus:ring-indigo-200"
//             />

//             <div className="h-64 overflow-auto pr-1 space-y-2">
//               {vehicles
//                 .filter((v) => {
//                   if (!searchVehicle) return true;
//                   const q = searchVehicle.toLowerCase();
//                   return (
//                     v.id.toLowerCase().includes(q) ||
//                     v.reg.toLowerCase().includes(q) ||
//                     v.driver.toLowerCase().includes(q)
//                   );
//                 })
//                 .map((v) => (
//                   <div
//                     key={v.id}
//                     className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all hover:bg-slate-50 ${
//                       focusedVehicle === v.id
//                         ? "bg-indigo-50 border-indigo-200"
//                         : "bg-white border-slate-200"
//                     }`}
//                     onClick={() => focusOnVehicle(v)}
//                   >
//                     <div>
//                       <div className="text-sm font-medium text-slate-700">
//                         {v.reg}
//                         <span className="text-xs ml-1 text-slate-400">
//                           ({v.id})
//                         </span>
//                       </div>
//                       <div className="text-xs text-slate-500">
//                         {v.driver} • {v.status}
//                       </div>
//                     </div>

//                     <div className="text-right">
//                       <div className="text-sm font-semibold">{v.speed} km/h</div>
//                       <div className="text-xs text-slate-500">{v.fuel}%</div>
//                     </div>
//                   </div>
//                 ))}
//             </div>
//           </div>

//           {/* Alerts */}
//           <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
//             <div className="flex items-center justify-between mb-2">
//               <h3 className="font-semibold text-slate-700">Alerts</h3>
//               <button
//                 onClick={() => setAlerts([])}
//                 className="text-xs text-slate-500 hover:text-slate-700 transition"
//               >
//                 Clear
//               </button>
//             </div>

//             <div className="h-44 overflow-auto pr-1">
//               {alerts.length === 0 && (
//                 <div className="text-sm text-slate-400">No active alerts</div>
//               )}

//               {alerts.map((a, idx) => (
//                 <div
//                   key={idx}
//                   className="p-3 mb-2 border rounded-lg bg-red-50 border-red-200 text-sm"
//                 >
//                   <div className="font-medium text-red-700">
//                     {a.type} — {a.vehicle}
//                   </div>
//                   <div className="text-xs text-slate-600">
//                     {a.driver} • {a.value}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-2">
//             <h4 className="font-medium text-slate-700">Quick Actions</h4>

//             {["Center Map on All", "Export Trip CSV", "Send Bulk Message"].map(
//               (label) => (
//                 <button
//                   key={label}
//                   className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm hover:bg-slate-50 transition"
//                 >
//                   {label}
//                 </button>
//               )
//             )}
//           </div>
//         </aside>

//         {/* ------------------- MAIN PANEL ------------------- */}
//         <main className="col-span-3 space-y-4">
          
//           {/* Tabs */}
//           <div className="flex items-center gap-2 sticky top-0 bg-slate-50 py-2 z-10">
//             {["tracking", "analytics"].map((t) => (
//               <button
//                 key={t}
//                 onClick={() => setSelectedTab(t)}
//                 className={`px-4 py-2 rounded-lg transition ${
//                   selectedTab === t
//                     ? "bg-indigo-600 text-white shadow"
//                     : "bg-white text-slate-700 border"
//                 }`}
//               >
//                 {t[0].toUpperCase() + t.slice(1)}
//               </button>
//             ))}

//             <div className="ml-auto text-sm text-slate-500">
//               Polling every {pollingIntervalMs / 1000}s
//             </div>
//           </div>

//           {/* ---------- TRACKING TAB ---------- */}
//           {selectedTab === "tracking" && (
//             <div className="bg-white shadow-sm border border-slate-100 rounded-xl p-4">
//               <h3 className="font-semibold text-slate-700 mb-3">Live Map</h3>

//               <div className="h-[450px] md:h-[520px]">
//                 <MapContainer
//                   whenCreated={onMapCreated}
//                   center={[19.076, 72.8777]}
//                   zoom={6}
//                   className="rounded-lg w-full h-full"
//                 >
//                   <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

//                   {vehicles.slice(0, 100).map((v) => (
//                     <Marker
//                       key={v.id}
//                       icon={truckIcon}
//                       position={[v.lat, v.lng]}
//                       eventHandlers={{ click: () => focusOnVehicle(v) }}
//                     >
//                       <Popup>
//                         <div className="text-sm space-y-1">
//                           <div className="font-semibold">
//                             {v.reg} ({v.id})
//                           </div>
//                           <div>Driver: {v.driver}</div>
//                           <div>Speed: {v.speed} km/h</div>
//                           <div>Fuel: {v.fuel}%</div>
//                           <div>Status: {v.status}</div>
//                           <div className="text-xs text-slate-400 mt-2">
//                             {new Date(v.lastSeen).toLocaleString()}
//                           </div>
//                         </div>
//                       </Popup>
//                     </Marker>
//                   ))}
//                 </MapContainer>
//               </div>
//             </div>
//           )}

//           {/* ---------- ANALYTICS TAB ---------- */}
//           {selectedTab === "analytics" && (
//             <div className="space-y-4">

//               {/* Summary Cards */}
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 {[
//                   ["Active Vehicles", vehicles.filter(v => v.status === "Active").length],
//                   ["Trips", trips.length],
//                   ["Avg Fuel (%)", Math.round((vehicles.reduce((s, v) => s + v.fuel, 0) / vehicles.length) * 10) / 10],
//                   ["Alerts Active", alerts.length],
//                 ].map(([label, value]) => (
//                   <div
//                     key={label}
//                     className="bg-white p-4 rounded-lg shadow-sm border border-slate-100"
//                   >
//                     <div className="text-sm text-slate-500">{label}</div>
//                     <div className="text-xl font-semibold text-slate-700">
//                       {value}
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Charts */}
//               <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
//                 <div className="col-span-2 bg-white p-4 rounded-lg shadow-sm border border-slate-100">
//                   <h4 className="font-medium mb-3 text-slate-700">Weekly Trips</h4>
//                   <ResponsiveContainer width="100%" height={250} minHeight={1} minWidth={1}>
//                     <BarChart data={tripStats}>
//                       <XAxis dataKey="day" />
//                       <YAxis />
//                       <Tooltip />
//                       <Bar dataKey="trips" fill="#4f46e5" />
//                     </BarChart>
//                   </ResponsiveContainer>

//                   <h4 className="font-medium mt-6 mb-3 text-slate-700">Fuel Levels</h4>
//                   <ResponsiveContainer width="100%" height={200} minHeight={1} minWidth={1}>
//                     <LineChart data={vehicles.slice(0, 100).map(v => ({ name: v.reg, fuel: v.fuel }))}>
//                       <XAxis dataKey="name" />
//                       <YAxis />
//                       <Tooltip />
//                       <Line type="monotone" dataKey="fuel" stroke="#06b6d4" strokeWidth={2} />
//                     </LineChart>
//                   </ResponsiveContainer>
//                 </div>

//                 <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
//                   <h4 className="font-medium mb-3 text-slate-700">Driver Performance</h4>
//                   <div className="space-y-3 max-h-[400px] overflow-auto pr-1">
//                     {driverPerf.map((d) => (
//                       <div
//                         key={d.driver}
//                         className="p-3 border rounded-lg bg-slate-50"
//                       >
//                         <div className="font-medium text-slate-700">
//                           {d.driver}
//                         </div>
//                         <div className="text-xs text-slate-500">
//                           Trips: {d.trips} • Avg speed: {d.avgSpeed} km/h
//                         </div>
//                         <div className="text-sm font-medium mt-1">
//                           Fuel/km: {d.fuelPerKm}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>

//               {/* Trip History */}
//               <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
//                 <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
//                   <h4 className="font-medium text-slate-700">Trip History</h4>

//                   <div className="flex gap-2">
//                     <input
//                       placeholder="Search trip/vehicle/driver"
//                       value={tripSearch}
//                       onChange={(e) => setTripSearch(e.target.value)}
//                       className="border rounded-md px-2 py-1 text-sm"
//                     />
//                     <select
//                       value={tripSort.key}
//                       onChange={(e) =>
//                         setTripSort((s) => ({ ...s, key: e.target.value }))
//                       }
//                       className="border rounded-md pl-2 pr-10 py-1 text-sm"
//                     >
//                       <option value="date">Date</option>
//                       <option value="distKm">Distance</option>
//                       <option value="fuelUsed">Fuel Used</option>
//                     </select>
//                     <button
//                       onClick={() =>
//                         setTripSort((s) => ({
//                           ...s,
//                           dir: s.dir === "asc" ? "desc" : "asc",
//                         }))
//                       }
//                       className="px-2 py-1 border rounded-md text-sm"
//                     >
//                       {tripSort.dir === "asc" ? "↑" : "↓"}
//                     </button>
//                   </div>
//                 </div>

//                 <div className="overflow-auto max-h-72">
//                   <table className="w-full text-left text-sm">
//                     <thead className="sticky top-0 bg-white shadow-sm">
//                       <tr className="text-slate-600">
//                         <th className="py-2">Trip ID</th>
//                         <th>Vehicle</th>
//                         <th>Driver</th>
//                         <th>From → To</th>
//                         <th>Dist (km)</th>
//                         <th>Duration</th>
//                         <th>Fuel Used</th>
//                         <th>Date</th>
//                       </tr>
//                     </thead>

//                     <tbody>
//                       {visibleTrips.map((t) => (
//                         <tr
//                           key={t.id}
//                           className="border-t hover:bg-slate-50 transition"
//                         >
//                           <td className="py-2">{t.id}</td>
//                           <td>{t.vehicle}</td>
//                           <td>{t.driver}</td>
//                           <td>{t.from} → {t.to}</td>
//                           <td>{t.distKm}</td>
//                           <td>{t.durationMin} min</td>
//                           <td>{t.fuelUsed}</td>
//                           <td>{t.date}</td>
//                         </tr>
//                       ))}

//                       {visibleTrips.length === 0 && (
//                         <tr>
//                           <td colSpan={8} className="py-6 text-center text-slate-400">
//                             No trips found
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>

//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }
