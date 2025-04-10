
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Index = () => {
  const { user, isLoading, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasSupabaseError, setHasSupabaseError] = useState(false);
  const [navigationProcessed, setNavigationProcessed] = useState(false);
  
  // Check for Supabase connection errors
  useEffect(() => {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('Supabase credentials')) {
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
    if (hasSupabaseError) return;
    
    if (!isLoading) {
      console.log("Auth check complete. User:", !!user, "Role:", userRole);
      
      if (!user) {
        console.log("No user found, redirecting to login");
        navigate('/login', { replace: true });
      } else if (userRole === 'pending') {
        console.log("User is pending approval, redirecting to pending page");
        navigate('/pending-approval', { replace: true });
      } else {
        console.log("User authenticated with role:", userRole, "- proceeding to dashboard");
        // When at the root path, don't navigate away - dashboard will be rendered automatically
        setNavigationProcessed(true);
      }
    }
  }, [user, isLoading, navigate, hasSupabaseError, userRole]);

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
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-sanctuary-green mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated and we're at the root, return null to let the router handle it
  // This allows the Dashboard to render properly instead of showing a loading screen
  return null;
