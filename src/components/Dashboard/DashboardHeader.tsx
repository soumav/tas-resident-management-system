
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface DashboardHeaderProps {
  username: string;
}

export function DashboardHeader({ username }: DashboardHeaderProps) {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  
  useEffect(() => {
    if (user) {
      // Check if user is admin
      const checkRole = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
          
        if (data && data.role === 'admin') {
          setIsAdmin(true);
          
          // Count pending users
          const { count } = await supabase
            .from('pending_users')
            .select('*', { count: 'exact', head: true });
            
          setPendingCount(count || 0);
        }
      };
      
      checkRole();
    }
  }, [user]);

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Welcome, {username}!</h2>
          <p className="text-gray-600">Manage your sanctuary residents and groups</p>
        </div>
        
        <div className="flex gap-4">
          {isAdmin && (
            <Button 
              className="flex items-center gap-2" 
              variant="outline" 
              asChild
            >
              <Link to="/admin/approvals">
                <UserCheck className="h-4 w-4" />
                <span>User Approvals</span>
                {pendingCount > 0 && (
                  <span className="ml-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {pendingCount}
                  </span>
                )}
              </Link>
            </Button>
          )}
        
          <Button className="flex items-center gap-2" variant="outline" asChild>
            <Link to="/resident-types">
              <span>Manage Types of Residents</span>
            </Link>
          </Button>
          
          <Button className="flex items-center gap-2 bg-sanctuary-green hover:bg-sanctuary-light-green" asChild>
            <Link to="/residents/new">
              <Plus className="h-4 w-4" />
              <span>Add New Resident</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
