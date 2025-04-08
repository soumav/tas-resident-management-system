
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
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [isDeleteGroupOpen, setIsDeleteGroupOpen] = useState(false);
  const [isAddSubgroupOpen, setIsAddSubgroupOpen] = useState(false);
  const [isEditSubgroupOpen, setIsEditSubgroupOpen] = useState(false);
  const [isDeleteSubgroupOpen, setIsDeleteSubgroupOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [subgroupName, setSubgroupName] = useState('');
  const [subgroupDescription, setSubgroupDescription] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<ResidentGroup | null>(null);
  const [selectedSubgroup, setSelectedSubgroup] = useState<ResidentSubgroup | null>(null);
  const [selectedGroupName, setSelectedGroupName] = useState('');
  const [selectedSubgroupName, setSelectedSubgroupName] = useState('');
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
  const handleOpenAddGroup = () => {
    setGroupName('');
    setGroupDescription('');
    setIsAddGroupOpen(true);
  };
  
  const handleOpenEditGroup = (group: ResidentGroup) => {
    setSelectedGroup(group);
    setGroupName(group.name || '');
    setGroupDescription(group.description || '');
    setIsEditGroupOpen(true);
  };
  
  const handleOpenDeleteGroup = (group: ResidentGroup) => {
    setSelectedGroup(group);
    setSelectedGroupName(group.name || '');
    setIsDeleteGroupOpen(true);
  };
  
  const handleOpenAddSubgroup = (group: ResidentGroup) => {
    setSelectedGroup(group);
    setSubgroupName('');
    setSubgroupDescription('');
    setIsAddSubgroupOpen(true);
  };
  
  const handleOpenEditSubgroup = (subgroup: ResidentSubgroup) => {
    setSelectedSubgroup(subgroup);
    setSubgroupName(subgroup.name || '');
    setSubgroupDescription(subgroup.description || '');
    setIsEditSubgroupOpen(true);
  };
  
  const handleOpenDeleteSubgroup = (subgroup: ResidentSubgroup) => {
    setSelectedSubgroup(subgroup);
    setSelectedSubgroupName(subgroup.name || '');
    setIsDeleteSubgroupOpen(true);
  };
  
  // Handle group and subgroup operations
  const handleAddGroup = async () => {
    // Mock implementation for now
    console.log('Adding group:', groupName, groupDescription);
    setIsAddGroupOpen(false);
  };
  
  const handleEditGroup = async () => {
    // Mock implementation for now
    console.log('Editing group:', selectedGroup?.id, groupName, groupDescription);
    setIsEditGroupOpen(false);
  };
  
  const handleDeleteGroup = async () => {
    // Mock implementation for now
    console.log('Deleting group:', selectedGroup?.id);
    setIsDeleteGroupOpen(false);
  };
  
  const handleAddSubgroup = async () => {
    // Mock implementation for now
    console.log('Adding subgroup:', subgroupName, subgroupDescription, 'to group', selectedGroup?.id);
    setIsAddSubgroupOpen(false);
  };
  
  const handleEditSubgroup = async () => {
    // Mock implementation for now
    console.log('Editing subgroup:', selectedSubgroup?.id, subgroupName, subgroupDescription);
    setIsEditSubgroupOpen(false);
  };
  
  const handleDeleteSubgroup = async () => {
    // Mock implementation for now
    console.log('Deleting subgroup:', selectedSubgroup?.id);
    setIsDeleteSubgroupOpen(false);
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

  // GroupsSection props adaptation
  const expandedGroups: number[] = [];
  const showSubgroupInput: number | null = null;
  const newSubgroupName = '';
  
  const onToggleGroupExpand = (groupId: number) => {
    // Mock implementation
    console.log('Toggle group expand:', groupId);
  };
  
  const onEditGroup = (group: ResidentGroup | null) => {
    if (group) {
      handleOpenEditGroup(group);
    } else {
      handleOpenAddGroup();
    }
  };
  
  const onDeleteGroup = (group: ResidentGroup) => {
    handleOpenDeleteGroup(group);
  };
  
  const onToggleSubgroupInput = (groupId: number) => {
    // Mock implementation
    console.log('Toggle subgroup input for group:', groupId);
  };
  
  const onNewSubgroupNameChange = (name: string) => {
    // Mock implementation
    console.log('New subgroup name:', name);
  };
  
  const onQuickAddSubgroup = () => {
    // Mock implementation
    console.log('Quick add subgroup');
  };
  
  const onEditSubgroup = (subgroup: ResidentSubgroup) => {
    handleOpenEditSubgroup(subgroup);
  };
  
  const onDeleteSubgroup = (subgroup: ResidentSubgroup) => {
    handleOpenDeleteSubgroup(subgroup);
  };
  
  const getResidentsByGroup = (groupId: number): Resident[] => {
    return residents.filter(r => r.group_id === groupId);
  };
  
  const getResidentsBySubgroup = (subgroupId: number): Resident[] => {
    return residents.filter(r => r.subgroup_id === subgroupId);
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
        residents={residents} 
        groups={groups}
        residentsByType={residentsByType}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <ResidentDisplay 
            residents={residents}
            onEditResident={handleEditResident}
            onDeleteResident={handleDeleteResident}
          />
        </div>
        
        <div>
          <GroupsSection 
            groups={groups}
            expandedGroups={expandedGroups}
            showSubgroupInput={showSubgroupInput}
            residents={residents}
            newSubgroupName={newSubgroupName}
            onToggleGroupExpand={onToggleGroupExpand}
            onEditGroup={onEditGroup}
            onDeleteGroup={onDeleteGroup}
            onToggleSubgroupInput={onToggleSubgroupInput}
            onNewSubgroupNameChange={onNewSubgroupNameChange}
            onQuickAddSubgroup={onQuickAddSubgroup}
            onEditSubgroup={onEditSubgroup}
            onDeleteSubgroup={onDeleteSubgroup}
            onEditResident={handleEditResident}
            onDeleteResident={handleDeleteResident}
            getResidentsByGroup={getResidentsByGroup}
            getResidentsBySubgroup={getResidentsBySubgroup}
          />
        </div>
      </div>
      
      {/* Dialogs */}
      <GroupDialogs 
        isAddOpen={isAddGroupOpen}
        isEditOpen={isEditGroupOpen}
        isDeleteOpen={isDeleteGroupOpen}
        isAddSubgroupOpen={isAddSubgroupOpen}
        isEditSubgroupOpen={isEditSubgroupOpen}
        isDeleteSubgroupOpen={isDeleteSubgroupOpen}
        groupName={groupName}
        groupDescription={groupDescription}
        subgroupName={subgroupName}
        subgroupDescription={subgroupDescription}
        selectedGroupName={selectedGroupName}
        selectedSubgroupName={selectedSubgroupName}
        onAddGroupClose={() => setIsAddGroupOpen(false)}
        onEditGroupClose={() => setIsEditGroupOpen(false)}
        onDeleteGroupClose={() => setIsDeleteGroupOpen(false)}
        onAddSubgroupClose={() => setIsAddSubgroupOpen(false)}
        onEditSubgroupClose={() => setIsEditSubgroupOpen(false)}
        onDeleteSubgroupClose={() => setIsDeleteSubgroupOpen(false)}
        onGroupNameChange={setGroupName}
        onGroupDescriptionChange={setGroupDescription}
        onSubgroupNameChange={setSubgroupName}
        onSubgroupDescriptionChange={setSubgroupDescription}
        onAddGroup={handleAddGroup}
        onEditGroup={handleEditGroup}
        onDeleteGroup={handleDeleteGroup}
        onAddSubgroup={handleAddSubgroup}
        onEditSubgroup={handleEditSubgroup}
        onDeleteSubgroup={handleDeleteSubgroup}
      />
      
      {selectedResident && (
        <>
          <EditResidentDialog 
            open={showEditResidentDialog}
            onOpenChange={setShowEditResidentDialog}
            resident={selectedResident}
            residentTypes={residentTypes}
            groups={groups}
            subgroups={subgroups}
            onSave={(updatedResident) => {
              console.log('Saving updated resident:', updatedResident);
              setShowEditResidentDialog(false);
            }}
          />
          
          <DeleteResidentDialog 
            open={showDeleteResidentDialog}
            onOpenChange={setShowDeleteResidentDialog}
            resident={selectedResident}
            onDelete={() => {
              console.log('Deleting resident:', selectedResident);
              setShowDeleteResidentDialog(false);
            }}
          />
        </>
      )}
    </div>
  );
}
