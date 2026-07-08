import { useState, useEffect } from "react";
import api from "../utils/api";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  X,
  Users,
  UserCheck,
  UserX,
  CalendarDays,
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

export default function VendorManagement() {
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const userRole = localStorage.getItem('user_role') || 'Admin';

  const [currentPage, setCurrentPage] = useState(1);
  const vendorsPerPage = 10;

  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await api.get("/vendors/");
      setVendors(response.data);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Vendor ID",
      "Name",
      "Type",
      "Contact Person",
      "Phone",
      "Email",
      "Address",
      "Status"
    ];
    const csvRows = [
      headers.join(","),
      ...vendors.map((v) =>
        [
          v.vendor_id,
          `"${v.name}"`,
          `"${v.service_type}"`,
          `"${v.contact_person || ''}"`,
          `"${v.phone}"`,
          `"${v.email || ''}"`,
          `"${v.address || ''}"`,
          v.status
        ].join(",")
      ),
    ];
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "vendors.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const csvText = evt.target.result;
      const lines = csvText.split("\n");
      let importedCount = 0;
      let errorsCount = 0;
      const promises = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          const cols = line.split(",").map(c => c.replace(/^"|"$/g, "").trim());
          if (cols.length >= 5) {
            const vendorName = cols[1];
            const serviceType = cols[2];
            const contactPerson = cols[3];
            const phone = cols[4];
            const email = cols[5] || "";
            const address = cols[6] || "";
            const status = cols[7] || "Active";

            if (!vendorName) {
              errorsCount++;
              continue;
            }

            const payload = {
              name: vendorName,
              service_type: serviceType || "Maintenance",
              contact_person: contactPerson,
              phone: phone,
              email: email || null,
              address: address,
              status: status
            };

            promises.push(
              api.post("/vendors/?import=true", payload)
                .then(() => { importedCount++; })
                .catch((err) => {
                  console.error("Error importing row:", err);
                  errorsCount++;
                })
            );
          }
        }
      }

      if (promises.length > 0) {
        await Promise.all(promises);
        fetchVendors();
        alert(`Import complete! ${importedCount} vendors imported successfully. ${errorsCount} failed/skipped.`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const [showModal, setShowModal] = useState(false);
  const [editVendorId, setEditVendorId] = useState(null);
  const [showDelete, setShowDelete] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const [newVendor, setNewVendor] = useState({
    name: "",
    service_type: "",
    contact_person: "",
    phone: "",
    address: "",
    email: "",
    status: "Active",
  });

  // RESET pagination when searching
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const filteredVendors = vendors.filter((v) => {
    const q = search.trim().toLowerCase();
    return !q ||
      String(v.name || "").toLowerCase().includes(q) ||
      String(v.service_type || "").toLowerCase().includes(q) ||
      String(v.contact_person || "").toLowerCase().includes(q) ||
      String(v.phone || "").toLowerCase().includes(q) ||
      String(v.email || "").toLowerCase().includes(q);
  });

  // PAGINATED vendors
  const paginatedVendors = filteredVendors.slice(
    (currentPage - 1) * vendorsPerPage,
    currentPage * vendorsPerPage
  );

  const totalPages = Math.ceil(filteredVendors.length / vendorsPerPage);

  const totalVendors = vendors.length;
  const activeVendors = vendors.filter((v) => v.status === "Active").length;
  const inactiveVendors = vendors.filter((v) => v.status === "Inactive").length;
  const vendorsThisMonth = vendors.filter((v) => {
    if(!v.added_date) return false;
    const vendorMonth = new Date(v.added_date).getMonth();
    const vendorYear = new Date(v.added_date).getFullYear();
    const now = new Date();
    return vendorMonth === now.getMonth() && vendorYear === now.getFullYear();
  }).length;

  // Save vendor (add/edit)
  const validateVendor = (data) => {
    const errors = {};
    if (!String(data.name || "").trim()) errors.name = "Vendor name is required.";
    if (!String(data.service_type || "").trim()) errors.service_type = "Vendor type is required.";
    if (!String(data.phone || "").trim()) errors.phone = "Phone number is required.";
    else if (!/^\d{10}$/.test(String(data.phone).replace(/\D/g, ""))) errors.phone = "Phone number must be 10 digits.";
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email))) errors.email = "Please enter a valid email address.";
    return errors;
  };

  const handleSaveVendor = async () => {
    if (saving) return;
    const errors = validateVendor(newVendor);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setSaving(true);

    // Clean payload for Django
    const payload = { ...newVendor };
    if (!payload.email) payload.email = null; // Prevent "Enter a valid email address" from DRF
    delete payload.gst; // Just in case it sneaks in from edit mode old data

    try {
      if (editVendorId) {
        await api.put(`/vendors/${editVendorId}/`, payload);
        alert("Vendor updated successfully!");
      } else {
        await api.post("/vendors/", payload);
        alert("Vendor added successfully!");
      }

      setNewVendor({
        name: "",
        service_type: "",
        contact_person: "",
        phone: "",
        address: "",
        email: "",
        status: "Active",
      });
      setEditVendorId(null);
      setShowModal(false);
      fetchVendors(); // Refresh full state and update dashboard KPI instantly
      setCurrentPage(1);
    } catch (error) {
      console.error("Error saving vendor:", error);
      if (error.response && error.response.data) {
        // Map backend validation errors to frontend error state
        setFormErrors(error.response.data);
      }
      alert(formatApiError(error, "Failed to save vendor."));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (vendor) => {
    setNewVendor({ ...vendor });
    setEditVendorId(vendor.vendor_id);
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this vendor?")) {
      try {
        await api.delete(`/vendors/${id}/`);
        setShowDelete(null);
        fetchVendors(); // Refresh full state and update dashboard KPI instantly
        alert("Vendor deleted successfully.");
      } catch (error) {
        console.error("Error deleting vendor:", error);
        alert(formatApiError(error, "Failed to delete vendor."));
      }
    }
  };

  const toggleStatus = async (id) => {
    const vendor = vendors.find((v) => v.vendor_id === id);
    if(!vendor) return;
    const updatedStatus = vendor.status === "Active" ? "Inactive" : "Active";
    try {
      await api.patch(`/vendors/${id}/`, { status: updatedStatus });
      fetchVendors(); // Refresh full state and update dashboard KPI instantly
      alert(`Vendor status updated to ${updatedStatus}.`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert(formatApiError(error, "Failed to update status."));
    }
  };

  return (
    <div className="w-full p-6 bg-slate-50 min-h-screen font-sans text-slate-900">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Vendor Management</h2>
          <p className="text-slate-500 text-sm mt-1">Manage your suppliers and service providers</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-3 sm:mt-0 w-full sm:w-auto">
          {userRole !== 'Vendor' && (
            <>
              <button
                onClick={handleExportCSV}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 h-11 rounded-lg flex items-center gap-2 shadow-sm transition-colors font-medium text-sm cursor-pointer whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-lg">download</span> Export CSV
              </button>
              <button
                onClick={() => document.getElementById('import-csv-file').click()}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 h-11 rounded-lg flex items-center gap-2 shadow-sm transition-colors font-medium text-sm cursor-pointer whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-lg">upload</span> Import CSV
              </button>
              <input
                type="file"
                accept=".csv"
                id="import-csv-file"
                onChange={handleImportCSV}
                className="hidden"
              />
            </>
          )}
          {userRole !== 'Vendor' && (
            <button
              onClick={() => {
                setNewVendor({
                  name: "",
                  service_type: "",
                  contact_person: "",
                  phone: "",
                  address: "",
                  email: "",
                  status: "Active",
                });
                setEditVendorId(null);
                setFormErrors({});
                setShowModal(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 h-11 rounded-lg flex items-center gap-2 shadow-sm transition-colors font-medium text-sm cursor-pointer whitespace-nowrap"
            >
              <Plus size={18} /> Add Vendor
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Vendors */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Total Vendors</p>
            <h2 className="text-2xl font-bold text-slate-900">{totalVendors}</h2>
          </div>
        </div>

        {/* Active Vendors */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3 rounded-lg bg-green-50 text-green-600">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Active Vendors</p>
            <h2 className="text-2xl font-bold text-slate-900">{activeVendors}</h2>
          </div>
        </div>

        {/* Inactive Vendors */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3 rounded-lg bg-red-50 text-red-600">
            <UserX size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Inactive Vendors</p>
            <h2 className="text-2xl font-bold text-slate-900">{inactiveVendors}</h2>
          </div>
        </div>

        {/* Vendors Added This Month */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600">
            <CalendarDays size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Added This Month</p>
            <h2 className="text-2xl font-bold text-slate-900">{vendorsThisMonth}</h2>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between p-3 bg-white shadow-sm border border-slate-100 rounded-xl mb-6 relative">
        <div className="flex items-center gap-3 flex-1">
          <Search size={20} className="text-slate-400 ml-2" />
          <input
            type="text"
            placeholder="Search vendor by name..."
            value={search}
            onChange={handleSearchChange}
            className="w-full focus:outline-none text-sm text-slate-700 placeholder:text-slate-400 bg-white"
          />
        </div>
        {search && (
          <button
            onClick={() => {
              setSearch("");
              setCurrentPage(1);
            }}
            className="text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer p-1 rounded-full hover:bg-slate-50 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Vendor Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-left text-sm border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-4 px-6 font-semibold text-slate-500 whitespace-nowrap">Name</th>
                <th className="py-4 px-6 font-semibold text-slate-500 whitespace-nowrap">Type</th>
                <th className="py-4 px-6 font-semibold text-slate-500 whitespace-nowrap">Contact Person</th>
                <th className="py-4 px-6 font-semibold text-slate-500 whitespace-nowrap">Phone</th>
                <th className="py-4 px-6 font-semibold text-slate-500 whitespace-nowrap">Email</th>
                <th className="py-4 px-6 font-semibold text-slate-500 whitespace-nowrap">Status</th>
                {userRole !== 'Vendor' && <th className="py-4 px-6 font-semibold text-slate-500 text-right whitespace-nowrap">Actions</th>}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedVendors.map((v) => (
                <tr key={v.vendor_id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 font-medium text-slate-900 whitespace-nowrap">{v.name}</td>
                  <td className="py-4 px-6 text-slate-600 whitespace-nowrap">{v.service_type}</td>
                  <td className="py-4 px-6 text-slate-600 whitespace-nowrap">{v.contact_person}</td>
                  <td className="py-4 px-6 text-slate-600 whitespace-nowrap">{v.phone}</td>
                  <td className="py-4 px-6 text-slate-600 font-mono text-xs whitespace-nowrap">{v.email || "-"}</td>

                  <td className="py-4 px-6 whitespace-nowrap">
                    {userRole === 'Vendor' ? (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        v.status === "Active"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}>
                        {v.status === "Active" ? <CheckCircle size={12} /> : <XCircle size={12} />} {v.status}
                      </span>
                    ) : (
                      <button
                        onClick={() => toggleStatus(v.vendor_id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                          v.status === "Active"
                            ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                            : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                        }`}
                      >
                        {v.status === "Active" ? (
                          <>
                            <CheckCircle size={12} /> Active
                          </>
                        ) : (
                          <>
                            <XCircle size={12} /> Inactive
                          </>
                        )}
                      </button>
                    )}
                  </td>

                  {userRole !== 'Vendor' && (
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(v)}
                          className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setShowDelete(v.vendor_id)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredVendors.length === 0 && (
          <div className="text-center p-8 text-slate-500">No vendors found matching your search.</div>
        )}

        {/* Pagination */}
        {filteredVendors.length > vendorsPerPage && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
             <p className="text-sm text-slate-500">
              Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
            </p>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    currentPage === i + 1
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl border border-slate-100 p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {editVendorId ? "Edit Vendor" : "Add New Vendor"}
                </h3>
                <p className="text-sm text-slate-500">Enter vendor details below</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              <InputGroup 
                label="Name *" 
                placeholder="Vendor Name" 
                value={newVendor.name} 
                error={formErrors.name}
                onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })} 
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
                <select
                  value={newVendor.service_type}
                  onChange={(e) => setNewVendor({ ...newVendor, service_type: e.target.value })}
                  className={`w-full border rounded-lg pl-3 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white text-slate-900 ${formErrors.service_type ? "border-red-500" : "border-slate-200"}`}
                >
                  <option value="">Select Vendor Type</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Parts">Parts</option>
                  <option value="Fuel">Fuel</option>
                  <option value="Toll">Toll</option>
                </select>
                {formErrors.service_type && <p className="mt-1 text-xs text-red-600">{formErrors.service_type}</p>}
              </div>

              <InputGroup 
                label="Contact Person" 
                placeholder="John Doe" 
                value={newVendor.contact_person} 
                onChange={(e) => setNewVendor({ ...newVendor, contact_person: e.target.value })} 
              />

              <InputGroup 
                label="Phone *" 
                placeholder="+91 98765 12345" 
                value={newVendor.phone} 
                error={formErrors.phone}
                onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })} 
              />

              <div className="sm:col-span-2">
                <InputGroup 
                  label="Address" 
                  placeholder="Enter vendor address" 
                  value={newVendor.address} 
                  onChange={(e) => setNewVendor({ ...newVendor, address: e.target.value })} 
                />
              </div>

              <div className="sm:col-span-2">
                <InputGroup 
                  label="Email" 
                  type="email"
                  placeholder="Enter vendor email" 
                  value={newVendor.email} 
                  error={formErrors.email}
                  onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })} 
                />
              </div>

              {/* Removed GST */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={newVendor.status}
                  onChange={(e) => setNewVendor({ ...newVendor, status: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg pl-3 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white text-slate-900"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveVendor}
                disabled={saving}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : (editVendorId ? "Save Changes" : "Add Vendor")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {showDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Delete Vendor?
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Are you sure you want to delete this vendor? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowDelete(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDelete)}
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

const InputGroup = ({ label, type = "text", error, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    <input
      type={type}
      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-slate-900 ${error ? "border-red-500" : "border-slate-200"}`}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);
