import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Truck } from 'lucide-react';
import { toast } from 'sonner';
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const {
    login
  } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const authData = await login(email, password);
      toast.success('Login successful');
      navigate(authData.record.role === 'owner' ? '/owner-dashboard' : '/driver-dashboard');
    } catch (error) {
      toast.error(error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };
  return <>
      <Helmet>
        <title>Login - Fleet Track Pro</title>
        <meta name="description" content="Login to your Fleet Track Pro account to manage your fleet operations." />
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
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Login to your Fleet Track Pro account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="text-foreground" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required className="text-foreground" />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </div>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              
            </div>
          </CardContent>
        </Card>
      </div>
    </>;
};
export default LoginPage;