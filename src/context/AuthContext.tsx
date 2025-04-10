import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, ensureUserExists } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  userRole: string | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, role: string, name: string) => Promise<{ error: any, data: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isPending: boolean;
  isUser: boolean;
  isStaff: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isInitialized = useRef(false);

  useEffect(() => {
    // Prevent multiple initialization
    if (isInitialized.current) return;
    isInitialized.current = true;
    
    console.log("Initializing auth context");
    
    const getSession = async () => {
      try {
        // Force refresh the session to ensure we have the latest data
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session fetch error:", error);
          setIsLoading(false);
          return;
        }
        
        const { session } = data;
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            console.log("User session found, fetching role...");
            // Get user data and role
            const userData = await ensureUserExists(session.user.id, session.user.email || '');
            console.log("User data from ensureUserExists:", userData);
            setUserRole(userData?.role || 'pending');
          } catch (error) {
            console.error('Error fetching/creating user role:', error);
            setUserRole('pending');
          }
        } else {
          // No session found, make sure we're not loading
          console.log("No session found");
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Session fetch error:', error);
        setIsLoading(false);
      }
    };
    
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change detected:", event);
      
      if (event === 'INITIAL_SESSION' && !session) {
        // No initial session, just finish loading
        setIsLoading(false);
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        try {
          console.log("Auth state change - fetching user data");
          const userData = await ensureUserExists(session.user.id, session.user.email || '');
          console.log("Auth state change - user data:", userData);
          setUserRole(userData?.role || 'pending');
        } catch (error) {
          console.error('Error fetching/creating user role:', error);
          setUserRole('pending');
        }
      } else {
        setUserRole(null);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Sign in error:", error);
        setIsLoading(false);
        return { error };
      }
      
      console.log("Sign in success, session:", data.session);
      
      // Set the user and session immediately on successful login
      setUser(data.session?.user ?? null);
      setSession(data.session);
      
      if (data.session?.user) {
        try {
          const userData = await ensureUserExists(data.session.user.id, data.session.user.email || '');
          console.log("Sign-in - user data:", userData);
          
          const role = userData?.role || 'pending';
          setUserRole(role);
          
          // Redirect based on role
          if (role === 'pending') {
            toast({
              title: "Account Pending Approval",
              description: "Your account is pending approval by an administrator.",
              variant: "default"
            });
            navigate('/pending-approval');
          } else {
            navigate('/');
          }
        } catch (error) {
          console.error('Error fetching/creating user role:', error);
          setUserRole('pending');
          navigate('/pending-approval');
        }
      }
      
      setIsLoading(false);
      return { error: null };
    } catch (error) {
      console.error("Sign in exception:", error);
      setIsLoading(false);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, requestedRole: string, name: string) => {
    try {
      // Create the auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        return { data: null, error };
      }
      
      // If auth signup was successful and we have a user
      if (data?.user) {
        // First insert the profile data
        await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name: name,
            email: email
          });
        
        // Then create an approval request
        await supabase
          .from('user_approval_requests')
          .insert({
            user_id: data.user.id,
            requested_role: requestedRole,
            status: 'pending'
          });
        
        toast({
          title: "Account created",
          description: "Your account will be reviewed by an administrator before you can access the system.",
        });
        
        navigate('/pending-approval');
      }
      
      return { data, error: null };
    } catch (error) {
      console.error("Error during signup process:", error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserRole(null);
    navigate('/login');
  };

  // Computed properties for easier role checking
  const isAdmin = userRole === 'admin';
  const isPending = userRole === 'pending';
  const isUser = userRole === 'user';
  const isStaff = userRole === 'staff';

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isLoading, 
      userRole,
      signIn, 
      signUp, 
      signOut,
      isAdmin,
      isPending,
      isUser,
      isStaff
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
