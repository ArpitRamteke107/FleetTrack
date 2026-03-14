import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '../lib/pocketbaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Edit, Trash2, UserPlus } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout.jsx';
import FloatingAddButton from '../components/FloatingAddButton.jsx';
import { toast } from 'sonner';


const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    vehicle_number: '',
    type: '',
    registration: '',
    insurance: '',
    assigned_driver: 'none',
    purchase_date: '',
    value: '',
    status: 'active'
  });
  const [driverFormData, setDriverFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    licence_number: '',
    joining_date: new Date().toISOString().split('T')[0]
  });
  const [driverLoading, setDriverLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vehiclesData, driversData] = await Promise.all([
        pb.collection('vehicles').getFullList({
          expand: 'assigned_driver',
          $autoCancel: false
        }),
        pb.collection('users').getFullList({
          filter: 'role = "driver"',
          $autoCancel: false
        })
      ]);

      setVehicles(vehiclesData);
      setDrivers(driversData);
    } catch (error) {
      toast.error('Failed to load vehicles');
      console.error(error);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDriverChange = (field, value) => {
    setDriverFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDriverSubmit = async (e) => {
    e.preventDefault();
    setDriverLoading(true);

    try {
      const driverData = {
        email: driverFormData.email,
        password: driverFormData.password,
        passwordConfirm: driverFormData.password,
        name: driverFormData.name,
        role: 'driver',
        phone: driverFormData.phone,
        licence_number: driverFormData.licence_number,
        joining_date: driverFormData.joining_date
      };
      await pb.collection('users').create(driverData, { $autoCancel: false });
      toast.success('Driver added successfully');
      setShowDriverForm(false);
      resetDriverForm();
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to add driver');
    } finally {
      setDriverLoading(false);
    }
  };

  const resetDriverForm = () => {
    setDriverFormData({
      email: '',
      password: '',
      name: '',
      phone: '',
      licence_number: '',
      joining_date: new Date().toISOString().split('T')[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const vehicleData = {
        ...formData,
        value: formData.value ? parseFloat(formData.value) : 0,
        assigned_driver: formData.assigned_driver === 'none' ? '' : formData.assigned_driver
      };

      if (editingVehicle) {
        await pb.collection('vehicles').update(editingVehicle.id, vehicleData, { $autoCancel: false });
        toast.success('Vehicle updated successfully');
      } else {
        await pb.collection('vehicles').create(vehicleData, { $autoCancel: false });
        toast.success('Vehicle added successfully');
      }

      setShowVehicleForm(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to save vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      vehicle_number: vehicle.vehicle_number,
      type: vehicle.type || '',
      registration: vehicle.registration || '',
      insurance: vehicle.insurance || '',
      assigned_driver: vehicle.assigned_driver || 'none',
      purchase_date: vehicle.purchase_date || '',
      value: vehicle.value || '',
      status: vehicle.status || 'active'
    });
    setShowVehicleForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      await pb.collection('vehicles').delete(id, { $autoCancel: false });
      toast.success('Vehicle deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete vehicle');
    }
  };

  const resetForm = () => {
    setEditingVehicle(null);
    setFormData({
      vehicle_number: '',
      type: '',
      registration: '',
      insurance: '',
      assigned_driver: 'none',
      purchase_date: '',
      value: '',
      status: 'active'
    });
  };

  const handleCancel = () => {
    setShowVehicleForm(false);
    resetForm();
  };

  return (
    <>
      <Helmet>
        <title>Vehicle Management - Fleet Track Pro</title>
        <meta name="description" content="Manage your fleet vehicles, assignments, and maintenance records." />
      </Helmet>

      <DashboardLayout>
        <div className="min-h-screen relative overflow-hidden">
          {/* Background Gradients */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-stone-50 to-orange-50/50 pointer-events-none" />
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-amber-300/15 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-orange-300/15 rounded-full blur-[100px] pointer-events-none" />

          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2 text-amber-900">Vehicles</h1>
              <p className="text-stone-600">Manage your fleet vehicles and assignments</p>
            </div>

          {/* Inline Add/Edit Vehicle Form */}
          {showVehicleForm && (
            <Card className="mb-8 bg-white border-stone-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-stone-800">
                  {editingVehicle ? 'Edit vehicle' : 'Add new vehicle'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  {/* Vehicle Details Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="space-y-2">
                      <Label htmlFor="vehicle_number" className="text-stone-700">Vehicle Number</Label>
                      <Input
                        id="vehicle_number"
                        placeholder="MH 12 AB 1234"
                        value={formData.vehicle_number}
                        onChange={(e) => handleChange('vehicle_number', e.target.value)}
                        required
                        className="bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-stone-700">Type</Label>
                      <Input
                        id="type"
                        placeholder="Truck, Dumper, etc."
                        value={formData.type}
                        onChange={(e) => handleChange('type', e.target.value)}
                        className="bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-stone-700">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                        <SelectTrigger id="status" className="bg-white border-stone-200 text-stone-900">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Separator */}
                  <div className="border-t border-stone-200 my-6" />

                  {/* Assign Driver Section */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-stone-800">Assign Driver</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDriverForm(!showDriverForm)}
                        className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
                      >
                        <UserPlus className="w-4 h-4" />
                        Add New Driver
                      </Button>
                    </div>

                    {/* Inline Add Driver Form */}
                    {showDriverForm && (
                      <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-stone-800 mb-4">New Driver Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                          <div className="space-y-2">
                            <Label htmlFor="driver_email" className="text-stone-700">Email *</Label>
                            <Input
                              id="driver_email"
                              type="email"
                              placeholder="driver@example.com"
                              value={driverFormData.email}
                              onChange={(e) => handleDriverChange('email', e.target.value)}
                              required
                              className="bg-white border-stone-200 text-stone-900"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="driver_password" className="text-stone-700">Password *</Label>
                            <Input
                              id="driver_password"
                              type="password"
                              placeholder="Min 8 characters"
                              value={driverFormData.password}
                              onChange={(e) => handleDriverChange('password', e.target.value)}
                              required
                              minLength={8}
                              className="bg-white border-stone-200 text-stone-900"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="driver_name" className="text-stone-700">Name *</Label>
                            <Input
                              id="driver_name"
                              placeholder="Full name"
                              value={driverFormData.name}
                              onChange={(e) => handleDriverChange('name', e.target.value)}
                              required
                              className="bg-white border-stone-200 text-stone-900"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="driver_phone" className="text-stone-700">Phone</Label>
                            <Input
                              id="driver_phone"
                              type="tel"
                              placeholder="Phone number"
                              value={driverFormData.phone}
                              onChange={(e) => handleDriverChange('phone', e.target.value)}
                              className="bg-white border-stone-200 text-stone-900"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="driver_licence" className="text-stone-700">Licence Number</Label>
                            <Input
                              id="driver_licence"
                              placeholder="DL-1234567890"
                              value={driverFormData.licence_number}
                              onChange={(e) => handleDriverChange('licence_number', e.target.value)}
                              className="bg-white border-stone-200 text-stone-900"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowDriverForm(false);
                              resetDriverForm();
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleDriverSubmit}
                            disabled={driverLoading}
                            className="bg-amber-700 hover:bg-amber-800 text-white"
                          >
                            {driverLoading ? 'Adding...' : 'Add Driver'}
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="assigned_driver" className="text-stone-600">Select Driver (Optional)</Label>
                      <Select value={formData.assigned_driver} onValueChange={(value) => handleChange('assigned_driver', value)}>
                        <SelectTrigger id="assigned_driver" className="bg-white border-stone-200 text-stone-900 max-w-xs">
                          <SelectValue placeholder="None" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {drivers.map((driver) => (
                            <SelectItem key={driver.id} value={driver.id}>
                              {driver.name || driver.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-center gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      className="px-8 border-stone-300 text-stone-700 hover:bg-stone-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="px-8 bg-amber-700 hover:bg-amber-800 text-white"
                    >
                      {loading ? 'Saving...' : editingVehicle ? 'Update Vehicle' : 'Save Vehicle'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card className="bg-white/80 backdrop-blur-sm border-stone-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-amber-900">All vehicles</CardTitle>
            </CardHeader>
            <CardContent>
              {vehicles.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-stone-500 uppercase text-xs font-medium">Number</TableHead>
                        <TableHead className="text-stone-500 uppercase text-xs font-medium">Type</TableHead>
                        <TableHead className="text-stone-500 uppercase text-xs font-medium">Driver</TableHead>
                        <TableHead className="text-stone-500 uppercase text-xs font-medium">Status</TableHead>
                        <TableHead className="text-stone-500 uppercase text-xs font-medium">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vehicles.map((vehicle) => (
                        <TableRow key={vehicle.id} className="hover:bg-stone-50">
                          <TableCell className="font-medium text-stone-800">{vehicle.vehicle_number}</TableCell>
                          <TableCell className="text-stone-600">{vehicle.type || '-'}</TableCell>
                          <TableCell className="text-stone-600">{vehicle.expand?.assigned_driver?.name || vehicle.expand?.assigned_driver?.email || '-'}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline"
                              className={
                                vehicle.status === 'active' ? 'border-green-200 bg-green-50 text-green-700' :
                                vehicle.status === 'maintenance' ? 'border-amber-200 bg-amber-50 text-amber-700' :
                                'border-stone-200 bg-stone-50 text-stone-600'
                              }
                            >
                              {vehicle.status ? vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1) : 'Unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="ghost" onClick={() => handleEdit(vehicle)} className="hover:bg-amber-50 hover:text-amber-700">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDelete(vehicle.id)} className="text-red-500 hover:bg-red-50 hover:text-red-600">
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
                <p className="text-center text-muted-foreground py-8">No vehicles added yet</p>
              )}
            </CardContent>
          </Card>
          </main>

          {/* Floating Add Button */}
          <FloatingAddButton 
            onClick={() => setShowVehicleForm(true)} 
            disabled={showVehicleForm}
          />
        </div>
      </DashboardLayout>
    </>
  );
};

export default VehicleManagement;
