
import React from 'react';
import { Outlet, Navigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

type DashboardContextType = {
  displayName: string;
};

export default function DashboardLayout() {
  const { user, isLoading, signOut } = useAuth();

  // If still loading, return null
  if (isLoading) return null;

  // If no user is authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  const handleSignOut = async () => {
    await signOut();
  };
  
  const username = user?.email?.split('@')[0] || 'User';
  // Use the username with capitalized first letter as the display name
  const displayName = username.charAt(0).toUpperCase() + username.slice(1);
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Fixed sidebar */}
      <div className="h-screen sticky top-0">
        <Sidebar />
      </div>
        
      {/* Scrollable main content */}
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white border-b border-gray-200 shadow-sm h-16 flex items-center px-6 sticky top-0 z-10">
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
        
        <div className="flex-1 overflow-auto">
          <div className="py-4 px-6 min-h-[calc(100vh-4rem)]">
            <Outlet context={{ displayName }} />
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}

// Helper hook to get the display name from context
export function useDashboardContext() {
  return useOutletContext<DashboardContextType>();
}
