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
import { Plus } from 'lucide-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { toast } from 'sonner';

const FuelLogging = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showFuelForm, setShowFuelForm] = useState(false);
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

  const resetForm = () => {
    setFormData({
      vehicle: '',
      driver: currentUser.role === 'driver' ? currentUser.id : '',
      date: new Date().toISOString().split('T')[0],
      litres: '',
      rate_per_litre: '',
      total_cost: ''
    });
  };

  const handleCancel = () => {
    setShowFuelForm(false);
    resetForm();
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

      setShowFuelForm(false);
      resetForm();
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

      <div className="min-h-screen flex flex-col bg-stone-100 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-stone-50 to-orange-50/50 pointer-events-none" />
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-amber-300/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-orange-300/15 rounded-full blur-[100px] pointer-events-none" />
        
        <Header className="relative z-20" />

        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-amber-900">Fuel</h1>
              <p className="text-stone-600">Record fuel consumption and track expenses</p>
            </div>

            <Button 
              onClick={() => setShowFuelForm(true)} 
              className="gap-2 bg-amber-700 hover:bg-amber-800 text-white"
              disabled={showFuelForm}
            >
              <Plus className="w-4 h-4" />
              Add Fuel Entry
            </Button>
          </div>

          {/* Inline Add Fuel Form */}
          {showFuelForm && (
            <Card className="mb-8 bg-white border-stone-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-stone-800">Log fuel entry</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  {/* Fuel Details Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                    <div className="space-y-2">
                      <Label htmlFor="vehicle" className="text-stone-700">Vehicle *</Label>
                      <Select value={formData.vehicle} onValueChange={(value) => handleChange('vehicle', value)}>
                        <SelectTrigger id="vehicle" className="bg-stone-50 border-stone-200 text-stone-900">
                          <SelectValue placeholder="Select vehicle" />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicles.map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.vehicle_number} {vehicle.type ? `- ${vehicle.type}` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {currentUser.role === 'owner' && (
                      <div className="space-y-2">
                        <Label htmlFor="driver" className="text-stone-700">Driver *</Label>
                        <Select value={formData.driver} onValueChange={(value) => handleChange('driver', value)}>
                          <SelectTrigger id="driver" className="bg-stone-50 border-stone-200 text-stone-900">
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
                      <Label htmlFor="date" className="text-stone-700">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleChange('date', e.target.value)}
                        required
                        className="bg-stone-50 border-stone-200 text-stone-900"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="litres" className="text-stone-700">Litres *</Label>
                      <Input
                        id="litres"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.litres}
                        onChange={(e) => handleChange('litres', e.target.value)}
                        required
                        className="bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rate_per_litre" className="text-stone-700">Rate/Litre (Rs) *</Label>
                      <Input
                        id="rate_per_litre"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.rate_per_litre}
                        onChange={(e) => handleChange('rate_per_litre', e.target.value)}
                        required
                        className="bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="total_cost" className="text-stone-700">Total Cost (Rs)</Label>
                      <Input
                        id="total_cost"
                        type="number"
                        step="0.01"
                        value={formData.total_cost}
                        readOnly
                        className="bg-stone-100 border-stone-200 text-stone-700"
                      />
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-center gap-3 pt-4 border-t border-stone-200">
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
                      {loading ? 'Saving...' : 'Save Fuel Entry'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Fuel Records Table */}
          <Card className="bg-white/80 backdrop-blur-sm border-stone-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-amber-900">All fuel records</CardTitle>
            </CardHeader>
            <CardContent>
              {fuelRecords.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-stone-500 uppercase text-xs font-medium">Date</TableHead>
                        <TableHead className="text-stone-500 uppercase text-xs font-medium">Vehicle</TableHead>
                        {currentUser.role === 'owner' && <TableHead className="text-stone-500 uppercase text-xs font-medium">Driver</TableHead>}
                        <TableHead className="text-stone-500 uppercase text-xs font-medium">Litres</TableHead>
                        <TableHead className="text-stone-500 uppercase text-xs font-medium">Rate/L</TableHead>
                        <TableHead className="text-stone-500 uppercase text-xs font-medium">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fuelRecords.map((fuel) => (
                        <TableRow key={fuel.id} className="hover:bg-stone-50">
                          <TableCell className="text-stone-600">{new Date(fuel.date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-stone-800 font-medium">{fuel.expand?.vehicle?.vehicle_number || '-'}</TableCell>
                          {currentUser.role === 'owner' && (
                            <TableCell className="text-stone-600">{fuel.expand?.driver?.name || fuel.expand?.driver?.email || '-'}</TableCell>
                          )}
                          <TableCell className="text-stone-600">{fuel.litres}L</TableCell>
                          <TableCell className="text-stone-600">Rs{fuel.rate_per_litre}</TableCell>
                          <TableCell className="font-semibold text-stone-800">Rs{fuel.total_cost}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center text-stone-500 py-8">No fuel records yet</p>
              )}
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default FuelLogging;
