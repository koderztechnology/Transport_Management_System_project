import re

path = 'd:/Koderz_T/Admin_TSm_all/Transport_management/frontend/src/App.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """                <Route path="/" element={<Dashboard />} />
                <Route path="/fleet-management" element={<RoleRoute allowedRoles={['Manager']}><Fleet /></RoleRoute>} />
                <Route path="/vehicle-management" element={<RoleRoute allowedRoles={['Manager']}><VehicleManagement /></RoleRoute>} />
                <Route path="/trip-management" element={<RoleRoute allowedRoles={['Manager', 'Driver']}><TripManagement /></RoleRoute>} />
                <Route path="/driver-management" element={<RoleRoute allowedRoles={['Manager', 'Driver']}><DriverManagement /></RoleRoute>} />
                <Route path="/diesel-toll-management" element={<RoleRoute allowedRoles={['Manager']}><DieselTollManagement /></RoleRoute>} />
                <Route path="/lr-management" element={<RoleRoute allowedRoles={['Manager']}><LRManagement /></RoleRoute>} />
                <Route path="/eway-bill-management" element={<RoleRoute allowedRoles={['Manager']}><EWayBillManagement /></RoleRoute>} />
                <Route path="/accounts-finance" element={<RoleRoute allowedRoles={['Manager', 'Vendor']}><AccountsFinance /></RoleRoute>} />
                <Route path="/vendor-management" element={<RoleRoute allowedRoles={['Manager', 'Vendor']}><Vendor /></RoleRoute>} />
                <Route path="/inventory" element={<RoleRoute allowedRoles={['Manager']}><InventoryManagement /></RoleRoute>} />
                <Route path="/tracking-analytics" element={<RoleRoute allowedRoles={['Manager', 'Driver']}><TrackingAnalytics /></RoleRoute>} />
                <Route path="/system-settings" element={<RoleRoute allowedRoles={[]}><SystemSetting /></RoleRoute>} />
                <Route path="/support" element={<Support />} />"""

content = re.sub(r'<Route path="/" element={<Dashboard />} />.*?<Route path="/support" element={<Support />} />', replacement, content, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

