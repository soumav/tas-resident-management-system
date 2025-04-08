
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, logSupabaseOperation } from '@/lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any, data: any }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a wrapper component that can safely use router hooks
function AuthProviderWithRouting({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          toast({
            title: 'Session Error',
            description: 'Could not retrieve your session. Please try logging in again.',
            variant: 'destructive',
          });
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      } catch (err) {
        console.error('Unexpected error during session retrieval:', err);
        setIsLoading(false);
      }
    };
    
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in with:', { email, password: '******' });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      await logSupabaseOperation('sign-in', { success: !error, email });
      
      if (error) {
        console.error('Sign in error:', error);
        toast({
          title: 'Authentication Error',
          description: error.message || 'Failed to sign in. Please check your credentials.',
          variant: 'destructive',
        });
        return { error };
      }
      
      if (data.user) {
        console.log('Successfully signed in user:', data.user.email);
        toast({
          title: 'Welcome back!',
          description: `Signed in as ${data.user.email}`,
        });
        navigate('/');
      }
      
      return { error: null };
    } catch (err) {
      console.error('Unexpected error during sign in:', err);
      toast({
        title: 'Unexpected Error',
        description: 'An unexpected error occurred. Please try again later.',
        variant: 'destructive',
      });
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      await logSupabaseOperation('sign-up', { success: !error, email });
      
      if (error) {
        console.error('Sign up error:', error);
        toast({
          title: 'Registration Error',
          description: error.message || 'Failed to create account. Please try again.',
          variant: 'destructive',
        });
        return { data: null, error };
      }
      
      toast({
        title: 'Account Created',
        description: 'Your account has been created successfully.',
      });
      
      if (!error) {
        navigate('/');
      }
      
      return { data, error };
    } catch (err) {
      console.error('Unexpected error during sign up:', err);
      toast({
        title: 'Unexpected Error',
        description: 'An unexpected error occurred. Please try again later.',
        variant: 'destructive',
      });
      return { data: null, error: err };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
      });
      navigate('/login');
    } catch (err) {
      console.error('Sign out error:', err);
      toast({
        title: 'Sign Out Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signIn, signUp, signOut }}>
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-sanctuary-green" />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

// Export a provider that doesn't need to be inside Router
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return children;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
