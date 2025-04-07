
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Leaf, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSupabaseError, setHasSupabaseError] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Check console for Supabase credential errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      if (args[0]?.includes?.('Supabase credentials')) {
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
    
    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "Authentication error",
        description: error.message,
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  const handleDemoLogin = async () => {
    if (hasSupabaseError) {
      toast({
        title: "Connection Error",
        description: "Cannot connect to Supabase. Please connect the project to Supabase first.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    // Use default demo credentials
    const { error } = await signIn("demo@example.com", "demo123");
    
    if (error) {
      toast({
        title: "Demo login failed",
        description: "Please ensure the demo account exists in your Supabase Auth.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Demo login successful",
        description: "You are now logged in with the demo account.",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="auth-layout">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="sanctuary-logo">
            <Leaf className="h-6 w-6 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-sanctuary-green">The Alice Sanctuary</h1>
        <p className="text-gray-600">Resident Management System</p>
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
      
      <div className="auth-card">
        <h2 className="text-2xl font-semibold mb-6">Sign In</h2>
        <p className="text-gray-500 mb-6">Sign in to access the sanctuary management system</p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
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
            />
          </div>
          
          <div className="mb-6">
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
            />
          </div>
          
          <Button
            type="submit"
            className="w-full bg-sanctuary-green hover:bg-sanctuary-light-green"
            disabled={isLoading || hasSupabaseError}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
          
          <div className="mt-4 relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleDemoLogin}
            className="w-full mt-4"
            disabled={isLoading || hasSupabaseError}
          >
            Demo Login
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
  );
}
