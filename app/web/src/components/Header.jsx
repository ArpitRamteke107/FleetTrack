import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Badge } from './ui/badge';
import { motion } from 'framer-motion';
import { Truck, User, LogOut, Menu, Home, Activity, Car, Users, Map, FileText, IndianRupee, PieChart, Info, ChevronRight, Droplet, Fuel } from 'lucide-react';

// Simple 2D Truck Wheel SVG Component
const TruckWheel = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className}>
    {/* Outer tire - black rubber */}
    <circle cx="50" cy="50" r="48" fill="#1a1a1a"/>
    {/* Tire tread pattern */}
    <circle cx="50" cy="50" r="42" fill="none" stroke="#333" strokeWidth="4" strokeDasharray="8 4"/>
    {/* Wheel rim - silver/gray */}
    <circle cx="50" cy="50" r="30" fill="#4a4a4a"/>
    {/* Inner rim highlight */}
    <circle cx="50" cy="50" r="24" fill="#5a5a5a"/>
    {/* Hub center */}
    <circle cx="50" cy="50" r="14" fill="#3a3a3a"/>
    {/* Center cap */}
    <circle cx="50" cy="50" r="8" fill="#2a2a2a"/>
    {/* Spokes - 5 spoke design */}
    <line x1="50" y1="20" x2="50" y2="36" stroke="#3a3a3a" strokeWidth="8" strokeLinecap="round"/>
    <line x1="78" y1="41" x2="64" y2="46" stroke="#3a3a3a" strokeWidth="8" strokeLinecap="round"/>
    <line x1="68" y1="74" x2="58" y2="62" stroke="#3a3a3a" strokeWidth="8" strokeLinecap="round"/>
    <line x1="32" y1="74" x2="42" y2="62" stroke="#3a3a3a" strokeWidth="8" strokeLinecap="round"/>
    <line x1="22" y1="41" x2="36" y2="46" stroke="#3a3a3a" strokeWidth="8" strokeLinecap="round"/>
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
          transition={{ type: "spring", stiffness: 80, damping: 15, mass: 1 }}
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

            <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-110 hover:rotate-1 duration-300 z-10">
              <div className="w-9 h-9 bg-gradient-to-br from-amber-700 to-amber-900 rounded-xl flex items-center justify-center shadow-sm">
                <Truck className="w-5 h-5 text-stone-100" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-900 to-stone-700 hidden xl:inline-block">Fleet Tracker</span>
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
