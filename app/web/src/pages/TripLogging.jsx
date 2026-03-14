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
import { Badge } from '../components/ui/badge';
import DashboardLayout from '../components/DashboardLayout.jsx';
import FloatingAddButton from '../components/FloatingAddButton.jsx';
import { toast } from 'sonner';

const TripLogging = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showTripForm, setShowTripForm] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [formData, setFormData] = useState({
    trip_number: '',
    vehicle: '',
    driver: currentUser.role === 'driver' ? currentUser.id : '',
    material_type: 'Sand',
    quantity: '',
    source: '',
    destination: '',
    revenue: '',
    date: new Date().toISOString().split('T')[0],
    status: 'in-transit',
    distance_km: '',
    fuel_cost: ''
  });

  useEffect(() => {
    fetchData();
    generateTripNumber();
  }, [currentUser]);

  const fetchData = async () => {
    try {
      const [vehiclesData, driversData, tripsData] = await Promise.all([
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
          ? pb.collection('trips').getFullList({
            sort: '-date',
            expand: 'vehicle,driver',
            $autoCancel: false
          })
          : pb.collection('trips').getFullList({
            filter: `driver = "${currentUser.id}"`,
            sort: '-date',
            expand: 'vehicle',
            $autoCancel: false
          })
      ]);

      setVehicles(vehiclesData);
      setDrivers(driversData);
      setTrips(tripsData);
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    }
  };

  const generateTripNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    setFormData(prev => ({ ...prev, trip_number: `TRP${timestamp}` }));
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      trip_number: '',
      vehicle: '',
      driver: currentUser.role === 'driver' ? currentUser.id : '',
      material_type: 'Sand',
      quantity: '',
      source: '',
      destination: '',
      revenue: '',
      date: new Date().toISOString().split('T')[0],
      status: 'in-transit',
      distance_km: '',
      fuel_cost: ''
    });
    generateTripNumber();
  };

  const handleCancel = () => {
    setShowTripForm(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.vehicle || !formData.driver || !formData.quantity || !formData.source || !formData.destination || !formData.revenue) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const tripData = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        revenue: parseFloat(formData.revenue),
        distance_km: formData.distance_km ? parseFloat(formData.distance_km) : 0,
        fuel_cost: formData.fuel_cost ? parseFloat(formData.fuel_cost) : 0
      };

      const record = await pb.collection('trips').create(tripData, { $autoCancel: false });

      toast.success('Trip logged successfully');

      setShowTripForm(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to log trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Trip Logging - Fleet Track Pro</title>
        <meta name="description" content="Log and manage fleet trips with material tracking and revenue recording." />
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
              <h1 className="text-3xl font-bold mb-2 text-amber-900">Trips</h1>
              <p className="text-stone-600">Record new trips and view trip history</p>
            </div>

            <Button 
              onClick={() => {
                setShowTripForm(true);
                generateTripNumber();
              }} 
              className="gap-2 bg-amber-700 hover:bg-amber-800 text-white"
              disabled={showTripForm}
            >
              <Plus className="w-4 h-4" />
              Add Trip
            </Button>
          </div>

          {/* Inline Add Trip Form */}
          {showTripForm && (
            <Card className="mb-8 bg-white border-stone-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-stone-800">Log new trip</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  {/* Trip Details Row 1 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="trip_number" className="text-stone-700">Trip Number</Label>
                      <Input
                        id="trip_number"
                        value={formData.trip_number}
                        readOnly
                        className="bg-stone-100 border-stone-200 text-stone-700"
                      />
                    </div>

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
                  </div>

                  {/* Trip Details Row 2 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="source" className="text-stone-700">Source *</Label>
                      <Input
                        id="source"
                        placeholder="Pickup location"
                        value={formData.source}
                        onChange={(e) => handleChange('source', e.target.value)}
                        required
                        className="bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="destination" className="text-stone-700">Destination *</Label>
                      <Input
                        id="destination"
                        placeholder="Delivery location"
                        value={formData.destination}
                        onChange={(e) => handleChange('destination', e.target.value)}
                        required
                        className="bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="material_type" className="text-stone-700">Material Type *</Label>
                      <Select value={formData.material_type} onValueChange={(value) => handleChange('material_type', value)}>
                        <SelectTrigger id="material_type" className="bg-stone-50 border-stone-200 text-stone-900">
                          <SelectValue placeholder="Select material" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sand">Sand</SelectItem>
                          <SelectItem value="Bricks">Bricks</SelectItem>
                          <SelectItem value="Gravel">Gravel</SelectItem>
                          <SelectItem value="Cement">Cement</SelectItem>
                          <SelectItem value="Stone">Stone</SelectItem>
                          <SelectItem value="Soil">Soil</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity" className="text-stone-700">Quantity (tons) *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        value={formData.quantity}
                        onChange={(e) => handleChange('quantity', e.target.value)}
                        required
                        className="bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400"
                      />
                    </div>
                  </div>

                  {/* Trip Details Row 3 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="space-y-2">
                      <Label htmlFor="revenue" className="text-stone-700">Revenue (Rs) *</Label>
                      <Input
                        id="revenue"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.revenue}
                        onChange={(e) => handleChange('revenue', e.target.value)}
                        required
                        className="bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="distance_km" className="text-stone-700">Distance (km)</Label>
                      <Input
                        id="distance_km"
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        value={formData.distance_km}
                        onChange={(e) => handleChange('distance_km', e.target.value)}
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
                          <SelectItem value="in-transit">In Transit</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
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
                      {loading ? 'Saving...' : 'Save Trip'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Trip History Table */}
          <Card className="bg-white/80 backdrop-blur-sm border-stone-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-amber-900">All trips</CardTitle>
            </CardHeader>
            <CardContent>
              {trips.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-stone-500 uppercase text-xs font-medium">Trip #</TableHead>
                        <TableHead className="text-stone-500 uppercase text-xs font-medium">Date</TableHead>
                        <TableHead className="text-stone-500 uppercase text-xs font-medium">Vehicle</TableHead>
                        <TableHead className="text-stone-500 uppercase text-xs font-medium">Route</TableHead>
                        <TableHead className="text-stone-500 uppercase text-xs font-medium">Material</TableHead>
                        <TableHead className="text-stone-500 uppercase text-xs font-medium">Qty</TableHead>
                        <TableHead className="text-stone-500 uppercase text-xs font-medium">Revenue</TableHead>
                        <TableHead className="text-stone-500 uppercase text-xs font-medium">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trips.map((trip) => (
                        <TableRow key={trip.id} className="hover:bg-stone-50">
                          <TableCell className="font-medium text-stone-800">{trip.trip_number}</TableCell>
                          <TableCell className="text-stone-600">{new Date(trip.date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-stone-600">{trip.expand?.vehicle?.vehicle_number || '-'}</TableCell>
                          <TableCell className="text-stone-600 text-sm">{trip.source} → {trip.destination}</TableCell>
                          <TableCell className="text-stone-600">{trip.material_type}</TableCell>
                          <TableCell className="text-stone-600">{trip.quantity}t</TableCell>
                          <TableCell className="font-semibold text-stone-800">Rs{trip.revenue}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline"
                              className={
                                trip.status === 'completed' ? 'border-green-200 bg-green-50 text-green-700' :
                                trip.status === 'in-transit' ? 'border-amber-200 bg-amber-50 text-amber-700' :
                                'border-red-200 bg-red-50 text-red-600'
                              }
                            >
                              {trip.status ? trip.status.charAt(0).toUpperCase() + trip.status.slice(1).replace('-', ' ') : 'Unknown'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center text-stone-500 py-8">No trips recorded yet</p>
              )}
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default TripLogging;
