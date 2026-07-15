import { useMemo, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const TopNavBar = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);

  const [showDropdown, setShowDropdown] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const profileRef = useRef(null);

  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        const userRole = localStorage.getItem('user_role') || 'Admin';
        const role = userRole.trim().toLowerCase();

        const fetchDrivers = (role === 'admin' || role === 'manager');
        const fetchVehicles = (role === 'admin' || role === 'manager' || role === 'driver');
        const fetchTrips = (role === 'admin' || role === 'manager' || role === 'driver');

        const promises = [];
        if (fetchDrivers) {
          promises.push(api.get('/drivers/').then(res => ({ type: 'drivers', data: res.data })));
        }
        if (fetchVehicles) {
          promises.push(api.get('/vehicles/').then(res => ({ type: 'vehicles', data: res.data })));
        }
        if (fetchTrips) {
          promises.push(api.get('/trips/').then(res => ({ type: 'trips', data: res.data })));
        }

        if (promises.length === 0) return;

        const results = await Promise.allSettled(promises);
        results.forEach(result => {
          if (result.status === 'fulfilled') {
            const { type, data } = result.value;
            if (type === 'drivers') setDrivers(data || []);
            if (type === 'vehicles') setVehicles(data || []);
            if (type === 'trips') setTrips(data || []);
          }
        });
      } catch (err) {
        console.error("Error loading search data:", err);
      }
    };
    fetchSearchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem('admin_username');
      navigate('/login');
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const match = filteredRoutes[0];
    if (match) {
      navigate(match.path);
      setSearchValue('');
    }
  };



  const username = localStorage.getItem('admin_username') || 'Admin';
  const userRole = localStorage.getItem('user_role') || 'Administrator';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between whitespace-nowrap border-b border-slate-200 px-6 lg:px-10 py-3 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="flex items-center gap-8 flex-1 ml-14 lg:ml-0">
        <form onSubmit={handleSearchSubmit} className="relative flex flex-col min-w-[200px] h-10 max-w-sm flex-1">
          <div className="flex w-full flex-1 items-stretch rounded-xl h-full border border-slate-200 bg-slate-50 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all overflow-hidden">
            <button type="submit" className="text-slate-500 flex border-none bg-transparent items-center justify-center pl-4 cursor-pointer hover:text-indigo-600 transition-colors">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>
            <input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="w-full min-w-0 flex-1 resize-none overflow-hidden text-slate-900 border-none bg-transparent h-full placeholder:text-slate-400 px-4 pl-2 text-sm font-normal leading-normal focus:outline-none focus:ring-0"
              placeholder="Search pages, drivers, vehicles..."
            />
          </div>
          {filteredRoutes.length > 0 && (
            <ul className="absolute top-12 left-0 z-40 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden divide-y divide-slate-100">
              {filteredRoutes.slice(0, 6).map((route) => (
                <li key={route.path}>
                  <Link
                    to={route.path}
                    className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
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
      <div className="flex items-center gap-4 relative">

        {/* Profile Avatar */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center justify-center rounded-full size-10 border border-slate-200 hover:border-indigo-500 transition-all cursor-pointer focus:outline-none bg-indigo-100 text-indigo-700 font-bold overflow-hidden relative"
            aria-label="Toggle profile menu"
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHZwNnLvTNo4dgOWNi958tH9rGfiYDy1F_VwxrCMELhBoeLHHBeXdPYzHrkjbJzsN0b5ku8aampuarIt48Iz29zWjEqAoE5euu1tbM8Km6BfstHgjD1JUcWUAQtX0TsBp0FvHvkk50K2-8fovfpl4m_h58isHwVHufPuL71l3CCaW_CwUU4HiPP2GuFl_SFEaO-b-4PnqJyxqkf01wU2YyH7D_x0GgF_QP4CePjyJZI5j_FvKE1BBHYmE9AcYbg8LQqNNh3obOb4k"
              alt=""
              className="w-full h-full object-cover"
              onLoad={() => setImgLoaded(true)}
              onError={(e) => {
                e.target.style.display = 'none'; // Hide broken image to let initials show
                setImgFailed(true);
              }}
            />
            {(!imgLoaded || imgFailed) && (
              <span className="absolute">{username.charAt(0).toUpperCase()}</span>
            )}
          </button>
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
      </div>
    </header>
  );
};

export default TopNavBar;
