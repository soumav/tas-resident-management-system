
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [hasSupabaseError, setHasSupabaseError] = useState(false);

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
    
    // If authentication status is determined and user is not logged in, redirect to login
    if (!isLoading && !user && !hasSupabaseError) {
      navigate('/login');
    }
    
    return cleanup;
  }, [user, isLoading, navigate, hasSupabaseError]);

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

  // This will be replaced by the dashboard layout in routes
  return null;
};

export default Index;
