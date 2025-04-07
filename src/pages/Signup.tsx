
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Leaf, User, Mail, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();

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
    
    // Using Supabase auth for signup
    const { data, error } = await signUp(email, password);
    
    if (error) {
      toast({
        title: "Sign up error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      // Add the name to the user metadata
      try {
        // If auth signup was successful, store the user name
        if (data?.user?.id) {
          await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              name: name,
              email: email
            });
        }
        
        toast({
          title: "Account created",
          description: "Please check your email to confirm your account",
        });
      } catch (metadataError) {
        console.error("Error saving user name:", metadataError);
        toast({
          title: "Warning",
          description: "Account created but we couldn't save your name. You can update it later.",
          variant: "destructive"
        });
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-40px)] flex flex-col justify-center bg-gray-50">
      <div className="flex-1 flex flex-col items-center justify-center p-4 pb-8">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 bg-sanctuary-green rounded-full flex items-center justify-center">
                <Leaf className="h-6 w-6 text-white" />
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-sanctuary-green">The Alice Sanctuary</h1>
            <p className="text-gray-600 mt-1">Resident Management System</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8 border border-gray-100">
            <h2 className="text-xl md:text-2xl font-semibold mb-2">Create Account</h2>
            <p className="text-gray-500 mb-6">Sign up to access the sanctuary management system</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
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
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
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
    </div>
  );
}
