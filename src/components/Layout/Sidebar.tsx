
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Home, Users, ListIcon, UserPlus, Settings, InfoIcon, HelpCircle, LogOut, UserSquare, PiggyBank, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface SidebarProps {
  closeSidebar?: () => void;
}

export default function Sidebar({ closeSidebar }: SidebarProps) {
  const {
    signOut,
    user
  } = useAuth();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
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
  const userInitial = username.charAt(0).toUpperCase();
  
  return (
    <div className="dashboard-sidebar bg-sanctuary-dark-green w-[280px] flex-shrink-0 flex flex-col h-full">
      <div className="px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <PiggyBank className="h-6 w-6 text-white" />
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-white">The Alice Sanctuary</h1>
            <p className="text-sm text-gray-300">Resident Management</p>
          </div>
        </div>
        
        {closeSidebar && (
          <Button variant="ghost" size="sm" onClick={closeSidebar} className="text-white lg:hidden">
            <X className="h-5 w-5" />
          </Button>
        )}
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
              onClick={closeSidebar}
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
              onClick={closeSidebar}
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
        <div className="px-4 py-2 text-xs font-semibold text-gray-300">HELP</div>
        <nav className="mt-2">
          {helpLinks.map(link => (
            <Link 
              key={link.path} 
              to={link.path} 
              onClick={closeSidebar}
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
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-white font-medium">Sanctuary Staff</p>
            <p className="text-xs text-gray-300">Version 1.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
