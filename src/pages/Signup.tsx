
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Leaf, User, Mail, Lock, UserCog } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Footer from '@/components/Layout/Footer';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name",
        variant: "destructive"
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Password error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Check if this is an admin creation with the special code
      // The format is email#admincode
      const adminCode = "createadmin123";
      const isAdminCreation = email.includes("#" + adminCode);
      
      // Clean the email if it contains the admin code
      const cleanEmail = email.split("#")[0];
      
      if (isAdminCreation) {
        // Direct admin creation path
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password
        });
        
        if (signUpError) throw signUpError;
        
        if (signUpData.user) {
          // Create the user profile with admin role
          const { error: profileError } = await supabase.from('users').insert({
            id: signUpData.user.id,
            email: cleanEmail,
            role: 'admin'
          });
          
          if (profileError) throw profileError;
          
          // Create profile entry
          const { error: userProfileError } = await supabase.from('profiles').insert({
            id: signUpData.user.id,
            name: name,
            email: cleanEmail,
          });
          
          if (userProfileError) throw userProfileError;
          
          toast({
            title: "Admin account created",
            description: "Your admin account has been created successfully.",
          });
          
          // Redirect to login page
          navigate('/login');
        }
      } else {
        // Standard user creation path through pending_users
        const { error: pendingError } = await supabase
          .from('pending_users')
          .insert({
            name: name,
            email: email,
            password_hash: password, // Note: This is just for the admin approval workflow
            requested_role: role
          });
          
        if (pendingError) {
          throw pendingError;
        }
        
        toast({
          title: "Registration submitted",
          description: "Your account registration has been submitted for admin approval. You will receive an email once approved.",
        });
      }
    } catch (error) {
      console.error("Error in signup process:", error);
      toast({
        title: "Sign up error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex flex-col items-center justify-center w-full flex-grow p-4 py-8">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="sanctuary-logo w-14 h-14 flex items-center justify-center">
                <Leaf className="h-7 w-7 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-sanctuary-green">The Alice Sanctuary</h1>
            <p className="text-gray-600 mt-1">Resident Management System</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-8 border border-gray-100">
            <h2 className="text-2xl font-semibold mb-2">Create Account</h2>
            <p className="text-gray-500 mb-6">Sign up to access the sanctuary management system</p>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Requested Role
                </label>
                <div className="relative">
                  <UserCog className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-gray-500 mt-1">Your role request will be reviewed by an administrator.</p>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-sanctuary-green hover:bg-sanctuary-light-green h-11"
                disabled={isLoading}
              >
                {isLoading ? 'Submitting Request...' : 'Request Account'}
              </Button>
              
              <p className="text-xs text-center text-gray-500">
                Your account request will be reviewed by an administrator.
                You will receive an email when your account is approved.
              </p>
            </form>
            
            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-sanctuary-green hover:underline font-medium">
                  Sign in
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
