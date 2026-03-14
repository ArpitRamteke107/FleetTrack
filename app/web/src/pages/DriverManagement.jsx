import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '../lib/pocketbaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Plus, Edit, Trash2, MapPin, Truck, Navigation, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { toast } from 'sonner';

const DriverManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    licence_number: '',
    joining_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const driversData = await pb.collection('users').getFullList({ 
        filter: 'role = "driver"',
        $autoCancel: false 
      });
      setDrivers(driversData);
    } catch (error) {
      toast.error('Failed to load drivers');
      console.error(error);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingDriver) {
        const updateData = {
          name: formData.name,
          phone: formData.phone,
          licence_number: formData.licence_number,
          joining_date: formData.joining_date
        };
        await pb.collection('users').update(editingDriver.id, updateData, { $autoCancel: false });
        toast.success('Driver updated successfully');
      } else {
        const driverData = {
          email: formData.email,
          password: formData.password,
          passwordConfirm: formData.password,
          name: formData.name,
          role: 'driver',
          phone: formData.phone,
          licence_number: formData.licence_number,
          joining_date: formData.joining_date
        };
        await pb.collection('users').create(driverData, { $autoCancel: false });
        toast.success('Driver added successfully');
      }

      setDialogOpen(false);
      resetForm();
      fetchDrivers();
    } catch (error) {
      toast.error(error.message || 'Failed to save driver');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setFormData({
      email: driver.email,
      password: '',
      name: driver.name || '',
      phone: driver.phone || '',
      licence_number: driver.licence_number || '',
      joining_date: driver.joining_date || new Date().toISOString().split('T')[0]
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return;

    try {
      await pb.collection('users').delete(id, { $autoCancel: false });
      toast.success('Driver deleted successfully');
      fetchDrivers();
    } catch (error) {
      toast.error('Failed to delete driver');
    }
  };

  const resetForm = () => {
    setEditingDriver(null);
    setFormData({
      email: '',
      password: '',
      name: '',
      phone: '',
      licence_number: '',
      joining_date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <>
      <Helmet>
        <title>Driver Management - Fleet Track Pro</title>
        <meta name="description" content="Manage your fleet drivers, assignments, and performance tracking." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-stone-50 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-stone-50 to-orange-50/50 pointer-events-none" />
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-amber-300/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-orange-300/15 rounded-full blur-[100px] pointer-events-none" />
        
        <Header className="relative z-20" />
        
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Driver Management</h1>
              <p className="text-muted-foreground">Manage your fleet drivers and their details</p>
            </div>
            
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-amber-800 hover:bg-amber-900 text-stone-100 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <Plus className="w-4 h-4" />
                  Add Driver
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingDriver ? 'Edit Driver' : 'Add New Driver'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!editingDriver && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          required
                          className="text-foreground"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => handleChange('password', e.target.value)}
                          required
                          minLength={8}
                          className="text-foreground"
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      required
                      className="text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licence_number">Licence Number</Label>
                    <Input
                      id="licence_number"
                      value={formData.licence_number}
                      onChange={(e) => handleChange('licence_number', e.target.value)}
                      className="text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="joining_date">Joining Date</Label>
                    <Input
                      id="joining_date"
                      type="date"
                      value={formData.joining_date}
                      onChange={(e) => handleChange('joining_date', e.target.value)}
                      className="text-foreground"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Saving...' : editingDriver ? 'Update Driver' : 'Add Driver'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="bg-white/80 backdrop-blur-sm border-stone-200 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-amber-900">Fleet Drivers</CardTitle>
            </CardHeader>
            <CardContent>
              {drivers.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-amber-50/50">
                        <TableHead className="text-amber-900">Name</TableHead>
                        <TableHead className="text-amber-900">Email</TableHead>
                        <TableHead className="text-amber-900">Phone</TableHead>
                        <TableHead className="text-amber-900">Licence Number</TableHead>
                        <TableHead className="text-amber-900">Joining Date</TableHead>
                        <TableHead className="text-amber-900">Location</TableHead>
                        <TableHead className="text-amber-900">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {drivers.map((driver) => (
                        <TableRow key={driver.id} className="hover:bg-amber-50/50 transition-colors duration-200">
                          <TableCell className="font-medium text-stone-800">{driver.name || 'N/A'}</TableCell>
                          <TableCell className="text-stone-600">{driver.email}</TableCell>
                          <TableCell className="text-stone-600">{driver.phone || 'N/A'}</TableCell>
                          <TableCell className="text-stone-600">{driver.licence_number || 'N/A'}</TableCell>
                          <TableCell className="text-stone-600">{driver.joining_date ? new Date(driver.joining_date).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell>
                            {driver.latitude && driver.longitude ? (
                              <a 
                                href={`https://www.google.com/maps?q=${driver.latitude},${driver.longitude}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 hover:bg-amber-200 transition-all duration-300 text-sm font-medium hover:scale-105"
                              >
                                <Navigation className="w-3 h-3" /> View Location
                              </a>
                            ) : (
                              <span className="text-stone-400 text-xs italic">Not tracking</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="ghost" onClick={() => handleEdit(driver)} className="hover:bg-amber-100 hover:text-amber-900 transition-all duration-300 hover:scale-110">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDelete(driver.id)} className="text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300 hover:scale-110">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center text-stone-400 py-8">No drivers added yet</p>
              )}
            </CardContent>
          </Card>

          {/* Journey Tracker Section */}
          {drivers.length > 0 && (
            <Card className="mt-8 bg-white/80 backdrop-blur-sm border-stone-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-stone-200">
                <CardTitle className="text-amber-900 flex items-center gap-2">
                  <Navigation className="w-5 h-5" />
                  Live Journey Tracker
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {drivers.filter(d => d.latitude && d.longitude).length > 0 ? (
                  <div className="space-y-6">
                    {drivers.filter(d => d.latitude && d.longitude).map((driver, index) => {
                      // Simulate journey progress (in real app, this would come from backend)
                      const journeyProgress = Math.random() * 100;
                      const distanceCovered = (journeyProgress * 1.5).toFixed(1); // Simulated km
                      
                      return (
                        <div key={driver.id} className="bg-stone-50/80 rounded-xl p-4 border border-stone-200 hover:border-amber-300 transition-all duration-300">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                <span className="font-bold text-amber-800">
                                  {driver.name ? driver.name.charAt(0).toUpperCase() : 'D'}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold text-stone-800">{driver.name || 'Unknown Driver'}</p>
                                <p className="text-xs text-stone-500">Last updated: {driver.last_location_update ? new Date(driver.last_location_update).toLocaleTimeString() : 'N/A'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="text-sm text-stone-500">Distance Covered</p>
                                <p className="text-lg font-bold text-amber-800">{distanceCovered} km</p>
                              </div>
                              <a 
                                href={`https://www.google.com/maps?q=${driver.latitude},${driver.longitude}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-800 text-stone-100 hover:bg-amber-900 transition-all duration-300 text-sm font-medium hover:scale-105 hover:shadow-lg"
                              >
                                <MapPin className="w-4 h-4" />
                                View Location
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                          
                          {/* Journey Progress Bar with Animated Truck */}
                          <div className="relative mt-4">
                            {/* Route Line */}
                            <div className="h-3 bg-stone-200 rounded-full overflow-hidden">
                              <motion.div 
                                className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${journeyProgress}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                              />
                            </div>
                            
                            {/* Start Point */}
                            <div className="absolute -top-1 left-0 w-5 h-5 rounded-full bg-green-500 border-2 border-white shadow-md flex items-center justify-center">
                              <span className="text-[8px] text-white font-bold">A</span>
                            </div>
                            
                            {/* End Point */}
                            <div className="absolute -top-1 right-0 w-5 h-5 rounded-full bg-red-500 border-2 border-white shadow-md flex items-center justify-center">
                              <span className="text-[8px] text-white font-bold">B</span>
                            </div>
                            
                            {/* Animated Truck */}
                            <motion.div 
                              className="absolute -top-3 transform -translate-x-1/2"
                              initial={{ left: "0%" }}
                              animate={{ left: `${journeyProgress}%` }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                            >
                              <motion.div
                                animate={{ y: [0, -2, 0] }}
                                transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
                                className="bg-amber-800 p-1.5 rounded-lg shadow-lg"
                              >
                                <Truck className="w-5 h-5 text-white" />
                              </motion.div>
                            </motion.div>
                          </div>
                          
                          {/* Progress Percentage */}
                          <div className="flex justify-between mt-3 text-xs text-stone-500">
                            <span>Start Point</span>
                            <span className="font-semibold text-amber-700">{journeyProgress.toFixed(0)}% Complete</span>
                            <span>Destination</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center">
                      <Navigation className="w-8 h-8 text-stone-400" />
                    </div>
                    <p className="text-stone-500 mb-2">No active tracking</p>
                    <p className="text-sm text-stone-400">Drivers need to enable location sharing to appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default DriverManagement;
