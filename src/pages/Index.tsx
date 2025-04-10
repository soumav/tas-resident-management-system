
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
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  useEffect(() => {
    // Check if there are Supabase credential errors
    const checkForSupabaseErrors = () => {
      const consoleErrors = console.error;
      console.error = (...args) => {
        if (args[0]?.includes?.('Supabase credentials')) {
          setHasSupabaseError(true);
        }
        consoleErrors(...args);
      };
      
      return () => {
        console.error = consoleErrors;
      };
    };
    
    const cleanup = checkForSupabaseErrors();
    
    return cleanup;
  }, []);

  useEffect(() => {
    // Add a protection against repeated redirects
    if (!isLoading && !user && !redirectAttempted && !hasSupabaseError) {
      console.log("No user found, redirecting to login");
      setRedirectAttempted(true);
      navigate('/login');
    }

    // When user is authenticated with a valid role, redirect to dashboard
    if (!isLoading && user && userRole && userRole !== 'pending' && !redirectAttempted && !hasSupabaseError) {
      console.log("User authenticated, redirecting to dashboard");
      setRedirectAttempted(true);
      navigate('/');
    }
  }, [user, isLoading, navigate, hasSupabaseError, redirectAttempted, userRole]);

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
