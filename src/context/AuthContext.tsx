
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
    
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            // Use our utility function to ensure user exists and get role
            const userData = await ensureUserExists(session.user.id, session.user.email || '');
            console.log("User data from ensureUserExists:", userData);
            setUserRole(userData?.role || null);
            
            // If the user is an admin, make sure they don't get stuck on pending approval page
            if (userData?.role === 'admin' && window.location.pathname === '/pending-approval') {
              navigate('/');
            }
          } catch (error) {
            console.error('Error fetching/creating user role:', error);
            setUserRole('pending'); // Default to pending if there's an error
          }
        }
      } catch (error) {
        console.error('Session fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        try {
          // Use our utility function
          const userData = await ensureUserExists(session.user.id, session.user.email || '');
          console.log("Auth state change - user data:", userData);
          setUserRole(userData?.role || 'pending');
          
          // If the user is an admin, make sure they don't get stuck on pending approval page
          if (userData?.role === 'admin' && window.location.pathname === '/pending-approval') {
            navigate('/');
          }
        } catch (error) {
          console.error('Error fetching/creating user role:', error);
          setUserRole('pending'); // Default to pending if there's an error
        }
      } else {
        setUserRole(null);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      isInitialized.current = false;
    };
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return { error };
      }
      
      // Fetch the user's role after sign in
      const { data: authUser } = await supabase.auth.getUser();
      
      if (authUser?.user) {
        try {
          // Use our utility function
          const userData = await ensureUserExists(authUser.user.id, authUser.user.email || '');
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
          } else if (role === 'admin' || role === 'user' || role === 'staff') {
            navigate('/');
          }
        } catch (error) {
          console.error('Error fetching/creating user role:', error);
          // Handle as pending user
          setUserRole('pending');
          toast({
            title: "Account Status",
            description: "Proceeding with limited access while account status is determined.",
            variant: "default"
          });
          navigate('/pending-approval');
        }
      }
      
      return { error: null };
    } catch (error) {
      console.error("Sign in error:", error);
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
