
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  const { user, isLoading } = useAuth();

  // If still loading, return null
  if (isLoading) return null;

  // If no user is authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 shadow-sm h-16 flex items-center px-6">
          <div className="flex-1 flex justify-center">
            <h1 className="text-xl font-bold text-sanctuary-green">The Alice Sanctuary Directory</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="font-medium">{user?.email?.split('@')[0] || 'User'}</p>
              <p className="text-xs text-gray-500">Staff</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-sanctuary-green/20 flex items-center justify-center text-sanctuary-green">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>
        
        <div className="dashboard-content flex-1 overflow-auto">
          <div className="py-4 px-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
