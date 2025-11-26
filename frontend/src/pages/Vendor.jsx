import { useState } from "react";
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

export default function VendorManagement() {
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const vendorsPerPage = 10;

  const [vendors, setVendors] = useState([
    {
      id: 1,
      name: "Bharat Petroleum",
      type: "Fuel",
      contact: "Ramesh Gupta",
      phone: "+91 98765 11111",
      gst: "27AAAAA0000A1Z5",
      status: "active",
      createdAt: new Date("2025-11-02"),
    },
    {
      id: 2,
      name: "AutoCare Services",
      type: "Maintenance",
      contact: "Sunil Mehta",
      phone: "+91 98765 22222",
      gst: "27BBBBB0000B1Z5",
      status: "active",
      createdAt: new Date("2025-11-05"),
    },
    {
      id: 3,
      name: "Tyres & More",
      type: "Parts",
      contact: "Kiran Shah",
      phone: "+91 98765 33333",
      gst: "07CCCCC0000C1Z5",
      status: "active",
      createdAt: new Date("2025-10-15"),
    },
    {
      id: 4,
      name: "Highway Toll Services",
      type: "Toll",
      contact: "Prakash Jain",
      phone: "+91 98765 44444",
      gst: "-",
      status: "inactive",
      createdAt: new Date("2025-11-08"),
    },

    // ---- ADDING 20+ MORE DUMMY VENDORS ---- //

    {
      id: 5,
      name: "Shell Energy India",
      type: "Fuel",
      contact: "Mahesh Patil",
      phone: "+91 98765 55555",
      gst: "29DDDDD0000D1Z5",
      status: "active",
      createdAt: new Date("2025-10-20"),
    },
    {
      id: 6,
      name: "Metro Auto Repairs",
      type: "Maintenance",
      contact: "Lokesh Thakur",
      phone: "+91 98765 66666",
      gst: "27EEEEE0000E1Z5",
      status: "active",
      createdAt: new Date("2025-09-12"),
    },
    {
      id: 7,
      name: "Prime Tyre House",
      type: "Parts",
      contact: "Harish Nair",
      phone: "+91 98765 77777",
      gst: "24FFFFF0000F1Z5",
      status: "inactive",
      createdAt: new Date("2025-10-25"),
    },
    {
      id: 8,
      name: "FastTrack Logistics Toll",
      type: "Toll",
      contact: "Ishaan Verma",
      phone: "+91 98765 88888",
      gst: "-",
      status: "active",
      createdAt: new Date("2025-11-01"),
    },
    {
      id: 9,
      name: "City Fuel Station",
      type: "Fuel",
      contact: "Rajesh Kumar",
      phone: "+91 98765 99999",
      gst: "18GGGGG0000G1Z5",
      status: "active",
      createdAt: new Date("2025-11-03"),
    },
    {
      id: 10,
      name: "Max Auto Garage",
      type: "Maintenance",
      contact: "Sameer Deshmukh",
      phone: "+91 98654 12345",
      gst: "27HHHHH0000H1Z5",
      status: "inactive",
      createdAt: new Date("2025-08-18"),
    },
    {
      id: 11,
      name: "HiGrip Tyres",
      type: "Parts",
      contact: "Gaurav Singh",
      phone: "+91 98712 54321",
      gst: "09IIIII0000I1Z5",
      status: "active",
      createdAt: new Date("2025-11-04"),
    },
    {
      id: 12,
      name: "Toll Master Pvt Ltd",
      type: "Toll",
      contact: "Mohan Kashyap",
      phone: "+91 98000 11111",
      gst: "-",
      status: "inactive",
      createdAt: new Date("2025-07-10"),
    },
    {
      id: 13,
      name: "Ultra Petrol Center",
      type: "Fuel",
      contact: "Sandeep Rana",
      phone: "+91 98111 22222",
      gst: "07JJJJJ0000J1Z5",
      status: "active",
      createdAt: new Date("2025-10-10"),
    },
    {
      id: 14,
      name: "Supreme Auto Clinic",
      type: "Maintenance",
      contact: "Vipul Sutar",
      phone: "+91 98222 33333",
      gst: "21KKKKK0000K1Z5",
      status: "active",
      createdAt: new Date("2025-11-06"),
    },
    {
      id: 15,
      name: "RoadStar Tyre Mart",
      type: "Parts",
      contact: "Hemant Joshi",
      phone: "+91 98333 44444",
      gst: "27LLLLL0000L1Z5",
      status: "inactive",
      createdAt: new Date("2025-09-22"),
    },
    {
      id: 16,
      name: "Golden Highway Toll",
      type: "Toll",
      contact: "Tarun Malhotra",
      phone: "+91 98444 55555",
      gst: "-",
      status: "active",
      createdAt: new Date("2025-11-07"),
    },
    {
      id: 17,
      name: "EcoFuel India",
      type: "Fuel",
      contact: "Neeraj Shinde",
      phone: "+91 98555 66666",
      gst: "27MMMMM0000M1Z5",
      status: "active",
      createdAt: new Date("2025-11-02"),
    },
    {
      id: 18,
      name: "CityFix Auto Solutions",
      type: "Maintenance",
      contact: "Kamlesh Chouhan",
      phone: "+91 98666 77777",
      gst: "23NNNNN0000N1Z5",
      status: "inactive",
      createdAt: new Date("2025-10-12"),
    },
    {
      id: 19,
      name: "MegaParts Zone",
      type: "Parts",
      contact: "Ritik Yadav",
      phone: "+91 98777 88888",
      gst: "27OOOOO0000O1Z5",
      status: "active",
      createdAt: new Date("2025-11-01"),
    },
    {
      id: 20,
      name: "QuickPay Toll Services",
      type: "Toll",
      contact: "Vinod Shetty",
      phone: "+91 98888 99999",
      gst: "-",
      status: "active",
      createdAt: new Date("2025-11-03"),
    },
    {
      id: 21,
      name: "Express Fuel Hub",
      type: "Fuel",
      contact: "Piyush Agarwal",
      phone: "+91 98999 00000",
      gst: "19PPPPP0000P1Z5",
      status: "inactive",
      createdAt: new Date("2025-10-18"),
    },
    {
      id: 22,
      name: "Allied Motor Works",
      type: "Maintenance",
      contact: "Jayesh Chavan",
      phone: "+91 98123 45678",
      gst: "27QQQQQ0000Q1Z5",
      status: "active",
      createdAt: new Date("2025-11-05"),
    },
    {
      id: 23,
      name: "Turbo Wheels Store",
      type: "Parts",
      contact: "Vishal Pandey",
      phone: "+91 98234 56789",
      gst: "24RRRRR0000R1Z5",
      status: "active",
      createdAt: new Date("2025-09-10"),
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editVendorId, setEditVendorId] = useState(null);
  const [showDelete, setShowDelete] = useState(null);

  const [newVendor, setNewVendor] = useState({
    name: "",
    type: "",
    contact: "",
    phone: "",
    gst: "",
    address: "",
    city: "",
    state: "",
    email: "",
    status: "active",
  });

  // RESET pagination when searching
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  // FILTERED vendors
  const filteredVendors = vendors.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase())
  );

  // PAGINATED vendors
  const paginatedVendors = filteredVendors.slice(
    (currentPage - 1) * vendorsPerPage,
    currentPage * vendorsPerPage
  );

  const totalPages = Math.ceil(filteredVendors.length / vendorsPerPage);

  const totalVendors = vendors.length;
  const activeVendors = vendors.filter((v) => v.status === "active").length;
  const inactiveVendors = vendors.filter((v) => v.status === "inactive").length;
  const vendorsThisMonth = vendors.filter((v) => {
    const vendorMonth = new Date(v.createdAt).getMonth();
    const vendorYear = new Date(v.createdAt).getFullYear();
    const now = new Date();
    return vendorMonth === now.getMonth() && vendorYear === now.getFullYear();
  }).length;

  // Save vendor (add/edit)
  const handleSaveVendor = () => {
    if (!newVendor.name || !newVendor.phone) return;

    if (editVendorId) {
      setVendors(
        vendors.map((v) => (v.id === editVendorId ? { ...v, ...newVendor } : v))
      );
    } else {
      setVendors([
        ...vendors,
        { id: Date.now(), createdAt: new Date(), ...newVendor },
      ]);
    }

    setNewVendor({
      name: "",
      type: "",
      contact: "",
      phone: "",
      gst: "",
      address: "",
      email: "",
      status: "active",
    });
    setEditVendorId(null);
    setShowModal(false);
  };

  const handleEdit = (vendor) => {
    setNewVendor({ ...vendor });
    setEditVendorId(vendor.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setVendors(vendors.filter((v) => v.id !== id));
    setShowDelete(null);
  };

  const toggleStatus = (id) => {
    setVendors(
      vendors.map((v) =>
        v.id === id
          ? { ...v, status: v.status === "active" ? "inactive" : "active" }
          : v
      )
    );
  };

  return (
    <div className="w-full p-6 bg-slate-50 min-h-screen font-sans text-slate-900">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Vendor Management</h2>
          <p className="text-slate-500 text-sm mt-1">Manage your suppliers and service providers</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm hover:bg-indigo-700 transition-colors mt-3 sm:mt-0 font-medium text-sm"
        >
          <Plus size={18} /> Add Vendor
        </button>
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
      <div className="flex items-center gap-3 p-3 bg-white shadow-sm border border-slate-100 rounded-xl mb-6">
        <Search size={20} className="text-slate-400 ml-2" />
        <input
          type="text"
          placeholder="Search vendor by name..."
          value={search}
          onChange={handleSearchChange}
          className="w-full focus:outline-none text-sm text-slate-700 placeholder:text-slate-400"
        />
      </div>

      {/* Vendor Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-4 px-6 font-semibold text-slate-500">Name</th>
                <th className="py-4 px-6 font-semibold text-slate-500">Type</th>
                <th className="py-4 px-6 font-semibold text-slate-500">Contact Person</th>
                <th className="py-4 px-6 font-semibold text-slate-500">Phone</th>
                <th className="py-4 px-6 font-semibold text-slate-500">GST Number</th>
                <th className="py-4 px-6 font-semibold text-slate-500">Status</th>
                <th className="py-4 px-6 font-semibold text-slate-500 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedVendors.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 font-medium text-slate-900">{v.name}</td>
                  <td className="py-4 px-6 text-slate-600">{v.type}</td>
                  <td className="py-4 px-6 text-slate-600">{v.contact}</td>
                  <td className="py-4 px-6 text-slate-600">{v.phone}</td>
                  <td className="py-4 px-6 text-slate-600 font-mono text-xs">{v.gst}</td>

                  <td className="py-4 px-6">
                    <button
                      onClick={() => toggleStatus(v.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                        v.status === "active"
                          ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                      }`}
                    >
                      {v.status === "active" ? (
                        <>
                          <CheckCircle size={12} /> Active
                        </>
                      ) : (
                        <>
                          <XCircle size={12} /> Inactive
                        </>
                      )}
                    </button>
                  </td>

                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(v)}
                        className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => setShowDelete(v.id)}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
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
                onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })} 
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
                <select
                  value={newVendor.type}
                  onChange={(e) => setNewVendor({ ...newVendor, type: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white text-slate-900"
                >
                  <option value="">Select Vendor Type</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Parts">Parts</option>
                  <option value="Fuel">Fuel</option>
                  <option value="Toll">Toll</option>
                </select>
              </div>

              <InputGroup 
                label="Contact Person" 
                placeholder="John Doe" 
                value={newVendor.contact} 
                onChange={(e) => setNewVendor({ ...newVendor, contact: e.target.value })} 
              />

              <InputGroup 
                label="Phone *" 
                placeholder="+91 98765 12345" 
                value={newVendor.phone} 
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

              <InputGroup 
                label="City" 
                placeholder="Enter city" 
                value={newVendor.city} 
                onChange={(e) => setNewVendor({ ...newVendor, city: e.target.value })} 
              />

              <InputGroup 
                label="State" 
                placeholder="Enter state" 
                value={newVendor.state} 
                onChange={(e) => setNewVendor({ ...newVendor, state: e.target.value })} 
              />

              <div className="sm:col-span-2">
                <InputGroup 
                  label="GST Number" 
                  placeholder="27AAAAA0000A1Z5" 
                  value={newVendor.gst} 
                  onChange={(e) => setNewVendor({ ...newVendor, gst: e.target.value })} 
                />
              </div>

              <div className="sm:col-span-2">
                <InputGroup 
                  label="Email" 
                  type="email"
                  placeholder="Enter vendor email" 
                  value={newVendor.email} 
                  onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={newVendor.status}
                  onChange={(e) => setNewVendor({ ...newVendor, status: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white text-slate-900"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
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
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors"
              >
                {editVendorId ? "Save Changes" : "Add Vendor"}
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

const InputGroup = ({ label, type = "text", ...props }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    <input
      type={type}
      className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-slate-900"
      {...props}
    />
  </div>
);
