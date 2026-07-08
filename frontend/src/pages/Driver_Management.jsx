import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import api from "../utils/api";

const API_URL = "/drivers/";

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

const DriverManagement = () => {
  const location = useLocation();
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [sortConfig, setSortConfig] = useState({ key: "driver_id", direction: "ascending" });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const toSentenceCase = (str) => {
    if (!str) return "";
    return str.trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // ------------------------------------------------------------
  // BASE FORM DATA (USED FOR BOTH ADD + EDIT)
  // ------------------------------------------------------------
  const emptyDriver = {
    name: "",
    license: "",
    phone: "",
    experience: "",
    address: "",
    state: "",
    city: "",
    aadhar: "",
    photo: null,
    dob: "",
    age: "",
    medical: "",
    altPhone: "",
    maritalStatus: "",
    nationality: "",
    jobType: "",
    status: "Active",
  };

  const [newDriver, setNewDriver] = useState(emptyDriver);
  const [editingData, setEditingData] = useState(emptyDriver);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingDriver, setDeletingDriver] = useState(null);

  // ------------------------------------------------------------
  // FETCH DRIVERS
  // ------------------------------------------------------------
  const fetchDrivers = () => {
    api
      .get(API_URL)
      .then((res) => setDrivers(res.data))
      .catch((err) => console.error("Error fetching drivers:", err));
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("search");
    setSearch(q || "");
    setCurrentPage(1);
  }, [location.search]);

  // ------------------------------------------------------------
  // VALIDATION & ACTIONS
  // ------------------------------------------------------------
  const validateDriver = (data) => {
    const errors = {};
    
    // SQLi and XSS check helper
    const hasSecurityRisk = (val) => {
      if (!val) return false;
      const sqlPattern = /[\';]--|union|select|insert|update|delete|drop/i;
      const xssPattern = /<script.*?>|javascript:|onload|onerror/i;
      return sqlPattern.test(val) || xssPattern.test(val);
    };

    // Name
    if (!String(data.name || "").trim()) {
      errors.name = "Driver name is required.";
    } else if (!/^[a-zA-Z\s]+$/.test(String(data.name).trim())) {
      errors.name = "Driver name can only contain letters and spaces.";
    } else if (hasSecurityRisk(data.name)) {
      errors.name = "Invalid characters detected.";
    }

    // License
    if (!String(data.license || "").trim()) {
      errors.license = "License number is required.";
    } else if (hasSecurityRisk(data.license)) {
      errors.license = "Invalid characters detected.";
    }

    // Phone
    const cleanedPhone = String(data.phone || "").replace(/\D/g, "");
    if (!String(data.phone || "").trim()) {
      errors.phone = "Phone number is required.";
    } else if (cleanedPhone.length !== 10) {
      errors.phone = "Phone number must be exactly 10 digits.";
    } else if (!/^\d{10}$/.test(cleanedPhone)) {
      errors.phone = "Phone number contains invalid characters.";
    }

    // Experience
    if (!String(data.experience || "").trim()) {
      errors.experience = "Experience is required.";
    } else if (Number.isNaN(Number(data.experience)) || Number(data.experience) < 0) {
      errors.experience = "Experience must be a positive number.";
    }

    // Address
    if (data.address && hasSecurityRisk(data.address)) {
      errors.address = "Invalid characters detected.";
    }

    // State
    if (!String(data.state || "").trim()) {
      errors.state = "State is required.";
    } else if (!/^[a-zA-Z\s]+$/.test(String(data.state).trim())) {
      errors.state = "State can only contain letters and spaces.";
    } else if (hasSecurityRisk(data.state)) {
      errors.state = "Invalid characters detected.";
    }

    // City
    if (!String(data.city || "").trim()) {
      errors.city = "City is required.";
    } else if (!/^[a-zA-Z\s]+$/.test(String(data.city).trim())) {
      errors.city = "City can only contain letters and spaces.";
    } else if (hasSecurityRisk(data.city)) {
      errors.city = "Invalid characters detected.";
    }

    // Aadhar
    if (!String(data.aadhar || "").trim()) {
      errors.aadhar = "Aadhar number is required.";
    } else {
      const cleanedAadhar = String(data.aadhar).replace(/[\s-]/g, "");
      if (!/^\d{12}$/.test(cleanedAadhar)) {
        errors.aadhar = "Aadhar number must be exactly 12 digits.";
      }
    }

    // Alt Phone
    if (data.altPhone && String(data.altPhone).trim() !== "") {
      const cleanedAlt = String(data.altPhone).replace(/\D/g, "");
      if (cleanedAlt.length !== 10) {
        errors.altPhone = "Alternative phone must be exactly 10 digits.";
      }
    }

    // Nationality
    if (data.nationality && String(data.nationality).trim() !== "") {
      if (!/^[a-zA-Z\s]+$/.test(String(data.nationality).trim())) {
        errors.nationality = "Nationality can only contain letters.";
      } else if (hasSecurityRisk(data.nationality)) {
        errors.nationality = "Invalid characters detected.";
      }
    }

    // DOB
    if (!String(data.dob || "").trim()) {
      errors.dob = "Date of birth is required.";
    } else {
      const dobDate = new Date(data.dob);
      const today = new Date();
      if (dobDate > today) {
        errors.dob = "Date of birth cannot be in the future.";
      } else {
        const age = today.getFullYear() - dobDate.getFullYear();
        if (age < 18) {
          errors.dob = "Driver must be at least 18 years old.";
        }
      }
    }

    // Medical History
    if (data.medical && String(data.medical).length > 200) {
      errors.medical = "Medical details cannot exceed 200 characters.";
    } else if (data.medical && hasSecurityRisk(data.medical)) {
      errors.medical = "Invalid characters detected.";
    }

    // Dropdowns
    if (!String(data.jobType || "").trim()) {
      errors.jobType = "Job type is required.";
    }
    if (!String(data.maritalStatus || "").trim()) {
      errors.maritalStatus = "Marital status is required.";
    }
    if (!String(data.status || "").trim()) {
      errors.status = "Status is required.";
    }

    return errors;
  };

  const handleAddDriver = async () => {
    const errors = validateDriver(newDriver);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    const cleanedPhone = String(newDriver.phone).replace(/\D/g, "");
    const cleanedLicense = String(newDriver.license).trim().toLowerCase();
    if (drivers.some(d => String(d.phone).replace(/\D/g, "") === cleanedPhone)) {
      alert("A driver with this phone number already exists.");
      return;
    }
    if (drivers.some(d => String(d.license).trim().toLowerCase() === cleanedLicense)) {
      alert("A driver with this license number already exists.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(newDriver).forEach(([key, value]) => {
        if (value !== "" && value !== null) {
          formData.append(key, value);
        }
      });

      await api.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      fetchDrivers();
      setNewDriver(emptyDriver);
      setShowAddModal(false);
      alert("Driver added successfully!");
    } catch (err) {
      console.error("Error adding driver:", err.response?.data || err);
      alert(formatApiError(err, "Failed to add driver."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (driver) => {
    setEditingId(driver.driver_id);
    setEditingData(driver);
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    const errors = validateDriver(editingData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    const cleanedPhone = String(editingData.phone).replace(/\D/g, "");
    const cleanedLicense = String(editingData.license).trim().toLowerCase();
    if (drivers.some(d => d.driver_id !== editingId && String(d.phone).replace(/\D/g, "") === cleanedPhone)) {
      alert("A driver with this phone number already exists.");
      return;
    }
    if (drivers.some(d => d.driver_id !== editingId && String(d.license).trim().toLowerCase() === cleanedLicense)) {
      alert("A driver with this license number already exists.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(editingData).forEach(([key, value]) => {
        if (key === "photo") {
          if (value instanceof File) {
            formData.append(key, value);
          }
        } else {
          formData.append(key, value || "");
        }
      });

      await api.put(`${API_URL}${editingId}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      fetchDrivers();
      setShowEditModal(false);
      setEditingId(null);
      setEditingData(emptyDriver);
      alert("Driver updated successfully!");
    } catch (err) {
      console.error("Error updating driver:", err.response?.data || err);
      alert(formatApiError(err, "Failed to update driver."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (driver) => {
    setDeletingDriver(driver);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingDriver) return;

    if (!navigator.onLine) {
      alert("Network Connection Failure: You are currently offline. Please check your internet connection and try again.");
      return;
    }

    setSubmitting(true);
    try {
      await api.delete(`${API_URL}${deletingDriver.driver_id}/`);
      setDrivers(drivers.filter((d) => d.driver_id !== deletingDriver.driver_id));
      setShowDeleteModal(false);
      setDeletingDriver(null);
      alert("Driver deleted successfully.");
    } catch (err) {
      console.error("Error deleting driver:", err);
      const isNetworkError = !err.response || err.message === "Network Error" || err.code === "ERR_NETWORK";
      const errMsg = isNetworkError 
        ? "Network interruption occurred. Delete operation failed. Please check your network and try again." 
        : formatApiError(err, "Failed to delete driver.");
      alert(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // ------------------------------------------------------------
  // FILTERING & PAGINATION
  // ------------------------------------------------------------
  const filteredDrivers = drivers.filter((d) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q ||
      String(d.driver_id || "").toLowerCase().includes(q) ||
      String(d.name || "").toLowerCase().includes(q) ||
      String(d.license || "").toLowerCase().includes(q) ||
      String(d.phone || "").toLowerCase().includes(q) ||
      String(d.city || "").toLowerCase().includes(q) ||
      String(d.aadhar || "").toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "All" || String(d.status || "").toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const sortedDrivers = React.useMemo(() => {
    let sortableItems = [...filteredDrivers];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (sortConfig.key === "experience" || sortConfig.key === "driver_id") {
          aVal = parseFloat(aVal) || 0;
          bVal = parseFloat(bVal) || 0;
        } else {
          aVal = String(aVal || "").toLowerCase();
          bVal = String(bVal || "").toLowerCase();
        }

        if (aVal < bVal) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredDrivers, sortConfig]);

  const totalPages = Math.ceil(sortedDrivers.length / itemsPerPage);

  const paginatedDrivers = sortedDrivers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // ------------------------------------------------------------
  // STATISTICS CALCULATION
  // ------------------------------------------------------------
  const stats = {
    total: drivers.length,
    active: drivers.filter((d) => String(d.status).toLowerCase() === "active").length,
    inactive: drivers.filter((d) => String(d.status).toLowerCase() === "inactive").length,
    avgExp:
      drivers.length > 0
        ? (drivers.reduce((sum, d) => sum + (parseFloat(d.experience) || 0), 0) / drivers.length).toFixed(1) + " Yrs"
        : "0.0 Yrs",
    uniqueCities: new Set(drivers.map((d) => d.city).filter(Boolean)).size,
  };

  const renderStatisticsCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-all border border-slate-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-500 text-sm font-medium">Total Drivers</p>
            <p className="text-slate-900 text-2xl font-bold mt-1">{stats.total}</p>
          </div>
          <div className="p-3 rounded-lg bg-blue-500/10">
            <span className="material-symbols-outlined text-[22px] text-blue-500">badge</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-all border border-slate-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-500 text-sm font-medium">Active Drivers</p>
            <p className="text-slate-900 text-2xl font-bold mt-1 text-green-600">{stats.active}</p>
          </div>
          <div className="p-3 rounded-lg bg-green-500/10">
            <span className="material-symbols-outlined text-[22px] text-green-500">check_circle</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-all border border-slate-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-500 text-sm font-medium">Inactive Drivers</p>
            <p className="text-slate-900 text-2xl font-bold mt-1 text-red-600">{stats.inactive}</p>
          </div>
          <div className="p-3 rounded-lg bg-red-500/10">
            <span className="material-symbols-outlined text-[22px] text-red-500">cancel</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-all border border-slate-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-500 text-sm font-medium">Avg Experience</p>
            <p className="text-slate-900 text-2xl font-bold mt-1">{stats.avgExp}</p>
          </div>
          <div className="p-3 rounded-lg bg-purple-500/10">
            <span className="material-symbols-outlined text-[22px] text-purple-500">star</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-all border border-slate-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-500 text-sm font-medium">Cities Covered</p>
            <p className="text-slate-900 text-2xl font-bold mt-1">{stats.uniqueCities}</p>
          </div>
          <div className="p-3 rounded-lg bg-orange-500/10">
            <span className="material-symbols-outlined text-[22px] text-orange-500">explore</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <main className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Driver Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and track your fleet drivers and their details</p>
        </div>
        <button
          onClick={() => {
            setNewDriver(emptyDriver);
            setFormErrors({});
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Add Driver
        </button>
      </div>

      {/* Statistics Cards */}
      {renderStatisticsCards()}

      {/* Drivers List Box */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Search and Filters */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="flex-1">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-[20px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search by name, license, phone, city..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-slate-900"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-4 pr-10 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Desktop View: Table Layout */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full min-w-max text-left md:table">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th onClick={() => requestSort("driver_id")} className="px-6 py-3 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  ID {sortConfig.key === "driver_id" ? (sortConfig.direction === "ascending" ? "▲" : "▼") : ""}
                </th>
                <th onClick={() => requestSort("name")} className="px-6 py-3 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  Name {sortConfig.key === "name" ? (sortConfig.direction === "ascending" ? "▲" : "▼") : ""}
                </th>
                <th onClick={() => requestSort("license")} className="px-6 py-3 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  License {sortConfig.key === "license" ? (sortConfig.direction === "ascending" ? "▲" : "▼") : ""}
                </th>
                <th onClick={() => requestSort("phone")} className="px-6 py-3 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  Phone {sortConfig.key === "phone" ? (sortConfig.direction === "ascending" ? "▲" : "▼") : ""}
                </th>
                <th onClick={() => requestSort("experience")} className="px-6 py-3 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  Experience {sortConfig.key === "experience" ? (sortConfig.direction === "ascending" ? "▲" : "▼") : ""}
                </th>
                <th onClick={() => requestSort("city")} className="px-6 py-3 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  City {sortConfig.key === "city" ? (sortConfig.direction === "ascending" ? "▲" : "▼") : ""}
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-700 select-none">Photo</th>
                <th onClick={() => requestSort("status")} className="px-6 py-3 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  Status {sortConfig.key === "status" ? (sortConfig.direction === "ascending" ? "▲" : "▼") : ""}
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-700 select-none">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDrivers.length > 0 ? (
                paginatedDrivers.map((driver) => (
                  <tr key={driver.driver_id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="px-6 py-4 text-sm text-slate-700">{driver.driver_id}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-indigo-600">{toSentenceCase(driver.name)}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{driver.license}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{driver.phone}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{driver.experience} Yrs</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{driver.city}</td>
                    <td className="px-6 py-4">
                      {driver.photo_url ? (
                        <img
                          src={driver.photo_url}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          alt="Driver"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-medium border border-slate-200">
                          No Pic
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          String(driver.status).toLowerCase() === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {driver.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(driver)}
                          className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 transition"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(driver)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-slate-600">
                    <span className="material-symbols-outlined text-4xl mx-auto block mb-2 text-slate-400">badge</span>
                    No drivers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Cards Layout */}
        <div className="block md:hidden divide-y divide-slate-100 border-t border-slate-200">
          {paginatedDrivers.length > 0 ? (
            paginatedDrivers.map((driver) => (
              <div key={driver.driver_id} className="p-4 space-y-3 bg-white hover:bg-slate-50 transition">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-medium">ID: {driver.driver_id}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      String(driver.status).toLowerCase() === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {driver.status}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {driver.photo_url ? (
                    <img
                      src={driver.photo_url}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200"
                      alt=""
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-medium border border-slate-200">
                      No Pic
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-indigo-600 text-sm">{toSentenceCase(driver.name)}</h4>
                    <p className="text-xs text-slate-500">License: {driver.license}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 border-t border-slate-50 pt-2">
                  <div><strong>Phone:</strong> {driver.phone}</div>
                  <div><strong>Experience:</strong> {driver.experience} Yrs</div>
                  <div className="col-span-2"><strong>City:</strong> {driver.city}</div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-50">
                  <button
                    onClick={() => handleEditClick(driver)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-indigo-100 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">edit</span>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(driver)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-red-100 text-red-700 bg-red-50/50 hover:bg-red-50 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-500">
              <span className="material-symbols-outlined text-4xl mx-auto block mb-2 text-slate-400">badge</span>
              No drivers found
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="flex justify-between items-center mt-4 p-4 border-t border-slate-200">
          <span className="text-sm text-slate-500">
            Showing {Math.min(filteredDrivers.length, (currentPage - 1) * itemsPerPage + 1)} to{" "}
            {Math.min(filteredDrivers.length, currentPage * itemsPerPage)} of {filteredDrivers.length} drivers
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button className="px-3 py-1 text-sm font-medium bg-indigo-600 text-white rounded-lg">{currentPage}</button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <Modal
          title="Add Driver"
          onClose={() => setShowAddModal(false)}
          onSave={handleAddDriver}
          formData={newDriver}
          setFormData={setNewDriver}
          errors={formErrors}
          submitting={submitting}
        />
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <Modal
          title="Edit Driver"
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEdit}
          formData={editingData}
          setFormData={setEditingData}
          errors={formErrors}
          submitting={submitting}
        />
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && deletingDriver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Driver Confirmation</h3>
            <p className="text-sm text-slate-600 mb-4">
              Are you sure you want to delete driver <strong className="text-slate-900">{deletingDriver.name}</strong> (License: {deletingDriver.license})? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingDriver(null);
                }}
                disabled={submitting}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={submitting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition cursor-pointer disabled:bg-red-400 flex items-center gap-1.5"
              >
                {submitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

// ------------------------------------------------------------------
// MODAL COMPONENT (REUSED FOR ADD + EDIT)
// ------------------------------------------------------------------
const Modal = ({ title, onClose, onSave, formData, setFormData, errors, submitting }) => {
  const fields = [
    { name: "name", label: "Driver Name *", placeholder: "e.g., John Doe" },
    { name: "license", label: "License Number *", placeholder: "e.g., DL-12345678" },
    { name: "phone", label: "Phone Number *", placeholder: "e.g., 9876543210" },
    { name: "experience", label: "Experience (Years) *", placeholder: "e.g., 5" },
    { name: "address", label: "Address", placeholder: "e.g., 123 Main St" },
    { name: "state", label: "State *", placeholder: "e.g., Maharashtra" },
    { name: "city", label: "City *", placeholder: "e.g., Pune" },
    { name: "aadhar", label: "Aadhar Number", placeholder: "e.g., 1234 5678 9012" },
    { name: "altPhone", label: "Alternative Phone", placeholder: "e.g., 9876543211" },
    { name: "nationality", label: "Nationality", placeholder: "e.g., Indian" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl my-8 w-full max-w-3xl flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition" disabled={submitting}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {Object.keys(errors || {}).length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              Please correct the highlighted fields before saving.
            </div>
          )}

          {/* Text Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{field.label}</label>
                <input
                  type="text"
                  placeholder={field.placeholder}
                  value={formData[field.name] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white ${
                    errors?.[field.name] ? "border-red-500" : "border-slate-200"
                  }`}
                />
                {errors?.[field.name] && <p className="mt-1 text-xs text-red-600">{errors[field.name]}</p>}
              </div>
            ))}
          </div>

          {/* DOB + AGE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Date of Birth *</label>
              <input
                type="date"
                value={formData.dob || ""}
                onChange={(e) => {
                  const dob = e.target.value;
                  const age = dob ? new Date().getFullYear() - new Date(dob).getFullYear() : "";
                  setFormData({ ...formData, dob, age });
                }}
                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white ${
                  errors?.dob ? "border-red-500" : "border-slate-200"
                }`}
              />
              {errors?.dob && <p className="mt-1 text-xs text-red-600">{errors.dob}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Calculated Age</label>
              <input
                type="text"
                value={formData.age || ""}
                readOnly
                className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-600"
              />
            </div>
          </div>

          {/* Medical Details */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Medical History / Details</label>
            <textarea
              placeholder="Enter medical conditions, physical check status, etc..."
              value={formData.medical || ""}
              onChange={(e) => setFormData({ ...formData, medical: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 h-20 resize-none bg-white"
            />
          </div>

          {/* Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Marital Status</label>
              <select
                value={formData.maritalStatus || ""}
                onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                className="w-full pl-4 pr-10 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              >
                <option value="">Select Status</option>
                <option value="Married">Married</option>
                <option value="Unmarried">Unmarried</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Job Type</label>
              <select
                value={formData.jobType || ""}
                onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                className="w-full pl-4 pr-10 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              >
                <option value="">Select Type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Temporary">Temporary</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status *</label>
              <select
                value={formData.status || ""}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className={`w-full pl-4 pr-10 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white ${
                  errors?.status ? "border-red-500" : "border-slate-200"
                }`}
              >
                <option value="">Select Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              {errors?.status && <p className="mt-1 text-xs text-red-600">{errors.status}</p>}
            </div>
          </div>

          {/* Photo Upload with Custom Design and Validations */}
          <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-slate-700">Driver Photograph</label>
            <div className="flex items-center gap-3 mt-1">
              <input
                type="file"
                id="driver-photo-upload"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files && e.target.files[0];
                  if (file) {
                    const filename = file.name;
                    const extension = filename.split('.').pop().toLowerCase();
                    const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
                    if (!/^[a-zA-Z0-9._-]+$/.test(nameWithoutExt)) {
                      alert("Invalid filename: Filename cannot contain special characters. Please rename your file using only letters, numbers, hyphens, and underscores.");
                      e.target.value = "";
                      return;
                    }
                    if (!['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
                      alert("Unsupported file format. Only JPG, JPEG, PNG, and GIF images are allowed.");
                      e.target.value = "";
                      return;
                    }
                    if (file.size > 2 * 1024 * 1024) {
                      alert("Oversized image file. Maximum size allowed is 2MB.");
                      e.target.value = "";
                      return;
                    }
                    setFormData({ ...formData, photo: file });
                  }
                }}
                className="hidden"
              />
              <label
                htmlFor="driver-photo-upload"
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-sm font-semibold cursor-pointer transition-colors"
              >
                Choose File
              </label>
              <span className="text-sm text-slate-500 truncate max-w-xs">
                {formData.photo ? (formData.photo.name || "File selected") : "No file chosen"}
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">Supported: JPG, PNG, GIF. Max: 2MB. Filename cannot contain special characters.</p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={submitting}
            className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition cursor-pointer disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverManagement;
