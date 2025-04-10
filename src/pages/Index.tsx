
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Index = () => {
  const { user, isLoading, userRole } = useAuth();
  const navigate = useNavigate();
  const [hasSupabaseError, setHasSupabaseError] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  
  // Check for Supabase connection errors
  useEffect(() => {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      if (args[0]?.toString()?.includes?.('Supabase credentials')) {
        setHasSupabaseError(true);
      }
      originalConsoleError(...args);
    };
    
    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  // Handle navigation based on auth state
  useEffect(() => {
    if (redirecting) return; // Prevent multiple redirects
    
    if (hasSupabaseError) return; // Don't redirect if there's a Supabase error
    
    if (!isLoading) {
      setRedirecting(true);
      
      if (!user) {
        console.log("No user found, redirecting to login");
        navigate('/login');
      } else if (userRole === 'pending') {
        console.log("User is pending approval, redirecting to pending page");
        navigate('/pending-approval');
      }
    }
  }, [user, isLoading, navigate, hasSupabaseError, redirecting, userRole]);

  // Show Supabase connection error
  if (hasSupabaseError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <Alert variant="destructive" className="max-w-md mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Supabase Connection Error</AlertTitle>
          <AlertDescription>
            This project requires a Supabase connection. Please connect to Supabase using the 
            green Supabase button in the top right corner of the Lovable interface.
          </AlertDescription>
        </Alert>
        
        <div className="prose prose-sm">
          <h2>Required Supabase Setup</h2>
          <p>After connecting to Supabase, you'll need to:</p>
          <ol>
            <li>Enable Email/Password authentication in the Auth section</li>
            <li>Create the database tables according to the schema</li>
            <li>Set up storage buckets for resident images</li>
          </ol>
        </div>
      </div>
    );
  }

  // Show loading indicator while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-sanctuary-green" />
      </div>
    );
  }

  // This will be shown if logged in but waiting for dashboard component to load
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-sanctuary-green" />
    </div>
  );
};

export default Index;
