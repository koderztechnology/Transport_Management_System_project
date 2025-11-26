  import { useState } from 'react';

const VehicleManagement = () => {
  // ============================================================
  // STATE MANAGEMENT
  // ============================================================
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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
  // SAMPLE VEHICLES DATA
  // ============================================================
  const [vehicles, setVehicles] = useState([
    {
      id: 'VEH-001',
      vehicleNumber: 'MH12AB3456',
      vehicleType: 'Truck',
      owner: 'Shree Logistics',
      model: 'Tata 2523',
      year: 2020,
      capacity: '25 MT',
      gvwr: '2300 kg',
      mileage: '45,230 km',
      lastService: '2025-01-10',
      nextServiceDue: '2025-04-10',
      insurance: {
        provider: 'ICICI General Insurance',
        expiryDate: '2025-08-15',
        daysLeft: 210,
      },
      pollution: {
        expiryDate: '2025-06-20',
        daysLeft: 155,
      },
      fitness: {
        expiryDate: '2025-12-30',
        daysLeft: 347,
      },
      roadTax: {
        expiryDate: '2026-01-15',
        daysLeft: 362,
      },
      gps_tracker: 'GPS-12345',
      status: 'Active',
      statusColor: 'bg-green-100 text-green-800',
      totalTrips: 156,
      totalEarnings: '₹8,45,000',
      createdAt: '2020-06-15',
      documentsStatus: {
        insurance: 'valid',
        pollution: 'valid',
        fitness: 'valid',
        roadTax: 'valid',
      },
    },
    {
      id: 'VEH-002',
      vehicleNumber: 'GJ01CD7890',
      vehicleType: 'Truck',
      owner: 'Shree Logistics',
      model: 'Volvo FM 450',
      year: 2021,
      capacity: '20 MT',
      gvwr: '2500 kg',
      mileage: '38,450 km',
      lastService: '2025-01-05',
      nextServiceDue: '2025-04-05',
      insurance: {
        provider: 'Bajaj Allianz',
        expiryDate: '2025-05-20',
        daysLeft: 123,
      },
      pollution: {
        expiryDate: '2025-03-15',
        daysLeft: 57,
      },
      fitness: {
        expiryDate: '2025-11-10',
        daysLeft: 297,
      },
      roadTax: {
        expiryDate: '2026-02-28',
        daysLeft: 402,
      },
      gps_tracker: 'GPS-12346',
      status: 'Active',
      statusColor: 'bg-green-100 text-green-800',
      totalTrips: 143,
      totalEarnings: '₹7,82,000',
      createdAt: '2021-03-20',
      documentsStatus: {
        insurance: 'valid',
        pollution: 'expiring_soon',
        fitness: 'valid',
        roadTax: 'valid',
      },
    },
    {
      id: 'VEH-003',
      vehicleNumber: 'DL08EF1234',
      vehicleType: 'Truck',
      owner: 'Shree Logistics',
      model: 'Ashok Leyland 1618',
      year: 2019,
      capacity: '18 MT',
      gvwr: '1800 kg',
      mileage: '68,900 km',
      lastService: '2024-12-20',
      nextServiceDue: '2025-03-20',
      insurance: {
        provider: 'United India Insurance',
        expiryDate: '2025-04-10',
        daysLeft: 83,
      },
      pollution: {
        expiryDate: '2025-02-15',
        daysLeft: 29,
      },
      fitness: {
        expiryDate: '2025-09-05',
        daysLeft: 231,
      },
      roadTax: {
        expiryDate: '2026-03-10',
        daysLeft: 451,
      },
      gps_tracker: 'GPS-12347',
      status: 'Active',
      statusColor: 'bg-green-100 text-green-800',
      totalTrips: 187,
      totalEarnings: '₹9,23,000',
      createdAt: '2019-05-10',
      documentsStatus: {
        insurance: 'expiring_soon',
        pollution: 'expiring_soon',
        fitness: 'valid',
        roadTax: 'valid',
      },
    },
    {
      id: 'VEH-004',
      vehicleNumber: 'MH14GH5678',
      vehicleType: 'Truck',
      owner: 'Shree Logistics',
      model: 'Hino 700 Series',
      year: 2022,
      capacity: '22 MT',
      gvwr: '2200 kg',
      mileage: '32,100 km',
      lastService: '2025-01-15',
      nextServiceDue: '2025-04-15',
      insurance: {
        provider: 'HDFC Ergo',
        expiryDate: '2025-07-20',
        daysLeft: 185,
      },
      pollution: {
        expiryDate: '2025-07-10',
        daysLeft: 175,
      },
      fitness: {
        expiryDate: '2026-01-20',
        daysLeft: 363,
      },
      roadTax: {
        expiryDate: '2026-04-30',
        daysLeft: 502,
      },
      gps_tracker: 'GPS-12348',
      status: 'Active',
      statusColor: 'bg-green-100 text-green-800',
      totalTrips: 98,
      totalEarnings: '₹5,67,000',
      createdAt: '2022-04-12',
      documentsStatus: {
        insurance: 'valid',
        pollution: 'valid',
        fitness: 'valid',
        roadTax: 'valid',
      },
    },
    {
      id: 'VEH-005',
      vehicleNumber: 'KA01IJ9012',
      vehicleType: 'Truck',
      owner: 'Shree Logistics',
      model: 'MAN TGX 470',
      year: 2021,
      capacity: '25 MT',
      gvwr: '2400 kg',
      mileage: '41,600 km',
      lastService: '2024-11-15',
      nextServiceDue: '2025-02-15',
      insurance: {
        provider: 'Reliance Insurance',
        expiryDate: '2025-02-20',
        daysLeft: 34,
      },
      pollution: {
        expiryDate: '2025-01-25',
        daysLeft: 8,
      },
      fitness: {
        expiryDate: '2025-08-15',
        daysLeft: 210,
      },
      roadTax: {
        expiryDate: '2025-12-31',
        daysLeft: 348,
      },
      gps_tracker: 'GPS-12349',
      status: 'Maintenance',
      statusColor: 'bg-yellow-100 text-yellow-800',
      totalTrips: 125,
      totalEarnings: '₹6,78,000',
      createdAt: '2021-08-22',
      documentsStatus: {
        insurance: 'expiring_soon',
        pollution: 'critical',
        fitness: 'valid',
        roadTax: 'valid',
      },
    },
  ]);

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

  const handleAddVehicle = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Please fill all required fields correctly');
      return;
    }

    const newVehicle = {
      id: `VEH-${String(vehicles.length + 1).padStart(3, '0')}`,
      vehicleNumber: formData.vehicleNumber,
      vehicleType: formData.vehicleType,
      owner: formData.ownerName,
      model: formData.modelName,
      year: parseInt(formData.manufacturingYear),
      capacity: formData.capacity,
      gvwr: formData.gvwr,
      mileage: formData.currentMileage || '0 km',
      lastService: formData.lastServiceDate || 'N/A',
      nextServiceDue: 'Pending',
      insurance: {
        provider: formData.insuranceProvider || 'Not Provided',
        expiryDate: formData.insuranceExpiry || 'Not Provided',
        daysLeft: formData.insuranceExpiry ? Math.ceil((new Date(formData.insuranceExpiry) - new Date()) / (1000 * 60 * 60 * 24)) : 0,
      },
      pollution: {
        expiryDate: formData.pollutionExpiry || 'Not Provided',
        daysLeft: formData.pollutionExpiry ? Math.ceil((new Date(formData.pollutionExpiry) - new Date()) / (1000 * 60 * 60 * 24)) : 0,
      },
      fitness: {
        expiryDate: formData.fitnessExpiry || 'Not Provided',
        daysLeft: formData.fitnessExpiry ? Math.ceil((new Date(formData.fitnessExpiry) - new Date()) / (1000 * 60 * 60 * 24)) : 0,
      },
      roadTax: {
        expiryDate: formData.roadTaxExpiry || 'Not Provided',
        daysLeft: formData.roadTaxExpiry ? Math.ceil((new Date(formData.roadTaxExpiry) - new Date()) / (1000 * 60 * 60 * 24)) : 0,
      },
      gps_tracker: formData.gps_trackerNumber || 'Not Assigned',
      status: 'Active',
      statusColor: 'bg-green-100 text-green-800',
      totalTrips: 0,
      totalEarnings: '₹0',
      createdAt: new Date().toISOString().split('T')[0],
      documentsStatus: {
        insurance: 'valid',
        pollution: 'valid',
        fitness: 'valid',
        roadTax: 'valid',
      },
    };

    setVehicles(prev => [newVehicle, ...prev]);
    
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
  };

  const handleViewDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDetailsModal(true);
  };

  const handleDeleteVehicle = (vehicleId) => {
    if (window.confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
      setVehicles(prev => prev.filter(v => v.id !== vehicleId));
      alert('Vehicle deleted successfully');
    }
  };

  const handleUpdateStatus = (vehicleId, newStatus) => {
    setVehicles(prev => prev.map(v => 
      v.id === vehicleId
        ? {
          ...v,
          status: newStatus,
          statusColor: newStatus === 'Active' 
            ? 'bg-green-100 text-green-800'
            : newStatus === 'Maintenance'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800',
        }
        : v
    ));
    alert(`Vehicle status updated to ${newStatus}`);
  };

  // ============================================================
  // FILTERING LOGIC
  // ============================================================
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.vehicleNumber.includes(searchQuery) ||
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.owner.toLowerCase().includes(searchQuery.toLowerCase());

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
                    <label className="block text-sm font-medium text-slate-700 mb-2">Owner Name *</label>
                    <input
                      type="text"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleFormChange}
                      placeholder="e.g., Shree Logistics"
                      className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                        formErrors.ownerName ? 'border-red-500' : 'border-slate-200'
                      }`}
                    />
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
              filteredVehicles.map((vehicle, index) => (
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

