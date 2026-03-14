import React from 'react';
import Sidebar from './Sidebar.jsx';
import { Menu } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from './ui/sheet';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Activity, Car, Users, Map, FileText, IndianRupee, PieChart, Fuel, LogOut, User, Truck } from 'lucide-react';

const DashboardLayout = ({ children }) => {
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

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-stone-50 via-amber-50/50 to-stone-50 border-b border-stone-200 flex items-center justify-between px-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-amber-50 text-amber-800">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 border-r-0 shadow-2xl bg-stone-50">
            <div className="h-full flex flex-col">
              <div className="p-6 border-b border-stone-200 bg-amber-50/50">
                <SheetHeader className="text-left">
                  <SheetTitle className="flex items-center gap-3 text-xl font-bold text-amber-900">
                    <Truck className="w-6 h-6" />
                    FleetTrack
                  </SheetTitle>
                </SheetHeader>
              </div>
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                {navLinks.map(link => (
                  <Link 
                    key={link.to} 
                    to={link.to} 
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                      location.pathname === link.to 
                        ? 'bg-amber-700 text-white shadow-md' 
                        : 'hover:bg-amber-100 text-stone-700'
                    }`}
                  >
                    {link.icon}
                    <span className="font-medium">{link.label}</span>
                  </Link>
                ))}
              </div>
              <div className="p-4 border-t border-stone-200">
                <div className="flex items-center gap-3 px-3 py-2 mb-3">
                  <div className="w-8 h-8 bg-amber-700 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-800">{currentUser?.name || 'User'}</p>
                    <p className="text-xs text-stone-500 capitalize">{currentUser?.role}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={logout}
                  className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <span className="text-lg font-bold text-amber-900">FleetTrack</span>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Main Content */}
      <div className="md:ml-64 min-h-screen">
        <div className="pt-16 md:pt-0">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
