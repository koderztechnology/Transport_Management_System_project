import re

path = 'd:/Koderz_T/Admin_TSm_all/Transport_management/frontend/src/components/Sidebar.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

replacement_1 = """  const toggleMobileMenu = () => {
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
  })).filter(section => section.items.length > 0);"""

content = re.sub(r'  const toggleMobileMenu = \(\) => {\n    setIsMobileMenuOpen\(!isMobileMenuOpen\);\n  };', replacement_1, content)

content = content.replace('navigationSections.map((section, sectionIndex)', 'filteredSections.map((section, sectionIndex)')

content = content.replace('location.pathname === \'/system-settings\'', 'location.pathname === \'/system-settings\'') # No, wait, SystemSettings should be hidden if !isItemAllowed('/system-settings')

system_settings_replacement = """          {/* Bottom Section */}
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
            )}"""

content = re.sub(r'          \{/\* Bottom Section \*/\}\n          <div className="border-t border-slate-200 px-3 py-3 bg-slate-50/50">\n            <Link\n              className=\{`group flex items-center gap-3 px-3 py-2\.5 rounded-lg transition-all duration-200 w-full mb-1 \$\{.*?System Settings\n              </span>\n            </Link>', system_settings_replacement, content, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

