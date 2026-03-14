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
import { Plus } from 'lucide-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { toast } from 'sonner';

const ExpenseManagement = () => {
  const [loading, setLoading] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
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

  const resetForm = () => {
    setFormData({
      type: 'fuel',
      vehicle: 'none',
      driver: 'none',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
  };

  const handleCancel = () => {
    setShowExpenseForm(false);
    resetForm();
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

      setShowExpenseForm(false);
      resetForm();
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

      <div className="min-h-screen flex flex-col bg-stone-100 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-stone-50 to-orange-50/50 pointer-events-none" />
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-amber-300/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-orange-300/15 rounded-full blur-[100px] pointer-events-none" />

        <Header className="relative z-20" />

        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-amber-900">Expenses</h1>
              <p className="text-stone-600">Track and manage all fleet expenses</p>
            </div>

            <Button
              onClick={() => setShowExpenseForm(true)}
              className="gap-2 bg-amber-700 hover:bg-amber-800 text-white"
              disabled={showExpenseForm}
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </Button>
          </div>

          {/* Inline Add Expense Form */}
          {showExpenseForm && (
            <Card className="mb-8 bg-white border-stone-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-stone-800">Record expense</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  {/* Expense Details Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-stone-700">Expense Type *</Label>
                      <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                        <SelectTrigger id="type" className="bg-stone-50 border-stone-200 text-stone-900">
                          <SelectValue placeholder="Select type" />
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
                      <Label htmlFor="vehicle" className="text-stone-700">Vehicle</Label>
                      <Select value={formData.vehicle} onValueChange={(value) => handleChange('vehicle', value)}>
                        <SelectTrigger id="vehicle" className="bg-stone-50 border-stone-200 text-stone-900">
                          <SelectValue placeholder="Select vehicle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {vehicles.map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.vehicle_number} {vehicle.type ? `- ${vehicle.type}` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="driver" className="text-stone-700">Driver</Label>
                      <Select value={formData.driver} onValueChange={(value) => handleChange('driver', value)}>
                        <SelectTrigger id="driver" className="bg-stone-50 border-stone-200 text-stone-900">
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
                      <Label htmlFor="amount" className="text-stone-700">Amount (Rs) *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => handleChange('amount', e.target.value)}
                        required
                        className="bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400"
                      />
                    </div>

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

                  {/* Description Row */}
                  <div className="mb-6">
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-stone-700">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Add notes about this expense..."
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        rows={2}
                        className="bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400 max-w-2xl"
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
                      {loading ? 'Saving...' : 'Save Expense'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Expense History Table */}
          <Card className="bg-white/80 backdrop-blur-sm border-stone-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-amber-900">All expenses</CardTitle>
            </CardHeader>
            <CardContent>
              {expenses.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-stone-500 uppercase text-xs font-medium">Date</TableHead>
                        <TableHead className="text-stone-500 uppercase text-xs font-medium">Type</TableHead>
                        <TableHead className="text-stone-500 uppercase text-xs font-medium">Vehicle</TableHead>
                        <TableHead className="text-stone-500 uppercase text-xs font-medium">Driver</TableHead>
                        <TableHead className="text-stone-500 uppercase text-xs font-medium">Amount</TableHead>
                        <TableHead className="text-stone-500 uppercase text-xs font-medium">Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.map((expense) => (
                        <TableRow key={expense.id} className="hover:bg-stone-50">
                          <TableCell className="text-stone-600">{new Date(expense.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="border-amber-200 bg-amber-50 text-amber-700"
                            >
                              {expenseTypes.find(t => t.value === expense.type)?.label || expense.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-stone-600">{expense.expand?.vehicle?.vehicle_number || '-'}</TableCell>
                          <TableCell className="text-stone-600">{expense.expand?.driver?.name || expense.expand?.driver?.email || '-'}</TableCell>
                          <TableCell className="font-semibold text-stone-800">Rs{expense.amount}</TableCell>
                          <TableCell className="text-sm text-stone-500">{expense.description || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center text-stone-500 py-8">No expenses recorded yet</p>
              )}
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ExpenseManagement;
