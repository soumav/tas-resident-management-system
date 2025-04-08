import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

import { DashboardHeader } from '@/components/Dashboard/DashboardHeader';
import { StatCards } from '@/components/Dashboard/StatCards';
import { GroupsSection } from '@/components/Dashboard/GroupsSection';
import { GroupDialogs } from '@/components/Dashboard/GroupDialogs';
import { EditResidentDialog } from '@/components/Dashboard/EditResidentDialog';
import { DeleteResidentDialog } from '@/components/Dashboard/DeleteResidentDialog';

import { Resident, ResidentGroup, ResidentSubgroup, ResidentType } from '@/lib/supabase';
import RLSDebugPanel from '@/components/Debug/RLSDebugPanel';

export default function Dashboard() {
  const { toast } = useToast();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [residentTypes, setResidentTypes] = useState<ResidentType[]>([]);
  const [groups, setGroups] = useState<ResidentGroup[]>([]);
  const [subgroups, setSubgroups] = useState<ResidentSubgroup[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<number[]>([]);
  const [showSubgroupInput, setShowSubgroupInput] = useState<number | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newSubgroupName, setNewSubgroupName] = useState('');
  const [newSubgroupDescription, setNewSubgroupDescription] = useState('');
  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false);
  const [isEditGroupDialogOpen, setIsEditGroupDialogOpen] = useState(false);
  const [isEditSubgroupDialogOpen, setIsEditSubgroupDialogOpen] = useState(false);
  const [isEditResidentDialogOpen, setIsEditResidentDialogOpen] = useState(false);
  const [isDeleteResidentDialogOpen, setIsDeleteResidentDialogOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<ResidentGroup | null>(null);
  const [selectedSubgroup, setSelectedSubgroup] = useState<ResidentSubgroup | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRLSDebugPanel, setShowRLSDebugPanel] = useState(false);
  
  const fetchResidents = async () => {
    try {
      setLoading(true);
      const { data: residentsData, error: residentsError } = await supabase
        .from('residents')
        .select(`
          *,
          type:resident_types (
            name,
            category:resident_categories (
              name
            )
          ),
          group:resident_groups (
            name,
            description
          ),
          subgroup:resident_subgroups (
            name,
            description
          )
        `);
      if (residentsError) throw residentsError;
      setResidents(residentsData || []);
      setError(null);
    } catch (error: any) {
      console.error("Error fetching residents:", error);
      setError(error);
      toast({
        title: "Error",
        description: "Failed to load residents",
        variant: "destructive"
      });
    }
  };
  
  const fetchResidentTypes = async () => {
    try {
      const { data: typesData, error: typesError } = await supabase
        .from('resident_types')
        .select('*');
      if (typesError) throw typesError;
      setResidentTypes(typesData || []);
      setError(null);
    } catch (error: any) {
      console.error("Error fetching resident types:", error);
      setError(error);
      toast({
        title: "Error",
        description: "Failed to load resident types",
        variant: "destructive"
      });
    }
  };
  
  const fetchGroups = async () => {
    try {
      const { data: groupsData, error: groupsError } = await supabase
        .from('resident_groups')
        .select(`
          *,
          subgroups:resident_subgroups (*)
        `);
      if (groupsError) throw groupsError;
      setGroups(groupsData || []);
      setError(null);
    } catch (error: any) {
      console.error("Error fetching groups:", error);
      setError(error);
      toast({
        title: "Error",
        description: "Failed to load resident groups",
        variant: "destructive"
      });
    }
  };
  
  const fetchSubgroups = async () => {
    try {
      const { data: subgroupsData, error: subgroupsError } = await supabase
        .from('resident_subgroups')
        .select('*');
      if (subgroupsError) throw subgroupsError;
      setSubgroups(subgroupsData || []);
      setError(null);
    } catch (error: any) {
      console.error("Error fetching subgroups:", error);
      setError(error);
      toast({
        title: "Error",
        description: "Failed to load resident subgroups",
        variant: "destructive"
      });
    }
  };
  
  useEffect(() => {
    Promise.all([fetchResidents(), fetchResidentTypes(), fetchGroups(), fetchSubgroups()])
      .then(() => setLoading(false));
  }, []);
  
  const handleToggleGroupExpand = (groupId: number) => {
    setExpandedGroups(prev =>
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  };
  
  const openAddGroupDialog = () => {
    setNewGroupName('');
    setNewGroupDescription('');
    setIsAddGroupDialogOpen(true);
  };
  
  const openEditGroupDialog = (group: ResidentGroup) => {
    setSelectedGroup(group);
    setNewGroupName(group.name);
    setNewGroupDescription(group.description || '');
    setIsEditGroupDialogOpen(true);
  };
  
  const handleAddGroup = async () => {
    try {
      const { data, error } = await supabase
        .from('resident_groups')
        .insert([{ name: newGroupName, description: newGroupDescription }]);
      if (error) throw error;
      
      fetchGroups();
      setIsAddGroupDialogOpen(false);
      toast({
        title: "Success",
        description: "Resident group added successfully",
      });
    } catch (error: any) {
      console.error("Error adding group:", error);
      setError(error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const handleEditGroup = async () => {
    if (!selectedGroup) return;
    try {
      const { data, error } = await supabase
        .from('resident_groups')
        .update({ name: newGroupName, description: newGroupDescription })
        .eq('id', selectedGroup.id);
      if (error) throw error;
      
      fetchGroups();
      setIsEditGroupDialogOpen(false);
      toast({
        title: "Success",
        description: "Resident group updated successfully",
      });
    } catch (error: any) {
      console.error("Error editing group:", error);
      setError(error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteGroup = async (group: ResidentGroup) => {
    try {
      const { error } = await supabase
        .from('resident_groups')
        .delete()
        .eq('id', group.id);
      if (error) throw error;
      
      fetchGroups();
      toast({
        title: "Success",
        description: "Resident group deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting group:", error);
      setError(error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const handleToggleSubgroupInput = (groupId: number) => {
    setShowSubgroupInput(prev => (prev === groupId ? null : groupId));
    setNewSubgroupName('');
  };
  
  const handleAddSubgroup = async () => {
    if (!showSubgroupInput) return;
    try {
      const { data, error } = await supabase
        .from('resident_subgroups')
        .insert([{ 
          name: newSubgroupName, 
          description: newSubgroupDescription,
          group_id: showSubgroupInput 
        }]);
      if (error) throw error;
      
      fetchGroups();
      fetchSubgroups();
      setShowSubgroupInput(null);
      setNewSubgroupName('');
      toast({
        title: "Success",
        description: "Resident subgroup added successfully",
      });
    } catch (error: any) {
      console.error("Error adding subgroup:", error);
      setError(error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const handleEditSubgroup = async (subgroup: ResidentSubgroup) => {
    setSelectedSubgroup(subgroup);
    setNewSubgroupName(subgroup.name);
    setNewSubgroupDescription(subgroup.description || '');
    setIsEditSubgroupDialogOpen(true);
  };
  
  const handleEditSubgroupSave = async () => {
    if (!selectedSubgroup) return;
    try {
      const { data, error } = await supabase
        .from('resident_subgroups')
        .update({ 
          name: newSubgroupName, 
          description: newSubgroupDescription 
        })
        .eq('id', selectedSubgroup.id);
      if (error) throw error;
      
      fetchGroups();
      fetchSubgroups();
      setIsEditSubgroupDialogOpen(false);
      toast({
        title: "Success",
        description: "Resident subgroup updated successfully",
      });
    } catch (error: any) {
      console.error("Error editing subgroup:", error);
      setError(error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteSubgroup = async (subgroup: ResidentSubgroup) => {
    try {
      const { error } = await supabase
        .from('resident_subgroups')
        .delete()
        .eq('id', subgroup.id);
      if (error) throw error;
      
      fetchGroups();
      fetchSubgroups();
      toast({
        title: "Success",
        description: "Resident subgroup deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting subgroup:", error);
      setError(error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const handleEditResident = async (resident: Resident) => {
    setSelectedResident(resident);
    setIsEditResidentDialogOpen(true);
  };
  
  const handleSaveResident = async (residentData: Resident) => {
    if (!selectedResident) return;
    try {
      const { error } = await supabase
        .from('residents')
        .update({
          name: residentData.name,
          type_id: residentData.type_id,
          group_id: residentData.group_id,
          subgroup_id: residentData.subgroup_id,
          arrival_date: residentData.arrival_date,
          description: residentData.description,
          image_url: residentData.image_url,
          year_arrived: residentData.year_arrived
        })
        .eq('id', selectedResident.id);
      if (error) throw error;
      
      fetchResidents();
      setIsEditResidentDialogOpen(false);
      toast({
        title: "Success",
        description: "Resident updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating resident:", error);
      setError(error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteResident = async (resident: Resident) => {
    setSelectedResident(resident);
    setIsDeleteResidentDialogOpen(true);
  };
  
  const handleConfirmDeleteResident = async () => {
    if (!selectedResident) return;
    try {
      const { error } = await supabase
        .from('residents')
        .delete()
        .eq('id', selectedResident.id);
      if (error) throw error;
      
      fetchResidents();
      setIsDeleteResidentDialogOpen(false);
      toast({
        title: "Success",
        description: "Resident deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting resident:", error);
      setError(error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const getResidentsByGroup = (groupId: number) => {
    return residents.filter(resident => resident.group_id === groupId && !resident.subgroup_id);
  };
  
  const getResidentsBySubgroup = (subgroupId: number) => {
    return residents.filter(resident => resident.subgroup_id === subgroupId);
  };
  
  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Sanctuary Dashboard"
        description="Overview and management of sanctuary residents, groups, and resources."
      />
      
      <StatCards residents={residents} />
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>{error.toString()}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowRLSDebugPanel(true)}
            >
              Debug Permission Issues
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {showRLSDebugPanel && (
        <RLSDebugPanel onComplete={() => setShowRLSDebugPanel(false)} />
      )}

      {/* Rest of your dashboard components */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Resident Groups</h2>
        <Button 
          className="flex items-center gap-2 bg-sanctuary-green hover:bg-sanctuary-light-green"
          onClick={openAddGroupDialog}
        >
          <Plus className="h-4 w-4" />
          <span>Add Group</span>
        </Button>
      </div>
      
      <GroupsSection
        groups={groups}
        expandedGroups={expandedGroups}
        showSubgroupInput={showSubgroupInput}
        residents={residents}
        newSubgroupName={newSubgroupName}
        onToggleGroupExpand={handleToggleGroupExpand}
        onEditGroup={openEditGroupDialog}
        onDeleteGroup={handleDeleteGroup}
        onToggleSubgroupInput={handleToggleSubgroupInput}
        onNewSubgroupNameChange={setNewSubgroupName}
        onQuickAddSubgroup={handleAddSubgroup}
        onEditSubgroup={handleEditSubgroup}
        onDeleteSubgroup={handleDeleteSubgroup}
        onEditResident={handleEditResident}
        onDeleteResident={handleDeleteResident}
        getResidentsByGroup={getResidentsByGroup}
        getResidentsBySubgroup={getResidentsBySubgroup}
      />
      
      <GroupDialogs
        isAddGroupDialogOpen={isAddGroupDialogOpen}
        isEditGroupDialogOpen={isEditGroupDialogOpen}
        isEditSubgroupDialogOpen={isEditSubgroupDialogOpen}
        newGroupName={newGroupName}
        newGroupDescription={newGroupDescription}
        newSubgroupName={newSubgroupName}
        newSubgroupDescription={newSubgroupDescription}
        onNewGroupNameChange={setNewGroupName}
        onNewGroupDescriptionChange={setNewGroupDescription}
        onNewSubgroupNameChange={setNewSubgroupName}
        onNewSubgroupDescriptionChange={setNewSubgroupDescription}
        onAddGroup={handleAddGroup}
        onEditGroup={handleEditGroup}
        onEditSubgroup={handleEditSubgroupSave}
        onOpenChange={setIsAddGroupDialogOpen}
        onEditOpenChange={setIsEditGroupDialogOpen}
        onEditSubgroupOpenChange={setIsEditSubgroupDialogOpen}
      />
      
      <EditResidentDialog 
        isOpen={isEditResidentDialogOpen}
        onOpenChange={setIsEditResidentDialogOpen}
        resident={selectedResident}
        onSave={handleSaveResident}
        residentTypes={residentTypes}
        groups={groups}
        subgroups={subgroups}
      />
      
      <DeleteResidentDialog 
        isOpen={isDeleteResidentDialogOpen}
        onOpenChange={setIsDeleteResidentDialogOpen}
        resident={selectedResident}
        onDelete={handleConfirmDeleteResident}
      />
    </div>
  );
}
