import { useState, useEffect } from 'react';
import api from '../utils/api';

const EWayBillManagement = () => {
  // ============================================================
  // STATE MANAGEMENT
  // ============================================================
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Form data for generating new e-way bill
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    lrNumber: '',
    supplierName: '',
    supplierGSTIN: '',
    buyerName: '',
    buyerGSTIN: '',
    goodsDescription: '',
    hsn_code: '',
    invoiceAmount: '',
    vehicleNumber: '',
    routeFrom: '',
    routeTo: '',
    estimatedDays: '',
    driverName: '',
    driverPhone: '',
  });

  const [formErrors, setFormErrors] = useState({});

  // ============================================================
  // SAMPLE E-WAY BILLS DATA
  // ============================================================
  const [ewayBills, setEwayBills] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [lrBills, setLrBills] = useState([]);

  useEffect(() => {
    fetchEWayBills();
    fetchRelatedData();
  }, []);

  const fetchRelatedData = async () => {
    try {
      const [vRes, dRes, lRes] = await Promise.all([
        api.get("/vehicles/"),
        api.get("/drivers/"),
        api.get("/lr-bilty/")
      ]);
      setVehicles(vRes.data || []);
      setDrivers(dRes.data || []);
      setLrBills(lRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEWayBills = async () => {
    try {
      const res = await api.get('/eway-bills/');
      const mapped = res.data.map(b => {
        const issueDate = b.added_date ? b.added_date.split('T')[0] : new Date().toISOString().split('T')[0];
        const issueTime = new Date(issueDate).getTime();
        const estDays = b.estimated_days || 30;
        const expiryTime = issueTime + (estDays * 86400000);
        const daysLeft = Math.ceil((expiryTime - Date.now()) / 86400000);

        return {
          id: b.eway_id,
          ewaybillNumber: `1234567890${String(b.eway_id).padStart(4, '0')}`,
          qrCode: `QR-${b.eway_id}`,
          invoiceNumber: b.invoice_number || '',
          lrNumber: b.lr || '',
          supplier: b.supplier_name || '',
          supplierGSTIN: b.supplier_gstin || '',
          buyer: b.buyer_name || '',
          buyerGSTIN: b.buyer_gstin || '',
          goods: b.goods_description || '',
          hsn: b.hsn_code || '',
          amount: b.invoice_amount ? `₹${b.invoice_amount}` : '₹0',
          vehicle: b.vehicle || '',
          route: `${b.route_from || ''} → ${b.route_to || ''}`,
          driver: b.driver || '',
          driverPhone: b.driver_phone || '',
          issueDate: issueDate,
          expiryDate: new Date(expiryTime).toISOString().split('T')[0],
          validDays: estDays,
          daysLeft: daysLeft,
          status: b.status || 'Active',
          statusColor: b.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800',
          createdAt: b.added_date ? new Date(b.added_date).toLocaleString() : '',
        };
      });
      setEwayBills(mapped);
    } catch (err) {
      console.error(err);
    }
  };

  // ============================================================
  // STATISTICS
  // ============================================================
  const statistics = {
    total: ewayBills.length,
    active: ewayBills.filter(b => b.status === 'Active').length,
    expiringSoon: ewayBills.filter(b => b.status === 'Expiring Soon').length,
    expired: ewayBills.filter(b => b.status === 'Expired').length,
    totalValue: '₹24,60,000',
  };

  // ============================================================
  // VALIDATION FUNCTIONS
  // ============================================================
  const validateForm = () => {
    const errors = {};
    const invoiceAmountValue = Number(formData.invoiceAmount);
    const estimatedDaysValue = Number(formData.estimatedDays);
    const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

    if (!formData.invoiceNumber.trim()) errors.invoiceNumber = 'Invoice number is required';
    if (!String(formData.lrNumber).trim()) errors.lrNumber = 'LR number is required';
    if (!formData.supplierName.trim()) errors.supplierName = 'Supplier name is required';
    if (!formData.supplierGSTIN.trim()) {
      errors.supplierGSTIN = 'Supplier GSTIN is required';
    } else if (!gstinPattern.test(formData.supplierGSTIN.trim().toUpperCase())) {
      errors.supplierGSTIN = 'Enter a valid GSTIN';
    }
    if (!formData.buyerName.trim()) errors.buyerName = 'Buyer name is required';
    if (!formData.buyerGSTIN.trim()) {
      errors.buyerGSTIN = 'Buyer GSTIN is required';
    } else if (!gstinPattern.test(formData.buyerGSTIN.trim().toUpperCase())) {
      errors.buyerGSTIN = 'Enter a valid GSTIN';
    }
    if (!formData.goodsDescription.trim()) errors.goodsDescription = 'Goods description is required';
    if (!formData.hsn_code.trim()) errors.hsn_code = 'HSN code is required';
    if (!formData.invoiceAmount.trim() || !Number.isFinite(invoiceAmountValue) || invoiceAmountValue <= 0) {
      errors.invoiceAmount = 'Invoice amount must be a positive number';
    }
    if (!String(formData.vehicleNumber).trim()) errors.vehicleNumber = 'Vehicle number is required';
    if (!formData.routeFrom.trim()) errors.routeFrom = 'Route From is required';
    if (!formData.routeTo.trim()) errors.routeTo = 'Route To is required';
    if (!String(formData.driverName).trim()) errors.driverName = 'Driver name is required';
    if (formData.estimatedDays && (!Number.isFinite(estimatedDaysValue) || estimatedDaysValue <= 0 || !Number.isInteger(estimatedDaysValue))) {
      errors.estimatedDays = 'Estimated days must be a whole number greater than 0';
    }

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

  const handleGenerateBill = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert('Please fill all required fields correctly');
      return;
    }

    const payload = {
      invoice_number: formData.invoiceNumber,
      lr: formData.lrNumber || null,
      supplier_name: formData.supplierName,
      supplier_gstin: formData.supplierGSTIN,
      buyer_name: formData.buyerName,
      buyer_gstin: formData.buyerGSTIN,
      goods_description: formData.goodsDescription,
      hsn_code: formData.hsn_code,
      invoice_amount: formData.invoiceAmount,
      vehicle: formData.vehicleNumber || null,
      route_from: formData.routeFrom,
      route_to: formData.routeTo,
      estimated_days: parseInt(formData.estimatedDays) || 30,
      driver: formData.driverName || null,
      driver_phone: formData.driverPhone,
      status: 'Active',
    };

    try {
      await api.post('/eway-bills/', payload);
      fetchEWayBills();
      
      setFormData({
        invoiceNumber: '',
        lrNumber: '',
        supplierName: '',
        supplierGSTIN: '',
        buyerName: '',
        buyerGSTIN: '',
        goodsDescription: '',
        hsn_code: '',
        invoiceAmount: '',
        vehicleNumber: '',
        routeFrom: '',
        routeTo: '',
        estimatedDays: '',
        driverName: '',
        driverPhone: '',
      });
      setFormErrors({});
      setShowGenerateModal(false);
      alert('E-Way Bill generated successfully!');
    } catch (err) {
      console.error(err);
      alert('Error generating E-Way Bill');
    }
  };

  const handleViewDetails = (bill) => {
    setSelectedBill(bill);
    setShowDetailsModal(true);
  };

  const handleCancelBill = async (billId) => {
    if (window.confirm('Are you sure you want to cancel this E-Way Bill? This action cannot be undone.')) {
      try {
        await api.patch(`/eway-bills/${billId}/`, { status: 'Cancelled' });
        fetchEWayBills();
        alert('E-Way Bill cancelled successfully');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleExtendBill = async (billId) => {
    const bill = ewayBills.find(b => b.id === billId);
    if (bill && bill.daysLeft < 1) {
      if (window.confirm(`Extend this E-Way Bill for 30 more days?`)) {
        try {
          await api.patch(`/eway-bills/${billId}/`, { status: 'Active', estimated_days: bill.validDays + 30 });
          fetchEWayBills();
          alert('E-Way Bill extended successfully');
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  const handleDownloadQR = (bill) => {
    alert(`Downloading QR Code for ${bill.id}\nQR Code: ${bill.qrCode}`);
  };

  const handleDownloadPDF = (bill) => {
    alert(`Downloading PDF for E-Way Bill: ${bill.ewaybillNumber}`);
  };

  const getVehicleNumber = (vId) => {
    const found = vehicles.find(v => String(v.vehicle_id) === String(vId));
    return found ? found.vehicle_number : `Vehicle ${vId}`;
  };

  const getDriverName = (dId) => {
    const found = drivers.find(d => String(d.driver_id) === String(dId));
    return found ? found.name : `Driver ${dId}`;
  };

  // ============================================================
  // FILTERING LOGIC
  // ============================================================
  const filteredBills = ewayBills.filter(bill => {
    const vNum = getVehicleNumber(bill.vehicle);
    const dName = getDriverName(bill.driver);
    const matchesSearch = 
      String(bill.ewaybillNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(bill.invoiceNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(bill.supplier || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(bill.buyer || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(vNum).toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(dName).toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || bill.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // ============================================================
  // RENDER: STATISTICS CARDS
  // ============================================================
  const renderStatisticsCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <div className="rounded-xl p-5 bg-white shadow-sm hover:shadow-lg transition-all border border-slate-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-600 text-sm font-medium">Total Bills</p>
            <p className="text-slate-900 text-2xl font-bold mt-1">{statistics.total}</p>
          </div>
          <div className="p-3 rounded-lg bg-blue-500/10">
            <span className="material-symbols-outlined text-2xl text-blue-500">receipt_long</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl p-5 bg-white shadow-sm hover:shadow-lg transition-all border border-slate-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-600 text-sm font-medium">Active Bills</p>
            <p className="text-slate-900 text-2xl font-bold mt-1">{statistics.active}</p>
          </div>
          <div className="p-3 rounded-lg bg-green-500/10">
            <span className="material-symbols-outlined text-2xl text-green-500">check_circle</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl p-5 bg-white shadow-sm hover:shadow-lg transition-all border border-slate-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-600 text-sm font-medium">Expiring Soon</p>
            <p className="text-slate-900 text-2xl font-bold mt-1">{statistics.expiringSoon}</p>
          </div>
          <div className="p-3 rounded-lg bg-yellow-500/10">
            <span className="material-symbols-outlined text-2xl text-yellow-500">schedule</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl p-5 bg-white shadow-sm hover:shadow-lg transition-all border border-slate-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-600 text-sm font-medium">Expired</p>
            <p className="text-slate-900 text-2xl font-bold mt-1">{statistics.expired}</p>
          </div>
          <div className="p-3 rounded-lg bg-red-500/10">
            <span className="material-symbols-outlined text-2xl text-red-500">error</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl p-5 bg-white shadow-sm hover:shadow-lg transition-all border border-slate-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-600 text-sm font-medium">Total Value</p>
            <p className="text-slate-900 text-2xl font-bold mt-1">{statistics.totalValue}</p>
          </div>
          <div className="p-3 rounded-lg bg-purple-500/10">
            <span className="material-symbols-outlined text-2xl text-purple-500">currency_rupee</span>
          </div>
        </div>
      </div>
    </div>
  );

  // ============================================================
  // RENDER: GENERATE BILL MODAL
  // ============================================================
  const renderGenerateModal = () => (
    <>
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl my-8 w-full max-w-4xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Generate New E-Way Bill</h2>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleGenerateBill} className="p-6 space-y-6 max-h-96 overflow-y-auto">
              {/* Invoice & LR Section */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Invoice & LR Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Invoice Number *</label>
                    <input
                      type="text"
                      name="invoiceNumber"
                      value={formData.invoiceNumber}
                      onChange={handleFormChange}
                      placeholder="e.g., INV-2025-001"
                      className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary ${
                        formErrors.invoiceNumber ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {formErrors.invoiceNumber && <p className="text-red-500 text-xs mt-1">{formErrors.invoiceNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">LR Number *</label>
                    <select
                      name="lrNumber"
                      value={formData.lrNumber}
                      onChange={handleFormChange}
                      className={`w-full pl-4 pr-10 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary bg-white ${
                        formErrors.lrNumber ? 'border-red-500' : 'border-slate-300'
                      }`}
                    >
                      <option value="">Select LR</option>
                      {lrBills.map(lr => (
                        <option key={lr.lr_id} value={lr.lr_id}>{lr.lr_number || `LR ${lr.lr_id}`}</option>
                      ))}
                    </select>
                    {formErrors.lrNumber && <p className="text-red-500 text-xs mt-1">{formErrors.lrNumber}</p>}
                  </div>
                </div>
              </div>

              {/* Supplier Section */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Supplier Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Supplier Name *</label>
                    <input
                      type="text"
                      name="supplierName"
                      value={formData.supplierName}
                      onChange={handleFormChange}
                      placeholder="e.g., ABC Electricals"
                      className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary ${
                        formErrors.supplierName ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {formErrors.supplierName && <p className="text-red-500 text-xs mt-1">{formErrors.supplierName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Supplier GSTIN *</label>
                    <input
                      type="text"
                      name="supplierGSTIN"
                      value={formData.supplierGSTIN}
                      onChange={handleFormChange}
                      placeholder="e.g., 27AABCU9603R1Z5"
                      className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary ${
                        formErrors.supplierGSTIN ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {formErrors.supplierGSTIN && <p className="text-red-500 text-xs mt-1">{formErrors.supplierGSTIN}</p>}
                  </div>
                </div>
              </div>

              {/* Buyer Section */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Buyer Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Buyer Name *</label>
                    <input
                      type="text"
                      name="buyerName"
                      value={formData.buyerName}
                      onChange={handleFormChange}
                      placeholder="e.g., KSR Traders"
                      className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary ${
                        formErrors.buyerName ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {formErrors.buyerName && <p className="text-red-500 text-xs mt-1">{formErrors.buyerName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Buyer GSTIN *</label>
                    <input
                      type="text"
                      name="buyerGSTIN"
                      value={formData.buyerGSTIN}
                      onChange={handleFormChange}
                      placeholder="e.g., 36ABCDK1234H1Z0"
                      className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary ${
                        formErrors.buyerGSTIN ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {formErrors.buyerGSTIN && <p className="text-red-500 text-xs mt-1">{formErrors.buyerGSTIN}</p>}
                  </div>
                </div>
              </div>

              {/* Goods Section */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Goods Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Goods Description *</label>
                    <input
                      type="text"
                      name="goodsDescription"
                      value={formData.goodsDescription}
                      onChange={handleFormChange}
                      placeholder="e.g., Electrical Wire"
                      className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary ${
                        formErrors.goodsDescription ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {formErrors.goodsDescription && <p className="text-red-500 text-xs mt-1">{formErrors.goodsDescription}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">HSN Code *</label>
                    <input
                      type="text"
                      name="hsn_code"
                      value={formData.hsn_code}
                      onChange={handleFormChange}
                      placeholder="e.g., 7408"
                      className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary ${
                        formErrors.hsn_code ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {formErrors.hsn_code && <p className="text-red-500 text-xs mt-1">{formErrors.hsn_code}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Invoice Amount *</label>
                    <input
                      type="number"
                      name="invoiceAmount"
                      value={formData.invoiceAmount}
                      onChange={handleFormChange}
                      placeholder="e.g., 425000"
                      className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary ${
                        formErrors.invoiceAmount ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {formErrors.invoiceAmount && <p className="text-red-500 text-xs mt-1">{formErrors.invoiceAmount}</p>}
                  </div>
                </div>
              </div>

              {/* Transport Section */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Transport Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Vehicle *</label>
                    <select
                      name="vehicleNumber"
                      value={formData.vehicleNumber}
                      onChange={handleFormChange}
                      className={`w-full pl-4 pr-10 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary bg-white ${
                        formErrors.vehicleNumber ? 'border-red-500' : 'border-slate-300'
                      }`}
                    >
                      <option value="">Select Vehicle</option>
                      {vehicles.slice(0, 100).map(v => (
                        <option key={v.vehicle_id} value={v.vehicle_id}>{v.vehicle_number || `Vehicle ${v.vehicle_id}`}</option>
                      ))}
                    </select>
                    {formErrors.vehicleNumber && <p className="text-red-500 text-xs mt-1">{formErrors.vehicleNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Route From *</label>
                    <input
                      type="text"
                      name="routeFrom"
                      value={formData.routeFrom}
                      onChange={handleFormChange}
                      placeholder="e.g., Nagpur"
                      className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary ${
                        formErrors.routeFrom ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {formErrors.routeFrom && <p className="text-red-500 text-xs mt-1">{formErrors.routeFrom}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Route To *</label>
                    <input
                      type="text"
                      name="routeTo"
                      value={formData.routeTo}
                      onChange={handleFormChange}
                      placeholder="e.g., Hyderabad"
                      className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary ${
                        formErrors.routeTo ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {formErrors.routeTo && <p className="text-red-500 text-xs mt-1">{formErrors.routeTo}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Estimated Days</label>
                    <input
                      type="number"
                      name="estimatedDays"
                      value={formData.estimatedDays}
                      onChange={handleFormChange}
                      placeholder="e.g., 3"
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Driver Section */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Driver Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Driver Name *</label>
                    <select
                      name="driverName"
                      value={formData.driverName}
                      onChange={handleFormChange}
                      className={`w-full pl-4 pr-10 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary bg-white ${
                        formErrors.driverName ? 'border-red-500' : 'border-slate-300'
                      }`}
                    >
                      <option value="">Select Driver</option>
                      {drivers.slice(0, 100).map(d => (
                        <option key={d.driver_id} value={d.driver_id}>{d.name || `Driver ${d.driver_id}`}</option>
                      ))}
                    </select>
                    {formErrors.driverName && <p className="text-red-500 text-xs mt-1">{formErrors.driverName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Driver Phone</label>
                    <input
                      type="tel"
                      name="driverPhone"
                      value={formData.driverPhone}
                      onChange={handleFormChange}
                      placeholder="e.g., 9876543210"
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
              <button
                type="button"
                onClick={() => setShowGenerateModal(false)}
                className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateBill}
                className="px-6 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition"
              >
                Generate E-Way Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // ============================================================
  // RENDER: BILL DETAILS MODAL
  // ============================================================
  const renderDetailsModal = () => (
    <>
      {showDetailsModal && selectedBill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl my-8 w-full max-w-3xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-linear-to-r from-primary/5 to-accent-cyan/5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">E-Way Bill Details</h2>
                <p className="text-sm text-slate-600">Bill ID: {selectedBill.id}</p>
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
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${selectedBill.statusColor}`}>
                  {selectedBill.status}
                </span>
                <div className="text-right">
                  <p className="text-sm text-slate-600">Days Left</p>
                  <p className={`text-2xl font-bold ${selectedBill.daysLeft < 1 ? 'text-red-600' : selectedBill.daysLeft < 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {selectedBill.daysLeft}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h3 className="font-semibold text-slate-900 mb-4">E-Way Bill Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-xs text-slate-600">E-Way Bill Number</p>
                    <p className="text-lg font-semibold text-slate-900">{selectedBill.ewaybillNumber}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-xs text-slate-600">Issue Date</p>
                    <p className="text-lg font-semibold text-slate-900">{selectedBill.issueDate}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-xs text-slate-600">Expiry Date</p>
                    <p className="text-lg font-semibold text-slate-900">{selectedBill.expiryDate}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-xs text-slate-600">Valid for</p>
                    <p className="text-lg font-semibold text-slate-900">{selectedBill.validDays} Days</p>
                  </div>
                </div>
              </div>

              {/* Invoice & LR */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="font-semibold text-slate-900 mb-4">Invoice & LR</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-600">Invoice Number</p>
                    <p className="text-sm font-semibold text-slate-900">{selectedBill.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">LR Number</p>
                    <p className="text-sm font-semibold text-slate-900">{lrBills.find(lr => String(lr.lr_id) === String(selectedBill.lrNumber))?.lr_number || selectedBill.lrNumber}</p>
                  </div>
                </div>
              </div>

              {/* Supplier & Buyer */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="font-semibold text-slate-900 mb-4">Parties</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-xs text-slate-600">Supplier</p>
                    <p className="font-semibold text-slate-900">{selectedBill.supplier}</p>
                    <p className="text-xs text-slate-600 mt-2">GSTIN: {selectedBill.supplierGSTIN}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-xs text-slate-600">Buyer</p>
                    <p className="font-semibold text-slate-900">{selectedBill.buyer}</p>
                    <p className="text-xs text-slate-600 mt-2">GSTIN: {selectedBill.buyerGSTIN}</p>
                  </div>
                </div>
              </div>

              {/* Goods */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="font-semibold text-slate-900 mb-4">Goods Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-slate-600">Description</p>
                    <p className="text-sm font-semibold text-slate-900">{selectedBill.goods}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">HSN Code</p>
                    <p className="text-sm font-semibold text-slate-900">{selectedBill.hsn}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Invoice Amount</p>
                    <p className="text-sm font-semibold text-slate-900">{selectedBill.amount}</p>
                  </div>
                </div>
              </div>

              {/* Transport */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="font-semibold text-slate-900 mb-4">Transport Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-600">Vehicle Number</p>
                    <p className="text-sm font-semibold text-slate-900">{vehicles.find(v => String(v.vehicle_id) === String(selectedBill.vehicle))?.vehicle_number || selectedBill.vehicle}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Route</p>
                    <p className="text-sm font-semibold text-slate-900">{selectedBill.route}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Driver</p>
                    <p className="text-sm font-semibold text-slate-900">{drivers.find(d => String(d.driver_id) === String(selectedBill.driver))?.name || selectedBill.driver}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Driver Phone</p>
                    <p className="text-sm font-semibold text-slate-900">{selectedBill.driverPhone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between gap-3 p-6 border-t border-slate-200 bg-slate-50 flex-wrap">
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadQR(selectedBill)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition"
                >
                  <span className="material-symbols-outlined text-sm">qr_code</span>
                  QR Code
                </button>
                <button
                  onClick={() => handleDownloadPDF(selectedBill)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition"
                >
                  <span className="material-symbols-outlined text-sm">file_download</span>
                  PDF
                </button>
              </div>
              <div className="flex gap-2">
                {selectedBill.status === 'Active' && (
                  <>
                    <button
                      onClick={() => {
                        handleExtendBill(selectedBill.id);
                        setShowDetailsModal(false);
                      }}
                      className="px-4 py-2 rounded-lg border border-orange-500 text-orange-600 font-medium hover:bg-orange-50 transition"
                    >
                      Extend
                    </button>
                    <button
                      onClick={() => {
                        handleCancelBill(selectedBill.id);
                        setShowDetailsModal(false);
                      }}
                      className="px-4 py-2 rounded-lg border border-red-500 text-red-600 font-medium hover:bg-red-50 transition"
                    >
                      Cancel
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
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
  // RENDER: BILLS LIST TABLE
  // ============================================================
  const renderBillsList = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Table Header with Search & Filter */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between items-center w-full">
          <div className="flex-1 w-full relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">search</span>
            <input
              type="text"
              placeholder="Search by E-Way Bill number, invoice number, supplier, or buyer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 h-11 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-slate-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            )}
          </div>
          <div className="flex gap-2 w-full md:w-auto items-center">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 pr-10 py-2.5 h-11 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-slate-900"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Expiring Soon">Expiring Soon</option>
              <option value="Critical">Critical</option>
              <option value="Expired">Expired</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            {(filterStatus !== 'all' || searchQuery !== '') && (
              <button
                onClick={() => {
                  setFilterStatus('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2.5 h-11 text-sm text-red-600 hover:text-red-700 font-semibold border border-red-200 rounded-lg bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-base">filter_alt_off</span>
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-slate-700">EWB Number</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-700">Supplier</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-700">Buyer</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-700">Amount</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-700">Vehicle</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-700">Days Left</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-700">Status</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBills.length > 0 ? (
              filteredBills.slice((currentPage - 1) * 10, currentPage * 10).map((bill, index) => (
                <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="px-6 py-4 text-sm font-semibold text-primary cursor-pointer hover:underline">{bill.ewaybillNumber}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{bill.supplier}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{bill.buyer}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">{bill.amount}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{vehicles.find(v => String(v.vehicle_id) === String(bill.vehicle))?.vehicle_number || bill.vehicle}</td>
                  <td className="px-6 py-4 text-sm font-semibold">
                    <span className={`${bill.daysLeft < 1 ? 'text-red-600' : bill.daysLeft < 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {bill.daysLeft}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${bill.statusColor}`}>
                      {bill.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(bill)}
                        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                        title="View Details"
                      >
                        <span className="material-symbols-outlined text-lg">visibility</span>
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(bill)}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                        title="Download PDF"
                      >
                        <span className="material-symbols-outlined text-lg">file_download</span>
                      </button>
                      {bill.status === 'Active' && (
                        <button
                          onClick={() => handleCancelBill(bill.id)}
                          className="p-2 rounded-lg text-orange-600 hover:bg-orange-50 transition"
                          title="Cancel Bill"
                        >
                          <span className="material-symbols-outlined text-lg">cancel</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-slate-600">
                  <span className="material-symbols-outlined text-4xl mx-auto block mb-2 text-slate-400">inbox</span>
                  No bills found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Footer */}
      <div className="flex justify-between items-center mt-4 p-4 border-t border-slate-200">
        <span className="text-sm text-slate-500">
          Showing {Math.min(filteredBills.length, (currentPage - 1) * 10 + 1)} to {Math.min(filteredBills.length, currentPage * 10)} of {filteredBills.length} bills
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
            disabled={currentPage * 10 >= filteredBills.length}
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
    <main className="flex-1 p-4 lg:p-6 xl:p-8 bg-background-light min-h-screen">
      {/* Page Header */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <h1 className="text-slate-900 text-2xl lg:text-3xl font-black leading-tight tracking-[-0.033em]">
            E-Way Bill Management
          </h1>
          <p className="text-slate-600 text-sm lg:text-base mt-1">
            Manage and track e-way bills for GST compliance
          </p>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <span className="material-symbols-outlined text-base">add_circle</span>
          Generate E-Way Bill
        </button>
      </div>

      {/* Statistics Cards */}
      {renderStatisticsCards()}

      {/* Bills List */}
      {renderBillsList()}

      {/* Modals */}
      {renderGenerateModal()}
      {renderDetailsModal()}
    </main>
  );
};

export default EWayBillManagement;

