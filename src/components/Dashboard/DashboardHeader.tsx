
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface DashboardHeaderProps {
  username: string;
}

export function DashboardHeader({ username }: DashboardHeaderProps) {
  const [displayName, setDisplayName] = useState(username);
  const { user } = useAuth();
  
  useEffect(() => {
    // Try to get user profile name
    const fetchUserProfile = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();
          
        if (data?.name && !error) {
          setDisplayName(data.name);
        }
      }
    };
    
    fetchUserProfile();
  }, [user]);

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Welcome, {displayName}!</h2>
          <p className="text-gray-600">Manage your sanctuary residents and groups</p>
        </div>
        
        <div className="flex gap-4">
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
