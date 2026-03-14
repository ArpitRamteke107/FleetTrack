import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Truck } from 'lucide-react';
import { toast } from 'sonner';
const SignupPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'driver',
    phone: '',
    licenceNumber: '',
    aadharCard: null,
    licenceCopy: null,
    passportPhoto: null
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const {
    signup
  } = useAuth();
  const navigate = useNavigate();
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleNext = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (formData.role === 'driver') {
      setStep(2);
    } else {
      submitSignup();
    }
  };

  const submitSignup = async () => {
    setLoading(true);
    try {
      await signup(
        formData.email, 
        formData.password, 
        formData.name, 
        formData.role, 
        formData.phone, 
        formData.licenceNumber,
        formData.aadharCard,
        formData.licenceCopy,
        formData.passportPhoto
      );
      toast.success('Account created successfully. Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 1) {
      handleNext(e);
    } else {
      if (!formData.aadharCard || !formData.licenceCopy || !formData.passportPhoto || !formData.licenceNumber) {
        toast.error('Please upload all mandatory documents and provide licence number for driver registration');
        return;
      }
      submitSignup();
    }
  };
  return <>
      <Helmet>
        <title>Sign Up - Fleet Track Pro</title>
        <meta name="description" content="Create your Fleet Track Pro account to start managing your fleet operations." />
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden p-4">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50/50" />
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] animate-pulse delay-700" />
        
          <Card className="w-full max-w-md shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] relative z-10 border-blue-100 bg-white/90 backdrop-blur-xl">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">
                {step === 1 ? 'Create your account' : 'Driver Documents'}
              </CardTitle>
              <CardDescription>
                {step === 1 ? 'Join Fleet Track Pro to manage your fleet' : 'Please upload mandatory documents'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {step === 1 ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" type="text" placeholder="John Doe" value={formData.name} onChange={e => handleChange('name', e.target.value)} required className="text-foreground bg-white" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="you@example.com" value={formData.email} onChange={e => handleChange('email', e.target.value)} required className="text-foreground bg-white" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select value={formData.role} onValueChange={value => handleChange('role', value)}>
                        <SelectTrigger id="role" className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="owner">Fleet Manager</SelectItem>
                          <SelectItem value="driver">Driver</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" type="tel" placeholder="9876543210" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} className="text-foreground bg-white" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" placeholder="Minimum 8 characters" value={formData.password} onChange={e => handleChange('password', e.target.value)} required minLength={8} className="text-foreground bg-white" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input id="confirmPassword" type="password" placeholder="Re-enter password" value={formData.confirmPassword} onChange={e => handleChange('confirmPassword', e.target.value)} required className="text-foreground bg-white" />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Processing...' : (formData.role === 'driver' ? 'Next: Upload Documents' : 'Sign Up')}
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-2">
                      <Label htmlFor="licenceNumber">Licence Number *</Label>
                      <Input id="licenceNumber" type="text" placeholder="DL123456" value={formData.licenceNumber} onChange={e => handleChange('licenceNumber', e.target.value)} required className="text-foreground bg-white" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="aadharCard">Aadhar Card (PDF/Image) *</Label>
                      <Input id="aadharCard" type="file" accept="image/*,.pdf" onChange={e => handleChange('aadharCard', e.target.files?.[0])} required className="text-foreground bg-white cursor-pointer" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="licenceCopy">Driving Licence Copy (PDF/Image) *</Label>
                      <Input id="licenceCopy" type="file" accept="image/*,.pdf" onChange={e => handleChange('licenceCopy', e.target.files?.[0])} required className="text-foreground bg-white cursor-pointer" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="passportPhoto">Passport Size Photo (Image) *</Label>
                      <Input id="passportPhoto" type="file" accept="image/*" onChange={e => handleChange('passportPhoto', e.target.files?.[0])} required className="text-foreground bg-white cursor-pointer" />
                    </div>

                    <div className="flex gap-4 pt-2">
                      <Button type="button" variant="outline" className="w-1/3" onClick={() => setStep(1)} disabled={loading}>
                        Back
                      </Button>
                      <Button type="submit" className="w-2/3" disabled={loading}>
                        {loading ? 'Creating account...' : 'Complete Sign Up'}
                      </Button>
                    </div>
                  </div>
                )}
              </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link to="/login" className="text-primary hover:underline font-medium">
                Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>;
};
export default SignupPage;