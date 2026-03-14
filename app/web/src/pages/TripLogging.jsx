import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import pb from '../lib/pocketbaseClient';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { toast } from 'sonner';

const TripLogging = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

      <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/80 pointer-events-none" />
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <Header className="relative z-20" />

        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Trip Logging</h1>
            <p className="text-muted-foreground">Record new trips and view trip history</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1 bg-white/80 backdrop-blur-sm border-blue-100/50 shadow-sm">
              <CardHeader>
                <CardTitle>Log New Trip</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="trip_number">Trip Number</Label>
                    <Input
                      id="trip_number"
                      value={formData.trip_number}
                      readOnly
                      className="bg-muted text-foreground"
                    />
                  </div>

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
                    <Label htmlFor="material_type">Material Type *</Label>
                    <Select value={formData.material_type} onValueChange={(value) => handleChange('material_type', value)}>
                      <SelectTrigger id="material_type">
                        <SelectValue placeholder="Select material type" />
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
                    <Label htmlFor="quantity">Quantity (tons) *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.1"
                      value={formData.quantity}
                      onChange={(e) => handleChange('quantity', e.target.value)}
                      required
                      className="text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="source">Source *</Label>
                    <Input
                      id="source"
                      value={formData.source}
                      onChange={(e) => handleChange('source', e.target.value)}
                      required
                      className="text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination *</Label>
                    <Input
                      id="destination"
                      value={formData.destination}
                      onChange={(e) => handleChange('destination', e.target.value)}
                      required
                      className="text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="revenue">Revenue (₹) *</Label>
                    <Input
                      id="revenue"
                      type="number"
                      step="0.01"
                      value={formData.revenue}
                      onChange={(e) => handleChange('revenue', e.target.value)}
                      required
                      className="text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="distance_km">Distance (km)</Label>
                    <Input
                      id="distance_km"
                      type="number"
                      step="0.1"
                      value={formData.distance_km}
                      onChange={(e) => handleChange('distance_km', e.target.value)}
                      className="text-foreground"
                    />
                  </div>

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
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in-transit">In Transit</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Logging Trip...' : 'Log Trip'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-blue-100/50 shadow-sm">
              <CardHeader>
                <CardTitle>Trip History</CardTitle>
              </CardHeader>
              <CardContent>
                {trips.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Trip #</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Vehicle</TableHead>
                          <TableHead>Route</TableHead>
                          <TableHead>Material</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Revenue</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {trips.map((trip) => (
                          <TableRow key={trip.id}>
                            <TableCell className="font-medium">{trip.trip_number}</TableCell>
                            <TableCell>{new Date(trip.date).toLocaleDateString()}</TableCell>
                            <TableCell>{trip.expand?.vehicle?.vehicle_number || 'N/A'}</TableCell>
                            <TableCell className="text-sm">{trip.source} → {trip.destination}</TableCell>
                            <TableCell>{trip.material_type}</TableCell>
                            <TableCell>{trip.quantity}t</TableCell>
                            <TableCell className="font-semibold">₹{trip.revenue}</TableCell>
                            <TableCell>
                              <Badge variant={
                                trip.status === 'completed' ? 'default' :
                                  trip.status === 'in-transit' ? 'secondary' :
                                    'destructive'
                              }>
                                {trip.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No trips recorded yet</p>
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

export default TripLogging;