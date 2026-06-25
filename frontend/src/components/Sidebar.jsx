import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigationSections = [
    {
      title: 'Operations',
      items: [
        { name: 'Dashboard', icon: 'dashboard', href: '/', badge: null },
        { name: 'Fleet Management', icon: 'local_shipping', href: '/fleet-management' },
        { name: 'Vehicle Management', icon: 'directions_car', href: '/vehicle-management' },
        { name: 'Trip Management', icon: 'route', href: '/trip-management' },
        { name: 'Driver Management', icon: 'badge', href: '/driver-management' },
      ]
    },
    {
      title: 'Finance & Billing',
      items: [
        { name: 'Diesel & Toll', icon: 'local_gas_station', href: '/diesel-toll-management' },
        { name: 'LR / Bilty & Billing', icon: 'receipt_long', href: '/lr-management' },
        { name: 'E-Way Bill', icon: 'description', href: '/eway-bill-management' },
        { name: 'Accounts & Finance', icon: 'account_balance_wallet', href: '/accounts-finance' },
      ]
    },
    {
      title: 'Management',
      items: [
        { name: 'Vendor Management', icon: 'store', href: '/vendor-management' },
        { name: 'Inventory', icon: 'inventory_2', href: '/inventory' },
        { name: 'Tracking & Analytics', icon: 'analytics', href: '/tracking-analytics' },
      ]
    }
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const userRole = localStorage.getItem('user_role') || 'Admin';

  const isItemAllowed = (href) => {
    if (userRole === 'Admin') return true;
    const rules = {
        '/fleet-management': ['Manager'],
        '/vehicle-management': ['Manager'],
        '/trip-management': ['Manager', 'Driver'],
        '/driver-management': ['Manager', 'Driver'],
        '/diesel-toll-management': ['Manager'],
        '/lr-management': ['Manager'],
        '/eway-bill-management': ['Manager'],
        '/accounts-finance': ['Manager', 'Vendor'],
        '/vendor-management': ['Manager', 'Vendor'],
        '/inventory': ['Manager'],
        '/tracking-analytics': ['Manager', 'Driver'],
        '/system-settings': [],
    };
    if (href === '/' || href.startsWith('#')) return true;
    if (rules[href] && rules[href].includes(userRole)) return true;
    return false;
  };

  const filteredSections = navigationSections.map(section => ({
    ...section,
    items: section.items.filter(item => isItemAllowed(item.href))
  })).filter(section => section.items.length > 0);

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        id="mobile-menu-toggle"
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white hover:bg-slate-50 rounded-xl shadow-md border border-slate-200 transition-all"
      >
        <span className="material-symbols-outlined text-slate-700 text-[22px]">
          {isMobileMenuOpen ? 'close' : 'menu'}
        </span>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden bg-slate-900/30 backdrop-blur-sm transition-opacity"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={`fixed left-0 top-0 z-40 w-60 h-screen bg-white border-r border-slate-200 shadow-sm overflow-hidden transition-transform duration-300 lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header with Logo */}
          <div className="px-4 py-5 border-b border-slate-200">
            <Link to="/" className="flex items-center gap-3 rounded-lg transition-colors hover:bg-slate-50 px-2 py-1">
              <div className="bg-indigo-600 p-2 rounded-lg shadow-sm">
                <span className="material-symbols-outlined text-white text-[22px]">local_shipping</span>
              </div>
              <div>
                <h1 className="text-slate-900 text-base font-bold tracking-tight">
                  TMS Pro
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Transport System
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">

            {/* Navigation Sections */}
            <div className="space-y-6">
              {filteredSections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  <h3 className="px-2 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item, itemIndex) => {
                      const isActive = location.pathname === item.href;
                      const ItemComponent = item.href.startsWith('#') ? 'a' : Link;
                      
                      return (
                        <ItemComponent
                          key={itemIndex}
                          className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full ${
                            isActive
                              ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                          {...(item.href.startsWith('#') ? { href: item.href } : { to: item.href })}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <span className={`material-symbols-outlined text-[19px] ${
                            isActive ? 'font-semibold' : ''
                          }`}>
                            {item.icon}
                          </span>
                          <span className={`flex-1 text-sm ${
                            isActive ? 'font-semibold' : 'font-medium'
                          }`}>
                            {item.name}
                          </span>
                          {item.badge && (
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </ItemComponent>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-slate-200 px-3 py-3 bg-slate-50/50">
            {isItemAllowed('/system-settings') && (
            <Link
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full mb-1 ${
                location.pathname === '/system-settings'
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              to="/system-settings"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className={`material-symbols-outlined text-[19px] ${
                location.pathname === '/system-settings' ? 'font-semibold' : ''
              }`}>
                settings
              </span>
              <span className={`flex-1 text-sm ${
                location.pathname === '/system-settings' ? 'font-semibold' : 'font-medium'
              }`}>
                System Settings
              </span>
            </Link>
            )}
            <Link
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full ${
                location.pathname === '/support'
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              to="/support"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className={`material-symbols-outlined text-[19px] ${
                location.pathname === '/support' ? 'font-semibold' : ''
              }`}>
                help
              </span>
              <span className={`flex-1 text-sm ${
                location.pathname === '/support' ? 'font-semibold' : 'font-medium'
              }`}>
                Support
              </span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
