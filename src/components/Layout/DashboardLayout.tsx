
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
      
      <div className="flex-1 dashboard-content overflow-auto">
        <div className="py-4 px-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
