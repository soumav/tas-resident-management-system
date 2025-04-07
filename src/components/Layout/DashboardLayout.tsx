
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
      
      <div className="flex-1 dashboard-content">
        <div className="py-4">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-sanctuary-green">The Alice Sanctuary Directory</h1>
          </header>
          
          <main>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
