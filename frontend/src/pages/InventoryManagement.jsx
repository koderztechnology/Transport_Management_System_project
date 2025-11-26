/* eslint-disable no-irregular-whitespace */
import { useState } from 'react';

const InventoryManagement = () => {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  
  // Main inventory data array
  const [stockItems, setStockItems] = useState([
    { id: 1, name: 'MRF Radial Tyres', category: 'Tyres', quantity: 45, unit: 'Nos', reorderLevel: 10 },
    { id: 2, name: 'Engine Oil 5W-30', category: 'Oils', quantity: 120, unit: 'Ltr', reorderLevel: 20 },
    { id: 3, name: 'Brake Pads Set', category: 'Spare Parts', quantity: 8, unit: 'Set', reorderLevel: 15 },
    { id: 4, name: 'Air Filter', category: 'Spare Parts', quantity: 28, unit: 'Nos', reorderLevel: 10 },
    { id: 5, name: 'Hydraulic Jack', category: 'Tools', quantity: 5, unit: 'Nos', reorderLevel: 8 },
    { id: 6, name: 'Transmission Fluid', category: 'Oils', quantity: 75, unit: 'Ltr', reorderLevel: 25 },
    { id: 7, name: 'Wiper Blades', category: 'Spare Parts', quantity: 32, unit: 'Set', reorderLevel: 12 },
    { id: 8, name: 'Tool Kit Premium', category: 'Tools', quantity: 15, unit: 'Set', reorderLevel: 5 },
  ]);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Modal/Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);

  // Form field states
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: '',
    reorderLevel: ''
  });

  // Form validation errors
  const [formErrors, setFormErrors] = useState({});

  // ========================================
  // COMPUTED VALUES
  // ========================================

  // Calculate summary card values dynamically
  const totalItemsInStock = stockItems.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = stockItems.filter(item => item.quantity <= item.reorderLevel).length;
  const itemsIssuedThisMonth = 156; // Mock data

  // Filter and search logic
  const filteredStockItems = stockItems.filter(item => {
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Determine stock status
  const getStockStatus = (item) => {
    if (item.quantity <= item.reorderLevel) {
      return {
        label: 'Low',
        class: 'bg-orange-100 text-orange-800'
      };
    }
    return {
      label: 'In Stock',
      class: 'bg-green-100 text-green-800'
    };
  };  // ========================================
  // FORM HANDLING FUNCTIONS
  // ========================================

  // Open modal for adding new item
  const handleAddItem = () => {
    setIsEditMode(false);
    setEditingItemId(null);
    setFormData({
      name: '', category: '', quantity: '', unit: '', reorderLevel: ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open modal for editing existing item
  const handleEditItem = (item) => {
    setIsEditMode(true);
    setEditingItemId(item.id);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity.toString(),
      unit: item.unit,
      reorderLevel: item.reorderLevel.toString()
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Close modal and reset form
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingItemId(null);
    setFormData({
      name: '', category: '', quantity: '', unit: '', reorderLevel: ''
    });
    setFormErrors({});
  };

  // Handle input changes in form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form fields
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Item name is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.quantity || formData.quantity <= 0) errors.quantity = 'Quantity must be greater than 0';
    if (!formData.unit.trim()) errors.unit = 'Unit is required';
    if (!formData.reorderLevel || formData.reorderLevel < 0) errors.reorderLevel = 'Reorder level must be 0 or greater';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit form (Add or Edit)
  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const itemData = {
      name: formData.name.trim(),
      category: formData.category,
      quantity: parseInt(formData.quantity),
      unit: formData.unit.trim(),
      reorderLevel: parseInt(formData.reorderLevel)
    };

    if (isEditMode) {
      setStockItems(prev => prev.map(item => 
        item.id === editingItemId 
          ? { ...item, ...itemData }
          : item
      ));
    } else {
      const newItem = {
        id: Math.max(...stockItems.map(i => i.id), 0) + 1, // Generate new ID
        ...itemData
      };
      setStockItems(prev => [...prev, newItem]);
    }
    handleCloseModal();
  };

  // ========================================
  // DELETE FUNCTIONALITY
  // ========================================

  const handleDeleteItem = (item) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.name}"?\n\nThis action cannot be undone.`
    );
    if (confirmed) {
      setStockItems(prev => prev.filter(i => i.id !== item.id));
    }
  };

  // ========================================
  // SAMPLE DATA FOR OTHER SECTIONS
  // ========================================

  const issueLog = [
    { id: 1, date: '2025-11-12', item: 'Engine Oil 5W-30', quantity: '10 Ltr', issuedTo: 'Rahul Kumar', vehicle: 'MH12AB3456' },
    { id: 2, date: '2025-11-11', item: 'Brake Pads Set', quantity: '2 Set', issuedTo: 'Suresh Patil', vehicle: 'GJ01CD7890' },
    { id: 3, date: '2025-11-10', item: 'Air Filter', quantity: '3 Nos', issuedTo: 'Workshop', vehicle: 'DL08EF1234' },
    { id: 4, date: '2025-11-09', item: 'MRF Radial Tyres', quantity: '4 Nos', issuedTo: 'Amit Sharma', vehicle: 'MH14GH5678' },
    { id: 5, date: '2025-11-08', item: 'Wiper Blades', quantity: '2 Set', issuedTo: 'Ravi Verma', vehicle: 'RJ09IJ3456' },
    { id: 6, date: '2025-11-07', item: 'Transmission Fluid', quantity: '8 Ltr', issuedTo: 'Workshop', vehicle: 'UP16KL7890' },
  ];

  // Calculate categories dynamically from stockItems
  const getCategoryData = () => {
    const categoryMap = {
      'Tyres': { icon: 'motion_photos_on' },
      'Oils': { icon: 'opacity' },
      'Spare Parts': { icon: 'settings' },
      'Tools': { icon: 'construction' },
      'Misc': { icon: 'category' }
    };

    return Object.keys(categoryMap).map(categoryName => {
      const itemsInCategory = stockItems.filter(item => item.category === categoryName);
      const totalItems = itemsInCategory.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        name: categoryName,
        totalItems: totalItems,
        icon: categoryMap[categoryName].icon
      };
    });
  };

  const categories = getCategoryData();

  // ========================================
  // RENDER COMPONENT
  // ========================================

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">        {/* Page Header -- MODIFIED */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
              <span>Home</span>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span>Inventory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Inventory Management
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage stock items, track inventory, and monitor usage
            </p>
          </div>
          {/* <-- MODIFIED: Action buttons moved here for a cleaner header --> */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
              <span className="material-symbols-outlined text-xl">download</span>
              <span className="font-medium text-sm">Download Report</span>
            </button>
            <button 
              onClick={handleAddItem}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">add</span>
          	  <span className="font-medium text-sm">Add Item</span>
          	</button>
          </div>
    	  </div>

    	  {/* Summary Cards - (No change needed) */}
    	  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    	  	<div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    	  	  <div className="flex items-start justify-between">
    	  		<div className="flex-1">
    	  		  <p className="text-sm text-slate-600 mb-2">
    	  			Total Items in Stock
    	  		  </p>
    	  		  <p className="text-2xl font-bold text-slate-900">
    	  			{totalItemsInStock.toLocaleString()}
    	  		  </p>
    	  		</div>
    	  		<div className="bg-blue-500/10 p-3 rounded-lg">
    	  		  <span className="material-symbols-outlined text-blue-500">inventory</span>
    	  		</div>
    	  	  </div>
    	  	</div>
    	  	<div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    	  	  <div className="flex items-start justify-between">
    	  		<div className="flex-1">
    	  		  <p className="text-sm text-slate-600 mb-2">
    	  			Low Stock Items
    	  		  </p>
    	  		  <p className="text-2xl font-bold text-slate-900">
    	  			{lowStockItems}
    	  		  </p>
    	  		</div>
    	  		<div className="bg-orange-500/10 p-3 rounded-lg">
    	  		  <span className="material-symbols-outlined text-orange-500">warning</span>
    	  		</div>
    	  	  </div>
    	  	</div>
    	  	<div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    	  	  <div className="flex items-start justify-between">
    	  		<div className="flex-1">
    	  		  <p className="text-sm text-slate-600 mb-2">
    	  			Items Issued This Month
    	  		  </p>
    	  		  <p className="text-2xl font-bold text-slate-900">
    	  			{itemsIssuedThisMonth}
    	  		  </p>
    	  		</div>
    	  		<div className="bg-green-500/10 p-3 rounded-lg">
    	  		  <span className="material-symbols-outlined text-green-500">output</span>
    	  		</div>
    	  	  </div>
    	  	</div>
    	  </div>

    	  {/* Stock Items Table Section -- MODIFIED */}
    	  <div className="bg-white rounded-xl shadow-sm border border-slate-200">
    	  	{/* Table Header with Search and Filter */}
    	  	<div className="p-5 border-b border-slate-200">
    	  	  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    	  		<div>
    	  		  <h2 className="text-lg font-semibold text-slate-900 mb-1">
    	  			Stock Items
    	  		  </h2>
    	  		  <p className="text-sm text-slate-600">
    	  			Manage and track all inventory items ({filteredStockItems.length} items)
    	  		  </p>
    	  		</div>
    	  		{/* <-- REMOVED: "Add Item" button was here, moved to main header --> */}
    	  	  </div>

    	  	  {/* Search and Filter */}
    	  	  <div className="flex flex-col sm:flex-row gap-3 mt-4">
    	  		<div className="flex-1 relative">
    	  		  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
    	  			search
    	  		  </span>
    	  		  <input
    	  			type="text"
    	  			placeholder="Search by name or category..."
    	  			value={searchQuery}
    	  			onChange={(e) => setSearchQuery(e.target.value)}
    	  			className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
    	  		  />
    	  		</div>
    	  		<select
    	  		  value={filterCategory}
    	  		  onChange={(e) => setFilterCategory(e.target.value)}
    	  		  className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
    	  		>
    	  		  <option value="All">All Categories</option>
    	  		  <option value="Tyres">Tyres</option>
    	  		  <option value="Oils">Oils</option>
    	  		  <option value="Spare Parts">Spare Parts</option>
    	  		  <option value="Tools">Tools</option>
    	  		  <option value="Misc">Misc</option>
  	  		  </select>
  	  		</div>
  	  	  </div>

  	  	  {/* Stock Items Table (No change needed) */}
  	  	  <div className="overflow-x-auto">
  	  		<table className="w-full">
  	  		  <thead className="bg-slate-50">
  	  			<tr>
  	  			  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
  	  				Item Name
  	  			  </th>
  	  			  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
  	  				Category
  	  			  </th>
  	  			  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
  	  				Quantity
  	  			  </th>
  	  			  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
  	  				Unit
  	  			  </th>
  	  			  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
  	  				Status
  	  			  </th>
  	  			  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
  	  				Actions
  	  			  </th>
  	  			</tr>
  	  		  </thead>
  	  		  <tbody className="divide-y divide-slate-200">
  	  			{filteredStockItems.length === 0 ? (
  	  			  <tr>
  	  				<td colSpan="6" className="px-5 py-8 text-center text-slate-500">
  	  				  No items found. Try adjusting your search or filter.
  	  				</td>
  	  			  </tr>
  	  			) : (
  	  			  filteredStockItems.map((item) => {
  	  				const status = getStockStatus(item);
  	  				return (
  	  				  <tr
  	  					key={item.id}
  	  					className="hover:bg-slate-50:bg-slate-900/50 transition-colors"
  	  				  >
  	  					<td className="px-5 py-4 text-sm font-medium text-slate-900">
  	  					  {item.name}
  	  					</td>
  	  					<td className="px-5 py-4 text-sm text-slate-600">
  	  					  {item.category}
  	  					</td>
  	  					<td className="px-5 py-4 text-sm text-slate-900 font-semibold">
  	  					  {item.quantity}
  	  					</td>
  	  					<td className="px-5 py-4 text-sm text-slate-600">
  	  					  {item.unit}
  	  					</td>
  	  					<td className="px-5 py-4">
  	  					  <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.class}`}>
  	  						{status.label}
  	  					  </span>
  	  					</td>
  	  					<td className="px-5 py-4">
  	  					  <div className="flex items-center gap-2">
  	  						<button
  	  						  onClick={() => handleEditItem(item)}
  	  						  className="p-1 hover:bg-slate-200:bg-slate-700 rounded transition-colors"
  	  						  title="Edit"
  	  						>
  	  						  <span className="material-symbols-outlined text-slate-600 text-xl">
  	  							edit
  	  						  </span>
  	  						</button>
  	  						<button
  	  						  className="p-1 hover:bg-slate-200:bg-slate-700 rounded transition-colors"
  	  						  title="Issue"
  	  						>
  	  						  <span className="material-symbols-outlined text-slate-600 text-xl">
  	  							output
  	  						  </span>
  	  						</button>
  	  						<button
  	  						  onClick={() => handleDeleteItem(item)}
  	  						  className="p-1 hover:bg-red-100:bg-red-900/20 rounded transition-colors"
  	  						  title="Delete"
  	  						>
  	  						  <span className="material-symbols-outlined text-red-600 text-xl">
  	  							delete
  	  						  </span>
  	  						</button>
  	  					  </div>
  	  					</td>
  	  				  </tr>
  	  				);
  	  			  })
  	  			)}
  	  		  </tbody>
  	  		</table>
  	  	  </div>
  	  	</div>

  	  	{/* Item Issue Log & Categories Overview (No change needed) */}
  	  	<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  	  	  
  	  	  {/* Item Issue Log Section */}
  	  	  <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100">
  	  		<div className="p-5 border-b border-slate-200">
  	  		  <h2 className="text-lg font-semibold text-slate-900 mb-1">
  	  			Item Issue Log
  	  		  </h2>
  	  		  <p className="text-sm text-slate-600">
  	  			Recent items issued to drivers and vehicles
  	  		  </p>
  	  		</div>

  	  		{/* Issue Log Table */}
  	  		<div className="overflow-x-auto">
  	  		  <table className="w-full">
  	  			<thead className="bg-slate-50">
  	  			  <tr>
  	  				<th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
  	  				  Date
  	  				</th>
  	  				<th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
  	  				  Item
  	  				</th>
  	  				<th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
  	  				  Quantity
  	  				</th>
  	  				<th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
  	  				  Issued To
  	  				</th>
  	  				<th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
  	  				  Vehicle/Driver
  	  				</th>
  	  			  </tr>
  	  			</thead>
  	  			<tbody className="divide-y divide-slate-200">
  	  			  {issueLog.map((log) => (
  	  				<tr
  	  				  key={log.id}
  	  				  className="hover:bg-slate-50:bg-slate-900/50 transition-colors"
  	  				>
  	  				  <td className="px-5 py-4 text-sm text-slate-600">
  	  					{log.date}
  	  				  </td>
  	  				  <td className="px-5 py-4 text-sm font-medium text-slate-900">
  	  					{log.item}
  	  				  </td>
  	  				  <td className="px-5 py-4 text-sm text-slate-900 font-semibold">
  	  					{log.quantity}
  	  				  </td>
  	  				  <td className="px-5 py-4 text-sm text-slate-600">
  	  					{log.issuedTo}
  	  				  </td>
  	  				  <td className="px-5 py-4 text-sm text-slate-600">
  	  					{log.vehicle}
  	  				  </td>
  	  				</tr>
  	  			  ))}
  	  			</tbody>
  	  		  </table>
  	  		</div>

  	  		{/* Pagination */}
  	  		<div className="p-5 border-t border-slate-200">
  	  		  <div className="flex items-center justify-between">
  	  			<p className="text-sm text-slate-600">
  	  			  Showing <span className="font-medium">1-6</span> of <span className="font-medium">42</span> records
  	  			</p>
  	  			<div className="flex items-center gap-2">
  	  			  <button
  	  				onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
  	  				disabled={currentPage === 1}
  	  				className="px-3 py-1 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
  	  			  >
  	  				Previous
  	  			  </button>
  	  			  <button className="px-3 py-1 bg-primary text-white rounded-lg text-sm font-medium">
  	  				1
  	  			  </button>
  	  			  <button className="px-3 py-1 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100:bg-slate-700 transition-colors">
  	  				2
  	  			  </button>
  	  			  <button className="px-3 py-1 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100:bg-slate-700 transition-colors">
  	  				3
  	  			  </button>
  	  			  <button
  	  				onClick={() => setCurrentPage(currentPage + 1)}
  	  				className="px-3 py-1 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100:bg-slate-700 transition-colors"
  	  			  >
  	  				Next
  	  			  </button>
  	  			</div>
  	  		  </div>
  	  		</div>
  	  	  </div>

  	  	  {/* Categories Overview Section */}
  	  	  <div className="bg-white rounded-xl shadow-sm border border-slate-100">
  	  		<div className="p-5 border-b border-slate-200">
  	  		  <h2 className="text-lg font-semibold text-slate-900 mb-1">
  	  			Categories
  	  		  </h2>
  	  		  <p className="text-sm text-slate-600">
  	  			Overview by category
  	  		  </p>
  	  		</div>
  	  		<div className="p-5 space-y-3">
  	  		  {categories.map((category, index) => (
  	  			<div
  	  			  key={index}
  	  			  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100:bg-slate-900 transition-colors cursor-pointer"
  	  			>
  	  			  <div className="flex items-center gap-3">
  	  				<div className="bg-primary/10 p-2 rounded-lg">
  	  				  <span className="material-symbols-outlined text-primary text-xl">
  	  					{category.icon}
  	  				  </span>
  	  				</div>
  	  				<div>
  	  				  <p className="text-sm font-medium text-slate-900">
  	  					{category.name}
  	  				  </p>
  	  				  <p className="text-xs text-slate-500">
  	  					{category.totalItems} items
  	  				  </p>
  	  				</div>
  	  			  </div>
  	  			  <span className="material-symbols-outlined text-slate-400">
  	  				chevron_right
  	  			  </span>
  	  			</div>
  	  		  ))}
  	  		</div>
  	  	  </div>
  	  	</div>

  	  	{/* <-- REMOVED: "Quick Actions Panel" was here. It's now redundant. --> */}

  	  </div>

  	  {/* ========================================
  	 	  ADD/EDIT MODAL FORM -- MODIFIED
  	 	  ======================================== */}
  	  {isModalOpen && (
  	  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
  	  	<div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
  	  	  {/* Modal Header */}
  	  	  <div className="sticky top-0 bg-white p-5 border-b border-slate-200 flex items-center justify-between">
  	  		<div>
  	  		  <h2 className="text-xl font-semibold text-slate-900">
  	  			{isEditMode ? 'Edit Inventory Item' : 'Add New Inventory Item'}
  	  		  </h2>
  	  		  <p className="text-sm text-slate-600 mt-1">
  	  			{isEditMode ? 'Update the item details below' : 'Fill in the details to add a new item'}
  	  		  </p>
  	  		</div>
  	  		<button
  	  		  onClick={handleCloseModal}
  	  		  className="p-2 hover:bg-slate-100:bg-slate-700 rounded-lg transition-colors"
  	  		>
  	  		  <span className="material-symbols-outlined text-slate-600">close</span>
  	  		</button>
  	  	  </div>

  	  	  {/* Modal Form */}
  	  	  <form onSubmit={handleSubmitForm} className="p-5 space-y-5">
  	  		
  	  		{/* Item Name */}
  	  		<div>
  	  		  <label className="block text-sm font-medium text-slate-700 mb-2">
  	  			Item Name <span className="text-red-500">*</span>
  	  		  </label>
  	  		  <input
  	  			type="text"
  	  			name="name"
  	  			value={formData.name}
  	  			onChange={handleInputChange}
  	  			className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400 
  	  			${formErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-primary'}`}
  	  			placeholder="Enter item name"
  	  		  />
  	  		  {formErrors.name && (
  	  			<p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
  	  		  )}
  	  		</div>

      	  {/* Category */}
      	  <div>
      		<label className="block text-sm font-medium text-slate-700 mb-2">
      		  Category <span className="text-red-500">*</span>
      		</label>
      		<select
    	  		  name="category"
      		  value={formData.category}
      		  onChange={handleInputChange}
      		  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all 
      		  ${formErrors.category ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-primary'}`}
      		>
      		  <option value="">Select category</option>
      		  <option value="Tyres">Tyres</option>
      		  <option value="Oils">Oils</option>
      		  <option value="Spare Parts">Spare Parts</option>
      		  <option value="Tools">Tools</option>
      		  <option value="Misc">Misc</option>
      		</select>
      		{formErrors.category && (
      		  <p className="mt-1 text-sm text-red-500">{formErrors.category}</p>
      		)}
      	  </div>

      	  {/* Quantity */}
      	  <div>
      		<label className="block text-sm font-medium text-slate-700 mb-2">
      		  Quantity <span className="text-red-500">*</span>
      		</label>
      		<input
      		  type="number"
    	  	  name="quantity"
      		  value={formData.quantity}
      		  onChange={handleInputChange}
      		  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400 
      		  ${formErrors.quantity ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-primary'}`}
      		  placeholder="Enter quantity"
      		  min="1"
      		/>
      		{formErrors.quantity && (
      		  <p className="mt-1 text-sm text-red-500">{formErrors.quantity}</p>
      		)}
      	  </div>

      	  {/* <-- MODIFIED: Wrapped Unit and Reorder Level in a grid --> */}
      	  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      	  	{/* Unit */}
      	  	<div>
      	  	  <label className="block text-sm font-medium text-slate-700 mb-2">
      	  		Unit <span className="text-red-500">*</span>
      	  	  </label>
      	  	  <input
      	  		type="text"
      	  		name="unit"
      	  		value={formData.unit}
      	  		onChange={handleInputChange}
      	  		className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400 
s     	  		${formErrors.unit ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-primary'}`}
      	  		placeholder="e.g., Nos, Ltr, Set"
      	  	  />
      	  	  {formErrors.unit && (
      	  		<p className="mt-1 text-sm text-red-500">{formErrors.unit}</p>
      	  	  )}
      	  	</div>

      	  	{/* Reorder Level */}
      	  	<div>
  	  		  <label className="block text-sm font-medium text-slate-700 mb-2">
  	  			Reorder Level <span className="text-red-500">*</span>
  	  		  </label>
  	  		  <input
  	  			type="number"
  	  			name="reorderLevel"
  	  			value={formData.reorderLevel}
  	  			onChange={handleInputChange}
  	  			className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400 
  	  			${formErrors.reorderLevel ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-primary'}`}
  	  			placeholder="Enter reorder level"
  	  			min="0"
  	  		  />
  	  		  {formErrors.reorderLevel && (
  	  			<p className="mt-1 text-sm text-red-500">{formErrors.reorderLevel}</p>
  	  		  )}
  	  		</div>
  	  	  </div>

  	  	  {/* Submit Button */}
  	  	  <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
  	  		<button
  	  		  type="button" // <-- Set type to button to prevent form submit
  	  		  onClick={handleCloseModal}
  	  		  className="px-4 py-2 bg-slate-200 rounded-lg text-slate-700 hover:bg-slate-300:bg-slate-600 transition-colors"
  	  		>
  	  		  Cancel
  	  		</button>
  	  		<button
  	  		  type="submit"
  	  		  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
  	  		>
  	  		  {isEditMode ? 'Update Item' : 'Add Item'}
  	  		</button>
  	  	  </div>
  	  	</form>
  	    </div>
  	  </div>
    )}
  </div>
  );
};

export default InventoryManagement;
