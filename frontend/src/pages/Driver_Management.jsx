import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://transport.koderzgroup.com/api/drivers/";

const DriverManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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
  useEffect(() => {
    axios
      .get(API_URL)
      .then((res) => setDrivers(res.data))
      .catch((err) => console.error("Error fetching drivers:", err));
  }, []);

  // ------------------------------------------------------------
  // ADD DRIVER
  // ------------------------------------------------------------
  const handleAddDriver = async () => {
    try {
      const formData = new FormData();
      Object.entries(newDriver).forEach(([key, value]) => {
        if (value !== "" && value !== null) {
          formData.append(key, value);
        }
      });

      const res = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setDrivers([...drivers, res.data]);
      setNewDriver(emptyDriver);
      setShowAddModal(false);
    } catch (err) {
      console.error("Error adding driver:", err.response?.data || err);
    }
  };

  // ------------------------------------------------------------
  // OPEN EDIT MODAL
  // ------------------------------------------------------------
  const handleEditClick = (driver) => {
    setEditingId(driver.driver_id);
    setEditingData(driver);
    setShowEditModal(true);
  };

  // ------------------------------------------------------------
  // UPDATE DRIVER
  // ------------------------------------------------------------
  const handleSaveEdit = async () => {
    try {
      const formData = new FormData();
      Object.entries(editingData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const res = await axios.put(`${API_URL}${editingId}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setDrivers(
        drivers.map((d) => (d.driver_id === editingId ? res.data : d))
      );

      setShowEditModal(false);
      setEditingId(null);
      setEditingData(emptyDriver);
    } catch (err) {
      console.error("Error updating driver:", err.response?.data || err);
    }
  };

  // ------------------------------------------------------------
  // DELETE DRIVER
  // ------------------------------------------------------------
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}${id}/`);
      setDrivers(drivers.filter((d) => d.driver_id !== id));
    } catch (err) {
      console.error("Error deleting driver:", err);
    }
  };

  // ------------------------------------------------------------
  // SEARCH + PAGINATION
  // ------------------------------------------------------------
  const filteredDrivers = drivers.filter((d) =>
    Object.values(d).join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);

  const paginatedDrivers = filteredDrivers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ------------------------------------------------------------
  // COMPONENT JSX
  // ------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-900">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Driver Management</h1>
        <p className="text-slate-500 mt-1">Manage your fleet drivers</p>
      </div>

      {/* SEARCH & ADD */}
      <div className="bg-white p-4 rounded-xl shadow-sm border mb-6 flex justify-between">
        <input
          type="text"
          placeholder="Search drivers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-3 pr-4 py-2 rounded-lg border w-80"
        />

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          Add Driver
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-sm">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">License</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Experience</th>
              <th className="px-6 py-4">City</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Photo</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedDrivers.map((driver) => (
              <tr key={driver.driver_id} className="border-t">
                <td className="px-6 py-4">{driver.driver_id}</td>
                <td className="px-6 py-4">{driver.name}</td>
                <td className="px-6 py-4">{driver.license}</td>
                <td className="px-6 py-4">{driver.phone}</td>
                <td className="px-6 py-4">{driver.experience}</td>
                <td className="px-6 py-4">{driver.city}</td>
                <td className="px-6 py-4">{driver.status}</td>

                <td className="px-6 py-4">
                  {driver.photo_url ? (
                    <img
                      src={driver.photo_url}
                      className="w-12 h-12 rounded object-cover border"
                      alt="Driver"
                    />
                  ) : (
                    "No Photo"
                  )}
                </td>

                <td className="px-6 py-4 space-x-3">
                  <button
                    onClick={() => handleEditClick(driver)}
                    className="text-indigo-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(driver.driver_id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {paginatedDrivers.length === 0 && (
              <tr>
                <td
                  colSpan="10"
                  className="px-6 py-8 text-center text-slate-400"
                >
                  No drivers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg border ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-slate-600 hover:bg-slate-50"
           }`}
         >
           Previous
         </button>

         <span className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium">
           {currentPage}
         </span>

         <button
           onClick={() => setCurrentPage(currentPage + 1)}
           disabled={currentPage === totalPages}
           className={`px-4 py-2 rounded-lg border ${
             currentPage === totalPages
               ? "bg-gray-100 text-gray-400 cursor-not-allowed"
               : "bg-white text-slate-600 hover:bg-slate-50"
           }`}
         >
           Next
         </button>

       </div>
      {/* ADD MODAL */}
      {showAddModal && (
        <Modal
          title="Add Driver"
          onClose={() => setShowAddModal(false)}
          onSave={handleAddDriver}
          formData={newDriver}
          setFormData={setNewDriver}
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
        />
      )}
    </div>
  );
};

// ------------------------------------------------------------------
// MODAL COMPONENT (REUSED FOR ADD + EDIT)
// ------------------------------------------------------------------
const Modal = ({ title, onClose, onSave, formData, setFormData }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-xl p-6 rounded-xl">
        <h2 className="text-xl font-bold mb-4">{title}</h2>

        {/* TEXT INPUTS */}
        <div className="grid grid-cols-2 gap-4">
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
            <input
              key={field}
              type="text"
              placeholder={field}
              value={formData[field] || ""}
              onChange={(e) =>
                setFormData({ ...formData, [field]: e.target.value })
              }
              className="border p-2 rounded"
            />
          ))}
        </div>

        {/* DOB + AGE */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <input
            type="date"
            value={formData.dob || ""}
            onChange={(e) => {
              const dob = e.target.value;
              const age =
                new Date().getFullYear() - new Date(dob).getFullYear();
              setFormData({ ...formData, dob, age });
            }}
            className="border p-2 rounded"
          />

          <input
            type="text"
            value={formData.age || ""}
            readOnly
            className="border p-2 rounded bg-gray-200"
          />
        </div>

        {/* MEDICAL */}
        <textarea
          placeholder="Medical details..."
          value={formData.medical || ""}
          onChange={(e) =>
            setFormData({ ...formData, medical: e.target.value })
          }
          className="border w-full mt-4 p-2 rounded"
        />

        {/* DROPDOWNS */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <select
            value={formData.maritalStatus}
            onChange={(e) =>
              setFormData({ ...formData, maritalStatus: e.target.value })
            }
            className="border p-2 rounded"
          >
            <option value="">Marital Status</option>
            <option>Married</option>
            <option>Unmarried</option>
          </select>

          <select
            value={formData.jobType}
            onChange={(e) =>
              setFormData({ ...formData, jobType: e.target.value })
            }
            className="border p-2 rounded"
          >
            <option value="">Job Type</option>
            <option>Full-time</option>
            <option>Part-time</option>
          </select>

          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            className="border p-2 rounded"
          >
            <option value="">Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

        {/* PHOTO UPLOAD */}
        <div className="mt-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setFormData({ ...formData, photo: e.target.files[0] })
            }
            className="border p-2 rounded w-full"
          />
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverManagement;
