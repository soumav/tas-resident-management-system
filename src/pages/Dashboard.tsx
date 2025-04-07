
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { 
  Plus, ChevronDown, ChevronUp, Edit, Trash2, ListIcon, 
  Users, Rabbit, CalendarIcon, Upload 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, ResidentGroup, ResidentSubgroup, Resident } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { 
  Dialog, DialogContent, DialogFooter, DialogHeader, 
  DialogTitle, DialogDescription 
} from '@/components/ui/dialog';
import { 
  Collapsible, CollapsibleContent, CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Dashboard() {
  const {
    user
  } = useAuth();
  const [groups, setGroups] = useState<ResidentGroup[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<number[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [residentsByType, setResidentsByType] = useState<Record<string, number>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  
  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false);
  const [isEditGroupDialogOpen, setIsEditGroupDialogOpen] = useState(false);
  const [isDeleteGroupDialogOpen, setIsDeleteGroupDialogOpen] = useState(false);
  const [isAddSubgroupDialogOpen, setIsAddSubgroupDialogOpen] = useState(false);
  const [showSubgroupInput, setShowSubgroupInput] = useState<number | null>(null);
  const [isEditSubgroupDialogOpen, setIsEditSubgroupDialogOpen] = useState(false);
  const [isDeleteSubgroupDialogOpen, setIsDeleteSubgroupDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<ResidentGroup | null>(null);
  const [newSubgroupName, setNewSubgroupName] = useState('');
  const [newSubgroupDescription, setNewSubgroupDescription] = useState('');
  const [selectedSubgroupId, setSelectedSubgroupId] = useState<number | null>(null);
  const [selectedSubgroup, setSelectedSubgroup] = useState<ResidentSubgroup | null>(null);
  
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

  useEffect(() => {
    fetchGroups();
    fetchResidents();
  }, []);

  useEffect(() => {
    if (residents.length) {
      const typeCount: Record<string, number> = {};
      residents.forEach(resident => {
        const typeName = resident.type?.name || 'Unknown';
        typeCount[typeName] = (typeCount[typeName] || 0) + 1;
      });
      setResidentsByType(typeCount);
    }
  }, [residents]);

  const fetchGroups = async () => {
    try {
      const {
        data: groupsData,
        error: groupsError
      } = await supabase.from('resident_groups').select('*').order('name');
      if (groupsError) throw groupsError;
      const {
        data: subgroupsData,
        error: subgroupsError
      } = await supabase.from('resident_subgroups').select('*').order('name');
      if (subgroupsError) throw subgroupsError;
      const groupsWithSubgroups = (groupsData || []).map((group: ResidentGroup) => {
        const groupSubgroups = (subgroupsData || []).filter((subgroup: ResidentSubgroup) => subgroup.group_id === group.id);
        return {
          ...group,
          subgroups: groupSubgroups
        };
      });
      setGroups(groupsWithSubgroups);
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
      const {
        data,
        error
      } = await supabase.from('residents').select(`
          *,
          type:resident_types(
            name,
            category:resident_categories(name)
          ),
          group:resident_groups(name, description),
          subgroup:resident_subgroups(name, description, group:resident_groups(name))
        `).order('name');
      if (error) throw error;
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
      
      // Update the resident record with new data including group_id and subgroup_id
      const updateData = {
        name: editResidentData.name,
        description: editResidentData.description,
        image_url: updatedImageUrl,
        arrival_date: editResidentData.arrival_date ? editResidentData.arrival_date.toISOString() : null,
        group_id: editResidentData.group_id,
        subgroup_id: editResidentData.subgroup_id
      };

      console.log('Updating resident with data:', updateData);
      
      const { error, data } = await supabase
        .from('residents')
        .update(updateData)
        .eq('id', selectedResident.id)
        .select(`
          *,
          type:resident_types(
            name,
            category:resident_categories(name)
          ),
          group:resident_groups(name, description),
          subgroup:resident_subgroups(name, description, group:resident_groups(name))
        `);
      
      if (error) throw error;
      
      toast({
        title: 'Resident updated',
        description: `${editResidentData.name} has been updated successfully`
      });
      
      // Update the local resident data with the new data
      if (data && data.length > 0) {
        setResidents(prev => 
          prev.map(resident => 
            resident.id === selectedResident.id ? data[0] : resident
          )
        );
      } else {
        // If we don't get the updated data back, fetch all residents again
        await fetchResidents();
      }
      
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
      const { error } = await supabase
        .from('residents')
        .delete()
        .eq('id', selectedResident.id);
      
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

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      const {
        data,
        error
      } = await supabase.from('resident_groups').insert({
        name: newGroupName.trim(),
        description: newGroupDescription.trim() || null
      }).select();
      if (error) throw error;
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
      const {
        error
      } = await supabase.from('resident_groups').update({
        name: newGroupName.trim(),
        description: newGroupDescription.trim() || null
      }).eq('id', selectedGroup.id);
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
      const {
        count: residentCount,
        error: countError
      } = await supabase.from('residents').select('*', {
        count: 'exact',
        head: true
      }).eq('group_id', selectedGroup.id);
      if (countError) throw countError;
      if (residentCount && residentCount > 0) {
        toast({
          title: 'Error',
          description: `Cannot delete group "${selectedGroup.name}" because it has residents assigned to it.`,
          variant: 'destructive'
        });
        setIsDeleteGroupDialogOpen(false);
        return;
      }
      const {
        error: subgroupError
      } = await supabase.from('resident_subgroups').delete().eq('group_id', selectedGroup.id);
      if (subgroupError) throw subgroupError;
      const {
        error: groupError
      } = await supabase.from('resident_groups').delete().eq('id', selectedGroup.id);
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

  const handleAddSubgroup = async () => {
    if (!selectedGroupId || !newSubgroupName.trim()) return;
    try {
      const {
        data,
        error
      } = await supabase.from('resident_subgroups').insert({
        name: newSubgroupName.trim(),
        description: newSubgroupDescription.trim() || null,
        group_id: selectedGroupId
      }).select();
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
      const {
        data,
        error
      } = await supabase.from('resident_subgroups').insert({
        name: newSubgroupName.trim(),
        group_id: showSubgroupInput
      }).select();
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
      const {
        error
      } = await supabase.from('resident_subgroups').update({
        name: newSubgroupName.trim(),
        description: newSubgroupDescription.trim() || null
      }).eq('id', selectedSubgroup.id);
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
      const {
        count: residentCount,
        error: countError
      } = await supabase.from('residents').select('*', {
        count: 'exact',
        head: true
      }).eq('subgroup_id', selectedSubgroup.id);
      if (countError) throw countError;
      if (residentCount && residentCount > 0) {
        toast({
          title: 'Error',
          description: `Cannot delete subgroup "${selectedSubgroup.name}" because it has residents assigned to it.`,
          variant: 'destructive'
        });
        setIsDeleteSubgroupDialogOpen(false);
        return;
      }
      const {
        error
      } = await supabase.from('resident_subgroups').delete().eq('id', selectedSubgroup.id);
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

  const getResidentsByGroup = (groupId: number) => {
    return residents.filter(resident => resident.group_id === groupId && !resident.subgroup_id);
  };

  const getResidentsBySubgroup = (subgroupId: number) => {
    return residents.filter(resident => resident.subgroup_id === subgroupId);
  };

  const getTopResidentTypes = () => {
    return Object.entries(residentsByType).sort(([, countA], [, countB]) => countB - countA);
  };

  const getResidentTypeIcon = (typeName: string) => {
    return Rabbit;
  };

  const getGroupsCount = () => {
    return {
      groups: groups.length,
      subgroups: groups.reduce((total, group) => total + (group.subgroups?.length || 0), 0)
    };
  };

  const name = user?.email?.split('@')[0] || "User";

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

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome, {name}!</h2>
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg text-gray-500 font-medium mb-1">Total Residents</h3>
            <p className="text-4xl font-bold">{residents.length}</p>
            <p className="text-sm text-gray-500">Animals in the sanctuary</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
            <Users className="h-6 w-6 text-gray-600" />
          </div>
        </Card>
        
        <Card className="p-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg text-gray-500 font-medium mb-1">Groups</h3>
            <p className="text-4xl font-bold">{getGroupsCount().groups}</p>
            <p className="text-sm text-gray-500">{getGroupsCount().subgroups} subgroups</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
            <ListIcon className="h-6 w-6 text-gray-600" />
          </div>
        </Card>
        
        {getTopResidentTypes().map(([typeName, count]) => {
          const TypeIcon = getResidentTypeIcon(typeName);
          const percentage = residents.length > 0 ? Math.round(count / residents.length * 100) : 0;
          return (
            <Card key={typeName} className="p-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg text-gray-500 font-medium mb-1">{typeName}</h3>
                <p className="text-4xl font-bold">{count}</p>
                <p className="text-sm text-gray-500">{percentage}% of residents</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <TypeIcon className="h-6 w-6 text-gray-600" />
              </div>
            </Card>
          );
        })}
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Resident Groups</h3>
        <Button className="flex items-center gap-2 bg-sanctuary-green hover:bg-sanctuary-light-green" onClick={openAddGroupDialog}>
          <Plus className="h-4 w-4" />
          <span>Add New Group</span>
        </Button>
      </div>
      
      <div className="space-y-4 mb-8">
        {groups.length > 0 ? groups.map(group => (
          <Collapsible key={group.id} open={expandedGroups.includes(group.id)} onOpenChange={() => toggleGroupExpand(group.id)} className="border rounded-lg overflow-hidden">
            <div className="flex justify-between items-center p-4 bg-white">
              <CollapsibleTrigger className="flex items-center gap-2 text-left w-full">
                {expandedGroups.includes(group.id) ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                <span className="font-medium text-lg">{group.name}</span>
                {group.description && <span className="text-sm text-gray-500 ml-2">- {group.description}</span>}
              </CollapsibleTrigger>
              
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={e => {
                    e.stopPropagation();
                    openEditGroupDialog(group);
                  }} 
                  className="h-8 w-8 text-gray-500"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={e => {
                    e.stopPropagation();
                    openDeleteGroupDialog(group);
                  }} 
                  className="h-8 w-8 text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <CollapsibleContent>
              <ScrollArea className="max-h-[60vh]">
                <div className="p-6 bg-white border-t">
                  <div className="resident-grid">
                    {getResidentsByGroup(group.id).map(resident => (
                      <div key={resident.id} className="resident-item">
                        <div className="resident-image">
                          {resident.image_url ? (
                            <img src={resident.image_url} alt={resident.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-gray-400 text-xs">No Image</div>
                          )}
                        </div>
                        <div className="p-2 text-center">
                          <p className="font-medium truncate">{resident.name}</p>
                          <div className="flex justify-center gap-1 mt-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditResident(resident);
                              }}
                            >
                              <Edit className="h-3 w-3 text-blue-500" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6" 
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteResidentDialog(resident);
                              }}
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <Link to={`/residents/new?group=${group.id}`} className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center aspect-square hover:border-gray-400 transition-colors">
                      <div className="flex flex-col items-center text-gray-500">
                        <Plus className="h-6 w-6" />
                        <span className="text-sm">Add Animal</span>
                      </div>
                    </Link>
                  </div>
                  
                  {group.subgroups && group.subgroups.length > 0 && group.subgroups.map(subgroup => (
                    <div key={subgroup.id} className="mt-6">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium text-gray-700 flex items-center">
                          <div className="w-1 h-6 bg-sanctuary-green mr-2"></div>
                          {subgroup.name}
                          {subgroup.description && <span className="text-sm text-gray-500 ml-2">- {subgroup.description}</span>}
                        </h3>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditSubgroupDialog(subgroup)} className="h-7 w-7 text-gray-500">
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openDeleteSubgroupDialog(subgroup)} className="h-7 w-7 text-red-500">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="resident-grid">
                        {getResidentsBySubgroup(subgroup.id).map(resident => (
                          <div key={resident.id} className="resident-item">
                            <div className="resident-image">
                              {resident.image_url ? (
                                <img src={resident.image_url} alt={resident.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="text-gray-400 text-xs">No Image</div>
                              )}
                            </div>
                            <div className="p-2 text-center">
                              <p className="font-medium truncate">{resident.name}</p>
                              <div className="flex justify-center gap-1 mt-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditResident(resident);
                                  }}
                                >
                                  <Edit className="h-3 w-3 text-blue-500" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDeleteResidentDialog(resident);
                                  }}
                                >
                                  <Trash2 className="h-3 w-3 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <Link to={`/residents/new?group=${group.id}&subgroup=${subgroup.id}`} className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center aspect-square hover:border-gray-400 transition-colors">
                          <div className="flex flex-col items-center text-gray-500">
                            <Plus className="h-6 w-6" />
                            <span className="text-sm">Add Animal</span>
                          </div>
                        </Link>
                      </div>
                    </div>
                  ))}
                  
                  {showSubgroupInput === group.id ? (
                    <div className="mt-6 subgroup-input">
                      <Input placeholder="Subgroup name" value={newSubgroupName} onChange={e => setNewSubgroupName(e.target.value)} className="max-w-xs" />
                      <Button onClick={handleQuickAddSubgroup} disabled={!newSubgroupName.trim()}>
                        Add
                      </Button>
                      <Button variant="outline" onClick={() => setShowSubgroupInput(null)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <Button variant="outline" onClick={() => toggleSubgroupInput(group.id)} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Subgroup
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CollapsibleContent>
          </Collapsible>
        )) : (
          <div className="bg-white rounded-lg p-8 text-center border">
            <p className="text-gray-500 mb-4">No resident groups yet</p>
            <Button onClick={openAddGroupDialog} className="flex items-center gap-2 bg-sanctuary-green hover:bg-sanctuary-light-green">
              <Plus className="h-4 w-4" />
              <span>Create your first group</span>
            </Button>
          </div>
        )}
      </div>

      {/* Add Group Dialog */}
      <Dialog open={isAddGroupDialogOpen} onOpenChange={setIsAddGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Group</DialogTitle>
            <DialogDescription>
              Create a new group for organizing residents.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name">Group Name</label>
              <Input id="name" placeholder="Enter group name" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <label htmlFor="description">Description (Optional)</label>
              <Input id="description" placeholder="Enter description" value={newGroupDescription} onChange={e => setNewGroupDescription(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddGroupDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddGroup} disabled={!newGroupName.trim()}>Create Group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog open={isEditGroupDialogOpen} onOpenChange={setIsEditGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
            <DialogDescription>
              Update group information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-name">Group Name</label>
              <Input id="edit-name" placeholder="Enter group name" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-description">Description (Optional)</label>
              <Input id="edit-description" placeholder="Enter description" value={newGroupDescription} onChange={e => setNewGroupDescription(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditGroupDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditGroup} disabled={!newGroupName.trim()}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Group Dialog */}
      <AlertDialog open={isDeleteGroupDialogOpen} onOpenChange={setIsDeleteGroupDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the group "{selectedGroup?.name}"? This will also delete all subgroups within this group. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGroup} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Subgroup Dialog */}
      <Dialog open={isAddSubgroupDialogOpen} onOpenChange={setIsAddSubgroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Subgroup</DialogTitle>
            <DialogDescription>
              Create a new subgroup for further organizing residents.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="subgroup-name">Subgroup Name</label>
              <Input id="subgroup-name" placeholder="Enter subgroup name" value={newSubgroupName} onChange={e => setNewSubgroupName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <label htmlFor="subgroup-description">Description (Optional)</label>
              <Input id="subgroup-description" placeholder="Enter description" value={newSubgroupDescription} onChange={e => setNewSubgroupDescription(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSubgroupDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSubgroup} disabled={!newSubgroupName.trim()}>Create Subgroup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subgroup Dialog */}
      <Dialog open={isEditSubgroupDialogOpen} onOpenChange={setIsEditSubgroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subgroup</DialogTitle>
            <DialogDescription>
              Update subgroup information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-subgroup-name">Subgroup Name</label>
              <Input id="edit-subgroup-name" placeholder="Enter subgroup name" value={newSubgroupName} onChange={e => setNewSubgroupName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-subgroup-description">Description (Optional)</label>
              <Input id="edit-subgroup-description" placeholder="Enter description" value={newSubgroupDescription} onChange={e => setNewSubgroupDescription(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditSubgroupDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubgroup} disabled={!newSubgroupName.trim()}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Subgroup Dialog */}
      <AlertDialog open={isDeleteSubgroupDialogOpen} onOpenChange={setIsDeleteSubgroupDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subgroup</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the subgroup "{selectedSubgroup?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSubgroup} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Resident Dialog */}
      <Dialog open={isEditResidentDialogOpen} onOpenChange={setIsEditResidentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Resident</DialogTitle>
            <DialogDescription>
              Update resident information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="resident-name">Name</label>
              <Input 
                id="resident-name" 
                placeholder="Enter name" 
                value={editResidentData.name} 
                onChange={e => setEditResidentData({...editResidentData, name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="resident-description">Description</label>
              <Input 
                id="resident-description" 
                placeholder="Enter description" 
                value={editResidentData.description} 
                onChange={e => setEditResidentData({...editResidentData, description: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <label>Arrival Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !editResidentData.arrival_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editResidentData.arrival_date ? format(editResidentData.arrival_date, "PPP") : <span>Select date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={editResidentData.arrival_date || undefined}
                    onSelect={(date) => setEditResidentData({...editResidentData, arrival_date: date})}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <label>Image</label>
              <div className="flex items-center space-x-4">
                {previewUrl && (
                  <div className="h-24 w-24 rounded-md overflow-hidden">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="relative">
                    <Input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      id="image-upload"
                      accept="image/*"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-gray-50"
                    >
                      <Upload className="h-4 w-4" />
                      Choose Image
                    </label>
                  </div>
                  {selectedFile && (
                    <p className="text-xs text-gray-500 mt-1 truncate">{selectedFile.name}</p>
                  )}
                  {previewUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={resetFileInput}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid gap-2">
              <label>Group</label>
              <select
                id="resident-group"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={editResidentData.group_id || ''}
                onChange={(e) => {
                  const groupId = e.target.value ? Number(e.target.value) : null;
                  setEditResidentData({
                    ...editResidentData, 
                    group_id: groupId,
                    subgroup_id: null
                  });
                }}
              >
                <option value="">No Group</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
            
            {editResidentData.group_id && (
              <div className="grid gap-2">
                <label htmlFor="resident-subgroup">Subgroup</label>
                <select
                  id="resident-subgroup"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={editResidentData.subgroup_id || ''}
                  onChange={(e) => {
                    const subgroupId = e.target.value ? Number(e.target.value) : null;
                    setEditResidentData({
                      ...editResidentData, 
                      subgroup_id: subgroupId
                    });
                  }}
                >
                  <option value="">No Subgroup</option>
                  {groups
                    .find(g => g.id === editResidentData.group_id)
                    ?.subgroups
                    ?.map((subgroup) => (
                      <option key={subgroup.id} value={subgroup.id}>
                        {subgroup.name}
                      </option>
                    ))
                  }
                </select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditResidentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditResidentSubmit} disabled={!editResidentData.name.trim() || isLoading}>
              {isLoading ? 'Updating...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Resident Dialog */}
      <AlertDialog open={isDeleteResidentDialogOpen} onOpenChange={setIsDeleteResidentDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resident</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the resident "{selectedResident?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteResident} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
