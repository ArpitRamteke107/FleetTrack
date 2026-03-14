import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '../lib/pocketbaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { toast } from 'sonner';

const RevenueTracking = () => {
  const [revenue, setRevenue] = useState([]);

  useEffect(() => {
    fetchRevenue();
  }, []);

  const fetchRevenue = async () => {
    try {
      const revenueData = await pb.collection('revenue').getFullList({ 
        sort: '-date',
        expand: 'trip,vehicle,driver',
        $autoCancel: false 
      });
      setRevenue(revenueData);
    } catch (error) {
      toast.error('Failed to load revenue data');
      console.error(error);
    }
  };

  const totalRevenue = revenue.reduce((sum, r) => sum + (r.amount || 0), 0);
  const paidRevenue = revenue.filter(r => r.payment_status === 'paid').reduce((sum, r) => sum + (r.amount || 0), 0);
  const pendingRevenue = revenue.filter(r => r.payment_status === 'pending').reduce((sum, r) => sum + (r.amount || 0), 0);

  return (
    <>
      <Helmet>
        <title>Revenue Tracking - Fleet Track Pro</title>
        <meta name="description" content="Track and monitor revenue from all fleet trips and operations." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/80 pointer-events-none" />
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <Header className="relative z-20" />
        
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Revenue Tracking</h1>
            <p className="text-muted-foreground">Monitor revenue from all trips and operations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm border-blue-100/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">₹{totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm border-blue-100/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Paid Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success">₹{paidRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">Received payments</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm border-blue-100/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-warning">₹{pendingRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">Awaiting payment</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/80 backdrop-blur-sm border-blue-100/50 shadow-sm">
            <CardHeader>
              <CardTitle>Revenue Records</CardTitle>
            </CardHeader>
            <CardContent>
              {revenue.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Trip</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Driver</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {revenue.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                          <TableCell>{record.expand?.trip?.trip_number || 'N/A'}</TableCell>
                          <TableCell>{record.expand?.vehicle?.vehicle_number || 'N/A'}</TableCell>
                          <TableCell>{record.expand?.driver?.name || record.expand?.driver?.email || 'N/A'}</TableCell>
                          <TableCell className="font-semibold">₹{record.amount}</TableCell>
                          <TableCell>
                            <Badge variant={
                              record.payment_status === 'paid' ? 'default' : 
                              record.payment_status === 'pending' ? 'secondary' : 
                              'destructive'
                            }>
                              {record.payment_status || 'pending'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No revenue records yet</p>
              )}
            </CardContent>
          </Card>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default RevenueTracking;