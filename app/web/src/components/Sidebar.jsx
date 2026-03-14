import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Activity, Car, Users, Map, FileText, IndianRupee, PieChart, Fuel, LogOut, User } from 'lucide-react';
import { Button } from './ui/button';

// Professional FleetTrack Logo SVG
const FleetTrackLogo = ({ className }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none">
    {/* Background circle with gradient effect */}
    <circle cx="24" cy="24" r="22" fill="url(#sidebarLogoGradient)" />
    {/* Outer ring */}
    <circle cx="24" cy="24" r="22" fill="none" stroke="#fbbf24" strokeWidth="1.5" opacity="0.4" />
    {/* Road/path element */}
    <path d="M8 30 Q24 20 40 30" stroke="#fef3c7" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M8 30 Q24 20 40 30" stroke="#fbbf24" strokeWidth="1" strokeLinecap="round" fill="none" strokeDasharray="3 2" />
    {/* Stylized truck body */}
    <rect x="14" y="16" width="18" height="10" rx="2" fill="#fef3c7" />
    {/* Truck cab */}
    <rect x="9" y="20" width="7" height="6" rx="1.5" fill="#fef3c7" />
    {/* Cab window */}
    <rect x="10" y="21" width="5" height="4" rx="1" fill="#78350f" />
    {/* Cargo lines */}
    <line x1="16" y1="19" x2="30" y2="19" stroke="#d97706" strokeWidth="1" opacity="0.5" />
    <line x1="16" y1="22" x2="30" y2="22" stroke="#d97706" strokeWidth="1" opacity="0.5" />
    {/* Wheels */}
    <circle cx="15" cy="26" r="3" fill="#292524" stroke="#a8a29e" strokeWidth="1.5" />
    <circle cx="15" cy="26" r="1" fill="#78350f" />
    <circle cx="28" cy="26" r="3" fill="#292524" stroke="#a8a29e" strokeWidth="1.5" />
    <circle cx="28" cy="26" r="1" fill="#78350f" />
    {/* Location pin accent */}
    <path d="M36 10 C36 5 42 5 42 10 C42 13 39 16 39 16 C39 16 36 13 36 10 Z" fill="#fbbf24" />
    <circle cx="39" cy="10" r="2" fill="#78350f" />
    {/* Gradient definition */}
    <defs>
      <linearGradient id="sidebarLogoGradient" x1="0" y1="0" x2="48" y2="48">
        <stop offset="0%" stopColor="#78350f" />
        <stop offset="50%" stopColor="#92400e" />
        <stop offset="100%" stopColor="#78350f" />
      </linearGradient>
    </defs>
  </svg>
);

const Sidebar = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const ownerLinks = [
    { to: '/owner-dashboard', label: 'Dashboard', icon: <Activity className="w-5 h-5" /> },
    { to: '/vehicles', label: 'Vehicles', icon: <Car className="w-5 h-5" /> },
    { to: '/drivers', label: 'Drivers', icon: <Users className="w-5 h-5" /> },
    { to: '/trips', label: 'Trips', icon: <Map className="w-5 h-5" /> },
    { to: '/fuel', label: 'Fuel', icon: <Fuel className="w-5 h-5" /> },
    { to: '/expenses', label: 'Expenses', icon: <FileText className="w-5 h-5" /> },
    { to: '/revenue', label: 'Revenue', icon: <IndianRupee className="w-5 h-5" /> },
    { to: '/reports', label: 'Reports', icon: <PieChart className="w-5 h-5" /> }
  ];

  const driverLinks = [
    { to: '/driver-dashboard', label: 'Dashboard', icon: <Activity className="w-5 h-5" /> },
    { to: '/trips', label: 'Trips', icon: <Map className="w-5 h-5" /> },
    { to: '/fuel', label: 'Fuel Log', icon: <Fuel className="w-5 h-5" /> }
  ];

  const navLinks = currentUser?.role === 'owner' ? ownerLinks : driverLinks;

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-50 border-r border-stone-200 flex flex-col z-50 shadow-sm">
      {/* Logo Section */}
      <div className="p-6 border-b border-stone-200">
        <Link to="/" className="flex items-center gap-3 group">
          <FleetTrackLogo className="w-12 h-12 drop-shadow-md transition-transform duration-300 group-hover:scale-105" />
          <div className="flex flex-col">
            <span className="text-xl font-bold text-amber-900 tracking-tight">FleetTrack</span>
            <span className="text-xs text-stone-500 font-medium">Fleet Management</span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-amber-700 text-white shadow-md shadow-amber-700/20' 
                    : 'text-stone-600 hover:bg-amber-100/70 hover:text-amber-800'
                }`}
              >
                <span className={`transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`}>
                  {link.icon}
                </span>
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-stone-200">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-100/80 mb-3">
          <div className="w-10 h-10 bg-amber-700 text-white rounded-full flex items-center justify-center text-sm font-bold">
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-stone-800 truncate">{currentUser?.name || 'User'}</p>
            <p className="text-xs text-stone-500 capitalize">{currentUser?.role}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
