import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import api from "../utils/api";
import {
  Plus,
  FileText,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  X,
  CheckCircle,
  ArrowRightCircle,
} from "lucide-react";

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

/* -------------------- Helpers -------------------- */
const generateLRNumber = () => {
  const t = Date.now().toString().slice(-6);
  return `LR${new Date().getFullYear()}${t}`;
};

/* -------------------- Component -------------------- */
export default function LRManagement() {
  // data + pagination
  const [lrData, setLRData] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [ewayBills, setEwayBills] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const location = useLocation();

  useEffect(() => {
    document.title = "LR / Bility & Billing";
    fetchLRs();
    fetchRelatedData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get("action");
    if (action === "add") {
      setShowCreate(true);
    }
  }, [location.search]);

  const fetchRelatedData = async () => {
    try {
      const [vRes, dRes, eRes] = await Promise.all([
        api.get("/vehicles/?options=true"),
        api.get("/drivers/?options=true"),
        api.get("/eway-bills/?options=true")
      ]);
      setVehicles(vRes.data || []);
      setDrivers(dRes.data || []);
      setEwayBills(eRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLRs = async () => {
    try {
      const res = await api.get("/lr-bilty/");
      const mapped = res.data.map(item => ({
        id: item.lr_id,
        lrNumber: item.lr_number || "",
        date: item.date || "",
        consignor: item.consignor || "",
        consignee: item.consignee || "",
        route: item.route || "",
        vehicle: item.vehicle || "",
        driver: item.driver || "",
        material: item.material || "",
        weight: item.weight || "",
        freight: item.freight || "",
        eway: item.eway_bill || "",
        status: item.status ? String(item.status).toLowerCase() : "pending"
      }));
      setLRData(mapped);
    } catch (err) {
      console.error(err);
    }
  };

  // modals & selected
  const [showCreate, setShowCreate] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedLR, setSelectedLR] = useState(null);

  // actions dropdown open id
  const [menuOpenFor, setMenuOpenFor] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const vehicleMap = useMemo(() => {
    const map = {};
    vehicles.forEach(v => {
      map[String(v.vehicle_id)] = v.vehicle_number;
    });
    return map;
  }, [vehicles]);

  const driverMap = useMemo(() => {
    const map = {};
    drivers.forEach(d => {
      map[String(d.driver_id)] = d.name;
    });
    return map;
  }, [drivers]);

  const getVehicleNumber = (vId) => {
    return vehicleMap[String(vId)] || (vId ? `Vehicle ${vId}` : 'Unassigned');
  };

  const getDriverName = (dId) => {
    return driverMap[String(dId)] || (dId ? `Driver ${dId}` : 'Unassigned');
  };

  const filteredLR = useMemo(() => {
    return lrData.filter(row => {
      const vNum = getVehicleNumber(row.vehicle);
      const dName = getDriverName(row.driver);
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q ||
        String(row.lrNumber || "").toLowerCase().includes(q) ||
        String(row.consignor || "").toLowerCase().includes(q) ||
        String(row.consignee || "").toLowerCase().includes(q) ||
        String(row.route || "").toLowerCase().includes(q) ||
        String(row.eway_bill || "").toLowerCase().includes(q) ||
        String(row.material || "").toLowerCase().includes(q) ||
        String(row.status || "").toLowerCase().includes(q) ||
        String(vNum).toLowerCase().includes(q) ||
        String(dName).toLowerCase().includes(q);
        
      const matchesStatus =
        statusFilter === "All" || String(row.status || "").toLowerCase() === statusFilter.toLowerCase();
        
      return matchesSearch && matchesStatus;
    });
  }, [lrData, searchQuery, statusFilter, vehicleMap, driverMap]);

  /* -------------------- Pagination helpers -------------------- */
  const totalPages = Math.max(1, Math.ceil(filteredLR.length / rowsPerPage));
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentLRs = filteredLR.slice(indexOfFirst, indexOfLast);

  const stats = {
    totalLR: lrData.length,
    pendingLR: lrData.filter((l) => l.status === "pending").length,
    completedLR: lrData.filter((l) => l.status === "billed").length,
    monthlyLR: lrData.filter((l) => {
      if (!l.date) return false;
      const d = new Date(l.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length,
  };

  /* -------------------- CRUD Actions -------------------- */
  const handleCreateLR = async (newBill) => {
    try {
      const payload = {
        lr_number: newBill.lrNumber,
        date: newBill.date,
        consignor: newBill.consignor,
        consignee: newBill.consignee,
        route: newBill.route,
        vehicle: newBill.vehicle || null,
        driver: newBill.driver || null,
        material: newBill.material,
        weight: newBill.weight,
        freight: newBill.freight,
        eway_bill: newBill.eway || null,
        status: newBill.status === "in-transit" ? "In-Transit" : newBill.status.charAt(0).toUpperCase() + newBill.status.slice(1)
      };
      await api.post("/lr-bilty/", payload);
      fetchLRs();
      setShowCreate(false);
      setCurrentPage(1);
      alert("LR Bility created successfully!");
    } catch (err) {
      console.error(err);
      alert(formatApiError(err, "Failed to create LR Bility."));
    }
  };

  const handleView = (lr) => {
    setSelectedLR(lr);
    setShowView(true);
    setMenuOpenFor(null);
  };

  const handleEditOpen = (lr) => {
    setSelectedLR(lr);
    setShowEdit(true);
    setMenuOpenFor(null);
  };

  const handleSaveEdit = async (updated) => {
    try {
      const payload = {
        lr_number: updated.lrNumber,
        date: updated.date,
        consignor: updated.consignor,
        consignee: updated.consignee,
        route: updated.route,
        vehicle: updated.vehicle || null,
        driver: updated.driver || null,
        material: updated.material,
        weight: updated.weight,
        freight: updated.freight,
        eway_bill: updated.eway || null,
        status: updated.status === "in-transit" ? "In-Transit" : updated.status.charAt(0).toUpperCase() + updated.status.slice(1)
      };
      await api.put(`/lr-bilty/${updated.id}/`, payload);
      fetchLRs();
      setShowEdit(false);
      setSelectedLR(null);
      alert("LR Bility updated successfully!");
    } catch (err) {
      console.error(err);
      alert(formatApiError(err, "Failed to update LR Bility."));
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!selectedLR) return;
    try {
      await api.delete(`/lr-bilty/${selectedLR.id}/`);
      fetchLRs();
      setShowDelete(false);
      setSelectedLR(null);
      alert("LR Bility deleted successfully.");
    } catch (err) {
      console.error(err);
      alert(formatApiError(err, "Failed to delete LR Bility."));
    }
  };

  const cycleStatus = async (id) => {
    const lr = lrData.find(l => l.id === id);
    if(!lr) return;
    
    let nextStatus = "Pending";
    if (lr.status === "pending") nextStatus = "In-Transit";
    else if (lr.status === "in-transit") nextStatus = "Billed";
    else nextStatus = "Pending";

    try {
      await api.patch(`/lr-bilty/${id}/`, { status: nextStatus });
      fetchLRs();
      setMenuOpenFor(null);
      alert(`LR status updated to ${nextStatus}.`);
    } catch(err) {
      console.error(err);
      alert(formatApiError(err, "Failed to update status."));
    }
  };

  /* -------------------- UI: Create Modal Form State -------------------- */
  const emptyForm = {
    id: null,
    lrNumber: generateLRNumber(),
    date: new Date().toISOString().slice(0, 10),
    consignor: "",
    consignee: "",
    origin: "",
    destination: "",
    vehicle: "",
    driver: "",
    material: "",
    weight: "",
    freight: "",
    eway: "",
    status: "pending",
  };
  const [form, setForm] = useState(emptyForm);

  const openCreateModal = () => {
    setForm({ ...emptyForm, lrNumber: generateLRNumber() });
    setShowCreate(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const toSentenceCase = (str) => {
    if (!str) return "";
    return str.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  const submitCreate = () => {
    if (!form.lrNumber) {
      alert("LR Number is required");
      return;
    }
    if (lrData.some(lr => lr.lrNumber.toLowerCase().trim() === form.lrNumber.toLowerCase().trim())) {
      alert("LR Number already exists");
      return;
    }
    if (!form.date) {
      alert("Date is required");
      return;
    }
    if (new Date(form.date) > new Date()) {
      alert("Date cannot be in the future");
      return;
    }
    if (!form.consignor || !form.consignee || !form.material) {
      alert("Consignor, Consignee, and Material are required fields");
      return;
    }
    const nameRegex = /^[a-zA-Z0-9\s,.-]+$/;
    if (!nameRegex.test(form.consignor) || !nameRegex.test(form.consignee) || !nameRegex.test(form.material)) {
      alert("Consignor, Consignee, and Material cannot contain special characters");
      return;
    }
    if (!form.origin || !form.destination) {
      alert("Origin and Destination are required");
      return;
    }
    if (form.origin.trim().toLowerCase() === form.destination.trim().toLowerCase()) {
      alert("Origin and Destination cannot be the same");
      return;
    }
    if (!form.weight || isNaN(form.weight) || parseFloat(form.weight) <= 0) {
      alert("Weight must be a positive number");
      return;
    }
    if (!form.freight || isNaN(form.freight) || parseFloat(form.freight) <= 0) {
      alert("Freight must be a positive number");
      return;
    }
    if (!form.vehicle) {
      alert("Vehicle is required");
      return;
    }
    if (!form.driver) {
      alert("Driver is required");
      return;
    }

    const routeValue = `${form.origin.trim()} to ${form.destination.trim()}`;
    handleCreateLR({ ...form, route: routeValue, id: Date.now() });
    setForm(emptyForm);
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">LR / Bility & Billing</h1>
          <p className="text-slate-500 text-sm mt-1">Create, view and manage LR bills</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
          >
            <Plus size={18} /> Create LR
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white shadow-sm rounded-xl border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Total LR</p>
            <h2 className="text-2xl font-bold text-slate-900">{stats.totalLR}</h2>
          </div>
        </div>

        <div className="p-5 bg-white shadow-sm rounded-xl border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600">
            <ArrowRightCircle size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Pending LR</p>
            <h2 className="text-2xl font-bold text-slate-900">{stats.pendingLR}</h2>
          </div>
        </div>

        <div className="p-5 bg-white shadow-sm rounded-xl border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3 rounded-lg bg-green-50 text-green-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Completed LR</p>
            <h2 className="text-2xl font-bold text-slate-900">{stats.completedLR}</h2>
          </div>
        </div>

        <div className="p-5 bg-white shadow-sm rounded-xl border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
            <Plus size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Added This Month</p>
            <h2 className="text-2xl font-bold text-slate-900">{stats.monthlyLR}</h2>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Search & Filters */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white w-full">
          <div className="relative flex-1 w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
              search
            </span>
            <input
              type="text"
              placeholder="Search by LR number, consignor, consignee, or route..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-10 py-2 h-11 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-slate-900"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto items-center">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-48 pl-4 pr-10 py-2 h-11 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-slate-900"
            >
              <option value="All">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-transit">In-Transit</option>
              <option value="billed">Billed</option>
            </select>
            <button
              onClick={() => {
                setStatusFilter("All");
                setSearchQuery("");
                setCurrentPage(1);
              }}
              disabled={statusFilter === "All" && searchQuery === ""}
              className="px-4 py-2.5 h-11 text-sm text-red-600 hover:text-red-700 disabled:text-slate-400 font-semibold border border-red-200 disabled:border-slate-200 rounded-lg bg-red-50 disabled:bg-slate-100 hover:bg-red-100 transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-base">filter_alt_off</span>
              Reset
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 tracking-wider">LR Number</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 tracking-wider">Date</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 tracking-wider">Route</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 tracking-wider">Vehicle</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 tracking-wider">Freight</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 tracking-wider text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {currentLRs.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <FileText size={16} />
                      </div>
                      <span className="font-medium text-slate-900">{row.lrNumber}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600">{row.date}</td>
                  <td className="py-4 px-6 text-sm text-slate-600 max-w-[150px] truncate" title={row.route}>{row.route}</td>
                  <td className="py-4 px-6 text-sm text-slate-600">
                    {vehicles.find(v => String(v.vehicle_id) === String(row.vehicle))?.vehicle_number || row.vehicle}
                  </td>
                  <td className="py-4 px-6 text-sm font-medium text-slate-900">{row.freight}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
                        row.status === "pending"
                          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                          : row.status === "in-transit"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-purple-50 text-purple-700 border-purple-200"
                      }`}
                    >
                      {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                    </span>
                  </td>

                  {/* Actions Menu */}
                  <td className="py-4 px-6 text-right relative">
                    <button
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                      onClick={() =>
                        setMenuOpenFor((id) => (id === row.id ? null : row.id))
                      }
                    >
                      <MoreVertical size={18} />
                    </button>

                    {/* dropdown */}
                    {menuOpenFor === row.id && (
                      <div className="absolute right-8 top-8 mt-2 w-48 bg-white shadow-xl rounded-xl border border-slate-100 z-30 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <button
                          className="w-full px-4 py-2.5 text-sm text-left hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-colors"
                          onClick={() => handleView(row)}
                        >
                          <Eye size={16} className="text-slate-400" /> View Details
                        </button>

                        <button
                          className="w-full px-4 py-2.5 text-sm text-left hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-colors"
                          onClick={() => handleEditOpen(row)}
                        >
                          <Edit size={16} className="text-slate-400" /> Edit Record
                        </button>

                        <button
                          className="w-full px-4 py-2.5 text-sm text-left hover:bg-slate-50 text-amber-600 flex items-center gap-2 transition-colors"
                          onClick={() => cycleStatus(row.id)}
                        >
                          <ArrowRightCircle size={16} /> Update Status
                        </button>

                        <div className="h-px bg-slate-100 my-1"></div>

                        <button
                          className="w-full px-4 py-2.5 text-sm text-left hover:bg-red-50 text-red-600 flex items-center gap-2 transition-colors"
                          onClick={() => {
                            setSelectedLR(row);
                            setShowDelete(true);
                            setMenuOpenFor(null);
                          }}
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <p className="text-sm text-slate-500">
            Showing <span className="font-medium">{indexOfFirst + 1}</span> to{" "}
            <span className="font-medium">{Math.min(indexOfLast, lrData.length)}</span> of{" "}
            <span className="font-medium">{lrData.length}</span> results
          </p>
         <div className="flex items-center gap-3">
           {currentPage > 1 && (
             <button
               onClick={() => setCurrentPage(currentPage - 1)}
               className="px-4 py-2 rounded-lg border bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
             >
               Previous
             </button>
           )}

           <span className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium">
             {currentPage}
           </span>

           <button
             onClick={() => setCurrentPage(currentPage + 1)}
             disabled={currentPage === totalPages}
             className={`px-4 py-2 rounded-lg border ${
               currentPage === totalPages
                 ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                 : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
             }`}
           >
             Next
           </button>
         </div>
        </div>
      </div>

      {/* ----------------- Create Modal ----------------- */}
      {showCreate && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-200">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Create New LR</h3>
                <p className="text-sm text-slate-500">Enter consignment details below</p>
              </div>
              <button
                onClick={() => setShowCreate(false)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InputGroup label="LR Number" name="lrNumber" value={form.lrNumber} readOnly className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-100 text-slate-600 focus:outline-none cursor-not-allowed" />
                <InputGroup label="Date *" type="date" name="date" value={form.date} max={new Date().toISOString().split("T")[0]} onChange={handleFormChange} />
                <InputGroup label="Consignor *" name="consignor" value={form.consignor} onChange={handleFormChange} placeholder="Sender name" />
                <InputGroup label="Consignee *" name="consignee" value={form.consignee} onChange={handleFormChange} placeholder="Receiver name" />
                <InputGroup label="Origin *" name="origin" value={form.origin} onChange={handleFormChange} placeholder="e.g. Pune" />
                <InputGroup label="Destination *" name="destination" value={form.destination} onChange={handleFormChange} placeholder="e.g. Mumbai" />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle *</label>
                  <select name="vehicle" value={form.vehicle} onChange={handleFormChange} className="w-full border border-slate-200 rounded-lg pl-3 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white">
                    <option value="">Select Vehicle</option>
                    {vehicles.slice(0, 100).map(v => <option key={v.vehicle_id} value={String(v.vehicle_id)}>{v.vehicle_number || `Vehicle ${v.vehicle_id}`}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Driver *</label>
                  <select name="driver" value={form.driver} onChange={handleFormChange} className="w-full border border-slate-200 rounded-lg pl-3 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white">
                    <option value="">Select Driver</option>
                    {drivers.slice(0, 100).map(d => <option key={d.driver_id} value={String(d.driver_id)}>{toSentenceCase(d.name)}</option>)}
                  </select>
                </div>
                <InputGroup label="Material *" name="material" value={form.material} onChange={handleFormChange} placeholder="Material Description" />
                <InputGroup label="Weight (kg) *" type="number" min="1" step="any" name="weight" value={form.weight} onChange={handleFormChange} placeholder="e.g. 1200" />
                <InputGroup label="Freight (₹) *" type="number" min="1" step="any" name="freight" value={form.freight} onChange={handleFormChange} placeholder="Amount (₹)" />
                <InputGroup label="Eway Bill Number" name="eway" value={form.eway} onChange={handleFormChange} placeholder="e.g. EWB-123456" />
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                    className="w-full border border-slate-200 rounded-lg pl-3 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-transit">In-Transit</option>
                    <option value="billed">Billed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={submitCreate}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors cursor-pointer"
              >
                Create LR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- View Modal ----------------- */}
      {showView && selectedLR && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-xl shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">LR Details</h3>
                <p className="text-sm text-indigo-600 font-medium mt-1">{selectedLR.lrNumber}</p>
              </div>
              <button
                onClick={() => setShowView(false)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <DetailItem label="Consignor" value={selectedLR.consignor} />
              <DetailItem label="Consignee" value={selectedLR.consignee} />
              <DetailItem label="Route" value={selectedLR.route} />
              <DetailItem label="Vehicle" value={vehicles.find(v => String(v.vehicle_id) === String(selectedLR.vehicle))?.vehicle_number || selectedLR.vehicle} />
              <DetailItem label="Driver" value={drivers.find(d => String(d.driver_id) === String(selectedLR.driver))?.name || selectedLR.driver} />
              <DetailItem label="Material" value={selectedLR.material} />
              <DetailItem label="Weight" value={selectedLR.weight ? `${selectedLR.weight} kg` : "-"} />
              <DetailItem label="Freight" value={selectedLR.freight ? `₹${selectedLR.freight}` : "-"} />
              <DetailItem label="Eway Bill" value={selectedLR.eway || "-"} />
              
              <div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Status</div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  selectedLR.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                  selectedLR.status === 'in-transit' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  'bg-purple-50 text-purple-700 border-purple-200'
                }`}>
                  {selectedLR.status.charAt(0).toUpperCase() + selectedLR.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="flex justify-end mt-8 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowView(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- Edit Modal ----------------- */}
      {showEdit && selectedLR && (
        <EditModal
          lr={selectedLR}
          vehicles={vehicles}
          drivers={drivers}
          ewayBills={ewayBills}
          onClose={() => {
            setShowEdit(false);
            setSelectedLR(null);
          }}
          onSave={(updated) => handleSaveEdit(updated)}
        />
      )}

      {/* ----------------- Delete Confirm ----------------- */}
      {showDelete && selectedLR && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Delete Record?</h3>
            <p className="mt-2 text-slate-500 text-sm">
              Are you sure you want to delete <b>{selectedLR.lrNumber}</b>? This action cannot be undone.
            </p>

            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setShowDelete(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-sm transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------- Helper Components ----------------- */
const InputGroup = ({ label, type = "text", ...props }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    <input
      type={type}
      className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
      {...props}
    />
  </div>
);

const DetailItem = ({ label, value }) => (
  <div>
    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{label}</div>
    <div className="font-medium text-slate-900">{value || "-"}</div>
  </div>
);

/* ----------------- EditModal Component ----------------- */
function EditModal({ lr, vehicles, drivers, ewayBills, onClose, onSave }) {
  const toSentenceCase = (str) => {
    if (!str) return "";
    return str.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  const [editForm, setEditForm] = useState(() => {
    const parts = lr.route ? lr.route.split(/ to | → | - /) : ["", ""];
    return {
      ...lr,
      origin: parts[0] || "",
      destination: parts[1] || "",
    };
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((f) => ({ ...f, [name]: value }));
  };

  const save = () => {
    if (!editForm.lrNumber) {
      alert("Please fill LR Number");
      return;
    }
    if (!editForm.date) {
      alert("Date is required");
      return;
    }
    if (new Date(editForm.date) > new Date()) {
      alert("Date cannot be in the future");
      return;
    }
    if (!editForm.origin || !editForm.destination) {
      alert("Origin and Destination are required");
      return;
    }
    if (editForm.origin.trim().toLowerCase() === editForm.destination.trim().toLowerCase()) {
      alert("Origin and Destination cannot be the same");
      return;
    }
    if (!editForm.weight || isNaN(editForm.weight) || parseFloat(editForm.weight) <= 0) {
      alert("Weight must be a positive number");
      return;
    }
    if (!editForm.freight || isNaN(editForm.freight) || parseFloat(editForm.freight) <= 0) {
      alert("Freight must be a positive number");
      return;
    }
    if (!editForm.consignor || !editForm.consignee || !editForm.material) {
      alert("Consignor, Consignee, and Material are required");
      return;
    }
    const nameRegex = /^[a-zA-Z0-9\s,.-]+$/;
    if (!nameRegex.test(editForm.consignor) || !nameRegex.test(editForm.consignee) || !nameRegex.test(editForm.material)) {
      alert("Consignor, Consignee, and Material cannot contain special characters");
      return;
    }

    const routeValue = `${editForm.origin.trim()} to ${editForm.destination.trim()}`;
    onSave({
      ...editForm,
      route: routeValue
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h3 className="text-xl font-bold text-slate-900">Edit LR Details</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputGroup label="LR Number" name="lrNumber" value={editForm.lrNumber} readOnly className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-100 text-slate-600 focus:outline-none cursor-not-allowed" />
            <InputGroup label="Date *" type="date" name="date" value={editForm.date} max={new Date().toISOString().split("T")[0]} onChange={handleChange} />
            <InputGroup label="Consignor *" name="consignor" value={editForm.consignor || ""} onChange={handleChange} />
            <InputGroup label="Consignee *" name="consignee" value={editForm.consignee || ""} onChange={handleChange} />
            <InputGroup label="Origin *" name="origin" value={editForm.origin} onChange={handleChange} />
            <InputGroup label="Destination *" name="destination" value={editForm.destination} onChange={handleChange} />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle *</label>
              <select name="vehicle" value={editForm.vehicle || ""} onChange={handleChange} className="w-full border border-slate-200 rounded-lg pl-3 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white">
                <option value="">Select Vehicle</option>
                {vehicles.slice(0, 100).map(v => <option key={v.vehicle_id} value={String(v.vehicle_id)}>{v.vehicle_number || `Vehicle ${v.vehicle_id}`}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Driver *</label>
              <select name="driver" value={editForm.driver || ""} onChange={handleChange} className="w-full border border-slate-200 rounded-lg pl-3 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white">
                <option value="">Select Driver</option>
                {drivers.slice(0, 100).map(d => <option key={d.driver_id} value={String(d.driver_id)}>{toSentenceCase(d.name)}</option>)}
              </select>
            </div>
            <InputGroup label="Material *" name="material" value={editForm.material || ""} onChange={handleChange} />
            <InputGroup label="Weight (kg) *" type="number" min="1" step="any" name="weight" value={editForm.weight || ""} onChange={handleChange} />
            <InputGroup label="Freight (₹) *" type="number" min="1" step="any" name="freight" value={editForm.freight || ""} onChange={handleChange} />
            <InputGroup label="Eway Bill Number" name="eway" value={editForm.eway || ""} onChange={handleChange} />
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                name="status"
                value={editForm.status}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg pl-3 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
              >
                <option value="pending">Pending</option>
                <option value="in-transit">In-Transit</option>
                <option value="billed">Billed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
