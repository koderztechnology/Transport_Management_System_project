import './App.css'
import 'leaflet/dist/leaflet.css';
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'

const Dashboard = lazy(() => import('./pages/Dashboard'));
const AccountsFinance = lazy(() => import('./pages/AccountsFinance'));
const InventoryManagement = lazy(() => import('./pages/InventoryManagement'));
const Fleet = lazy(() => import('./pages/Fleet_Management'));
const TripManagement = lazy(() => import('./pages/Trip_Management'));
const DieselTollManagement = lazy(() => import('./pages/Diesel_Toll_Management'));
const DriverManagement = lazy(() => import('./pages/Driver_Management'));
const TrackingAnalytics = lazy(() => import('./pages/Tracking_Analytics'));
const Support = lazy(() => import('./pages/Support'));
const VehicleManagement = lazy(() => import('./pages/VehicleManagement'));
const EWayBillManagement = lazy(() => import('./pages/EWayBillManagement'));
const LRManagement = lazy(() => import('./pages/LRManagement'));
const Vendor = lazy(() => import('./pages/Vendor'));
const SystemSetting = lazy(() => import('./pages/SystemSetting'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('admin_username') !== null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const RoleRoute = ({ children, allowedRoles }) => {
  const userRole = localStorage.getItem('user_role') || 'Admin';
  const roleClean = String(userRole).trim().toLowerCase();
  if (roleClean === 'admin') return children;
  if (allowedRoles && !allowedRoles.map(r => r.toLowerCase()).includes(roleClean)) return <Navigate to="/" replace />;
  return children;
};

const Loader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout>
                <Suspense fallback={<Loader />}>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/fleet-management" element={<RoleRoute allowedRoles={['Manager']}><Fleet /></RoleRoute>} />
                    <Route path="/vehicle-management" element={<RoleRoute allowedRoles={['Manager']}><VehicleManagement /></RoleRoute>} />
                    <Route path="/trip-management" element={<RoleRoute allowedRoles={['Manager', 'Driver']}><TripManagement /></RoleRoute>} />
                    <Route path="/driver-management" element={<RoleRoute allowedRoles={['Manager', 'Driver']}><DriverManagement /></RoleRoute>} />
                    <Route path="/diesel-toll-management" element={<RoleRoute allowedRoles={['Manager']}><DieselTollManagement /></RoleRoute>} />
                    <Route path="/lr-bilty-billing" element={<RoleRoute allowedRoles={['Manager']}><LRManagement /></RoleRoute>} />
                    <Route path="/eway-bill" element={<RoleRoute allowedRoles={['Manager']}><EWayBillManagement /></RoleRoute>} />
                    <Route path="/accounts-finance" element={<RoleRoute allowedRoles={['Manager', 'Vendor']}><AccountsFinance /></RoleRoute>} />
                    <Route path="/vendor-management" element={<RoleRoute allowedRoles={['Manager', 'Vendor']}><Vendor /></RoleRoute>} />
                    <Route path="/inventory" element={<RoleRoute allowedRoles={['Manager']}><InventoryManagement /></RoleRoute>} />
                    <Route path="/tracking-analytics" element={<RoleRoute allowedRoles={['Manager', 'Driver']}><TrackingAnalytics /></RoleRoute>} />
                    <Route path="/system-settings" element={<RoleRoute allowedRoles={[]}><SystemSetting /></RoleRoute>} />
                    <Route path="/support" element={<Support />} />
                  </Routes>
                </Suspense>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
