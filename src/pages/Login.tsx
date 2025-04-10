import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { PiggyBank, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Footer from '@/components/Layout/Footer';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);
  const [hasSupabaseError, setHasSupabaseError] = useState(false);
  const { signIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && loginAttempted) {
      navigate('/');
    }
  }, [user, navigate, loginAttempted]);

  useEffect(() => {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('Supabase credentials')) {
        setHasSupabaseError(true);
      }
      originalConsoleError(...args);
    };
    
    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (hasSupabaseError) {
      toast({
        title: "Connection Error",
        description: "Cannot connect to Supabase. Please connect the project to Supabase first.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setLoginAttempted(true);
    
    try {
      console.log("Attempting login with:", email);
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error("Login error:", error);
        setIsLoading(false);
        toast({
          title: "Authentication error",
          description: error.message || "Invalid email or password. Please try again.",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      console.error("Login exception:", err);
      setIsLoading(false);
      toast({
        title: "Authentication error",
        description: err?.message || "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex flex-col items-center justify-center py-8 px-4">
        <div className="w-full"></div> {/* Spacer */}
        <div className="max-w-md w-full">
          <div className="mb-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 bg-sanctuary-green rounded-full flex items-center justify-center">
                <PiggyBank className="h-6 w-6 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-sanctuary-green">The Alice Sanctuary</h1>
            <p className="text-gray-600 mt-1">Resident Management System</p>
          </div>
          
          {hasSupabaseError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Supabase Connection Error</AlertTitle>
              <AlertDescription>
                This app requires Supabase connection. Please connect to Supabase using the 
                green button in the Lovable interface.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="bg-white shadow-md rounded-lg p-8 border border-gray-200">
            <h2 className="text-2xl font-semibold mb-2">Sign In</h2>
            <p className="text-gray-500 mb-6">Sign in to access the sanctuary management system</p>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-sm text-sanctuary-green hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full"
                  disabled={isLoading}
                />
              </div>
              
              <Button
                type="submit"
                className="w-full bg-sanctuary-green hover:bg-sanctuary-light-green"
                disabled={isLoading || hasSupabaseError}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-sanctuary-green hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
