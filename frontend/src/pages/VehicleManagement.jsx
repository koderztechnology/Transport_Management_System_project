import { useState, useEffect } from 'react';
import axios from 'axios';

const VehicleManagement = () => {
  // ============================================================
  // STATE MANAGEMENT
  // ============================================================
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Form data for adding new vehicle
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    vehicleType: 'Truck',
    ownerName: '',
    ownerPhone: '',
    modelName: '',
    manufacturingYear: '',
    chassisNumber: '',
    engineNumber: '',
    insuranceProvider: '',
    insuranceExpiry: '',
    pollutionExpiry: '',
    fitnessExpiry: '',
    roadTaxExpiry: '',
    capacity: '',
    gvwr: '',
    currentMileage: '',
    lastServiceDate: '',
    gps_trackerNumber: '',
    totalTrips: '',
    totalEarnings: '',
  });

  const [formErrors, setFormErrors] = useState({});

  // ============================================================
  // DATA STATES
  // ============================================================
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    fetchVehicles();
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/drivers/');
      setDrivers(res.data);
    } catch (err) {
      console.error("Error fetching drivers:", err);
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/vehicles/');
      const apiVehicles = res.data.map(v => ({
        id: v.vehicle_id,
        vehicleNumber: v.vehicle_number || '',
        vehicleType: v.make || 'Truck',
        owner: v.driver || '', // Driver ID now
        model: v.model || '',
        year: 2020,
        capacity: v.capacity || '',
        gvwr: '',
        mileage: '0 km',
        lastService: 'Pending',
        nextServiceDue: 'Pending',
        insurance: { provider: 'Not Provided', expiryDate: 'Not Provided', daysLeft: 0 },
        pollution: { expiryDate: 'Not Provided', daysLeft: 0 },
        fitness: { expiryDate: 'Not Provided', daysLeft: 0 },
        roadTax: { expiryDate: 'Not Provided', daysLeft: 0 },
        gps_tracker: 'Not Assigned',
        status: v.status || 'Active',
        statusColor: v.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800',
        totalTrips: 0,
        totalEarnings: '₹0',
        createdAt: v.added_date ? v.added_date.split('T')[0] : '',
        documentsStatus: { insurance: 'valid', pollution: 'valid', fitness: 'valid', roadTax: 'valid' }
      }));
      setVehicles(apiVehicles);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    }
  };

  // ============================================================
  // STATISTICS
  // ============================================================
  const statistics = {
    total: vehicles.length,
    active: vehicles.filter(v => v.status === 'Active').length,
    maintenance: vehicles.filter(v => v.status === 'Maintenance').length,
    documentsExpiring: vehicles.filter(v => 
      Object.values(v.documentsStatus).some(s => s === 'expiring_soon' || s === 'critical')
    ).length,
    totalCapacity: '110 MT',
  };

  // ============================================================
  // VALIDATION FUNCTIONS
  // ============================================================
  const validateForm = () => {
    const errors = {};

    if (!formData.vehicleNumber.trim()) errors.vehicleNumber = 'Vehicle number is required';
    if (!formData.ownerName.trim()) errors.ownerName = 'Owner name is required';
    if (!formData.modelName.trim()) errors.modelName = 'Model name is required';
    if (!formData.manufacturingYear) errors.manufacturingYear = 'Manufacturing year is required';
    if (!formData.chassisNumber.trim()) errors.chassisNumber = 'Chassis number is required';
    if (!formData.engineNumber.trim()) errors.engineNumber = 'Engine number is required';
    if (!formData.capacity.trim()) errors.capacity = 'Capacity is required';
    if (!formData.gvwr.trim()) errors.gvwr = 'GVWR is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ============================================================
  // EVENT HANDLERS
  // ============================================================
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => {
        delete prev[name];
        return prev;
      });
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert('Please fill all required fields correctly');
      return;
    }

    const payload = {
      vehicle_number: formData.vehicleNumber,
      make: formData.vehicleType,
      model: formData.modelName,
      capacity: formData.capacity,
      driver: formData.ownerName || null,
      status: 'Available'
    };

    try {
      await axios.post('http://127.0.0.1:8000/api/vehicles/', payload);
      fetchVehicles();
      
      setFormData({
        vehicleNumber: '',
        vehicleType: 'Truck',
        ownerName: '',
        ownerPhone: '',
        modelName: '',
        manufacturingYear: '',
        chassisNumber: '',
        engineNumber: '',
        insuranceProvider: '',
        insuranceExpiry: '',
        pollutionExpiry: '',
        fitnessExpiry: '',
        roadTaxExpiry: '',
        capacity: '',
        gvwr: '',
        currentMileage: '',
        lastServiceDate: '',
        gps_trackerNumber: '',
        totalTrips: '',
        totalEarnings: '',
      });
      setFormErrors({});
      setShowAddModal(false);
      alert('Vehicle added successfully!');
    } catch (err) {
      console.error(err);
      alert('Error adding vehicle');
    }
  };

  const handleViewDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDetailsModal(true);
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (window.confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/vehicles/${vehicleId}/`);
        fetchVehicles();
        alert('Vehicle deleted successfully');
      } catch (err) {
        console.error(err);
        alert('Error deleting vehicle');
      }
    }
  };

  const handleUpdateStatus = async (vehicleId, newStatus) => {
    try {
      await axios.patch(`http://127.0.0.1:8000/api/vehicles/${vehicleId}/`, { status: newStatus });
      fetchVehicles();
      alert(`Vehicle status updated to ${newStatus}`);
    } catch (err) {
      console.error(err);
      alert('Error updating status');
    }
  };

  // ============================================================
  // FILTERING LOGIC
  // ============================================================
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      String(vehicle.vehicleNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(vehicle.model || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(vehicle.owner || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || vehicle.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================
  const getDocumentStatusBadge = (status) => {
    switch (status) {
      case 'valid':
        return 'bg-green-100 text-green-800';
      case 'expiring_soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getDocumentStatusText = (status) => {
    switch (status) {
      case 'valid':
        return 'Valid';
      case 'expiring_soon':
        return 'Expiring Soon';
      case 'critical':
        return 'Critical';
      case 'expired':
        return 'Expired';
      default:
        return 'Unknown';
    }
  };

  // ============================================================
  // RENDER: STATISTICS CARDS
  // ============================================================
  const renderStatisticsCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-all border border-slate-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-500 text-sm font-medium">Total Vehicles</p>
            <p className="text-slate-900 text-2xl font-bold mt-1">{statistics.total}</p>
          </div>
          <div className="p-3 rounded-lg bg-blue-500/10">
            <span className="material-symbols-outlined text-[22px] text-blue-500">local_shipping</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-all border border-slate-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-500 text-sm font-medium">Active</p>
            <p className="text-slate-900 text-2xl font-bold mt-1">{statistics.active}</p>
          </div>
          <div className="p-3 rounded-lg bg-green-500/10">
            <span className="material-symbols-outlined text-[22px] text-green-500">check_circle</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-all border border-slate-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-500 text-sm font-medium">Maintenance</p>
            <p className="text-slate-900 text-2xl font-bold mt-1">{statistics.maintenance}</p>
          </div>
          <div className="p-3 rounded-lg bg-yellow-500/10">
            <span className="material-symbols-outlined text-[22px] text-yellow-500">build</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-all border border-slate-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-500 text-sm font-medium">Doc Expiring</p>
            <p className="text-slate-900 text-2xl font-bold mt-1">{statistics.documentsExpiring}</p>
          </div>
          <div className="p-3 rounded-lg bg-red-500/10">
            <span className="material-symbols-outlined text-[22px] text-red-500">warning</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-all border border-slate-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-500 text-sm font-medium">Total Capacity</p>
            <p className="text-slate-900 text-2xl font-bold mt-1">{statistics.totalCapacity}</p>
          </div>
          <div className="p-3 rounded-lg bg-purple-500/10">
            <span className="material-symbols-outlined text-[22px] text-purple-500">scale</span>
          </div>
        </div>
      </div>
    </div>
  );

  // ============================================================
  // RENDER: ADD VEHICLE MODAL
  // ============================================================
  const renderAddModal = () => (
    <>
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl my-8 w-full max-w-4xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Add New Vehicle</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddVehicle} className="p-6 space-y-6 max-h-96 overflow-y-auto">
              {/* Basic Information */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Vehicle Number *</label>
                    <input
                      type="text"
                      name="vehicleNumber"
                      value={formData.vehicleNumber}
                      onChange={handleFormChange}
                      placeholder="e.g., MH12AB3456"
                      className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                        formErrors.vehicleNumber ? 'border-red-500' : 'border-slate-200'
                      }`}
                    />
                    {formErrors.vehicleNumber && <p className="text-red-500 text-xs mt-1">{formErrors.vehicleNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Vehicle Type</label>
                    <select
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option>Truck</option>
                      <option>Tempo</option>
                      <option>Auto</option>
                      <option>Tanker</option>
                      <option>Flatbed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Manufacturing Year *</label>
                    <input
                      type="number"
                      name="manufacturingYear"
                      value={formData.manufacturingYear}
                      onChange={handleFormChange}
                      placeholder="e.g., 2020"
                      className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                        formErrors.manufacturingYear ? 'border-red-500' : 'border-slate-200'
                      }`}
                    />
                    {formErrors.manufacturingYear && <p className="text-red-500 text-xs mt-1">{formErrors.manufacturingYear}</p>}
                  </div>
                </div>
              </div>

              {/* Owner Information */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Owner Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Driver (Optional)</label>
                    <select
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleFormChange}
                      className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                        formErrors.ownerName ? 'border-red-500' : 'border-slate-200'
                      }`}
                    >
                      <option value="">Select Driver</option>
                      {drivers.slice(0, 100).map(d => (
                        <option key={d.driver_id} value={d.driver_id}>{d.name || `Driver ${d.driver_id}`}</option>
                      ))}
                    </select>
                    {formErrors.ownerName && <p className="text-red-500 text-xs mt-1">{formErrors.ownerName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Owner Phone</label>
                    <input
                      type="tel"
                      name="ownerPhone"
                      value={formData.ownerPhone}
                      onChange={handleFormChange}
                      placeholder="e.g., 9876543210"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Specifications */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Vehicle Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Model Name *</label>
                    <input
                      type="text"
                      name="modelName"
                      value={formData.modelName}
                      onChange={handleFormChange}
                      placeholder="e.g., Tata 2523"
                      className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                        formErrors.modelName ? 'border-red-500' : 'border-slate-200'
                      }`}
                    />
                    {formErrors.modelName && <p className="text-red-500 text-xs mt-1">{formErrors.modelName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Chassis Number *</label>
                    <input
                      type="text"
                      name="chassisNumber"
                      value={formData.chassisNumber}
                      onChange={handleFormChange}
                      placeholder="e.g., TATA1234567890"
                      className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                        formErrors.chassisNumber ? 'border-red-500' : 'border-slate-200'
                      }`}
                    />
                    {formErrors.chassisNumber && <p className="text-red-500 text-xs mt-1">{formErrors.chassisNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Engine Number *</label>
                    <input
                      type="text"
                      name="engineNumber"
                      value={formData.engineNumber}
                      onChange={handleFormChange}
                      placeholder="e.g., 5D12XYZ"
                      className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                        formErrors.engineNumber ? 'border-red-500' : 'border-slate-200'
                      }`}
                    />
                    {formErrors.engineNumber && <p className="text-red-500 text-xs mt-1">{formErrors.engineNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Capacity *</label>
                    <input
                      type="text"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleFormChange}
                      placeholder="e.g., 25 MT"
                      className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                        formErrors.capacity ? 'border-red-500' : 'border-slate-200'
                      }`}
                    />
                    {formErrors.capacity && <p className="text-red-500 text-xs mt-1">{formErrors.capacity}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">GVWR *</label>
                    <input
                      type="text"
                      name="gvwr"
                      value={formData.gvwr}
                      onChange={handleFormChange}
                      placeholder="e.g., 2300 kg"
                      className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                        formErrors.gvwr ? 'border-red-500' : 'border-slate-200'
                      }`}
                    />
                    {formErrors.gvwr && <p className="text-red-500 text-xs mt-1">{formErrors.gvwr}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Current Mileage</label>
                    <input
                      type="text"
                      name="currentMileage"
                      value={formData.currentMileage}
                      onChange={handleFormChange}
                      placeholder="e.g., 45000 km"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Document Information */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Document Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Insurance Provider</label>
                    <input
                      type="text"
                      name="insuranceProvider"
                      value={formData.insuranceProvider}
                      onChange={handleFormChange}
                      placeholder="e.g., ICICI General"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Insurance Expiry</label>
                    <input
                      type="date"
                      name="insuranceExpiry"
                      value={formData.insuranceExpiry}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Pollution Certificate Expiry</label>
                    <input
                      type="date"
                      name="pollutionExpiry"
                      value={formData.pollutionExpiry}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Fitness Certificate Expiry</label>
                    <input
                      type="date"
                      name="fitnessExpiry"
                      value={formData.fitnessExpiry}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Road Tax Expiry</label>
                    <input
                      type="date"
                      name="roadTaxExpiry"
                      value={formData.roadTaxExpiry}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Last Service Date</label>
                    <input
                      type="date"
                      name="lastServiceDate"
                      value={formData.lastServiceDate}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Additional Information</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">GPS Tracker Number</label>
                  <input
                    type="text"
                    name="gps_trackerNumber"
                    value={formData.gps_trackerNumber}
                    onChange={handleFormChange}
                    placeholder="e.g., GPS-12345"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddVehicle}
                className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition"
              >
                Add Vehicle
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // ============================================================
  // RENDER: VEHICLE DETAILS MODAL
  // ============================================================
  const renderDetailsModal = () => (
    <>
      {showDetailsModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl my-8 w-full max-w-3xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-indigo-50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Vehicle Details</h2>
                <p className="text-sm text-slate-600">{selectedVehicle.vehicleNumber}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${selectedVehicle.statusColor}`}>
                  {selectedVehicle.status}
                </span>
                <div className="text-right">
                  <p className="text-sm text-slate-600">Total Trips</p>
                  <p className="text-2xl font-bold text-slate-900">{selectedVehicle.totalTrips}</p>
                </div>
              </div>

              {/* Basic Information */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="font-semibold text-slate-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-xs text-slate-600">Vehicle Type</p>
                    <p className="text-lg font-semibold text-slate-900">{selectedVehicle.vehicleType}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-xs text-slate-600">Model</p>
                    <p className="text-lg font-semibold text-slate-900">{selectedVehicle.model}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-xs text-slate-600">Manufacturing Year</p>
                    <p className="text-lg font-semibold text-slate-900">{selectedVehicle.year}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-xs text-slate-600">Owner</p>
                    <p className="text-lg font-semibold text-slate-900">{selectedVehicle.owner}</p>
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="font-semibold text-slate-900 mb-4">Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-xs text-slate-600">Capacity</p>
                    <p className="text-lg font-semibold text-slate-900">{selectedVehicle.capacity}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-xs text-slate-600">GVWR</p>
                    <p className="text-lg font-semibold text-slate-900">{selectedVehicle.gvwr}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-xs text-slate-600">Current Mileage</p>
                    <p className="text-lg font-semibold text-slate-900">{selectedVehicle.mileage}</p>
                  </div>
                </div>
              </div>

              {/* Service Information */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="font-semibold text-slate-900 mb-4">Service Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-600">Last Service Date</p>
                    <p className="text-sm font-semibold text-slate-900">{selectedVehicle.lastService}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Next Service Due</p>
                    <p className="text-sm font-semibold text-slate-900">{selectedVehicle.nextServiceDue}</p>
                  </div>
                </div>
              </div>

              {/* Documents Status */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="font-semibold text-slate-900 mb-4">Document Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">Insurance</p>
                      <p className="text-xs text-slate-600">{selectedVehicle.insurance.expiryDate}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDocumentStatusBadge(selectedVehicle.documentsStatus.insurance)}`}>
                        {getDocumentStatusText(selectedVehicle.documentsStatus.insurance)}
                      </span>
                      <p className="text-sm font-semibold text-slate-900 mt-1">{selectedVehicle.insurance.daysLeft} days</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">Pollution Certificate</p>
                      <p className="text-xs text-slate-600">{selectedVehicle.pollution.expiryDate}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDocumentStatusBadge(selectedVehicle.documentsStatus.pollution)}`}>
                        {getDocumentStatusText(selectedVehicle.documentsStatus.pollution)}
                      </span>
                      <p className="text-sm font-semibold text-slate-900 mt-1">{selectedVehicle.pollution.daysLeft} days</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">Fitness Certificate</p>
                      <p className="text-xs text-slate-600">{selectedVehicle.fitness.expiryDate}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDocumentStatusBadge(selectedVehicle.documentsStatus.fitness)}`}>
                        {getDocumentStatusText(selectedVehicle.documentsStatus.fitness)}
                      </span>
                      <p className="text-sm font-semibold text-slate-900 mt-1">{selectedVehicle.fitness.daysLeft} days</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">Road Tax</p>
                      <p className="text-xs text-slate-600">{selectedVehicle.roadTax.expiryDate}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDocumentStatusBadge(selectedVehicle.documentsStatus.roadTax)}`}>
                        {getDocumentStatusText(selectedVehicle.documentsStatus.roadTax)}
                      </span>
                      <p className="text-sm font-semibold text-slate-900 mt-1">{selectedVehicle.roadTax.daysLeft} days</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="font-semibold text-slate-900 mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-xs text-slate-600">Total Trips</p>
                    <p className="text-2xl font-bold text-slate-900">{selectedVehicle.totalTrips}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-xs text-slate-600">Total Earnings</p>
                    <p className="text-2xl font-bold text-slate-900">{selectedVehicle.totalEarnings}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between gap-3 p-6 border-t border-slate-200 bg-slate-50 flex-wrap">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleUpdateStatus(selectedVehicle.id, e.target.value);
                    setShowDetailsModal(false);
                  }
                }}
                className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">Update Status</option>
                <option value="Active">Active</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Inactive">Inactive</option>
              </select>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    handleDeleteVehicle(selectedVehicle.id);
                    setShowDetailsModal(false);
                  }}
                  className="px-4 py-2 rounded-lg border border-red-500 text-red-600 font-medium hover:bg-red-50 transition"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // ============================================================
  // RENDER: VEHICLES LIST TABLE
  // ============================================================
  const renderVehiclesList = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Table Header with Search & Filter */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="flex-1">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-[20px]">search</span>
              <input
                type="text"
                placeholder="Search by vehicle number, model, owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-slate-700">Vehicle Number</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-700">Type</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-700">Model</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-700">Capacity</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-700">Trips</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-700">Earnings</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-700">Doc Status</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-700">Status</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.length > 0 ? (
              filteredVehicles.slice((currentPage - 1) * 10, currentPage * 10).map((vehicle, index) => (
                <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="px-6 py-4 text-sm font-semibold text-indigo-600 cursor-pointer hover:underline">{vehicle.vehicleNumber}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{vehicle.vehicleType}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{vehicle.model}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{vehicle.capacity}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">{vehicle.totalTrips}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-green-600">{vehicle.totalEarnings}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(vehicle.documentsStatus).map(([doc, status]) => (
                        <span key={doc} className={`px-2 py-1 rounded text-xs font-medium ${getDocumentStatusBadge(status)}`} title={doc}>
                          {doc.charAt(0).toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${vehicle.statusColor}`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(vehicle)}
                        className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 transition"
                        title="View Details"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                      <button
                        onClick={() => handleDeleteVehicle(vehicle.id)}
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
                  <span className="material-symbols-outlined text-4xl mx-auto block mb-2 text-slate-400">local_shipping</span>
                  No vehicles found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Footer */}
      <div className="flex justify-between items-center mt-4 p-4 border-t border-slate-200">
        <span className="text-sm text-slate-500">
          Showing {Math.min(filteredVehicles.length, (currentPage - 1) * 10 + 1)} to {Math.min(filteredVehicles.length, currentPage * 10)} of {filteredVehicles.length} vehicles
        </span>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button className="px-3 py-1 text-sm font-medium bg-indigo-600 text-white rounded-lg">
            {currentPage}
          </button>
          <button 
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage * 10 >= filteredVehicles.length}
            className="px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <main className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Vehicle Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track and manage all vehicles with document expiry alerts
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Add Vehicle
        </button>
      </div>

      {/* Statistics Cards */}
      {renderStatisticsCards()}

      {/* Vehicles List */}
      {renderVehiclesList()}

      {/* Modals */}
      {renderAddModal()}
      {renderDetailsModal()}
    </main>
  );
};

export default VehicleManagement;

