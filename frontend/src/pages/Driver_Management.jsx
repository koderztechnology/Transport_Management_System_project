import React, { useState } from "react";

const DriverManagement = () => {
  const [drivers, setDrivers] = useState([
    {
      id: 1,
      name: "John Doe",
      license: "ABC123",
      phone: "1234567890",
      experience: "5 Years",
      address: "",
      state: "",
      city: "",
      aadhar: "",
      photo: "",
      dob: "",
      age: "",
      medical: "",
      altPhone: "",
      maritalStatus: "",
      nationality: "",
      jobType: "",
      status: "Active",
      dateAdded: new Date().toLocaleDateString(),
    },
  ]);

  const [search, setSearch] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newDriver, setNewDriver] = useState({
    name: "",
    license: "",
    phone: "",
    experience: "",
    address: "",
    state: "",
    city: "",
    aadhar: "",
    photo: "",
    dob: "",
    age: "",
    medical: "",
    altPhone: "",
    maritalStatus: "",
    nationality: "",
    jobType: "",
    status: "",
    dateAdded: new Date().toLocaleDateString(),
  });

  const [editingData, setEditingData] = useState({});
  const [editingId, setEditingId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ---------------- ADD DRIVER ----------------
  const handleAddDriver = () => {
    const nextId = drivers.length ? Math.max(...drivers.map((d) => d.id)) + 1 : 1;

    setDrivers([...drivers, { id: nextId, ...newDriver }]);

    setNewDriver({
      name: "",
      license: "",
      phone: "",
      experience: "",
      address: "",
      state: "",
      city: "",
      aadhar: "",
      photo: "",
      dob: "",
      age: "",
      medical: "",
      altPhone: "",
      maritalStatus: "",
      nationality: "",
      jobType: "",
      status: "",
      dateAdded: new Date().toLocaleDateString(),
    });

    setShowAddModal(false);
  };

  // ---------------- EDIT DRIVER ----------------
  const handleEditClick = (driver) => {
    setEditingId(driver.id);
    setEditingData({ ...driver });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    setDrivers(
      drivers.map((d) => (d.id === editingId ? { ...editingData } : d))
    );

    setShowEditModal(false);
    setEditingId(null);
    setEditingData({});
  };

  const filteredDrivers = drivers.filter((d) =>
    Object.values(d).some((val) =>
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);

  const paginatedDrivers = filteredDrivers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-900">

      {/* --------- TITLE LEFT TOP --------- */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Driver Management
        </h1>
        <p className="text-slate-500 mt-1">Manage your fleet drivers and their details</p>
      </div>

      {/* ---------- Search + Add ---------- */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center mb-6 gap-4">

        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search drivers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Add Driver
        </button>

      </div>

      {/* ---------- TABLE ---------- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm uppercase tracking-wider">
              <tr>
                {[
                  "ID",
                  "Name",
                  "License",
                  "Phone",
                  "Experience",
                  "City",
                  "Status",
                  "Date Added",
                ].map((col) => (
                  <th key={col} className="px-6 py-4 font-medium">
                    {col}
                  </th>
                ))}
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedDrivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-slate-600">#{driver.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{driver.name}</td>
                  <td className="px-6 py-4 text-slate-600">{driver.license}</td>
                  <td className="px-6 py-4 text-slate-600">{driver.phone}</td>
                  <td className="px-6 py-4 text-slate-600">{driver.experience}</td>
                  <td className="px-6 py-4 text-slate-600">{driver.city}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${driver.status === "Active"
                          ? "bg-green-50 text-green-700 border-green-100"
                          : "bg-red-50 text-red-700 border-red-100"
                        }`}
                    >
                      {driver.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{driver.dateAdded}</td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditClick(driver)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>

                      <button
                        onClick={() =>
                          setDrivers(drivers.filter((d) => d.id !== driver.id))
                        }
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------- Pagination ---------- */}
      <div className="flex justify-center mt-6 gap-2">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${currentPage === i + 1
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* ----------------------------------------------------- */}
      {/* ---------------------- ADD MODAL -------------------- */}
      {/* ----------------------------------------------------- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setShowAddModal(false)}></div>

          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-slate-900">
                Add New Driver
              </h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "name",
                  "license",
                  "phone",
                  "experience",
                  "address",
                  "state",
                  "city",
                  "aadhar",
                  "altPhone",
                  "nationality",
                ].map((field) => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-slate-500 uppercase mb-1">{field}</label>
                    <input
                      type="text"
                      value={newDriver[field]}
                      onChange={(e) =>
                        setNewDriver({ ...newDriver, [field]: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={newDriver.dob}
                    onChange={(e) => {
                      const dob = e.target.value;
                      const age =
                        new Date().getFullYear() - new Date(dob).getFullYear();
                      setNewDriver({ ...newDriver, dob, age });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Age</label>
                  <input
                    type="text"
                    value={newDriver.age}
                    readOnly
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Medical Details</label>
                <textarea
                  value={newDriver.medical}
                  onChange={(e) =>
                    setNewDriver({ ...newDriver, medical: e.target.value })
                  }
                  rows="2"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Marital Status</label>
                  <select
                    value={newDriver.maritalStatus}
                    onChange={(e) =>
                      setNewDriver({ ...newDriver, maritalStatus: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  >
                    <option value="">Select</option>
                    <option value="Married">Married</option>
                    <option value="Unmarried">Unmarried</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Job Type</label>
                  <select
                    value={newDriver.jobType}
                    onChange={(e) =>
                      setNewDriver({ ...newDriver, jobType: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  >
                    <option value="">Select</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Status</label>
                  <select
                    value={newDriver.status}
                    onChange={(e) =>
                      setNewDriver({ ...newDriver, status: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  >
                    <option value="">Select</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const imageUrl = URL.createObjectURL(file);
                      setNewDriver({ ...newDriver, photo: imageUrl });
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {newDriver.photo && (
                  <img
                    src={newDriver.photo}
                    className="mt-2 w-20 h-20 rounded-lg object-cover border border-slate-200"
                    alt="Preview"
                  />
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleAddDriver}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Add Driver
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ----------------------------------------------------- */}
      {/* ---------------------- EDIT MODAL ------------------- */}
      {/* ----------------------------------------------------- */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setShowEditModal(false)}></div>

          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-slate-900">
                Edit Driver
              </h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "name",
                  "license",
                  "phone",
                  "experience",
                  "address",
                  "state",
                  "city",
                  "aadhar",
                  "altPhone",
                  "nationality",
                ].map((field) => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-slate-500 uppercase mb-1">{field}</label>
                    <input
                      type="text"
                      value={editingData[field]}
                      onChange={(e) =>
                        setEditingData({ ...editingData, [field]: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={editingData.dob}
                    onChange={(e) => {
                      const dob = e.target.value;
                      const age =
                        new Date().getFullYear() -
                        new Date(dob).getFullYear();
                      setEditingData({ ...editingData, dob, age });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Age</label>
                  <input
                    type="text"
                    value={editingData.age}
                    readOnly
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Medical Details</label>
                <textarea
                  value={editingData.medical}
                  onChange={(e) =>
                    setEditingData({ ...editingData, medical: e.target.value })
                  }
                  rows="2"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Marital Status</label>
                  <select
                    value={editingData.maritalStatus}
                    onChange={(e) =>
                      setEditingData({
                        ...editingData,
                        maritalStatus: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  >
                    <option value="">Select</option>
                    <option value="Married">Married</option>
                    <option value="Unmarried">Unmarried</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Job Type</label>
                  <select
                    value={editingData.jobType}
                    onChange={(e) =>
                      setEditingData({ ...editingData, jobType: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  >
                    <option value="">Select</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Status</label>
                  <select
                    value={editingData.status}
                    onChange={(e) =>
                      setEditingData({ ...editingData, status: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const imageUrl = URL.createObjectURL(file);
                      setEditingData({ ...editingData, photo: imageUrl });
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {editingData.photo && (
                  <img
                    src={editingData.photo}
                    className="mt-2 w-20 h-20 rounded-lg object-cover border border-slate-200"
                    alt="Preview"
                  />
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Save Changes
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default DriverManagement;
