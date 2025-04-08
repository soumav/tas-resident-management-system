import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { supabase, getUserRole, forceSetUserRole, checkRLSAccess, Resident, ResidentGroup, ResidentSubgroup, ResidentType } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

import { DashboardHeader } from '@/components/Dashboard/DashboardHeader';
import { StatCards } from '@/components/Dashboard/StatCards';
import { ResidentDisplay } from '@/components/Dashboard/ResidentDisplay';
import { GroupsSection } from '@/components/Dashboard/GroupsSection';
import { GroupDialogs } from '@/components/Dashboard/GroupDialogs';
import { EditResidentDialog } from '@/components/Dashboard/EditResidentDialog';
import { DeleteResidentDialog } from '@/components/Dashboard/DeleteResidentDialog';
import RLSDebugPanel from '@/components/Debug/RLSDebugPanel';
import AdminRoleHelper from '@/components/Auth/AdminRoleHelper';

export default function Dashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [residentTypes, setResidentTypes] = useState<ResidentType[]>([]);
  const [groups, setGroups] = useState<ResidentGroup[]>([]);
  const [subgroups, setSubgroups] = useState<ResidentSubgroup[]>([]);
  const [residentsByType, setResidentsByType] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasRLSIssue, setHasRLSIssue] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // Dialog states
  const [showAddGroupDialog, setShowAddGroupDialog] = useState(false);
  const [showAddSubgroupDialog, setShowAddSubgroupDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ResidentGroup | null>(null);
  const [showEditResidentDialog, setShowEditResidentDialog] = useState(false);
  const [showDeleteResidentDialog, setShowDeleteResidentDialog] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [showRLSDebug, setShowRLSDebug] = useState(false);

  // Fetch user role
  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const role = await getUserRole();
        setUserRole(role);
        console.log('User role:', role);
      }
    };
    
    fetchUserRole();
  }, [user]);

  // Fetch data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      
      try {
        // Check for RLS issues first
        const hasAccess = await checkRLSAccess('residents');
        if (!hasAccess) {
          setHasRLSIssue(true);
          setIsLoading(false);
          return;
        }
        
        // Fetch residents with their types and groups
        const { data: residentsData, error: residentsError } = await supabase
          .from('residents')
          .select(`
            *,
            type:resident_types(
              *,
              category:resident_categories(*)
            ),
            group:resident_groups(*),
            subgroup:resident_subgroups(*)
          `)
          .order('name');
          
        if (residentsError) throw residentsError;
        
        // Fetch resident types
        const { data: typesData, error: typesError } = await supabase
          .from('resident_types')
          .select(`
            *,
            category:resident_categories(*)
          `)
          .order('name');
          
        if (typesError) throw typesError;
        
        // Fetch groups
        const { data: groupsData, error: groupsError } = await supabase
          .from('resident_groups')
          .select('*')
          .order('name');
          
        if (groupsError) throw groupsError;
        
        // Fetch subgroups
        const { data: subgroupsData, error: subgroupsError } = await supabase
          .from('resident_subgroups')
          .select(`
            *,
            group:resident_groups(*)
          `)
          .order('name');
          
        if (subgroupsError) throw subgroupsError;
        
        // Calculate residents by type
        const typeCount: Record<string, number> = {};
        residentsData.forEach((resident: Resident) => {
          const typeName = resident.type?.name || 'Unknown';
          typeCount[typeName] = (typeCount[typeName] || 0) + 1;
        });
        
        // Update state
        setResidents(residentsData as Resident[]);
        setResidentTypes(typesData as ResidentType[]);
        setGroups(groupsData as ResidentGroup[]);
        setSubgroups(subgroupsData as ResidentSubgroup[]);
        setResidentsByType(typeCount);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive',
        });
        setHasRLSIssue(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [toast]);

  // Handle dialog opens
  const handleOpenAddGroup = () => setShowAddGroupDialog(true);
  const handleOpenAddSubgroup = (group: ResidentGroup) => {
    setSelectedGroup(group);
    setShowAddSubgroupDialog(true);
  };
  
  const handleEditResident = (resident: Resident) => {
    setSelectedResident(resident);
    setShowEditResidentDialog(true);
  };
  
  const handleDeleteResident = (resident: Resident) => {
    setSelectedResident(resident);
    setShowDeleteResidentDialog(true);
  };
  
  const handleRLSDebugComplete = () => {
    setShowRLSDebug(false);
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Admin Role Helper to fix permission issues */}
      <AdminRoleHelper />
      
      {hasRLSIssue && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Permission Error</AlertTitle>
          <AlertDescription>
            You don't have permission to access this data. This is likely due to Row Level Security (RLS) policies.
            <div className="mt-2">
              <Button 
                variant="outline" 
                onClick={() => setShowRLSDebug(true)}
              >
                Debug RLS Issues
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {showRLSDebug && (
        <RLSDebugPanel onComplete={handleRLSDebugComplete} />
      )}
      
      <DashboardHeader />
      
      <StatCards 
        totalResidents={residents.length} 
        residentsByType={residentsByType}
        totalGroups={groups.length}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <ResidentDisplay 
            residents={residents} 
            isLoading={isLoading} 
            onEdit={handleEditResident}
            onDelete={handleDeleteResident}
          />
        </div>
        
        <div>
          <GroupsSection 
            groups={groups} 
            subgroups={subgroups}
            isLoading={isLoading}
            onAddGroup={handleOpenAddGroup}
            onAddSubgroup={handleOpenAddSubgroup}
          />
        </div>
      </div>
      
      {/* Dialogs */}
      <GroupDialogs 
        showAddGroupDialog={showAddGroupDialog}
        setShowAddGroupDialog={setShowAddGroupDialog}
        showAddSubgroupDialog={showAddSubgroupDialog}
        setShowAddSubgroupDialog={setShowAddSubgroupDialog}
        selectedGroup={selectedGroup}
        groups={groups}
        setGroups={setGroups}
        subgroups={subgroups}
        setSubgroups={setSubgroups}
      />
      
      {selectedResident && (
        <>
          <EditResidentDialog 
            open={showEditResidentDialog}
            setOpen={setShowEditResidentDialog}
            resident={selectedResident}
            residentTypes={residentTypes}
            groups={groups}
            subgroups={subgroups}
            setResidents={setResidents}
          />
          
          <DeleteResidentDialog 
            open={showDeleteResidentDialog}
            setOpen={setShowDeleteResidentDialog}
            resident={selectedResident}
            setResidents={setResidents}
          />
        </>
      )}
    </div>
  );
}
