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
import { Globe, UserCircle, Phone, Mail, Eye, EyeOff } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Country codes for phone registration
const countryCodes = [
  { code: 'US', dial: '+1', name: 'United States' },
  { code: 'UK', dial: '+44', name: 'United Kingdom' },
  { code: 'FR', dial: '+33', name: 'France' },
  { code: 'DE', dial: '+49', name: 'Germany' },
  { code: 'JP', dial: '+81', name: 'Japan' },
  { code: 'BR', dial: '+55', name: 'Brazil' },
  { code: 'IN', dial: '+91', name: 'India' },
  { code: 'AU', dial: '+61', name: 'Australia' },
  { code: 'CN', dial: '+86', name: 'China' },
  { code: 'RU', dial: '+7', name: 'Russia' },
  { code: 'IT', dial: '+39', name: 'Italy' },
  { code: 'ES', dial: '+34', name: 'Spain' },
  { code: 'MX', dial: '+52', name: 'Mexico' },
  { code: 'CA', dial: '+1', name: 'Canada' },
  { code: 'KR', dial: '+82', name: 'South Korea' },
];

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  
  const [loginData, setLoginData] = useState({
    email: '',
    phone: '',
    countryCode: '+1',
    password: '',
  });
  
  const [registerData, setRegisterData] = useState({
    email: '',
    phone: '',
    countryCode: '+1',
    password: '',
    name: '',
    username: '',
    country: '',
    avatar: '👤',
    bio: 'Sharing news and knowledge',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // For phone login, convert to email format (phone@worldnews.app)
    const email = loginMethod === 'phone' 
      ? `${loginData.countryCode.replace('+', '')}${loginData.phone}@worldnews.app`
      : loginData.email;

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

    if (!registerData.email && !registerData.phone) {
      toast({
        title: 'Validation Error',
        description: 'Please provide email or phone number',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    // For phone registration, create a synthetic email
    const email = registerData.phone 
      ? `${registerData.countryCode.replace('+', '')}${registerData.phone}@worldnews.app`
      : registerData.email;

    const { user, error } = await FirebaseAuthService.register(
      email,
      registerData.password,
      {
        name: registerData.name,
        username: registerData.username,
        country: registerData.country,
        avatar: registerData.avatar,
        bio: registerData.bio,
        phone: registerData.phone ? `${registerData.countryCode}${registerData.phone}` : undefined,
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
            <CardDescription>Login or create an account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Login Method Toggle */}
                  <div className="flex gap-2 p-1 bg-muted rounded-lg">
                    <Button
                      type="button"
                      variant={loginMethod === 'email' ? 'default' : 'ghost'}
                      size="sm"
                      className="flex-1"
                      onClick={() => setLoginMethod('email')}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                    <Button
                      type="button"
                      variant={loginMethod === 'phone' ? 'default' : 'ghost'}
                      size="sm"
                      className="flex-1"
                      onClick={() => setLoginMethod('phone')}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Phone
                    </Button>
                  </div>

                  {loginMethod === 'email' ? (
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your@email.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <div className="flex gap-2">
                        <Select
                          value={loginData.countryCode}
                          onValueChange={(value) => setLoginData({ ...loginData, countryCode: value })}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {countryCodes.map((c) => (
                              <SelectItem key={c.code + c.dial} value={c.dial}>
                                {c.dial}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="tel"
                          placeholder="Phone number"
                          value={loginData.phone}
                          onChange={(e) => setLoginData({ ...loginData, phone: e.target.value.replace(/\D/g, '') })}
                          className="flex-1"
                          required
                        />
                      </div>
                    </div>
                  )}
                  
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
                    <Label>Email or Phone (choose one)</Label>
                    <Input
                      type="email"
                      placeholder="Email (optional)"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value, phone: '' })}
                    />
                    <div className="flex items-center gap-2 my-2">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-muted-foreground">OR</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    <div className="flex gap-2">
                      <Select
                        value={registerData.countryCode}
                        onValueChange={(value) => setRegisterData({ ...registerData, countryCode: value })}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {countryCodes.map((c) => (
                            <SelectItem key={c.code + c.dial} value={c.dial}>
                              {c.dial}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="tel"
                        placeholder="Phone (optional)"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value.replace(/\D/g, ''), email: '' })}
                        className="flex-1"
                      />
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
                    <Label htmlFor="register-country">Country</Label>
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