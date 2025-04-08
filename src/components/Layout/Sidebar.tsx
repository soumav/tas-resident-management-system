import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Home, Users, ListIcon, UserPlus, Settings, InfoIcon, HelpCircle, LogOut, UserSquare, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { isAdmin, getUserRole } from '@/lib/supabase';

export default function Sidebar() {
  const {
    signOut,
    user
  } = useAuth();
  const location = useLocation();
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  const isActive = (path: string) => location.pathname === path;
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const adminStatus = await isAdmin();
        setIsUserAdmin(adminStatus);
        
        // Fetch user role
        const role = await getUserRole();
        setUserRole(role);
      }
    };
    
    checkAdminStatus();
  }, [user]);
  
  // Get the initial based on the user role
  const getRoleInitial = () => {
    if (!userRole) return "U"; // Default to "U" if role is not yet determined
    
    switch(userRole.toLowerCase()) {
      case "admin": return "A";
      case "staff": return "S";
      case "volunteer": return "V";
      default: return "U"; // For "user" or any other role
    }
  };

  const dashboardLinks = [{
    name: 'Overview',
    path: '/',
    icon: Home
  }, {
    name: 'All Residents',
    path: '/residents',
    icon: Users
  }, {
    name: 'Groups',
    path: '/groups',
    icon: ListIcon
  }];
  
  const managementLinks = [{
    name: 'Add Resident',
    path: '/residents/new',
    icon: UserPlus
  }, {
    name: 'Staff & Volunteers',
    path: '/staff',
    icon: Users
  }, {
    name: 'Settings',
    path: '/settings',
    icon: Settings
  }];

  // Admin-specific links
  const adminLinks = [{
    name: 'User Approval',
    path: '/admin/approval',
    icon: ShieldCheck
  }];
  
  const helpLinks = [{
    name: 'About',
    path: '/about',
    icon: InfoIcon
  }, {
    name: 'Help & Support',
    path: '/help',
    icon: HelpCircle
  }];
  
  const username = user?.email?.split('@')[0] || 'User';
  const roleInitial = getRoleInitial();
  
  return (
    <div className="dashboard-sidebar bg-sanctuary-dark-green w-[280px] flex-shrink-0 flex flex-col min-h-full h-screen">
      <div className="px-4 py-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-white">The Alice Sanctuary</h1>
          <p className="text-sm text-gray-300">Resident Management</p>
        </div>
      </div>
      
      <Separator className="bg-sanctuary-green/30" />
      
      <div className="px-4 py-2"></div>
      
      <div className="mb-6 mt-4">
        <div className="px-4 py-2 text-xs font-semibold text-gray-300">DASHBOARD</div>
        <nav className="mt-2">
          {dashboardLinks.map(link => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={cn('flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-sanctuary-green/20', 
                isActive(link.path) && 'bg-sanctuary-green/20 text-white font-medium')}
            >
              <link.icon className="h-5 w-5" />
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="mb-6">
        <div className="px-4 py-2 text-xs font-semibold text-gray-300">MANAGEMENT</div>
        <nav className="mt-2">
          {managementLinks.map(link => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={cn('flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-sanctuary-green/20', 
                isActive(link.path) && 'bg-sanctuary-green/20 text-white font-medium')}
            >
              <link.icon className="h-5 w-5" />
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>
      </div>
      
      {isUserAdmin && (
        <div className="mb-6">
          <div className="px-4 py-2 text-xs font-semibold text-gray-300">ADMIN</div>
          <nav className="mt-2">
            {adminLinks.map(link => (
              <Link 
                key={link.path} 
                to={link.path} 
                className={cn('flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-sanctuary-green/20', 
                  isActive(link.path) && 'bg-sanctuary-green/20 text-white font-medium')}
              >
                <link.icon className="h-5 w-5" />
                <span>{link.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
      
      <div className="mb-6">
        <div className="px-4 py-2 text-xs font-semibold text-gray-300">HELP</div>
        <nav className="mt-2">
          {helpLinks.map(link => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={cn('flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-sanctuary-green/20', 
                isActive(link.path) && 'bg-sanctuary-green/20 text-white font-medium')}
            >
              <link.icon className="h-5 w-5" />
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="mt-auto px-4 py-6 border-t border-sanctuary-green/30">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 bg-[#8B5CF6] text-sanctuary-dark-green">
            <AvatarFallback>{roleInitial}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-white font-medium">Sanctuary {userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'User'}</p>
            <p className="text-xs text-gray-300">Version 1.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
