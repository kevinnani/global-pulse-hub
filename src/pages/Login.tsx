import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FirebaseAuthService } from '@/lib/firebase-auth';
import { countries } from '@/lib/firebase-data';
import { useToast } from '@/hooks/use-toast';
import { Globe, UserCircle, Phone, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Country codes for phone registration - using unique identifiers
const countryCodes = [
  { id: 'US', dial: '+1', name: 'United States' },
  { id: 'UK', dial: '+44', name: 'United Kingdom' },
  { id: 'FR', dial: '+33', name: 'France' },
  { id: 'DE', dial: '+49', name: 'Germany' },
  { id: 'JP', dial: '+81', name: 'Japan' },
  { id: 'BR', dial: '+55', name: 'Brazil' },
  { id: 'IN', dial: '+91', name: 'India' },
  { id: 'AU', dial: '+61', name: 'Australia' },
  { id: 'CN', dial: '+86', name: 'China' },
  { id: 'RU', dial: '+7', name: 'Russia' },
  { id: 'IT', dial: '+39', name: 'Italy' },
  { id: 'ES', dial: '+34', name: 'Spain' },
  { id: 'MX', dial: '+52', name: 'Mexico' },
  { id: 'CA_1', dial: '+1', name: 'Canada' },
  { id: 'KR', dial: '+82', name: 'South Korea' },
];

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  
  const [loginData, setLoginData] = useState({
    phone: '',
    countryCode: '+91',
    password: '',
  });
  
  const [registerData, setRegisterData] = useState({
    phone: '',
    countryCode: '+91',
    password: '',
    name: '',
    username: '',
    country: '',
    avatar: '👤',
    bio: 'Sharing news and knowledge',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.phone) {
      toast({
        title: 'Validation Error',
        description: 'Please enter your phone number',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    // Convert phone to synthetic email format
    const email = `${loginData.countryCode.replace('+', '')}${loginData.phone}@worldnews.app`;

    const { user, error } = await FirebaseAuthService.login(email, loginData.password);
    
    setIsLoading(false);

    if (user) {
      toast({
        title: 'Welcome back!',
        description: `Logged in as ${user.name}`,
      });
      navigate('/feed');
    } else {
      toast({
        title: 'Login Failed',
        description: error || 'Invalid credentials',
        variant: 'destructive',
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!registerData.country) {
      toast({
        title: 'Validation Error',
        description: 'Please select your country',
        variant: 'destructive',
      });
      return;
    }

    if (!registerData.phone) {
      toast({
        title: 'Validation Error',
        description: 'Please provide phone number with country code',
        variant: 'destructive',
      });
      return;
    }

    if (registerData.phone.length < 8) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid phone number',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    // Create synthetic email from phone number
    const email = `${registerData.countryCode.replace('+', '')}${registerData.phone}@worldnews.app`;

    const { user, error } = await FirebaseAuthService.register(
      email,
      registerData.password,
      {
        name: registerData.name,
        username: registerData.username,
        country: registerData.country,
        avatar: registerData.avatar,
        bio: registerData.bio,
        phone: `${registerData.countryCode}${registerData.phone}`,
      }
    );

    setIsLoading(false);

    if (user) {
      toast({
        title: 'Account Created!',
        description: `Welcome, ${user.name}!`,
      });
      navigate('/feed');
    } else {
      toast({
        title: 'Registration Failed',
        description: error || 'Could not create account',
        variant: 'destructive',
      });
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      toast({
        title: 'Error',
        description: 'Please enter your phone number',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const email = forgotEmail.includes('@') ? forgotEmail : `${forgotEmail.replace('+', '')}@worldnews.app`;
    const { success, error } = await FirebaseAuthService.forgotPassword(email);
    setIsLoading(false);

    if (success) {
      toast({
        title: 'Password Reset Sent',
        description: 'Check your email for reset instructions',
      });
      setForgotPasswordOpen(false);
      setForgotEmail('');
    } else {
      toast({
        title: 'Error',
        description: error || 'Could not send reset email',
        variant: 'destructive',
      });
    }
  };

  const handleGuestLogin = () => {
    const guest = FirebaseAuthService.loginAsGuest();
    localStorage.setItem('guestUser', JSON.stringify(guest));
    toast({
      title: 'Welcome Guest!',
      description: 'Exploring as a guest user (view-only)',
    });
    navigate('/feed');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-background via-background to-muted">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-8 space-y-4">
          <div className="inline-flex items-center gap-3 justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Globe className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-serif font-bold text-foreground">
            WorldNews
          </h1>
          <p className="text-muted-foreground">
            Compare news from around the world
          </p>
        </div>

        {/* Auth Card */}
        <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Get Started</CardTitle>
            <CardDescription>Login with phone number or create an account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <div className="flex gap-2">
                      <Select
                        value={loginData.countryCode}
                        onValueChange={(value) => setLoginData({ ...loginData, countryCode: value })}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {countryCodes.map((c) => (
                            <SelectItem key={c.id} value={c.dial}>
                              {c.dial} {c.id.replace('_1', '')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="relative flex-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="tel"
                          placeholder="Phone number"
                          value={loginData.phone}
                          onChange={(e) => setLoginData({ ...loginData, phone: e.target.value.replace(/\D/g, '') })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="link" className="p-0 h-auto text-sm text-primary">
                        Forgot password?
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Enter your phone number (with country code, e.g., 917382591233) to receive a password reset link.
                        </p>
                        <Input
                          placeholder="Phone number (e.g., 917382591233)"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value.replace(/\D/g, ''))}
                        />
                        <Button onClick={handleForgotPassword} disabled={isLoading} className="w-full">
                          {isLoading ? 'Sending...' : 'Send Reset Link'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Full Name</Label>
                      <Input
                        id="register-name"
                        placeholder="John Doe"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-username">Username</Label>
                      <Input
                        id="register-username"
                        placeholder="johndoe"
                        value={registerData.username}
                        onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Phone Number (Required)</Label>
                    <div className="flex gap-2">
                      <Select
                        value={registerData.countryCode}
                        onValueChange={(value) => setRegisterData({ ...registerData, countryCode: value })}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {countryCodes.map((c) => (
                            <SelectItem key={c.id} value={c.dial}>
                              {c.dial} {c.id.replace('_1', '')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="relative flex-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="tel"
                          placeholder="Phone number"
                          value={registerData.phone}
                          onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value.replace(/\D/g, '') })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-country">Country (Required)</Label>
                    <Select
                      value={registerData.country}
                      onValueChange={(value) => setRegisterData({ ...registerData, country: value })}
                    >
                      <SelectTrigger id="register-country">
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.flag} {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      You can only create posts for your selected country
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGuestLogin}
            >
              <UserCircle className="mr-2 h-4 w-4" />
              Continue as Guest (View Only)
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          🌍 Experience news from multiple perspectives
        </p>
      </div>
    </div>
  );
};

export default Login;