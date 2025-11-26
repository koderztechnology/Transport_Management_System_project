import './App.css'
import 'leaflet/dist/leaflet.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/fleet-management" element={<Fleet />} />
          <Route path="/vehicle-management" element={<VehicleManagement />} />
          <Route path="/trip-management" element={<TripManagement />} />
          <Route path="/driver-management" element={<DriverManagement />} />
          <Route path="/diesel-toll-management" element={<DieselTollManagement />} />
          <Route path="/lr-management" element={<LRManagement />} />
          <Route path="/eway-bill-management" element={<EWayBillManagement />} />
          <Route path="/accounts-finance" element={<AccountsFinance />} />
          <Route path="/vendor-management" element={<Vendor />} />
          <Route path="/inventory" element={<InventoryManagement />} />
          <Route path="/tracking-analytics" element={<TrackingAnalytics />} />
          <Route path="/system-settings" element={<SystemSetting />} />
          <Route path="/support" element={<Support />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
