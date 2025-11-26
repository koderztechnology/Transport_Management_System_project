import React, { useState } from "react";
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

/* -------------------- Helpers -------------------- */
const generateLRNumber = () => {
  const t = Date.now().toString().slice(-6);
  return `LR${new Date().getFullYear()}${t}`;
};

const generateDummyLR = (count = 25) => {
  const routes = [
    "Mumbai → Delhi",
    "Ahmedabad → Bangalore",
    "Chennai → Hyderabad",
    "Delhi → Kolkata",
    "Pune → Nagpur",
    "Surat → Surat",
  ];
  const vehicles = [
    "MH-12-AB-1234",
    "GJ-05-EF-9012",
    "DL-08-IJ-7890",
    "MH-01-CD-5678",
  ];
  const freights = ["₹48,000", "₹85,000", "₹92,000", "₹95,000", "₹72,500"];
  return Array.from({ length: count }, (_, i) => ({
    id: Date.now() + i,
    lrNumber: `LR2025${String(i + 1).padStart(4, "0")}`,
    date: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
    consignor: `Consignor ${i + 1}`,
    consignee: `Consignee ${i + 1}`,
    route: routes[i % routes.length],
    vehicle: vehicles[i % vehicles.length],
    driver: `Driver ${i + 1}`,
    material: `Material ${i + 1}`,
    weight: `${(i + 1) * 100} kg`,
    freight: freights[i % freights.length],
    eway: `EWAY${1000 + i}`,
    status: i % 3 === 0 ? "pending" : i % 3 === 1 ? "in-transit" : "billed",
  }));
};

/* -------------------- Component -------------------- */
export default function LRManagement() {
  // data + pagination
  const [lrData, setLRData] = useState(generateDummyLR(25));
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // modals & selected
  const [showCreate, setShowCreate] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedLR, setSelectedLR] = useState(null);

  // actions dropdown open id
  const [menuOpenFor, setMenuOpenFor] = useState(null);

  /* -------------------- Pagination helpers -------------------- */
  const totalPages = Math.max(1, Math.ceil(lrData.length / rowsPerPage));
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentLRs = lrData.slice(indexOfFirst, indexOfLast);

  const stats = {
    totalLR: lrData.length,
    pendingLR: lrData.filter((l) => l.status === "pending").length,
    completedLR: lrData.filter((l) => l.status === "billed").length,
    monthlyLR: lrData.filter((l) => l.date?.startsWith("2025-02")).length,
  };

  /* -------------------- CRUD Actions -------------------- */
  const handleCreateLR = (newBill) => {
    setLRData((prev) => [newBill, ...prev]);
    setShowCreate(false);
    setCurrentPage(1); // show newest on page 1
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

  const handleSaveEdit = (updated) => {
    setLRData((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    setShowEdit(false);
    setSelectedLR(null);
  };

  const handleDeleteConfirmed = () => {
    if (!selectedLR) return;
    setLRData((prev) => prev.filter((l) => l.id !== selectedLR.id));
    setShowDelete(false);
    setSelectedLR(null);
    // adjust page if needed (e.g., after deleting last item on last page)
    const newTotalPages = Math.max(
      1,
      Math.ceil((lrData.length - 1) / rowsPerPage)
    );
    if (currentPage > newTotalPages) setCurrentPage(newTotalPages);
  };

  const cycleStatus = (id) => {
    setLRData((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const next =
          l.status === "pending"
            ? "in-transit"
            : l.status === "in-transit"
            ? "billed"
            : "pending";
        return { ...l, status: next };
      })
    );
    setMenuOpenFor(null);
  };

  /* -------------------- UI: Create Modal Form State -------------------- */
  const emptyForm = {
    id: null,
    lrNumber: generateLRNumber(),
    date: new Date().toISOString().slice(0, 10),
    consignor: "",
    consignee: "",
    route: "",
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

  const submitCreate = () => {
    if (!form.lrNumber || !form.route) {
      // minimal validation
      alert("Please enter LR Number and Route");
      return;
    }
    handleCreateLR({ ...form, id: Date.now() });
    setForm(emptyForm);
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">LR / Bilty Management</h1>
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
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">LR Number</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Route</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Vehicle</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Freight</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
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
                  <td className="py-4 px-6 text-sm text-slate-600">{row.route}</td>
                  <td className="py-4 px-6 text-sm text-slate-600">{row.vehicle}</td>
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
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  currentPage === index + 1
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ----------------- Create Modal ----------------- */}
      {showCreate && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-start sm:items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-3xl shadow-2xl border border-slate-100 p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputGroup label="LR Number" name="lrNumber" value={form.lrNumber} onChange={handleFormChange} />
              <InputGroup label="Date" type="date" name="date" value={form.date} onChange={handleFormChange} />
              <InputGroup label="Consignor" name="consignor" value={form.consignor} onChange={handleFormChange} placeholder="Sender name" />
              <InputGroup label="Consignee" name="consignee" value={form.consignee} onChange={handleFormChange} placeholder="Receiver name" />
              <InputGroup label="Route" name="route" value={form.route} onChange={handleFormChange} placeholder="Origin → Destination" />
              <InputGroup label="Vehicle" name="vehicle" value={form.vehicle} onChange={handleFormChange} placeholder="Vehicle Number" />
              <InputGroup label="Driver" name="driver" value={form.driver} onChange={handleFormChange} placeholder="Driver Name" />
              <InputGroup label="Material" name="material" value={form.material} onChange={handleFormChange} placeholder="Material Description" />
              <InputGroup label="Weight" name="weight" value={form.weight} onChange={handleFormChange} placeholder="e.g. 1200 kg" />
              <InputGroup label="Freight" name="freight" value={form.freight} onChange={handleFormChange} placeholder="Amount (₹)" />
              <InputGroup label="Eway Bill" name="eway" value={form.eway} onChange={handleFormChange} placeholder="Eway Number" />
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
                >
                  <option value="pending">Pending</option>
                  <option value="in-transit">In-Transit</option>
                  <option value="billed">Billed</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitCreate}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors"
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
              <DetailItem label="Vehicle" value={selectedLR.vehicle} />
              <DetailItem label="Driver" value={selectedLR.driver} />
              <DetailItem label="Material" value={selectedLR.material} />
              <DetailItem label="Weight" value={selectedLR.weight} />
              <DetailItem label="Freight" value={selectedLR.freight} />
              <DetailItem label="Eway Bill" value={selectedLR.eway} />
              
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
function EditModal({ lr, onClose, onSave }) {
  const [editForm, setEditForm] = useState({ ...lr });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((f) => ({ ...f, [name]: value }));
  };

  const save = () => {
    if (!editForm.lrNumber || !editForm.route) {
      alert("Please fill LR Number & Route");
      return;
    }
    onSave(editForm);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl shadow-2xl border border-slate-100 p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900">Edit LR Details</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <InputGroup label="LR Number" name="lrNumber" value={editForm.lrNumber} onChange={handleChange} />
          <InputGroup label="Date" type="date" name="date" value={editForm.date} onChange={handleChange} />
          <InputGroup label="Route" name="route" value={editForm.route} onChange={handleChange} />
          <InputGroup label="Vehicle" name="vehicle" value={editForm.vehicle} onChange={handleChange} />
          <InputGroup label="Freight" name="freight" value={editForm.freight} onChange={handleChange} />
          <InputGroup label="Driver" name="driver" value={editForm.driver} onChange={handleChange} />
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              name="status"
              value={editForm.status}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
            >
              <option value="pending">Pending</option>
              <option value="in-transit">In-Transit</option>
              <option value="billed">Billed</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
