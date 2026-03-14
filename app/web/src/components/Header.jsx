import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Badge } from './ui/badge';
import { motion } from 'framer-motion';
import { Truck, User, LogOut, Menu, Home, Activity, Car, Users, Map, FileText, IndianRupee, PieChart, Info, ChevronRight, Droplet, Fuel, Settings } from 'lucide-react';

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
    <nav className="hidden md:flex items-center gap-1 lg:gap-2">
      {navLinks.map((link) => {
        const isActive = location.pathname === link.to;
        return (
          <Link
            key={link.to}
            to={link.to}
            onClick={onClick}
            className={`relative flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 ${
              isActive 
                ? 'text-primary font-bold bg-blue-50/80 shadow-inner' 
                : 'text-slate-600 hover:text-primary hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2 relative z-10">
              {link.icon}
              <span className="text-sm hidden lg:inline-block tracking-tight">{link.label}</span>
            </div>
            
            {/* Rolling Wheel Active Indicator */}
            {isActive && (
              <motion.div
                layoutId="activeNavWheel"
                className="absolute -bottom-5 left-1/2 flex items-center justify-center z-20 drop-shadow-lg"
                transition={{ type: "spring", stiffness: 60, damping: 18, mass: 1.2 }}
                style={{ x: "-50%" }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ ease: "linear", duration: 6, repeat: Infinity }}
                  className="bg-white rounded-full p-0.5 shadow-sm border border-slate-200"
                >
                  <Settings className="w-5 h-5 text-slate-900" />
                </motion.div>
              </motion.div>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4 lg:gap-8">
            {/* Mobile Hamburger Menu */}
            {currentUser && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden hover:bg-blue-50 text-primary transition-colors">
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-0 border-r-0 shadow-2xl bg-white">
                  <div className="h-full flex flex-col">
                    <div className="p-6 border-b bg-slate-50">
                      <SheetHeader className="text-left">
                        <SheetTitle className="flex items-center gap-3 text-xl font-bold text-primary">
                          <Truck className="w-6 h-6" />
                          Fleet Tracker
                        </SheetTitle>
                      </SheetHeader>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                       {navLinks.map(link => (
                          <Link key={link.to} to={link.to} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${location.pathname === link.to ? 'bg-primary border-primary text-white shadow-md' : 'hover:bg-slate-100 text-slate-700'}`}>
                             {link.icon}
                             <span className="font-medium">{link.label}</span>
                          </Link>
                       ))}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}

            <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105 z-10">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 hidden xl:inline-block">Fleet Tracker</span>
            </Link>

            {/* Desktop Top Navigation with Rolling Wheel */}
            {currentUser && <NavLinks />}
          </div>

          <div className="flex items-center gap-4">
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 rounded-full pl-2 pr-4 bg-slate-100 hover:bg-slate-200 border border-slate-200">
                    <div className="w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-xs font-bold">
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <User className="w-3 h-3" />}
                    </div>
                    <span className="hidden sm:inline font-medium text-slate-700">{currentUser.name?.split(' ')[0] || 'Profile'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-slate-100">
                  <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 rounded-t-xl text-center">
                    <p className="text-sm font-semibold text-slate-800">{currentUser.name || currentUser.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{currentUser.role} Account</p>
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
                  <Button variant="ghost" className="hover:bg-blue-50 hover:text-primary font-medium">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button className="font-medium shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all">Sign Up</Button>
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