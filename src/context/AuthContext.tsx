
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
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

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch the user's role
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (data && !error) {
          setUserRole(data.role);
        } else {
          console.error('Error fetching user role:', error);
        }
      }
      
      setIsLoading(false);
    };
    
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch the user's role
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (data && !error) {
          setUserRole(data.role);
        }
      } else {
        setUserRole(null);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (!error) {
      // Fetch the user's role after sign in
      const { data: authUser } = await supabase.auth.getUser();
      
      if (authUser?.user) {
        const { data, error: roleError } = await supabase
          .from('users')
          .select('role')
          .eq('id', authUser.user.id)
          .single();
        
        if (data && !roleError) {
          setUserRole(data.role);
          
          // Redirect based on role
          if (data.role === 'pending') {
            toast({
              title: "Account Pending Approval",
              description: "Your account is pending approval by an administrator.",
              variant: "warning"
            });
            navigate('/pending-approval');
          } else if (data.role === 'admin') {
            navigate('/');
          } else if (data.role === 'user' || data.role === 'staff') {
            navigate('/');
          }
        }
      }
    }
    
    return { error };
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
