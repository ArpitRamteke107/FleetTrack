import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '../lib/pocketbaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
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
      
      <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/80 pointer-events-none" />
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        
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
                <Button className="gap-2">
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

          <Card className="bg-white/80 backdrop-blur-sm border-blue-100/50 shadow-sm">
            <CardHeader>
              <CardTitle>Fleet Drivers</CardTitle>
            </CardHeader>
            <CardContent>
              {drivers.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Licence Number</TableHead>
                        <TableHead>Joining Date</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {drivers.map((driver) => (
                        <TableRow key={driver.id}>
                          <TableCell className="font-medium">{driver.name || 'N/A'}</TableCell>
                          <TableCell>{driver.email}</TableCell>
                          <TableCell>{driver.phone || 'N/A'}</TableCell>
                          <TableCell>{driver.licence_number || 'N/A'}</TableCell>
                          <TableCell>{driver.joining_date ? new Date(driver.joining_date).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell>
                            {driver.latitude && driver.longitude ? (
                              <a 
                                href={`https://www.google.com/maps?q=${driver.latitude},${driver.longitude}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1 text-sm font-medium"
                              >
                                <MapPin className="w-3 h-3" /> View Map
                              </a>
                            ) : (
                              <span className="text-muted-foreground text-xs">Not tracking</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="ghost" onClick={() => handleEdit(driver)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDelete(driver.id)} className="text-destructive">
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
                <p className="text-center text-muted-foreground py-8">No drivers added yet</p>
              )}
            </CardContent>
          </Card>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default DriverManagement;