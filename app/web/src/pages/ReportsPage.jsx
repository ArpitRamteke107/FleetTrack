import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '../lib/pocketbaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { toast } from 'sonner';

const ReportsPage = () => {
  const [period, setPeriod] = useState('weekly');
  const [reportData, setReportData] = useState({
    tripSummary: { totalTrips: 0, totalMaterial: 0 },
    fuelChart: [],
    driverPerformance: [],
    revenueExpenseChart: [],
    vehicleCosts: [],
    topVehicle: null,
    profitLoss: { revenue: 0, expense: 0, profit: 0 }
  });

  useEffect(() => {
    fetchReportData();
  }, [period]);

  const fetchReportData = async () => {
    try {
      const now = new Date();
      let startDate = new Date();
      
      if (period === 'weekly') {
        startDate.setDate(now.getDate() - 7);
      } else if (period === 'monthly') {
        startDate.setMonth(now.getMonth() - 1);
      } else {
        startDate.setFullYear(now.getFullYear() - 1);
      }

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = now.toISOString().split('T')[0];

      const [trips, fuel, revenue, expenses] = await Promise.all([
        pb.collection('trips').getFullList({ 
          filter: `date >= "${startDateStr}" && date <= "${endDateStr}"`,
          expand: 'driver,vehicle',
          $autoCancel: false 
        }),
        pb.collection('fuel').getFullList({ 
          filter: `date >= "${startDateStr}" && date <= "${endDateStr}"`,
          $autoCancel: false 
        }),
        pb.collection('revenue').getFullList({ 
          filter: `date >= "${startDateStr}" && date <= "${endDateStr}"`,
          $autoCancel: false 
        }),
        pb.collection('expenses').getFullList({ 
          filter: `date >= "${startDateStr}" && date <= "${endDateStr}"`,
          $autoCancel: false 
        })
      ]);

      const totalTrips = trips.length;
      const totalMaterial = trips.reduce((sum, trip) => sum + (trip.quantity || 0), 0);

      const fuelByDate = {};
      fuel.forEach(f => {
        const date = new Date(f.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        fuelByDate[date] = (fuelByDate[date] || 0) + (f.total_cost || 0);
      });
      const fuelChart = Object.entries(fuelByDate).map(([date, cost]) => ({ date, cost }));

      const driverStats = {};
      trips.forEach(trip => {
        const driverId = trip.driver;
        if (!driverStats[driverId]) {
          driverStats[driverId] = {
            name: trip.expand?.driver?.name || trip.expand?.driver?.email || 'Unknown',
            tripCount: 0,
            materialDelivered: 0,
            totalDistance: 0,
            totalFuel: 0
          };
        }
        driverStats[driverId].tripCount++;
        driverStats[driverId].materialDelivered += trip.quantity || 0;
        driverStats[driverId].totalDistance += trip.distance_km || 0;
      });

      fuel.forEach(f => {
        const driverId = f.driver;
        if (driverStats[driverId]) {
          driverStats[driverId].totalFuel += f.litres || 0;
        }
      });

      const driverPerformance = Object.values(driverStats).map(driver => ({
        ...driver,
        fuelEfficiency: driver.totalFuel > 0 ? (driver.totalDistance / driver.totalFuel).toFixed(2) : 0
      }));

      const revenueByDate = {};
      const expenseByDate = {};
      
      revenue.forEach(r => {
        const date = new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        revenueByDate[date] = (revenueByDate[date] || 0) + (r.amount || 0);
      });

      expenses.forEach(e => {
        const date = new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        expenseByDate[date] = (expenseByDate[date] || 0) + (e.amount || 0);
      });

      const allDates = [...new Set([...Object.keys(revenueByDate), ...Object.keys(expenseByDate)])];
      const revenueExpenseChart = allDates.map(date => ({
        date,
        revenue: revenueByDate[date] || 0,
        expense: expenseByDate[date] || 0
      }));

      const vehicleStats = {};
      trips.forEach(trip => {
        const vehicleId = trip.vehicle;
        if (!vehicleStats[vehicleId]) {
          vehicleStats[vehicleId] = {
            vehicle: trip.expand?.vehicle?.vehicle_number || 'Unknown',
            revenue: 0,
            fuelCost: 0
          };
        }
        vehicleStats[vehicleId].revenue += trip.revenue || 0;
      });

      fuel.forEach(f => {
        const vehicleId = f.vehicle;
        if (vehicleStats[vehicleId]) {
          vehicleStats[vehicleId].fuelCost += f.total_cost || 0;
        }
      });

      const vehicleCosts = Object.values(vehicleStats).map(v => ({
        ...v,
        profit: v.revenue - v.fuelCost
      }));

      const topVehicle = vehicleCosts.length > 0 
        ? vehicleCosts.reduce((max, v) => v.revenue > max.revenue ? v : max, vehicleCosts[0])
        : null;

      const totalRevenue = revenue.reduce((sum, r) => sum + (r.amount || 0), 0);
      const totalExpense = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const profit = totalRevenue - totalExpense;

      setReportData({
        tripSummary: { totalTrips, totalMaterial },
        fuelChart,
        driverPerformance,
        revenueExpenseChart,
        vehicleCosts,
        topVehicle,
        profitLoss: { revenue: totalRevenue, expense: totalExpense, profit }
      });
    } catch (error) {
      toast.error('Failed to load report data');
      console.error(error);
    }
  };

  return (
    <>
      <Helmet>
        <title>Reports - Fleet Track Pro</title>
        <meta name="description" content="Comprehensive fleet reports with trip summaries, fuel analysis, driver performance, and P&L statements." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/80 pointer-events-none" />
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <Header className="relative z-20" />
        
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
            <p className="text-muted-foreground">Comprehensive fleet performance reports</p>
          </div>

          <Tabs value={period} onValueChange={setPeriod} className="mb-8">
            <TabsList>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>

            <TabsContent value={period} className="space-y-8 mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white/80 backdrop-blur-sm border-blue-100/50 shadow-sm">
                  <CardHeader>
                    <CardTitle>Trip Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Trips</p>
                        <p className="text-3xl font-bold">{reportData.tripSummary.totalTrips}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Material Delivered</p>
                        <p className="text-3xl font-bold">{reportData.tripSummary.totalMaterial.toFixed(1)} tons</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-blue-100/50 shadow-sm">
                  <CardHeader>
                    <CardTitle>P&L Statement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Revenue</span>
                        <span className="font-semibold">₹{reportData.profitLoss.revenue.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Expense</span>
                        <span className="font-semibold">₹{reportData.profitLoss.expense.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pt-4 border-t">
                        <span className="font-medium">Net Profit/Loss</span>
                        <span className={`text-xl font-bold ${reportData.profitLoss.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                          ₹{reportData.profitLoss.profit.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Fuel Spend Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.fuelChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="cost" fill="hsl(var(--primary))" name="Fuel Cost (₹)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue vs Expense</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={reportData.revenueExpenseChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} name="Revenue (₹)" />
                      <Line type="monotone" dataKey="expense" stroke="hsl(var(--destructive))" strokeWidth={2} name="Expense (₹)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Driver Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  {reportData.driverPerformance.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Driver</TableHead>
                          <TableHead>Trips</TableHead>
                          <TableHead>Material Delivered</TableHead>
                          <TableHead>Fuel Efficiency</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.driverPerformance.map((driver, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{driver.name}</TableCell>
                            <TableCell>{driver.tripCount}</TableCell>
                            <TableCell>{driver.materialDelivered.toFixed(1)} tons</TableCell>
                            <TableCell>{driver.fuelEfficiency} km/L</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No driver data available</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vehicle-wise Costs</CardTitle>
                </CardHeader>
                <CardContent>
                  {reportData.vehicleCosts.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vehicle</TableHead>
                          <TableHead>Revenue</TableHead>
                          <TableHead>Fuel Cost</TableHead>
                          <TableHead>Profit</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.vehicleCosts.map((vehicle, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{vehicle.vehicle}</TableCell>
                            <TableCell>₹{vehicle.revenue.toFixed(2)}</TableCell>
                            <TableCell>₹{vehicle.fuelCost.toFixed(2)}</TableCell>
                            <TableCell className={vehicle.profit >= 0 ? 'text-success font-semibold' : 'text-destructive font-semibold'}>
                              ₹{vehicle.profit.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No vehicle data available</p>
                  )}
                </CardContent>
              </Card>

              {reportData.topVehicle && (
                <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-md">
                  <CardHeader>
                    <CardTitle>Top Earning Vehicle</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{reportData.topVehicle.vehicle}</p>
                        <p className="text-sm text-muted-foreground">Highest revenue generator</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-primary">₹{reportData.topVehicle.revenue.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Total revenue</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default ReportsPage;