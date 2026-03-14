import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '../lib/pocketbaseClient';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { toast } from 'sonner';

const FuelLogging = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [fuelRecords, setFuelRecords] = useState([]);
  const [formData, setFormData] = useState({
    vehicle: '',
    driver: currentUser.role === 'driver' ? currentUser.id : '',
    date: new Date().toISOString().split('T')[0],
    litres: '',
    rate_per_litre: '',
    total_cost: ''
  });

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    try {
      const [vehiclesData, driversData, fuelData] = await Promise.all([
        currentUser.role === 'owner'
          ? pb.collection('vehicles').getFullList({ $autoCancel: false })
          : pb.collection('vehicles').getFullList({
            filter: `assigned_driver = "${currentUser.id}"`,
            $autoCancel: false
          }),
        currentUser.role === 'owner'
          ? pb.collection('users').getFullList({
            filter: 'role = "driver"',
            $autoCancel: false
          })
          : [],
        currentUser.role === 'owner'
          ? pb.collection('fuel').getFullList({
            sort: '-date',
            expand: 'vehicle,driver',
            $autoCancel: false
          })
          : pb.collection('fuel').getFullList({
            filter: `driver = "${currentUser.id}"`,
            sort: '-date',
            expand: 'vehicle',
            $autoCancel: false
          })
      ]);

      setVehicles(vehiclesData);
      setDrivers(driversData);
      setFuelRecords(fuelData);
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      if (field === 'litres' || field === 'rate_per_litre') {
        const litres = parseFloat(field === 'litres' ? value : updated.litres) || 0;
        const rate = parseFloat(field === 'rate_per_litre' ? value : updated.rate_per_litre) || 0;
        updated.total_cost = (litres * rate).toFixed(2);
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.vehicle || !formData.driver || !formData.litres || !formData.rate_per_litre) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const fuelData = {
        vehicle: formData.vehicle,
        driver: formData.driver,
        date: formData.date,
        litres: parseFloat(formData.litres),
        rate_per_litre: parseFloat(formData.rate_per_litre),
        total_cost: parseFloat(formData.total_cost)
      };

      await pb.collection('fuel').create(fuelData, { $autoCancel: false });

      toast.success('Fuel record logged successfully');

      setFormData({
        vehicle: '',
        driver: currentUser.role === 'driver' ? currentUser.id : '',
        date: new Date().toISOString().split('T')[0],
        litres: '',
        rate_per_litre: '',
        total_cost: ''
      });
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to log fuel record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Fuel Logging - Fleet Track Pro</title>
        <meta name="description" content="Log and track fuel consumption for your fleet vehicles." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/80 pointer-events-none" />
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <Header className="relative z-20" />

        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Fuel Logging</h1>
            <p className="text-muted-foreground">Record fuel consumption and track expenses</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1 bg-white/80 backdrop-blur-sm border-blue-100/50 shadow-sm">
              <CardHeader>
                <CardTitle>Log Fuel Entry</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicle">Vehicle *</Label>
                    <Select value={formData.vehicle} onValueChange={(value) => handleChange('vehicle', value)}>
                      <SelectTrigger id="vehicle">
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.vehicle_number} - {vehicle.type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {currentUser.role === 'owner' && (
                    <div className="space-y-2">
                      <Label htmlFor="driver">Driver *</Label>
                      <Select value={formData.driver} onValueChange={(value) => handleChange('driver', value)}>
                        <SelectTrigger id="driver">
                          <SelectValue placeholder="Select driver" />
                        </SelectTrigger>
                        <SelectContent>
                          {drivers.map((driver) => (
                            <SelectItem key={driver.id} value={driver.id}>
                              {driver.name || driver.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleChange('date', e.target.value)}
                      required
                      className="text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="litres">Litres *</Label>
                    <Input
                      id="litres"
                      type="number"
                      step="0.01"
                      value={formData.litres}
                      onChange={(e) => handleChange('litres', e.target.value)}
                      required
                      className="text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rate_per_litre">Rate per Litre (₹) *</Label>
                    <Input
                      id="rate_per_litre"
                      type="number"
                      step="0.01"
                      value={formData.rate_per_litre}
                      onChange={(e) => handleChange('rate_per_litre', e.target.value)}
                      required
                      className="text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="total_cost">Total Cost (₹)</Label>
                    <Input
                      id="total_cost"
                      type="number"
                      step="0.01"
                      value={formData.total_cost}
                      readOnly
                      className="bg-muted text-foreground"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Logging Fuel...' : 'Log Fuel'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-blue-100/50 shadow-sm">
              <CardHeader>
                <CardTitle>Fuel Records</CardTitle>
              </CardHeader>
              <CardContent>
                {fuelRecords.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Vehicle</TableHead>
                          {currentUser.role === 'owner' && <TableHead>Driver</TableHead>}
                          <TableHead>Litres</TableHead>
                          <TableHead>Rate/L</TableHead>
                          <TableHead>Total Cost</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fuelRecords.map((fuel) => (
                          <TableRow key={fuel.id}>
                            <TableCell>{new Date(fuel.date).toLocaleDateString()}</TableCell>
                            <TableCell>{fuel.expand?.vehicle?.vehicle_number || 'N/A'}</TableCell>
                            {currentUser.role === 'owner' && (
                              <TableCell>{fuel.expand?.driver?.name || fuel.expand?.driver?.email || 'N/A'}</TableCell>
                            )}
                            <TableCell>{fuel.litres}L</TableCell>
                            <TableCell>₹{fuel.rate_per_litre}</TableCell>
                            <TableCell className="font-semibold">₹{fuel.total_cost}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No fuel records yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default FuelLogging;