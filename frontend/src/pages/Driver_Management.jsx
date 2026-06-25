import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../utils/api";

const API_URL = "/drivers/";

const DriverManagement = () => {
  const location = useLocation();
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});

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
    status: "",
  };

  const [newDriver, setNewDriver] = useState(emptyDriver);
  const [editingData, setEditingData] = useState(emptyDriver);
  const [editingId, setEditingId] = useState(null);

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
    if (q) {
      setSearch(q);
    }
  }, [location.search]);

  // ------------------------------------------------------------
  // VALIDATION & ACTIONS
  // ------------------------------------------------------------
  const validateDriver = (data) => {
    const errors = {};
    if (!String(data.name || "").trim()) errors.name = "Driver name is required.";
    if (!String(data.license || "").trim()) errors.license = "License number is required.";
    if (!String(data.phone || "").trim()) errors.phone = "Phone number is required.";
    else if (!/^\d{10}$/.test(String(data.phone).replace(/\D/g, ""))) errors.phone = "Phone number must be 10 digits.";
    if (!String(data.experience || "").trim()) errors.experience = "Experience is required.";
    else if (Number.isNaN(Number(data.experience)) || Number(data.experience) < 0) errors.experience = "Experience must be a valid number.";
    if (!String(data.city || "").trim()) errors.city = "City is required.";
    if (!String(data.state || "").trim()) errors.state = "State is required.";
    if (!String(data.dob || "").trim()) errors.dob = "Date of birth is required.";
    if (!String(data.status || "").trim()) errors.status = "Status is required.";
    return errors;
  };

  const handleAddDriver = async () => {
    const errors = validateDriver(newDriver);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

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
      alert("Failed to add driver.");
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

    try {
      const formData = new FormData();
      Object.entries(editingData).forEach(([key, value]) => {
        // Don't append null/file objects unless they are files
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
      alert("Failed to update driver.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this driver? This action cannot be undone.")) {
      try {
        await api.delete(`${API_URL}${id}/`);
        setDrivers(drivers.filter((d) => d.driver_id !== id));
        alert("Driver deleted successfully.");
      } catch (err) {
        console.error("Error deleting driver:", err);
        alert("Failed to delete driver.");
      }
    }
  };

  // ------------------------------------------------------------
  // FILTERING & PAGINATION
  // ------------------------------------------------------------
  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch =
      String(d.name || "").toLowerCase().includes(search.toLowerCase()) ||
      String(d.license || "").toLowerCase().includes(search.toLowerCase()) ||
      String(d.phone || "").toLowerCase().includes(search.toLowerCase()) ||
      String(d.city || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || String(d.status || "").toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);

  const paginatedDrivers = filteredDrivers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-slate-700 uppercase">ID</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-700 uppercase">Name</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-700 uppercase">License</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-700 uppercase">Phone</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-700 uppercase">Experience</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-700 uppercase">City</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-700 uppercase">Photo</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-700 uppercase">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDrivers.length > 0 ? (
                paginatedDrivers.map((driver) => (
                  <tr key={driver.driver_id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="px-6 py-4 text-sm text-slate-700">{driver.driver_id}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-indigo-600">{driver.name}</td>
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
                          onClick={() => handleDelete(driver.driver_id)}
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
        />
      )}
    </main>
  );
};

// ------------------------------------------------------------------
// MODAL COMPONENT (REUSED FOR ADD + EDIT)
// ------------------------------------------------------------------
const Modal = ({ title, onClose, onSave, formData, setFormData, errors }) => {
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
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
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
                  className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
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
                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
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
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 h-20 resize-none"
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

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Driver Photograph</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, photo: e.target.files[0] })}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverManagement;
