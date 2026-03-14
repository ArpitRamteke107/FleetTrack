import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '../lib/pocketbaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { toast } from 'sonner';

const ExpenseManagement = () => {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    type: 'fuel',
    vehicle: 'none',
    driver: 'none',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vehiclesData, driversData, expensesData] = await Promise.all([
        pb.collection('vehicles').getFullList({ $autoCancel: false }),
        pb.collection('users').getFullList({
          filter: 'role = "driver"',
          $autoCancel: false
        }),
        pb.collection('expenses').getFullList({
          sort: '-date',
          expand: 'vehicle,driver',
          $autoCancel: false
        })
      ]);

      setVehicles(vehiclesData);
      setDrivers(driversData);
      setExpenses(expensesData);
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.type || !formData.amount) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const expenseData = {
        type: formData.type,
        vehicle: formData.vehicle === 'none' ? '' : formData.vehicle,
        driver: formData.driver === 'none' ? '' : formData.driver,
        amount: parseFloat(formData.amount),
        date: formData.date,
        description: formData.description
      };

      await pb.collection('expenses').create(expenseData, { $autoCancel: false });

      toast.success('Expense recorded successfully');

      setFormData({
        type: 'fuel',
        vehicle: 'none',
        driver: 'none',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to record expense');
    } finally {
      setLoading(false);
    }
  };

  const expenseTypes = [
    { value: 'fuel', label: 'Fuel' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'driver_wages', label: 'Driver Wages' },
    { value: 'toll', label: 'Toll' },
    { value: 'permits', label: 'Permits' },
    { value: 'taxes', label: 'Taxes' },
    { value: 'loading_charges', label: 'Loading Charges' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <>
      <Helmet>
        <title>Expense Management - Fleet Track Pro</title>
        <meta name="description" content="Track and manage all fleet-related expenses including fuel, maintenance, and operational costs." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/80 pointer-events-none" />
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <Header className="relative z-20" />

        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Expense Management</h1>
            <p className="text-muted-foreground">Track and manage all fleet expenses</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1 bg-white/80 backdrop-blur-sm border-blue-100/50 shadow-sm">
              <CardHeader>
                <CardTitle>Record Expense</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Expense Type *</Label>
                    <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select expense type" />
                      </SelectTrigger>
                      <SelectContent>
                        {expenseTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vehicle">Vehicle (Optional)</Label>
                    <Select value={formData.vehicle} onValueChange={(value) => handleChange('vehicle', value)}>
                      <SelectTrigger id="vehicle">
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.vehicle_number} - {vehicle.type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="driver">Driver (Optional)</Label>
                    <Select value={formData.driver} onValueChange={(value) => handleChange('driver', value)}>
                      <SelectTrigger id="driver">
                        <SelectValue placeholder="Select driver" />
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

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₹) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => handleChange('amount', e.target.value)}
                      required
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
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      rows={3}
                      className="text-foreground"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Recording...' : 'Record Expense'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-blue-100/50 shadow-sm">
              <CardHeader>
                <CardTitle>Expense History</CardTitle>
              </CardHeader>
              <CardContent>
                {expenses.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Vehicle</TableHead>
                          <TableHead>Driver</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {expenses.map((expense) => (
                          <TableRow key={expense.id}>
                            <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {expenseTypes.find(t => t.value === expense.type)?.label || expense.type}
                              </Badge>
                            </TableCell>
                            <TableCell>{expense.expand?.vehicle?.vehicle_number || 'N/A'}</TableCell>
                            <TableCell>{expense.expand?.driver?.name || expense.expand?.driver?.email || 'N/A'}</TableCell>
                            <TableCell className="font-semibold">₹{expense.amount}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{expense.description || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No expenses recorded yet</p>
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

export default ExpenseManagement;