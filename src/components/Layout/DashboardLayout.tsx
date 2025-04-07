
import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function DashboardLayout() {
  const { user, isLoading, signOut } = useAuth();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          return;
        }

        if (data?.name) {
          setUserName(data.name);
        }
      } catch (error) {
        console.error('Error in fetchUserProfile:', error);
      }
    };

    fetchUserProfile();
  }, [user?.id]);

  // If still loading, return null
  if (isLoading) return null;

  // If no user is authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  const handleSignOut = async () => {
    await signOut();
  };

  // Display name in order of preference: userName from profile, email username, or 'User'
  const displayName = userName || user?.email?.split('@')[0] || 'User';
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex flex-1">
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="bg-white border-b border-gray-200 shadow-sm h-16 flex items-center px-6">
            <div className="flex-1 flex justify-center">
              <h1 className="text-xl font-semibold tracking-wider text-sanctuary-dark-green">The Alice Sanctuary Resident Directory</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-medium">{displayName}</p>
                <p className="text-xs text-gray-500">Staff</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut} 
                className="text-gray-600 hover:text-gray-800"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>
          
          <div className="dashboard-content flex-1 overflow-auto">
            <div className="py-4 px-6">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
