import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Badge } from './ui/badge';
import { motion } from 'framer-motion';
import { Truck, User, LogOut, Menu, Home, Activity, Car, Users, Map, FileText, IndianRupee, PieChart, Info, ChevronRight, Droplet, Fuel } from 'lucide-react';

// Simple 2D Truck Wheel SVG Component - Brighter colors
const TruckWheel = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className}>
    {/* Outer tire - dark gray rubber */}
    <circle cx="50" cy="50" r="48" fill="#2d2d2d"/>
    {/* Tire tread pattern */}
    <circle cx="50" cy="50" r="42" fill="none" stroke="#4a4a4a" strokeWidth="4" strokeDasharray="8 4"/>
    {/* Wheel rim - bright silver */}
    <circle cx="50" cy="50" r="30" fill="#a0a0a0"/>
    {/* Inner rim highlight */}
    <circle cx="50" cy="50" r="24" fill="#c0c0c0"/>
    {/* Hub center */}
    <circle cx="50" cy="50" r="14" fill="#888"/>
    {/* Center cap - amber accent */}
    <circle cx="50" cy="50" r="8" fill="#b45309"/>
    {/* Spokes - 5 spoke design with brighter color */}
    <line x1="50" y1="20" x2="50" y2="36" stroke="#707070" strokeWidth="8" strokeLinecap="round"/>
    <line x1="78" y1="41" x2="64" y2="46" stroke="#707070" strokeWidth="8" strokeLinecap="round"/>
    <line x1="68" y1="74" x2="58" y2="62" stroke="#707070" strokeWidth="8" strokeLinecap="round"/>
    <line x1="32" y1="74" x2="42" y2="62" stroke="#707070" strokeWidth="8" strokeLinecap="round"/>
    <line x1="22" y1="41" x2="36" y2="46" stroke="#707070" strokeWidth="8" strokeLinecap="round"/>
  </svg>
);

// Professional FleetTrack Logo SVG
const FleetTrackLogo = ({ className }) => (
  <svg viewBox="0 0 40 40" className={className} fill="none">
    {/* Background circle with gradient effect */}
    <circle cx="20" cy="20" r="19" fill="url(#logoGradient)" />
    {/* Road/path element */}
    <path d="M6 26 Q20 18 34 26" stroke="#fef3c7" strokeWidth="3" strokeLinecap="round" fill="none" />
    <path d="M6 26 Q20 18 34 26" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeDasharray="4 3" />
    {/* Stylized truck silhouette */}
    <rect x="12" y="14" width="14" height="8" rx="1.5" fill="#fef3c7" />
    <rect x="8" y="17" width="6" height="5" rx="1" fill="#fef3c7" />
    {/* Cab window */}
    <rect x="9" y="18" width="4" height="3" rx="0.5" fill="#78350f" />
    {/* Wheels */}
    <circle cx="13" cy="22" r="2.5" fill="#292524" stroke="#a8a29e" strokeWidth="1" />
    <circle cx="23" cy="22" r="2.5" fill="#292524" stroke="#a8a29e" strokeWidth="1" />
    {/* Location pin accent */}
    <path d="M30 10 C30 6 34 6 34 10 C34 12 32 14 32 14 C32 14 30 12 30 10 Z" fill="#fbbf24" />
    <circle cx="32" cy="10" r="1.5" fill="#78350f" />
    {/* Gradient definition */}
    <defs>
      <linearGradient id="logoGradient" x1="0" y1="0" x2="40" y2="40">
        <stop offset="0%" stopColor="#78350f" />
        <stop offset="100%" stopColor="#92400e" />
      </linearGradient>
    </defs>
  </svg>
);

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const ownerLinks = [
    { to: '/owner-dashboard', label: 'Dashboard', icon: <Activity className="w-5 h-5" /> },
    { to: '/vehicles', label: 'Vehicles', icon: <Car className="w-5 h-5" /> },
    { to: '/drivers', label: 'Drivers', icon: <Users className="w-5 h-5" /> },
    { to: '/trips', label: 'Trips', icon: <Map className="w-5 h-5" /> },
    { to: '/fuel', label: 'Fuel', icon: <Fuel className="w-5 h-5" /> }, /* Note: Fuel icon isn't imported from lucide-react above, let's use Activity or similar if needed, wait I'll add Fuel to import */
    { to: '/expenses', label: 'Expenses', icon: <FileText className="w-5 h-5" /> },
    { to: '/revenue', label: 'Revenue', icon: <IndianRupee className="w-5 h-5" /> },
    { to: '/reports', label: 'Reports', icon: <PieChart className="w-5 h-5" /> }
  ];

  const driverLinks = [
    { to: '/driver-dashboard', label: 'Dashboard', icon: <Activity className="w-5 h-5" /> },
    { to: '/trips', label: 'Trips', icon: <Map className="w-5 h-5" /> },
    { to: '/fuel', label: 'Fuel Log', icon: <Droplet className="w-5 h-5" /> }
  ];

  const navLinks = currentUser?.role === 'owner' ? ownerLinks : driverLinks;

  const NavLinks = ({ onClick }) => (
    <nav className="hidden md:flex items-center relative">
      {/* Navigation container with colorful background */}
      <div className="flex items-center gap-1 lg:gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 via-orange-50 to-amber-100 rounded-full border border-amber-200/50 shadow-inner">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={onClick}
              className={`relative flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 hover:scale-105 ${
                isActive 
                  ? 'text-amber-900 font-bold bg-white shadow-md' 
                  : 'text-stone-600 hover:text-amber-800 hover:bg-white/60'
              }`}
            >
              <div className="flex items-center gap-2 relative z-10">
                {link.icon}
                <span className="text-sm hidden lg:inline-block tracking-tight">{link.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
      
      {/* Track/Road bar under navigation */}
      <div className="absolute -bottom-4 left-0 right-0 mx-4">
        {/* Road surface */}
        <div className="h-2 bg-gradient-to-r from-stone-300 via-stone-400 to-stone-300 rounded-full shadow-inner" />
        {/* Road marking dashes */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-0.5 w-full mx-2 border-t-2 border-dashed border-amber-200/60" />
        </div>
        
        {/* Rolling wheel on the track */}
        <motion.div
          layoutId="activeNavWheel"
          className="absolute -top-2 flex items-center justify-center z-20"
          style={{ 
            left: `${(navLinks.findIndex(link => link.to === location.pathname) / navLinks.length) * 100 + (50 / navLinks.length)}%`,
            x: "-50%"
          }}
          transition={{ type: "tween", duration: 0.5, ease: "easeInOut" }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ ease: "linear", duration: 1.5, repeat: Infinity }}
            className="drop-shadow-lg"
          >
            <TruckWheel className="w-6 h-6" />
          </motion.div>
        </motion.div>
      </div>
    </nav>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-amber-200 bg-gradient-to-r from-amber-50/95 via-stone-50/95 to-orange-50/95 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between pb-2">
          <div className="flex items-center gap-4 lg:gap-8">
            {/* Mobile Hamburger Menu */}
            {currentUser && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden hover:bg-amber-50 text-amber-800 transition-colors hover:rotate-90 duration-300">
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-0 border-r-0 shadow-2xl bg-stone-50">
                  <div className="h-full flex flex-col">
                    <div className="p-6 border-b border-stone-200 bg-amber-50/50">
                      <SheetHeader className="text-left">
                        <SheetTitle className="flex items-center gap-3 text-xl font-bold text-amber-900">
                          <Truck className="w-6 h-6" />
                          Fleet Tracker
                        </SheetTitle>
                      </SheetHeader>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                       {navLinks.map(link => (
                          <Link key={link.to} to={link.to} className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:translate-x-1 ${location.pathname === link.to ? 'bg-amber-800 text-white shadow-md' : 'hover:bg-amber-100 text-stone-700'}`}>
                             {link.icon}
                             <span className="font-medium">{link.label}</span>
                          </Link>
                       ))}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}

            <Link to="/" className="flex items-center gap-2.5 transition-transform hover:scale-105 duration-300 z-10">
              <FleetTrackLogo className="w-10 h-10 drop-shadow-md" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-800 to-amber-950 hidden xl:inline-block">FleetTrack</span>
            </Link>

            {/* Desktop Top Navigation with Rolling Wheel */}
            {currentUser && <NavLinks />}
          </div>

          <div className="flex items-center gap-4">
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 rounded-full pl-2 pr-4 bg-stone-100 hover:bg-amber-100 border border-stone-200 transition-all duration-300 hover:shadow-md">
                    <div className="w-6 h-6 bg-amber-800 text-stone-100 rounded-full flex items-center justify-center text-xs font-bold">
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <User className="w-3 h-3" />}
                    </div>
                    <span className="hidden sm:inline font-medium text-stone-700">{currentUser.name?.split(' ')[0] || 'Profile'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-stone-200 bg-stone-50">
                  <div className="px-3 py-2 border-b border-stone-200 bg-amber-50/50 rounded-t-xl text-center">
                    <p className="text-sm font-semibold text-amber-900">{currentUser.name || currentUser.email}</p>
                    <p className="text-xs text-stone-500 capitalize">{currentUser.role} Account</p>
                  </div>
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-red-50 cursor-pointer p-3 rounded-b-xl">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" className="hover:bg-amber-50 hover:text-amber-900 font-medium transition-all duration-300 hover:scale-105">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button className="font-medium bg-amber-800 hover:bg-amber-900 text-stone-100 shadow-md shadow-amber-800/20 hover:shadow-lg hover:shadow-amber-900/30 transition-all duration-300 hover:scale-105">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
