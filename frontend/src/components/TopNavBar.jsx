import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const TopNavBar = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        const [dRes, vRes, tRes] = await Promise.all([
          api.get('/drivers/'),
          api.get('/vehicles/'),
          api.get('/trips/')
        ]);
        setDrivers(dRes.data || []);
        setVehicles(vRes.data || []);
        setTrips(tRes.data || []);
      } catch (err) {
        console.error("Error loading search data:", err);
      }
    };
    fetchSearchData();
  }, []);

  const searchableRoutes = useMemo(() => [
    { label: 'Dashboard', path: '/' },
    { label: 'Vehicle Management', path: '/vehicle-management' },
    { label: 'Trip Management', path: '/trip-management' },
    { label: 'Driver Management', path: '/driver-management' },
  ], []);

  const filteredRoutes = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return [];
    
    const results = [];
    
    // 1. Match page routes
    searchableRoutes.forEach(r => {
      if (r.label.toLowerCase().includes(query)) {
        results.push({ label: r.label, path: r.path });
      }
    });
    
    // 2. Match drivers
    drivers.forEach(d => {
      if (d.name && d.name.toLowerCase().includes(query)) {
        results.push({ label: `Driver: ${d.name}`, path: `/driver-management?search=${encodeURIComponent(d.name)}` });
      }
    });
    
    // 3. Match vehicles
    vehicles.forEach(v => {
      if (v.vehicle_number && v.vehicle_number.toLowerCase().includes(query)) {
        results.push({ label: `Vehicle: ${v.vehicle_number}`, path: `/vehicle-management?search=${encodeURIComponent(v.vehicle_number)}` });
      }
    });
    
    // 4. Match trips
    trips.forEach(t => {
      const routeName = `${t.start_location} to ${t.end_location}`;
      if (
        (t.start_location && t.start_location.toLowerCase().includes(query)) ||
        (t.end_location && t.end_location.toLowerCase().includes(query))
      ) {
        results.push({ label: `Trip: ${routeName}`, path: `/trip-management?search=${encodeURIComponent(t.start_location)}` });
      }
    });
    
    return results;
  }, [searchValue, searchableRoutes, drivers, vehicles, trips]);

  const handleLogout = () => {
    localStorage.removeItem('admin_username');
    navigate('/login');
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const match = filteredRoutes[0];
    if (match) {
      navigate(match.path);
      setSearchValue('');
    }
  };

  const [showDropdown, setShowDropdown] = useState(false);
  const username = localStorage.getItem('admin_username') || 'Admin';
  const userRole = localStorage.getItem('user_role') || 'Administrator';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between whitespace-nowrap border-b border-slate-200 px-6 lg:px-10 py-3 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="flex items-center gap-8 flex-1 ml-14 lg:ml-0">
        <form onSubmit={handleSearchSubmit} className="relative flex flex-col min-w-40 h-10 max-w-64 flex-1">
          <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
            <button type="submit" className="text-slate-600 flex border-none bg-slate-100 items-center justify-center pl-4 rounded-l-xl border-r-0 cursor-pointer hover:text-indigo-600 transition-colors">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>
            <input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-slate-900 focus:outline-0 focus:ring-0 border-none bg-slate-100 focus:border-none h-full placeholder:text-slate-400 px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
              placeholder="Search pages..."
            />
          </div>
          {filteredRoutes.length > 0 && (
            <ul className="absolute top-12 left-0 z-40 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
              {filteredRoutes.slice(0, 6).map((route) => (
                <li key={route.path}>
                  <Link
                    to={route.path}
                    className="flex items-center px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    onClick={() => setSearchValue('')}
                  >
                    {route.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </form>
      </div>
      <div className="flex flex-1 justify-end items-center gap-4 relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border border-slate-200 hover:border-indigo-500 transition-all cursor-pointer focus:outline-none"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBHZwNnLvTNo4dgOWNi958tH9rGfiYDy1F_VwxrCMELhBoeLHHBeXdPYzHrkjbJzsN0b5ku8aampuarIt48Iz29zWjEqAoE5euu1tbM8Km6BfstHgjD1JUcWUAQtX0TsBp0FvHvkk50K2-8fovfpl4m_h58isHwVHufPuL71l3CCaW_CwUU4HiPP2GuFl_SFEaO-b-4PnqJyxqkf01wU2YyH7D_x0GgF_QP4CePjyJZI5j_FvKE1BBHYmE9AcYbg8LQqNNh3obOb4k')",
          }}
          aria-label="Toggle profile menu"
        />
        {showDropdown && (
          <div className="absolute right-0 top-12 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50">
            <div className="px-4 py-2 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-900">{username}</p>
              <p className="text-xs text-slate-500">{userRole}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopNavBar;
