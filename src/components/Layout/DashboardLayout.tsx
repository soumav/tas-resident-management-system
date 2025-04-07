
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { Button } from '@/components/ui/button';
import { LogOut, Menu } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

export default function DashboardLayout() {
  const { user, isLoading, signOut } = useAuth();
  const isMobile = useIsMobile();

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
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
        
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 shadow-sm h-12 sm:h-14 md:h-16 flex items-center px-3 sm:px-6">
          <div className="flex items-center md:hidden mr-2">
            <SidebarTrigger />
          </div>
          
          <div className="flex-1 flex justify-center">
            <h1 className="text-sm sm:text-md md:text-xl font-semibold tracking-wider text-sanctuary-dark-green truncate">
              The Alice Sanctuary Resident Directory
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="font-medium text-xs sm:text-sm">{username}</p>
              <p className="text-xs text-gray-500">Staff</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSignOut} 
              className="text-gray-600 hover:text-gray-800 p-1 sm:p-2"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto">
          <div className="py-2 px-2 sm:py-4 sm:px-6 flex flex-col min-h-[calc(100vh-3rem)]">
            <Outlet />
          </div>
        </div>
        
        <Footer />
      </div>
    </div>
  );
}
