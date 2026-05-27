import './App.css'
import 'leaflet/dist/leaflet.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import AccountsFinance from './pages/AccountsFinance'
import InventoryManagement from './pages/InventoryManagement'
import Fleet from './pages/Fleet_Management'
import TripManagement from './pages/Trip_Management'
import DieselTollManagement from './pages/Diesel_Toll_Management'
import DriverManagement from './pages/Driver_Management'
import TrackingAnalytics from './pages/Tracking_Analytics'
import Support from './pages/Support'
import VehicleManagement from './pages/VehicleManagement'
import EWayBillManagement from './pages/EWayBillManagement'
import LRManagement from './pages/LRManagement'
import Vendor from './pages/Vendor'
import SystemSetting from './pages/SystemSetting'
import Login from './pages/Login'
import Signup from './pages/Signup'

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('admin_username') !== null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const RoleRoute = ({ children, allowedRoles }) => {
  const userRole = localStorage.getItem('user_role') || 'Admin';
  if (userRole === 'Admin') return children;
  if (allowedRoles && !allowedRoles.includes(userRole)) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                                <Route path="/" element={<Dashboard />} />
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
                <Route path="/support" element={<Support />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App
