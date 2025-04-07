
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  Home, 
  Users, 
  List, 
  PlusCircle, 
  UserPlus, 
  Settings,
  Info,
  HelpCircle,
  LogOut,
  Leaf
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const { signOut } = useAuth();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const dashboardLinks = [
    { 
      name: 'Overview', 
      path: '/', 
      icon: Home 
    },
    { 
      name: 'All Residents', 
      path: '/residents', 
      icon: Users 
    },
    { 
      name: 'Groups', 
      path: '/groups', 
      icon: List 
    }
  ];
  
  const managementLinks = [
    { 
      name: 'Add Resident', 
      path: '/residents/new', 
      icon: PlusCircle 
    },
    { 
      name: 'Staff & Volunteers', 
      path: '/staff', 
      icon: UserPlus 
    },
    { 
      name: 'Settings', 
      path: '/settings', 
      icon: Settings 
    }
  ];
  
  const helpLinks = [
    { 
      name: 'About', 
      path: '/about', 
      icon: Info 
    },
    { 
      name: 'Help & Support', 
      path: '/help', 
      icon: HelpCircle 
    }
  ];
  
  return (
    <div className="dashboard-sidebar">
      <div className="px-4 py-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="sanctuary-logo">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">The Alice Sanctuary</h1>
            <p className="text-sm text-gray-300">Resident Management</p>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="px-4 py-2 text-xs font-semibold text-gray-300">DASHBOARD</div>
        <nav className="mt-2">
          {dashboardLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'sidebar-link',
                isActive(link.path) && 'active'
              )}
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
          {managementLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'sidebar-link',
                isActive(link.path) && 'active'
              )}
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
          {helpLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'sidebar-link',
                isActive(link.path) && 'active'
              )}
            >
              <link.icon className="h-5 w-5" />
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="mt-auto px-4 py-6">
        <Button 
          variant="outline" 
          onClick={signOut}
          className="w-full bg-sanctuary-dark-green hover:bg-sanctuary-green text-white border-sanctuary-green"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
        <div className="mt-4 text-xs text-center text-gray-300">
          <div>Sanctuary Staff</div>
          <div>Version 1.0</div>
        </div>
      </div>
    </div>
  );
}
