import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import pb from '../lib/pocketbaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Truck, Package, Fuel, Users, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const OwnerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeVehicles: 0,
    totalVehicles: 0,
    todayTrips: 0,
    materialBreakdown: {},
    todayFuel: 0,
    todayRevenue: 0,
    todayProfit: 0,
    driverStatus: { inTransit: 0, completed: 0, idle: 0 }
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const nextDay = new Date();
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = nextDay.toISOString().split('T')[0];

      const [vehicles, trips, fuel, revenue] = await Promise.all([
        pb.collection('vehicles').getFullList({ $autoCancel: false }),
        pb.collection('trips').getFullList({
          filter: `date >= "${today}" && date < "${nextDayStr}"`,
          $autoCancel: false
        }),
        pb.collection('fuel').getFullList({
          filter: `date >= "${today}" && date < "${nextDayStr}"`,
          $autoCancel: false
        }),
        pb.collection('revenue').getFullList({
          filter: `date >= "${today}" && date < "${nextDayStr}"`,
          $autoCancel: false
        })
      ]);

      const activeVehicles = vehicles.filter(v => v.status === 'active').length;
      const todayTrips = trips.length;

      const materialBreakdown = trips.reduce((acc, trip) => {
        acc[trip.material_type] = (acc[trip.material_type] || 0) + 1;
        return acc;
      }, {});

      const todayFuel = fuel.reduce((sum, f) => sum + (f.total_cost || 0), 0);
      const todayRevenue = revenue.reduce((sum, r) => sum + (r.amount || 0), 0);
      const todayProfit = todayRevenue - todayFuel;

      const driverStatus = {
        inTransit: trips.filter(t => t.status === 'in-transit').length,
        completed: trips.filter(t => t.status === 'completed').length,
        idle: vehicles.length - trips.filter(t => t.status === 'in-transit').length
      };

      setStats({
        activeVehicles,
        totalVehicles: vehicles.length,
        todayTrips,
        materialBreakdown,
        todayFuel,
        todayRevenue,
        todayProfit,
        driverStatus
      });

      await fetchChartData();
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        const nextDateStr = nextDate.toISOString().split('T')[0];

        const [dayRevenue, dayFuel] = await Promise.all([
          pb.collection('revenue').getFullList({
            filter: `date >= "${dateStr}" && date < "${nextDateStr}"`,
            $autoCancel: false
          }),
          pb.collection('fuel').getFullList({
            filter: `date >= "${dateStr}" && date < "${nextDateStr}"`,
            $autoCancel: false
          })
        ]);

        const revenue = dayRevenue.reduce((sum, r) => sum + (r.amount || 0), 0);
        const expense = dayFuel.reduce((sum, f) => sum + (f.total_cost || 0), 0);

        last7Days.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue,
          expense
        });
      }

      setChartData(last7Days);
    } catch (error) {
      console.error('Failed to load chart data:', error);
    }
  };

  return (
    <>
      <Helmet>
        <title>Owner Dashboard - Fleet Track Pro</title>
        <meta name="description" content="Fleet owner dashboard with real-time vehicle, trip, and revenue analytics." />
      </Helmet>

      <div className="min-h-screen flex flex-col relative overflow-hidden bg-stone-50">
        {/* Topographic map background — visible during loading, fades out on complete */}
        <AnimatePresence>
          {loading && (
            <motion.div
              key="topo-bg"
              className="absolute inset-0 z-0 pointer-events-none"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cdefs%3E%3Cpattern id='topo' patternUnits='userSpaceOnUse' width='120' height='120'%3E%3Ccircle cx='60' cy='60' r='55' fill='none' stroke='%23cbd5e1' stroke-width='0.8'/%3E%3Ccircle cx='60' cy='60' r='42' fill='none' stroke='%23cbd5e1' stroke-width='0.8'/%3E%3Ccircle cx='60' cy='60' r='28' fill='none' stroke='%23cbd5e1' stroke-width='0.8'/%3E%3Ccircle cx='60' cy='60' r='14' fill='none' stroke='%23cbd5e1' stroke-width='0.8'/%3E%3Cline x1='0' y1='60' x2='120' y2='60' stroke='%23e2e8f0' stroke-width='0.5'/%3E%3Cline x1='60' y1='0' x2='60' y2='120' stroke='%23e2e8f0' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='%23f8fafc'/%3E%3Crect width='100%25' height='100%25' fill='url(%23topo)'/%3E%3C/svg%3E")`,
              }}
            />
          )}
        </AnimatePresence>

        {/* Decorative blobs (always) */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-stone-50/40 to-orange-50/80 pointer-events-none z-0" />
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-amber-300/15 rounded-full blur-[100px] pointer-events-none z-0" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-orange-300/15 rounded-full blur-[100px] pointer-events-none z-0" />

        <Header className="relative z-20" />

        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="bg-white/80 backdrop-blur-sm border-stone-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardHeader>
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                <p className="text-muted-foreground">Real-time overview of your fleet operations</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-300 bg-white/80 backdrop-blur-sm border-stone-200 hover:border-amber-300">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Vehicles</CardTitle>
                    <Truck className="w-5 h-5 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.activeVehicles}/{stats.totalVehicles}</div>
                    <p className="text-xs text-muted-foreground mt-1">Vehicles on road today</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-300 bg-white/80 backdrop-blur-sm border-stone-200 hover:border-amber-300">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Today's Trips</CardTitle>
                    <Package className="w-5 h-5 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.todayTrips}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Object.entries(stats.materialBreakdown).slice(0, 2).map(([mat, count]) => `${mat}: ${count}`).join(', ')}
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-300 bg-white/80 backdrop-blur-sm border-stone-200 hover:border-amber-300">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Fuel vs Revenue</CardTitle>
                    <Fuel className="w-5 h-5 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">₹{stats.todayFuel.toFixed(0)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Revenue: ₹{stats.todayRevenue.toFixed(0)}</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-300 bg-white/80 backdrop-blur-sm border-stone-200 hover:border-amber-300">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Today's Profit</CardTitle>
                    {stats.todayProfit >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-success" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-destructive" />
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${stats.todayProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                      ₹{stats.todayProfit.toFixed(0)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.todayProfit >= 0 ? 'Profit' : 'Loss'} today
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-stone-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle>Revenue vs Expense (Last 7 Days)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} name="Revenue" />
                        <Line type="monotone" dataKey="expense" stroke="hsl(var(--destructive))" strokeWidth={2} name="Expense" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-stone-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle>Driver Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">In Transit</span>
                      <span className="text-lg font-semibold text-warning">{stats.driverStatus.inTransit}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Completed</span>
                      <span className="text-lg font-semibold text-success">{stats.driverStatus.completed}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Idle</span>
                      <span className="text-lg font-semibold text-muted-foreground">{stats.driverStatus.idle}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link to="/trips">
                  <Button className="w-full gap-2 h-auto py-4">
                    <Plus className="w-5 h-5" />
                    Add Trip
                  </Button>
                </Link>
                <Link to="/fuel">
                  <Button className="w-full gap-2 h-auto py-4" variant="outline">
                    <Plus className="w-5 h-5" />
                    Add Fuel
                  </Button>
                </Link>
                <Link to="/expenses">
                  <Button className="w-full gap-2 h-auto py-4" variant="outline">
                    <Plus className="w-5 h-5" />
                    Add Expense
                  </Button>
                </Link>
                <Link to="/reports">
                  <Button className="w-full gap-2 h-auto py-4" variant="outline">
                    <Users className="w-5 h-5" />
                    View Reports
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
};

export default OwnerDashboard;
