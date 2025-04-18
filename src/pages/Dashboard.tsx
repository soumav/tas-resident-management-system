
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { supabase, ResidentGroup, ResidentSubgroup, Resident, bypassRLS } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

// Component imports
import { DashboardHeader } from '@/components/Dashboard/DashboardHeader';
import { StatCards } from '@/components/Dashboard/StatCards';
import { GroupsSection } from '@/components/Dashboard/GroupsSection';
import { EditResidentDialog } from '@/components/Dashboard/EditResidentDialog';
import { DeleteResidentDialog } from '@/components/Dashboard/DeleteResidentDialog';
import { GroupDialogs } from '@/components/Dashboard/GroupDialogs';

export default function Dashboard() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<ResidentGroup[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<number[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [residentsByType, setResidentsByType] = useState<Record<string, number>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataFetched, setIsDataFetched] = useState(false);
  
  const { toast } = useToast();
  
  // Dialog state
  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false);
  const [isEditGroupDialogOpen, setIsEditGroupDialogOpen] = useState(false);
  const [isDeleteGroupDialogOpen, setIsDeleteGroupDialogOpen] = useState(false);
  const [isAddSubgroupDialogOpen, setIsAddSubgroupDialogOpen] = useState(false);
  const [showSubgroupInput, setShowSubgroupInput] = useState<number | null>(null);
  const [isEditSubgroupDialogOpen, setIsEditSubgroupDialogOpen] = useState(false);
  const [isDeleteSubgroupDialogOpen, setIsDeleteSubgroupDialogOpen] = useState(false);
  
  // Form state
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<ResidentGroup | null>(null);
  const [newSubgroupName, setNewSubgroupName] = useState('');
  const [newSubgroupDescription, setNewSubgroupDescription] = useState('');
  const [selectedSubgroupId, setSelectedSubgroupId] = useState<number | null>(null);
  const [selectedSubgroup, setSelectedSubgroup] = useState<ResidentSubgroup | null>(null);
  
  // Resident state
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [isDeleteResidentDialogOpen, setIsDeleteResidentDialogOpen] = useState(false);
  const [isEditResidentDialogOpen, setIsEditResidentDialogOpen] = useState(false);
  const [editResidentData, setEditResidentData] = useState({
    name: '',
    description: '',
    image_url: '',
    arrival_date: null as Date | null,
    group_id: null as number | null,
    subgroup_id: null as number | null
  });

  // This useEffect will run whenever the Dashboard component mounts
  useEffect(() => {
    console.log('Dashboard mounted/revisited - fetching fresh data');
    setIsLoading(true);
    
    // Fetch data in sequence to ensure we have all the data we need
    const fetchData = async () => {
      try {
        await fetchGroups();
        await fetchResidents();
        setIsDataFetched(true);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data. Please try refreshing the page.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // We don't need a cleanup function since we're not subscribing to anything
  }, []);

  // Calculate resident types whenever residents change
  useEffect(() => {
    if (residents.length) {
      const typeCount: Record<string, number> = {};
      residents.forEach(resident => {
        const typeName = resident.type?.name || 'Unknown';
        typeCount[typeName] = (typeCount[typeName] || 0) + 1;
      });
      setResidentsByType(typeCount);
    } else {
      // If there are no residents, make sure residentsByType is empty
      setResidentsByType({});
    }
  }, [residents]);

  const fetchGroups = async () => {
    try {
      console.log('Fetching groups with admin privileges...');
      
      const { data: groupsData, error: groupsError } = await bypassRLS(
        () => supabase.from('resident_groups').select('*').order('name'),
        [],
        'fetch_groups'
      );
      
      if (groupsError) {
        console.error('Error fetching groups:', groupsError);
        throw groupsError;
      }
      
      console.log('Groups fetched successfully, raw data:', groupsData);
      
      const { data: subgroupsData, error: subgroupsError } = await bypassRLS(
        () => supabase.from('resident_subgroups').select('*').order('name'),
        [],
        'fetch_subgroups'
      );
      
      if (subgroupsError) {
        console.error('Error fetching subgroups:', subgroupsError);
        throw subgroupsError;
      }
      
      console.log('Subgroups fetched successfully, raw data:', subgroupsData);
      
      const groupsWithSubgroups = (groupsData || []).map((group: ResidentGroup) => {
        const groupSubgroups = (subgroupsData || []).filter((subgroup: ResidentSubgroup) => subgroup.group_id === group.id);
        return {
          ...group,
          subgroups: groupSubgroups
        };
      });
      
      setGroups(groupsWithSubgroups);
      console.log('Groups with subgroups:', groupsWithSubgroups);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load groups',
        variant: 'destructive'
      });
    }
  };

  const fetchResidents = async () => {
    try {
      console.log('Fetching residents with admin privileges...');
      const { data, error } = await bypassRLS(
        () => supabase.from('residents').select(`
            *,
            type:resident_types(
              name,
              category:resident_categories(name)
            ),
            group:resident_groups(name, description),
            subgroup:resident_subgroups(name, description, group:resident_groups(name))
          `).order('name'),
        [],
        'fetch_residents'
      );
      
      if (error) {
        console.error('Error in fetchResidents:', error);
        throw error;
      }
      
      console.log('Fetched residents:', data);
      setResidents(data || []);
    } catch (error) {
      console.error('Error fetching residents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load residents',
        variant: 'destructive'
      });
    }
  };

  const toggleGroupExpand = (groupId: number) => {
    setExpandedGroups(prev => {
      if (prev.includes(groupId)) {
        return prev.filter(id => id !== groupId);
      } else {
        return [...prev, groupId];
      }
    });
  };

  const getResidentsByGroup = (groupId: number) => {
    return residents.filter(resident => resident.group_id === groupId && !resident.subgroup_id);
  };

  const getResidentsBySubgroup = (subgroupId: number) => {
    return residents.filter(resident => resident.subgroup_id === subgroupId);
  };

  const handleEditResident = (resident: Resident) => {
    openEditResidentDialog(resident);
  };

  const openEditResidentDialog = (resident: Resident) => {
    setSelectedResident(resident);
    setEditResidentData({
      name: resident.name,
      description: resident.description || '',
      image_url: resident.image_url || '',
      arrival_date: resident.arrival_date ? new Date(resident.arrival_date) : null,
      group_id: resident.group_id,
      subgroup_id: resident.subgroup_id
    });
    setPreviewUrl(resident.image_url || null);
    setIsEditResidentDialogOpen(true);
  };

  const handleEditResidentSubmit = async () => {
    if (!selectedResident) return;
    
    setIsLoading(true);
    
    try {
      let updatedImageUrl = editResidentData.image_url;
      
      if (selectedFile) {
        try {
          const { data: buckets } = await supabase.storage.listBuckets();
          const bucketExists = buckets?.some(bucket => bucket.name === 'resident-images');
          
          if (!bucketExists) {
            console.log('Bucket does not exist. Creating...');
            const { error: createError } = await supabase.storage.createBucket('resident-images', {
              public: true
            });
            
            if (createError) {
              console.error('Error creating bucket:', createError);
              throw createError;
            }
            console.log('Bucket created successfully');
          }
          
          const fileExt = selectedFile.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('resident-images')
            .upload(filePath, selectedFile);
            
          if (uploadError) throw uploadError;
          
          const { data: publicUrlData } = supabase.storage
            .from('resident-images')
            .getPublicUrl(filePath);
            
          updatedImageUrl = publicUrlData.publicUrl;
          console.log('File uploaded successfully:', updatedImageUrl);
          
        } catch (uploadError: any) {
          console.error('Upload error:', uploadError);
          toast({
            title: 'Upload Failed',
            description: 'Failed to upload image. Please try again.',
            variant: 'destructive',
          });
        }
      }
      
      const residentData = {
        name: editResidentData.name,
        description: editResidentData.description,
        image_url: updatedImageUrl,
        arrival_date: editResidentData.arrival_date ? editResidentData.arrival_date.toISOString() : null,
        group_id: editResidentData.group_id,
        subgroup_id: editResidentData.subgroup_id
      };

      console.log('Updating resident with admin privileges:', selectedResident.id);
      const { error: updateError, data: updatedResident } = await bypassRLS(
        () => supabase
          .from('residents')
          .update(residentData)
          .eq('id', selectedResident.id)
          .select(),
        null,
        'update_resident'
      );
      
      if (updateError) {
        console.error('Error updating resident in database:', updateError);
        throw updateError;
      }
      
      console.log('Database update successful:', updatedResident);
      
      await fetchResidents();
      
      toast({
        title: 'Resident updated',
        description: `${editResidentData.name} has been updated successfully`
      });
      
      setIsEditResidentDialogOpen(false);
      resetFileInput();
      
    } catch (error: any) {
      console.error('Error updating resident:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update resident',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteResidentDialog = (resident: Resident) => {
    setSelectedResident(resident);
    setIsDeleteResidentDialogOpen(true);
  };

  const handleDeleteResident = async () => {
    if (!selectedResident) return;
    
    try {
      console.log('Deleting resident with admin privileges:', selectedResident.id);
      const { error } = await bypassRLS(
        () => supabase
          .from('residents')
          .delete()
          .eq('id', selectedResident.id),
        null,
        'delete_resident'
      );
      
      if (error) throw error;
      
      toast({
        title: 'Resident deleted',
        description: `${selectedResident.name} has been removed from the system`
      });
      
      fetchResidents();
      setIsDeleteResidentDialogOpen(false);
      
    } catch (error: any) {
      console.error('Error deleting resident:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete resident',
        variant: 'destructive'
      });
    }
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

  const openDeleteGroupDialog = (group: ResidentGroup) => {
    setSelectedGroup(group);
    setIsDeleteGroupDialogOpen(true);
  };

  const toggleSubgroupInput = (groupId: number) => {
    if (showSubgroupInput === groupId) {
      setShowSubgroupInput(null);
    } else {
      setShowSubgroupInput(groupId);
      setNewSubgroupName('');
    }
  };

  const openAddSubgroupDialog = (groupId: number) => {
    setSelectedGroupId(groupId);
    setNewSubgroupName('');
    setNewSubgroupDescription('');
    setIsAddSubgroupDialogOpen(true);
  };

  const openEditSubgroupDialog = (subgroup: ResidentSubgroup) => {
    setSelectedSubgroup(subgroup);
    setNewSubgroupName(subgroup.name);
    setNewSubgroupDescription(subgroup.description || '');
    setIsEditSubgroupDialogOpen(true);
  };

  const openDeleteSubgroupDialog = (subgroup: ResidentSubgroup) => {
    setSelectedSubgroup(subgroup);
    setIsDeleteSubgroupDialogOpen(true);
  };

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      console.log('Adding new group with admin privileges:', newGroupName);
      const { data, error } = await bypassRLS(
        () => supabase.from('resident_groups').insert({
          name: newGroupName.trim(),
          description: newGroupDescription.trim() || null
        }).select(),
        null,
        'add_group'
      );
      
      if (error) {
        console.error('Error adding group:', error);
        throw error;
      }
      
      setGroups(prev => [...prev, {
        ...data[0],
        subgroups: []
      }]);
      
      setIsAddGroupDialogOpen(false);
      toast({
        title: 'Success',
        description: `Group "${newGroupName}" has been added`
      });
    } catch (error) {
      console.error('Error adding group:', error);
      toast({
        title: 'Error',
        description: 'Failed to add group',
        variant: 'destructive'
      });
    }
  };

  const handleEditGroup = async () => {
    if (!selectedGroup || !newGroupName.trim()) return;
    try {
      console.log('Editing group with admin privileges:', selectedGroup.id);
      const { error } = await bypassRLS(
        () => supabase.from('resident_groups').update({
          name: newGroupName.trim(),
          description: newGroupDescription.trim() || null
        }).eq('id', selectedGroup.id),
        null,
        'edit_group'
      );
      
      if (error) throw error;
      
      setGroups(prev => prev.map(group => {
        if (group.id === selectedGroup.id) {
          return {
            ...group,
            name: newGroupName.trim(),
            description: newGroupDescription.trim() || null
          };
        }
        return group;
      }));
      
      setIsEditGroupDialogOpen(false);
      toast({
        title: 'Success',
        description: `Group "${selectedGroup.name}" has been updated`
      });
    } catch (error) {
      console.error('Error editing group:', error);
      toast({
        title: 'Error',
        description: 'Failed to update group',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;
    try {
      console.log('Checking for residents in group with admin privileges:', selectedGroup.id);
      const result = await bypassRLS(
        () => supabase
          .from('residents')
          .select('*', {
            count: 'exact',
            head: true
          }).eq('group_id', selectedGroup.id),
        { count: 0 } as unknown as { count: number },
        'check_residents_in_group'
      );
      
      const residentCount = result.data?.count || 0;
      if (residentCount > 0) {
        toast({
          title: 'Error',
          description: `Cannot delete group "${selectedGroup.name}" because it has residents assigned to it.`,
          variant: 'destructive'
        });
        setIsDeleteGroupDialogOpen(false);
        return;
      }
      
      console.log('Deleting subgroups with admin privileges:', selectedGroup.id);
      const { error: subgroupError } = await bypassRLS(
        () => supabase
          .from('resident_subgroups')
          .delete()
          .eq('group_id', selectedGroup.id),
        null,
        'delete_subgroups'
      );
      
      if (subgroupError) throw subgroupError;
      
      console.log('Deleting group with admin privileges:', selectedGroup.id);
      const { error: groupError } = await bypassRLS(
        () => supabase
          .from('resident_groups')
          .delete()
          .eq('id', selectedGroup.id),
        null,
        'delete_group'
      );
      
      if (groupError) throw groupError;
      
      setGroups(prev => prev.filter(group => group.id !== selectedGroup.id));
      setIsDeleteGroupDialogOpen(false);
      toast({
        title: 'Success',
        description: `Group "${selectedGroup.name}" and its subgroups have been deleted`
      });
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete group',
        variant: 'destructive'
      });
    }
  };

  const handleAddSubgroup = async () => {
    if (!selectedGroupId || !newSubgroupName.trim()) return;
    try {
      console.log('Adding new subgroup with admin privileges:', newSubgroupName);
      const { data, error } = await bypassRLS(
        () => supabase.from('resident_subgroups').insert({
          name: newSubgroupName.trim(),
          description: newSubgroupDescription.trim() || null,
          group_id: selectedGroupId
        }).select(),
        null,
        'add_subgroup'
      );
      
      if (error) throw error;
      
      setGroups(prev => prev.map(group => {
        if (group.id === selectedGroupId) {
          return {
            ...group,
            subgroups: [...(group.subgroups || []), data[0]]
          };
        }
        return group;
      }));
      
      setIsAddSubgroupDialogOpen(false);
      setShowSubgroupInput(null);
      toast({
        title: 'Success',
        description: `Subgroup "${newSubgroupName}" has been added`
      });
    } catch (error) {
      console.error('Error adding subgroup:', error);
      toast({
        title: 'Error',
        description: 'Failed to add subgroup',
        variant: 'destructive'
      });
    }
  };

  const handleQuickAddSubgroup = async () => {
    if (!showSubgroupInput || !newSubgroupName.trim()) return;
    try {
      console.log('Adding quick subgroup with admin privileges:', newSubgroupName);
      const { data, error } = await bypassRLS(
        () => supabase.from('resident_subgroups').insert({
          name: newSubgroupName.trim(),
          group_id: showSubgroupInput
        }).select(),
        null,
        'quick_add_subgroup'
      );
      
      if (error) throw error;
      
      setGroups(prev => prev.map(group => {
        if (group.id === showSubgroupInput) {
          return {
            ...group,
            subgroups: [...(group.subgroups || []), data[0]]
          };
        }
        return group;
      }));
      
      setShowSubgroupInput(null);
      setNewSubgroupName('');
      toast({
        title: 'Success',
        description: `Subgroup "${newSubgroupName}" has been added`
      });
    } catch (error) {
      console.error('Error adding subgroup:', error);
      toast({
        title: 'Error',
        description: 'Failed to add subgroup',
        variant: 'destructive'
      });
    }
  };

  const handleEditSubgroup = async () => {
    if (!selectedSubgroup || !newSubgroupName.trim()) return;
    try {
      console.log('Editing subgroup with admin privileges:', selectedSubgroup.id);
      const { error } = await bypassRLS(
        () => supabase.from('resident_subgroups').update({
          name: newSubgroupName.trim(),
          description: newSubgroupDescription.trim() || null
        }).eq('id', selectedSubgroup.id),
        null,
        'edit_subgroup'
      );
      
      if (error) throw error;
      
      setGroups(prev => prev.map(group => {
        if (group.subgroups?.some(subgroup => subgroup.id === selectedSubgroup.id)) {
          return {
            ...group,
            subgroups: group.subgroups?.map(subgroup => {
              if (subgroup.id === selectedSubgroup.id) {
                return {
                  ...subgroup,
                  name: newSubgroupName.trim(),
                  description: newSubgroupDescription.trim() || null
                };
              }
              return subgroup;
            })
          };
        }
        return group;
      }));
      
      setIsEditSubgroupDialogOpen(false);
      toast({
        title: 'Success',
        description: `Subgroup "${selectedSubgroup.name}" has been updated`
      });
    } catch (error) {
      console.error('Error editing subgroup:', error);
      toast({
        title: 'Error',
        description: 'Failed to update subgroup',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteSubgroup = async () => {
    if (!selectedSubgroup) return;
    try {
      console.log('Checking residents in subgroup with admin privileges:', selectedSubgroup.id);
      const result = await bypassRLS(
        () => supabase
          .from('residents')
          .select('*', {
            count: 'exact',
            head: true
          }).eq('subgroup_id', selectedSubgroup.id),
        { count: 0 } as unknown as { count: number },
        'check_residents_in_subgroup'
      );
      
      const residentCount = result.data?.count || 0;
      if (residentCount > 0) {
        toast({
          title: 'Error',
          description: `Cannot delete subgroup "${selectedSubgroup.name}" because it has residents assigned to it.`,
          variant: 'destructive'
        });
        setIsDeleteSubgroupDialogOpen(false);
        return;
      }
      
      console.log('Deleting subgroup with admin privileges:', selectedSubgroup.id);
      const { error } = await bypassRLS(
        () => supabase
          .from('resident_subgroups')
          .delete()
          .eq('id', selectedSubgroup.id),
        null,
        'delete_subgroup'
      );
      
      if (error) throw error;
      
      setGroups(prev => prev.map(group => {
        if (group.subgroups?.some(subgroup => subgroup.id === selectedSubgroup.id)) {
          return {
            ...group,
            subgroups: group.subgroups?.filter(subgroup => subgroup.id !== selectedSubgroup.id)
          };
        }
        return group;
      }));
      
      setIsDeleteSubgroupDialogOpen(false);
      toast({
        title: 'Success',
        description: `Subgroup "${selectedSubgroup.name}" has been deleted`
      });
    } catch (error) {
      console.error('Error deleting subgroup:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete subgroup',
        variant: 'destructive'
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  const resetFileInput = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const username = user?.email?.split('@')[0] || "User";

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-sanctuary-green mb-4" />
        <p className="text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader username={username} />
      
      <StatCards 
        residents={residents} 
        groups={groups} 
        residentsByType={residentsByType} 
      />
      
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Resident Groups</h3>
        <Button 
          className="flex items-center gap-2 bg-sanctuary-green hover:bg-sanctuary-light-green" 
          onClick={openAddGroupDialog}
        >
          <Plus className="h-4 w-4" />
          <span>Add New Group</span>
        </Button>
      </div>
      
      {isDataFetched && (
        <GroupsSection 
          groups={groups}
          expandedGroups={expandedGroups}
          showSubgroupInput={showSubgroupInput}
          residents={residents}
          newSubgroupName={newSubgroupName}
          onToggleGroupExpand={toggleGroupExpand}
          onEditGroup={openEditGroupDialog}
          onDeleteGroup={openDeleteGroupDialog}
          onToggleSubgroupInput={toggleSubgroupInput}
          onNewSubgroupNameChange={setNewSubgroupName}
          onQuickAddSubgroup={handleQuickAddSubgroup}
          onEditSubgroup={openEditSubgroupDialog}
          onDeleteSubgroup={openDeleteSubgroupDialog}
          onEditResident={handleEditResident}
          onDeleteResident={openDeleteResidentDialog}
          getResidentsByGroup={getResidentsByGroup}
          getResidentsBySubgroup={getResidentsBySubgroup}
        />
      )}

      <EditResidentDialog 
        open={isEditResidentDialogOpen}
        groups={groups}
        isLoading={isLoading}
        formData={editResidentData}
        previewUrl={previewUrl}
        selectedFile={selectedFile}
        onClose={() => setIsEditResidentDialogOpen(false)}
        onSubmit={handleEditResidentSubmit}
        onFormChange={(data) => setEditResidentData({...editResidentData, ...data})}
        onFileChange={handleFileChange}
        resetFileInput={resetFileInput}
      />
      
      <DeleteResidentDialog 
        open={isDeleteResidentDialogOpen}
        residentName={selectedResident?.name || ''}
        onClose={() => setIsDeleteResidentDialogOpen(false)}
        onDelete={handleDeleteResident}
      />
      
      <GroupDialogs 
        isAddOpen={isAddGroupDialogOpen}
        isEditOpen={isEditGroupDialogOpen}
        isDeleteOpen={isDeleteGroupDialogOpen}
        isAddSubgroupOpen={isAddSubgroupDialogOpen}
        isEditSubgroupOpen={isEditSubgroupDialogOpen}
        isDeleteSubgroupOpen={isDeleteSubgroupDialogOpen}
        groupName={newGroupName}
        groupDescription={newGroupDescription}
        subgroupName={newSubgroupName}
        subgroupDescription={newSubgroupDescription}
        selectedGroupName={selectedGroup?.name || ''}
        selectedSubgroupName={selectedSubgroup?.name || ''}
        onAddGroupClose={() => setIsAddGroupDialogOpen(false)}
        onEditGroupClose={() => setIsEditGroupDialogOpen(false)}
        onDeleteGroupClose={() => setIsDeleteGroupDialogOpen(false)}
        onAddSubgroupClose={() => setIsAddSubgroupDialogOpen(false)}
        onEditSubgroupClose={() => setIsEditSubgroupDialogOpen(false)}
        onDeleteSubgroupClose={() => setIsDeleteSubgroupDialogOpen(false)}
        onGroupNameChange={setNewGroupName}
        onGroupDescriptionChange={setNewGroupDescription}
        onSubgroupNameChange={setNewSubgroupName}
        onSubgroupDescriptionChange={setNewSubgroupDescription}
        onAddGroup={handleAddGroup}
        onEditGroup={handleEditGroup}
        onDeleteGroup={handleDeleteGroup}
        onAddSubgroup={handleAddSubgroup}
        onEditSubgroup={handleEditSubgroup}
        onDeleteSubgroup={handleDeleteSubgroup}
      />
    </div>
  );
}
