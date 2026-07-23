import React, { useState, useEffect } from "react";
import useToast from "../hooks/useToast";
import { Save, User, Building2, Bell, Settings, Database } from "lucide-react";

// Mock storage utility (replace with your actual implementation)
const writeSettings = (settings) => {
  localStorage.setItem('app-settings', JSON.stringify(settings));
};

// SaveButton Component
const SaveButton = ({ children, onClick, className }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors font-medium text-sm ${
      className || ""
    }`}
  >
    <Save size={16} />
    {children}
  </button>
);


// Company Settings Component
const CompanySettings = ({ data, onSave }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    gst: "",
    pan: "",
    address: "",
    city: "",
    state: "",
  });
  const [errors, setErrors] = useState({});

  // Load existing company data into form
  useEffect(() => {
    if (data?.company) {
      setForm((prev) => ({ ...prev, ...data.company }));
    }
  }, [data]);

  // Handle input changes
  const handleChange = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
  };

  // Save
  const validate = () => {
    const validationErrors = {};
    if (!form.name.trim()) validationErrors.name = "Company name is required.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) validationErrors.email = "Please enter a valid email address.";
    
    if (form.phone) {
      let cleaned = String(form.phone).replace(/\D/g, "");
      if (cleaned.length === 12 && cleaned.startsWith("91")) {
        cleaned = cleaned.substring(2);
      } else if (cleaned.length === 11 && cleaned.startsWith("0")) {
        cleaned = cleaned.substring(1);
      }
      if (cleaned.length !== 10) {
        validationErrors.phone = "Phone number must be 10 digits.";
      }
    }
    
    if (form.gst && !/^[0-9A-Z]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gst)) validationErrors.gst = "GST number format is invalid.";
    return validationErrors;
  };

  const handleSave = () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return onSave(false, "Please fix the highlighted fields");
    }

    onSave(true, "Company settings saved successfully!", {
      company: form,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 animate-in fade-in zoom-in duration-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
          <Building2 size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Company Information</h3>
          <p className="text-sm text-slate-500">Manage your company details and billing info</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Company Name */}
        <InputGroup 
          label="Company Name" 
          value={form.name} 
          onChange={handleChange("name")} 
          placeholder="ABC Transport Services" 
          error={errors.name}
        />

        {/* Email */}
        <InputGroup 
          label="Company Email" 
          type="email"
          value={form.email} 
          onChange={handleChange("email")} 
          placeholder="info@company.com" 
          error={errors.email}
        />

        {/* Phone */}
        <InputGroup 
          label="Company Phone" 
          value={form.phone} 
          onChange={handleChange("phone")} 
          placeholder="+91 98765 43210" 
          error={errors.phone}
        />

        {/* GST */}
        <InputGroup 
          label="GST Number" 
          value={form.gst} 
          onChange={handleChange("gst")} 
          placeholder="22AAAAA0000A1Z5" 
          error={errors.gst}
        />

        {/* PAN */}
        <InputGroup 
          label="PAN Number" 
          value={form.pan} 
          onChange={handleChange("pan")} 
          placeholder="ABCDE1234F" 
        />

        {/* Address */}
        <div className="space-y-1 md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Company Address</label>
          <textarea
            value={form.address}
            onChange={handleChange("address")}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-slate-900 resize-none"
            placeholder="Enter complete address"
          />
        </div>

        {/* City */}
        <InputGroup 
          label="City" 
          value={form.city} 
          onChange={handleChange("city")} 
          placeholder="Enter city" 
        />

        {/* State */}
        <InputGroup 
          label="State" 
          value={form.state} 
          onChange={handleChange("state")} 
          placeholder="Enter state" 
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-6 pt-6 border-t border-slate-100">
        <SaveButton onClick={handleSave}>
          Save Changes
        </SaveButton>
      </div>
    </div>
  );
};

const defaults = {
    name: "",
    email: "",
    phone: "",
    role: "",
  };
// Profile Settings Component
const ProfileSettings = ({ data, onSave }) => {
  const [form, setForm] = useState(defaults);
  const [errors, setErrors] = useState({});

  // Load saved profile data
  useEffect(() => {
    setForm({ ...defaults, ...(data.profile || {}) });
  }, [data]);

  const change = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = () => {
    const validationErrors = {};
    if (!form.name.trim()) validationErrors.name = "Full name is required";
    
    if (!form.phone.trim()) {
      validationErrors.phone = "Phone number is required";
    } else {
      let cleaned = String(form.phone).replace(/\D/g, "");
      if (cleaned.length === 12 && cleaned.startsWith("91")) {
        cleaned = cleaned.substring(2);
      } else if (cleaned.length === 11 && cleaned.startsWith("0")) {
        cleaned = cleaned.substring(1);
      }
      if (cleaned.length !== 10) {
        validationErrors.phone = "Phone number must be 10 digits";
      }
    }
    
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return onSave(false, "Please fix the highlighted fields");

    onSave(true, "Profile updated", { profile: form });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-6 animate-in fade-in zoom-in duration-200">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
          <User size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">User Profile</h3>
          <p className="text-sm text-slate-500">
            Manage your personal information and account details
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Name */}
        <InputGroup 
          label="Full Name" 
          value={form.name} 
          onChange={change("name")} 
          placeholder="Enter full name" 
          error={errors.name}
        />

        {/* Email */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
          <input
            type="email"
            value={form.email}
            disabled
            className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-500 cursor-not-allowed"
          />
          <div className="text-xs text-slate-400 mt-1">Email cannot be changed</div>
        </div>

        {/* Phone */}
        <InputGroup 
          label="Phone Number" 
          value={form.phone} 
          onChange={change("phone")} 
          placeholder="+91 98765 43210" 
          error={errors.phone}
        />

        {/* Role */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
          <input
            type="text"
            value={form.role}
            disabled
            className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-500 cursor-not-allowed"
          />
          <div className="text-xs text-slate-400 mt-1">Role is managed by admin</div>
        </div>
      </div>

      {/* Save Button */}
      <div className="border-t border-slate-100 pt-6 flex justify-end">
        <SaveButton onClick={handleSave}>Update Profile</SaveButton>
      </div>

      {/* Password Reset */}
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <div className="font-medium text-blue-900">Change Password</div>
          <div className="text-sm text-blue-700">
            Password changes require email verification.
          </div>
        </div>
        <button className="px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium shadow-sm">
          Request Password Reset
        </button>
      </div>
    </div>
  );
};

// Notification Settings Component
const NotificationSettings = ({ data, onSave }) => {
  const defaults = {
    email: true,
    sms: false,
    trip: true,
    expense: true,
    docs: true,
    lowFuel: false,
    maintenance: true,
  };

  const [form, setForm] = useState(defaults);

  // Load saved state when data changes
  useEffect(() => {
    setForm({ ...defaults, ...(data.notifications || {}) });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const toggle = (key) => () =>
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSave = () =>
    onSave(true, "Notification settings saved", { notifications: form });

  const Switch = ({ checked, onChange }) => (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
        checked ? "bg-indigo-600" : "bg-slate-200"
      }`}
    >
      <span
        className={`inline-block w-5 h-5 transform bg-white rounded-2xl shadow transition-transform duration-200 ease-in-out ${
          checked ? "translate-x-3" : "translate-x-0"
        }`}
      />
    </button>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 animate-in fade-in zoom-in duration-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
          <Bell size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Notification Preferences</h3>
          <p className="text-sm text-slate-500">Customize how you receive alerts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LEFT SIDE */}
        <div>
          <div className="font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">Notification Channels</div>

          {[
            ["Email Notifications", "email"],
            ["SMS Notifications", "sms"],
          ].map(([label, key]) => (
            <div
              key={key}
              className="flex justify-between items-center py-3"
            >
              <span className="text-slate-700 font-medium">{label}</span>
              <Switch checked={form[key]} onChange={toggle(key)} />
            </div>
          ))}
        </div>

        {/* RIGHT SIDE */}
        <div>
          <div className="font-semibold text-slate-9600 mb-4 pb-2 border-b border-slate-100">Alert Types</div>

          {[
            ["Trip Alerts", "trip"],
            ["Expense Alerts", "expense"],
            ["Document Expiry", "docs"],
            ["Low Fuel Alerts", "lowFuel"],
            ["Maintenance Alerts", "maintenance"],
          ].map(([label, key]) => (
            <div
              key={key}
              className="flex justify-between items-center py-3"
            >
              <span className="text-slate-700 font-medium">{label}</span>
              <Switch checked={form[key]} onChange={toggle(key)} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end mt-8 pt-6 border-t border-slate-100">
        <SaveButton onClick={handleSave}>Save Notification Settings</SaveButton>
      </div>
    </div>
  );
};

// System Settings Component
const SystemSettings = ({ data, onSave }) => {
  const defaults = {
    currency: "inr",
    dateFormat: "ddmmyyyy",
    timezone: "IST",
    language: "English",
  };

  const [form, setForm] = useState(defaults);

  // Load existing saved system settings
  useEffect(() => {
    setForm({ ...defaults, ...(data.system || {}) });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const change = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = () => {
    onSave(true, "System settings saved", { system: form });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-6 animate-in fade-in zoom-in duration-200">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
          <Settings size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">System Configuration</h3>
          <p className="text-sm text-slate-500">
            Manage system-wide settings that affect your entire application
          </p>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Currency */}
        <SelectGroup 
          label="Currency" 
          value={form.currency} 
          onChange={change("currency")}
        >
          <option value="inr">INR — Indian Rupee (₹)</option>
          <option value="usd">USD — US Dollar ($)</option>
          <option value="eur">EUR — Euro (€)</option>
          <option value="gbp">GBP — British Pound (£)</option>
        </SelectGroup>

        {/* Date Format */}
        <SelectGroup 
          label="Date Format" 
          value={form.dateFormat} 
          onChange={change("dateFormat")}
        >
          <option value="ddmmyyyy">DD/MM/YYYY</option>
          <option value="mmddyyyy">MM/DD/YYYY</option>
          <option value="yyyymmdd">YYYY/MM/DD</option>
        </SelectGroup>

        {/* Timezone */}
        <SelectGroup 
          label="Time Zone" 
          value={form.timezone} 
          onChange={change("timezone")}
        >
          <option value="IST">IST — India Standard Time</option>
          <option value="UTC">UTC — Universal Time</option>
          <option value="CET">CET — Central Europe Time</option>
          <option value="EST">EST — Eastern Standard Time</option>
          <option value="PST">PST — Pacific Standard Time</option>
        </SelectGroup>

        {/* Language */}
        <SelectGroup 
          label="Language" 
          value={form.language} 
          onChange={change("language")}
        >
          <option>English</option>
          <option>Hindi</option>
          <option>Marathi</option>
          <option>Tamil</option>
          <option>Gujarati</option>
        </SelectGroup>
      </div>

      {/* Save Button */}
      <div className="border-t border-slate-100 pt-6 flex justify-end">
        <SaveButton onClick={handleSave}>Save System Settings</SaveButton>
      </div>
    </div>
  );
};

// Data Settings Component
const DataSettings = ({ data, onSave }) => {
  // Export Data
  const exportData = () => {
    try {
      const payload = JSON.stringify(data || {}, null, 2);
      const blob = new Blob([payload], { type: "application/json" });

      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "tms-data.json";
      a.click();

      onSave(true, "Data exported successfully");
    } catch  {
      onSave(false, "Export failed");
    }
  };

  // Import Data
  const importData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        onSave(true, "Imported data applied", parsed);
      } catch {
        onSave(false, "Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  // Clear All Data
  const clearAll = () => {
    if (!confirm("⚠️ This will permanently delete ALL data. Proceed?")) return;
    onSave(true, "All data cleared", {});
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-6 animate-in fade-in zoom-in duration-200">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
          <Database size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Data Management</h3>
          <p className="text-sm text-slate-500">
            Import, export, or clear your system data.
          </p>
        </div>
      </div>

      {/* Export Section */}
      <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
        <div>
          <div className="font-semibold text-slate-900">Export Data</div>
          <div className="text-sm text-slate-500 mt-1">
            Download a backup of all system data in JSON format.
          </div>
        </div>
        <button 
          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium shadow-sm" 
          onClick={exportData}
        >
          Export JSON
        </button>
      </div>

      {/* Import Section */}
      <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
        <div>
          <div className="font-semibold text-slate-900">Import Data</div>
        <div className="text-sm text-slate-500 mt-1">
            Upload a JSON backup file to restore settings and records.
          </div>
        </div>
        <label className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium shadow-sm cursor-pointer">
          Import JSON
          <input
            type="file"
            accept="application/json"
            onChange={importData}
            className="hidden"
          />
        </label>
      </div>

      {/* Danger Zone */}
      <div className="p-5 rounded-xl border border-red-200 bg-red-50 space-y-3">
        <div className="font-bold text-red-800">Danger Zone</div>
        <div className="text-sm text-red-600">
          Clearing all data is irreversible. Please proceed carefully.
        </div>
        <button 
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium shadow-sm" 
          onClick={clearAll}
        >
          Clear All Data
        </button>
      </div>
    </div>
  );
};

// Main Settings Page Component
const SettingsPage = () => {
  const { push, ToastContainer } = useToast();
  const [active, setActive] = useState("company");

  const [settings, setSettings] = useState({
    company: {},
    profile: {
      name: "admin",
      email: "admin@transport.com",
      phone: "+91 98765 43210",
      role: "Admin",
    },
    notifications: {},
    system: {},
  });

  // Save everytime `settings` changes
  useEffect(() => {
    writeSettings(settings);
  }, [settings]);

  // Universal Save Handler
  const handleSave = (ok, msg, partial = null) => {
    if (!ok) {
      push(msg || "Failed", { type: "error" });
      return;
    }

    if (partial && typeof partial === "object") {
      const isFullObject =
        partial.company ||
        partial.profile ||
        partial.notifications ||
        partial.system;

      setSettings((prev) =>
        isFullObject ? { ...partial } : { ...prev, ...partial }
      );
    }

    push(msg || "Saved", { type: "success" });
  };

  const tabs = [
    { key: "company", label: "Company", icon: Building2 },
    { key: "profile", label: "Profile", icon: User },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "system", label: "System", icon: Settings },
    { key: "data", label: "Data", icon: Database },
  ];

  return (
    <div className="p-6 min-h-screen bg-slate-50 font-sans text-slate-900">
      <ToastContainer />

      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your application preferences and configuration
          </p>
        </div>

        {/* Horizontal Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-1.5 mb-8 overflow-x-auto">
          <div className="flex min-w-max sm:min-w-0 space-x-1">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => setActive(t.key)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    active === t.key
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon size={18} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Panels */}
        <div className="animate-in fade-in zoom-in duration-200">
          {active === "company" && (
            <CompanySettings data={settings} onSave={handleSave} />
          )}

          {active === "profile" && (
            <ProfileSettings data={settings} onSave={handleSave} />
          )}

          {active === "notifications" && (
            <NotificationSettings data={settings} onSave={handleSave} />
          )}

          {active === "system" && (
            <SystemSettings data={settings} onSave={handleSave} />
          )}

          {active === "data" && (
            <DataSettings
              data={settings}
              onSave={(ok, msg, partial) => {
                if (ok && partial && Object.keys(partial).length === 0) {
                  setSettings({});
                  writeSettings({});
                  push("All data cleared");
                  return;
                }

                if (ok && partial && typeof partial === "object") {
                  setSettings(partial);
                  writeSettings(partial);
                  push(msg || "Imported");
                  return;
                }

                handleSave(ok, msg);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Helper Components
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

const SelectGroup = ({ label, children, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    <select
      className="w-full border border-slate-200 rounded-lg pl-3 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white text-slate-900"
      {...props}
    >
      {children}
    </select>
  </div>
);

export default SettingsPage;