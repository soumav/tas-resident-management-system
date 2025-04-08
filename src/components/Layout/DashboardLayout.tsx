
import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { Button } from '@/components/ui/button';
import { LogOut, PiggyBank, Menu } from 'lucide-react';

export default function DashboardLayout() {
  const { user, isLoading, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar closeSidebar={() => setSidebarOpen(false)} />
      </div>
        
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white border-b border-gray-200 shadow-sm h-16 flex items-center px-6 sticky top-0 z-10">
          <button 
            className="lg:hidden mr-4 text-gray-600"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2">
              <PiggyBank className="h-6 w-6 text-sanctuary-green" />
              <h1 className="text-xl font-semibold tracking-wider text-sanctuary-dark-green">The Alice Sanctuary Resident Directory</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-medium">{username}</p>
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
            <Outlet />
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
