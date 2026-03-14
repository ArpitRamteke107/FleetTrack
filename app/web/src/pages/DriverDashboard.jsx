import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import pb from '../lib/pocketbaseClient';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Truck, Plus, Package, Fuel, TrendingUp, MapPin } from 'lucide-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { toast } from 'sonner';

const DriverDashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [assignedVehicle, setAssignedVehicle] = useState(null);
  const [trips, setTrips] = useState([]);
  const [fuelRecords, setFuelRecords] = useState([]);
  const [stats, setStats] = useState({
    tripCount: 0,
    totalMaterial: 0,
    fuelEfficiency: 0
  });
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [watchId, setWatchId] = useState(null);

  useEffect(() => {
    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [watchId]);

  const toggleLocationSharing = () => {
    if (isSharingLocation) {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      setIsSharingLocation(false);
      setWatchId(null);
      toast.success('Location sharing stopped');
    } else {
      if (!navigator.geolocation) {
        toast.error('Geolocation is not supported by your browser');
        return;
      }
      toast.info('Requesting location access...');
      const id = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Attempt to update user location in backend
            await pb.collection('users').update(currentUser.id, {
              latitude,
              longitude,
              last_location_update: new Date().toISOString()
            }, { $autoCancel: false });
          } catch (error) {
            console.error('Failed to update location on server', error);
          }
        },
        (error) => {
          toast.error(`Location error: ${error.message}`);
          setIsSharingLocation(false);
        },
        { enableHighAccuracy: true }
      );
      setWatchId(id);
      setIsSharingLocation(true);
      toast.success('Location sharing started');
    }
  };

  useEffect(() => {
    fetchDriverData();
  }, [currentUser]);

  const fetchDriverData = async () => {
    try {
      const [vehiclesData, tripsData, fuelData] = await Promise.all([
        pb.collection('vehicles').getFullList({ 
          filter: `assigned_driver = "${currentUser.id}"`,
          $autoCancel: false 
        }),
        pb.collection('trips').getFullList({ 
          filter: `driver = "${currentUser.id}"`,
          sort: '-date',
          $autoCancel: false 
        }),
        pb.collection('fuel').getFullList({ 
          filter: `driver = "${currentUser.id}"`,
          sort: '-date',
          $autoCancel: false 
        })
      ]);

      setAssignedVehicle(vehiclesData[0] || null);
      setTrips(tripsData.slice(0, 10));
      setFuelRecords(fuelData.slice(0, 10));

      const tripCount = tripsData.length;
      const totalMaterial = tripsData.reduce((sum, trip) => sum + (trip.quantity || 0), 0);
      const totalDistance = tripsData.reduce((sum, trip) => sum + (trip.distance_km || 0), 0);
      const totalFuel = fuelData.reduce((sum, fuel) => sum + (fuel.litres || 0), 0);
      const fuelEfficiency = totalFuel > 0 ? (totalDistance / totalFuel).toFixed(2) : 0;

      setStats({ tripCount, totalMaterial, fuelEfficiency });
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="bg-white/80 backdrop-blur-sm border-blue-100/50 shadow-sm">
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Driver Dashboard - Fleet Track Pro</title>
        <meta name="description" content="Driver dashboard with assigned vehicle, trip history, and fuel records." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/80 pointer-events-none" />
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <Header className="relative z-20" />
        
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Driver Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {currentUser.name}</p>
          </div>

          <Card className="mb-8 bg-white/80 backdrop-blur-sm border-blue-200 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-primary">
                <MapPin className="w-5 h-5" />
                Live Location Tracking
              </CardTitle>
              <Button 
                variant={isSharingLocation ? "destructive" : "default"} 
                onClick={toggleLocationSharing}
                className={isSharingLocation ? "bg-red-500 hover:bg-red-600 text-white" : "bg-green-600 hover:bg-green-700 text-white"}
              >
                {isSharingLocation ? 'Stop Sharing' : 'Start Sharing Location'}
              </Button>
            </CardHeader>
          </Card>

          {assignedVehicle && (
            <Card className="mb-8 bg-white/80 backdrop-blur-sm border-blue-200 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Truck className="w-5 h-5" />
                  Assigned Vehicle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Vehicle Number</p>
                    <p className="text-lg font-semibold">{assignedVehicle.vehicle_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="text-lg font-semibold">{assignedVehicle.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Registration</p>
                    <p className="text-lg font-semibold">{assignedVehicle.registration || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={assignedVehicle.status === 'active' ? 'default' : 'secondary'}>
                      {assignedVehicle.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm border-blue-100/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Trips</CardTitle>
                <Package className="w-5 h-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.tripCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Completed trips</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm border-blue-100/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Material Delivered</CardTitle>
                <TrendingUp className="w-5 h-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalMaterial.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground mt-1">Total tons</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm border-blue-100/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Fuel Efficiency</CardTitle>
                <Fuel className="w-5 h-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.fuelEfficiency}</div>
                <p className="text-xs text-muted-foreground mt-1">km per litre</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Link to="/trips">
              <Button className="w-full gap-2 h-auto py-4">
                <Plus className="w-5 h-5" />
                Log Trip
              </Button>
            </Link>
            <Link to="/fuel">
              <Button className="w-full gap-2 h-auto py-4" variant="outline">
                <Plus className="w-5 h-5" />
                Log Fuel
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="bg-white/80 backdrop-blur-sm border-blue-100/50 shadow-sm">
              <CardHeader>
                <CardTitle>Recent Trips</CardTitle>
              </CardHeader>
              <CardContent>
                {trips.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Route</TableHead>
                        <TableHead>Material</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trips.map((trip) => (
                        <TableRow key={trip.id}>
                          <TableCell className="text-sm">{new Date(trip.date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-sm">{trip.source} → {trip.destination}</TableCell>
                          <TableCell className="text-sm">{trip.material_type}</TableCell>
                          <TableCell>
                            <Badge variant={trip.status === 'completed' ? 'default' : 'secondary'}>
                              {trip.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No trips recorded yet</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-blue-100/50 shadow-sm">
              <CardHeader>
                <CardTitle>Recent Fuel Records</CardTitle>
              </CardHeader>
              <CardContent>
                {fuelRecords.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Litres</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fuelRecords.map((fuel) => (
                        <TableRow key={fuel.id}>
                          <TableCell className="text-sm">{new Date(fuel.date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-sm">{fuel.litres}L</TableCell>
                          <TableCell className="text-sm">₹{fuel.rate_per_litre}</TableCell>
                          <TableCell className="text-sm font-semibold">₹{fuel.total_cost}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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

export default DriverDashboard;