
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Home, Users, ListIcon, UserPlus, Settings, InfoIcon, HelpCircle } from 'lucide-react';
import { 
  Sidebar as ShadcnSidebar, 
  SidebarContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarRail,
  SidebarFooter
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  
  const dashboardLinks = [
    { name: 'Overview', path: '/', icon: Home },
    { name: 'All Residents', path: '/residents', icon: Users },
    { name: 'Groups', path: '/groups', icon: ListIcon }
  ];
  
  const managementLinks = [
    { name: 'Add Resident', path: '/residents/new', icon: UserPlus },
    { name: 'Staff & Volunteers', path: '/staff', icon: Users },
    { name: 'Settings', path: '/settings', icon: Settings }
  ];
  
  const helpLinks = [
    { name: 'About', path: '/about', icon: InfoIcon },
    { name: 'Help & Support', path: '/help', icon: HelpCircle }
  ];
  
  const username = user?.email?.split('@')[0] || 'User';
  const userInitial = username.charAt(0).toUpperCase();

  return (
    <ShadcnSidebar collapsible="icon" variant="sidebar" className="bg-sanctuary-dark-green border-r-0">
      <SidebarRail />
      
      <SidebarHeader className="text-white px-4 py-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold">The Alice Sanctuary</h1>
          <p className="text-sm text-gray-300">Resident Management</p>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-300 font-semibold">DASHBOARD</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dashboardLinks.map(link => (
                <SidebarMenuItem key={link.path}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(link.path)}
                    tooltip={link.name}
                  >
                    <Link to={link.path}>
                      <link.icon className="h-5 w-5" />
                      <span>{link.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-300 font-semibold">MANAGEMENT</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementLinks.map(link => (
                <SidebarMenuItem key={link.path}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(link.path)}
                    tooltip={link.name}
                  >
                    <Link to={link.path}>
                      <link.icon className="h-5 w-5" />
                      <span>{link.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-300 font-semibold">HELP</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {helpLinks.map(link => (
                <SidebarMenuItem key={link.path}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(link.path)}
                    tooltip={link.name}
                  >
                    <Link to={link.path}>
                      <link.icon className="h-5 w-5" />
                      <span>{link.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="mt-auto border-t border-sanctuary-green/30">
        <div className="flex items-center gap-3 px-4 py-4">
          <Avatar className="h-10 w-10 bg-[#8B5CF6] text-sanctuary-dark-green">
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-white font-medium">Sanctuary Staff</p>
            <p className="text-xs text-gray-300">Version 1.0</p>
          </div>
        </div>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
