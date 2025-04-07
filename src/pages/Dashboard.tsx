import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { 
  Plus,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  ListIcon,
  Users,
  Cow
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, ResidentGroup, ResidentSubgroup, Resident } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Dashboard() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<ResidentGroup[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<number[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [residentsByType, setResidentsByType] = useState<Record<string, number>>({});
  const { toast } = useToast();
  
  // State for dialogs
  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false);
  const [isEditGroupDialogOpen, setIsEditGroupDialogOpen] = useState(false);
  const [isDeleteGroupDialogOpen, setIsDeleteGroupDialogOpen] = useState(false);
  const [isAddSubgroupDialogOpen, setIsAddSubgroupDialogOpen] = useState(false);
  const [isEditSubgroupDialogOpen, setIsEditSubgroupDialogOpen] = useState(false);
  const [isDeleteSubgroupDialogOpen, setIsDeleteSubgroupDialogOpen] = useState(false);
  
  // Form states
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<ResidentGroup | null>(null);
  const [newSubgroupName, setNewSubgroupName] = useState('');
  const [newSubgroupDescription, setNewSubgroupDescription] = useState('');
  const [selectedSubgroupId, setSelectedSubgroupId] = useState<number | null>(null);
  const [selectedSubgroup, setSelectedSubgroup] = useState<ResidentSubgroup | null>(null);
  
  useEffect(() => {
    fetchGroups();
    fetchResidents();
  }, []);

  useEffect(() => {
    // Calculate residents by type when residents change
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
      // Get groups data with subgroups
      const { data: groupsData, error: groupsError } = await supabase
        .from('resident_groups')
        .select('*')
        .order('name');
        
      if (groupsError) throw groupsError;
      
      // Get subgroups data
      const { data: subgroupsData, error: subgroupsError } = await supabase
        .from('resident_subgroups')
        .select('*')
        .order('name');
        
      if (subgroupsError) throw subgroupsError;
      
      // Merge groups with their subgroups
      const groupsWithSubgroups = (groupsData || []).map((group: ResidentGroup) => {
        const groupSubgroups = (subgroupsData || []).filter(
          (subgroup: ResidentSubgroup) => subgroup.group_id === group.id
        );
        
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
      // Get residents with their related data
      const { data, error } = await supabase
        .from('residents')
        .select(`
          *,
          type:resident_types(
            name,
            category:resident_categories(name)
          ),
          group:resident_groups(name, description),
          subgroup:resident_subgroups(name, description, group:resident_groups(name))
        `)
        .order('name');
        
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

  // Toggle expanded state for a group
  const toggleGroupExpand = (groupId: number) => {
    setExpandedGroups(prev => {
      if (prev.includes(groupId)) {
        return prev.filter(id => id !== groupId);
      } else {
        return [...prev, groupId];
      }
    });
  };
  
  // Group management functions
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
      const { data, error } = await supabase
        .from('resident_groups')
        .insert({
          name: newGroupName.trim(),
          description: newGroupDescription.trim() || null
        })
        .select();
      
      if (error) throw error;
      
      setGroups(prev => [...prev, {...data[0], subgroups: []}]);
      setIsAddGroupDialogOpen(false);
      
      toast({
        title: 'Success',
        description: `Group "${newGroupName}" has been added`,
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
      const { error } = await supabase
        .from('resident_groups')
        .update({
          name: newGroupName.trim(),
          description: newGroupDescription.trim() || null
        })
        .eq('id', selectedGroup.id);
      
      if (error) throw error;
      
      // Update the groups in state
      setGroups(prev => 
        prev.map(group => {
          if (group.id === selectedGroup.id) {
            return { 
              ...group, 
              name: newGroupName.trim(),
              description: newGroupDescription.trim() || null
            };
          }
          return group;
        })
      );
      
      setIsEditGroupDialogOpen(false);
      
      toast({
        title: 'Success',
        description: `Group "${selectedGroup.name}" has been updated`,
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
      // Check if there are residents associated with this group
      const { count: residentCount, error: countError } = await supabase
        .from('residents')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', selectedGroup.id);
      
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
      
      // Delete associated subgroups first
      const { error: subgroupError } = await supabase
        .from('resident_subgroups')
        .delete()
        .eq('group_id', selectedGroup.id);
      
      if (subgroupError) throw subgroupError;
      
      // Delete the group
      const { error: groupError } = await supabase
        .from('resident_groups')
        .delete()
        .eq('id', selectedGroup.id);
      
      if (groupError) throw groupError;
      
      // Update the groups in state
      setGroups(prev => prev.filter(group => group.id !== selectedGroup.id));
      setIsDeleteGroupDialogOpen(false);
      
      toast({
        title: 'Success',
        description: `Group "${selectedGroup.name}" and its subgroups have been deleted`,
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
  
  // Subgroup management functions
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
      const { data, error } = await supabase
        .from('resident_subgroups')
        .insert({
          name: newSubgroupName.trim(),
          description: newSubgroupDescription.trim() || null,
          group_id: selectedGroupId
        })
        .select();
      
      if (error) throw error;
      
      // Update the groups in state
      setGroups(prev => 
        prev.map(group => {
          if (group.id === selectedGroupId) {
            return {
              ...group,
              subgroups: [
                ...(group.subgroups || []),
                data[0]
              ]
            };
          }
          return group;
        })
      );
      
      setIsAddSubgroupDialogOpen(false);
      
      toast({
        title: 'Success',
        description: `Subgroup "${newSubgroupName}" has been added`,
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
      const { error } = await supabase
        .from('resident_subgroups')
        .update({
          name: newSubgroupName.trim(),
          description: newSubgroupDescription.trim() || null
        })
        .eq('id', selectedSubgroup.id);
      
      if (error) throw error;
      
      // Update the groups in state
      setGroups(prev => 
        prev.map(group => {
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
        })
      );
      
      setIsEditSubgroupDialogOpen(false);
      
      toast({
        title: 'Success',
        description: `Subgroup "${selectedSubgroup.name}" has been updated`,
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
      // Check if there are residents associated with this subgroup
      const { count: residentCount, error: countError } = await supabase
        .from('residents')
        .select('*', { count: 'exact', head: true })
        .eq('subgroup_id', selectedSubgroup.id);
      
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
      
      // Delete the subgroup
      const { error } = await supabase
        .from('resident_subgroups')
        .delete()
        .eq('id', selectedSubgroup.id);
      
      if (error) throw error;
      
      // Update the groups in state
      setGroups(prev => 
        prev.map(group => {
          if (group.subgroups?.some(subgroup => subgroup.id === selectedSubgroup.id)) {
            return {
              ...group,
              subgroups: group.subgroups?.filter(subgroup => subgroup.id !== selectedSubgroup.id)
            };
          }
          return group;
        })
      );
      
      setIsDeleteSubgroupDialogOpen(false);
      
      toast({
        title: 'Success',
        description: `Subgroup "${selectedSubgroup.name}" has been deleted`,
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
  
  // Get residents by group or subgroup
  const getResidentsByGroup = (groupId: number) => {
    return residents.filter(resident => resident.group_id === groupId);
  };
  
  const getResidentsBySubgroup = (subgroupId: number) => {
    return residents.filter(resident => resident.subgroup_id === subgroupId);
  };
  
  // Get the most populous resident types for display
  const getTopResidentTypes = (limit: number = 3) => {
    return Object.entries(residentsByType)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, limit);
  };
  
  // Get the icon for a resident type
  const getResidentTypeIcon = (typeName: string) => {
    // Default to Cow icon, but could be expanded with more icons based on type
    return Cow;
  };
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-sanctuary-green">
          The Alice Sanctuary Directory
        </h1>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome, {user?.email?.split('@')[0] || 'Guest'}!</h2>
            <p className="text-gray-600">Manage your sanctuary residents and groups</p>
          </div>
          
          <div className="flex gap-4">
            <Button 
              className="flex items-center gap-2"
              variant="outline"
              asChild
            >
              <Link to="/resident-types">
                <span>Manage Types of Residents</span>
              </Link>
            </Button>
            
            <Button 
              className="flex items-center gap-2 bg-sanctuary-green hover:bg-sanctuary-light-green"
              asChild
            >
              <Link to="/residents/new">
                <Plus className="h-4 w-4" />
                <span>Add New Resident</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Residents Card */}
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
        
        {/* Display the most common resident type */}
        {getTopResidentTypes(1).map(([typeName, count]) => {
          const TypeIcon = getResidentTypeIcon(typeName);
          const percentage = residents.length > 0 ? Math.round((count / residents.length) * 100) : 0;
          
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
        
        {/* Groups Card */}
        <Card className="p-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg text-gray-500 font-medium mb-1">Groups</h3>
            <p className="text-4xl font-bold">{groups.length}</p>
            <p className="text-sm text-gray-500">Groups of residents</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
            <ListIcon className="h-6 w-6 text-gray-600" />
          </div>
        </Card>
      </div>
      
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
      
      <div className="space-y-4 mb-8">
        {groups.length > 0 ? (
          groups.map((group) => (
            <Collapsible 
              key={group.id} 
              open={expandedGroups.includes(group.id)}
              onOpenChange={() => toggleGroupExpand(group.id)}
              className="border rounded-lg overflow-hidden bg-white"
            >
              <div className="flex justify-between items-center p-4 border-b">
                <CollapsibleTrigger className="flex items-center gap-2 text-left w-full">
                  {expandedGroups.includes(group.id) ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                  <span className="font-medium text-lg">{group.name}</span>
                  {group.description && (
                    <span className="text-sm text-gray-500 ml-2">- {group.description}</span>
                  )}
                </CollapsibleTrigger>
                
                <div className="flex items-center">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => {
                      e.stopPropagation(); 
                      openAddSubgroupDialog(group.id);
                    }}
                    className="h-8 w-8 text-gray-500"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => {
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
                    onClick={(e) => {
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
                {/* Subgroups and directly associated residents */}
                <div className="divide-y">
                  {/* Residents directly in the group (not in any subgroup) */}
                  {getResidentsByGroup(group.id)
                    .filter(resident => !resident.subgroup_id)
                    .length > 0 && (
                    <div className="p-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {getResidentsByGroup(group.id)
                          .filter(resident => !resident.subgroup_id)
                          .map(resident => (
                          <Card key={resident.id} className="overflow-hidden">
                            <div className="aspect-square bg-gray-200 flex items-center justify-center">
                              {resident.image_url ? (
                                <img 
                                  src={resident.image_url} 
                                  alt={resident.name} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="text-gray-400 text-xs">No Image</div>
                              )}
                            </div>
                            <div className="p-2 text-center">
                              <p className="font-medium truncate">{resident.name}</p>
                            </div>
                          </Card>
                        ))}
                        <Link 
                          to={`/residents/new?group=${group.id}`}
                          className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center aspect-square hover:border-gray-400 transition-colors"
                        >
                          <div className="flex flex-col items-center text-gray-500">
                            <Plus className="h-6 w-6" />
                            <span className="text-sm">Add Animal</span>
                          </div>
                        </Link>
                      </div>
                    </div>
                  )}
                  
                  {/* Subgroups */}
                  {group.subgroups && group.subgroups.length > 0 && 
                    group.subgroups.map(subgroup => (
                      <div key={subgroup.id} className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-medium text-gray-700 flex items-center">
                            <div className="w-1 h-6 bg-sanctuary-green mr-2"></div>
                            {subgroup.name}
                            {subgroup.description && (
                              <span className="text-sm text-gray-500 ml-2">- {subgroup.description}</span>
                            )}
                          </h3>
                          <div className="flex items-center space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => openEditSubgroupDialog(subgroup)}
                              className="h-7 w-7 text-gray-500"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => openDeleteSubgroupDialog(subgroup)}
                              className="h-7 w-7 text-red-500"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                          {getResidentsBySubgroup(subgroup.id).map(resident => (
                            <Card key={resident.id} className="overflow-hidden">
                              <div className="aspect-square bg-gray-200 flex items-center justify-center">
                                {resident.image_url ? (
                                  <img 
                                    src={resident.image_url} 
                                    alt={resident.name} 
                                    className="w-full h-full object-cover" 
                                  />
                                ) : (
                                  <div className="text-gray-400 text-xs">No Image</div>
                                )}
                              </div>
                              <div className="p-2 text-center">
                                <p className="font-medium truncate">{resident.name}</p>
                              </div>
                            </Card>
                          ))}
                          <Link 
                            to={`/residents/new?group=${group.id}&subgroup=${subgroup.id}`}
                            className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center aspect-square hover:border-gray-400 transition-colors"
                          >
                            <div className="flex flex-col items-center text-gray-500">
                              <Plus className="h-6 w-6" />
                              <span className="text-sm">Add Animal</span>
                            </div>
                          </Link>
                        </div>
                      </div>
                    ))
                  }
                  
                  {/* Add subgroup input when there are no subgroups */}
                  {(!group.subgroups || group.subgroups.length === 0) && (
                    <div className="p-4 flex justify-center">
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2"
                        onClick={() => openAddSubgroupDialog(group.id)}
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Subgroup</span>
                      </Button>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))
        ) : (
          <div className="text-center p-8 border rounded-lg bg-gray-50">
            <p className="text-gray-500 mb-4">No resident groups found</p>
            <Button 
              onClick={openAddGroupDialog}
              className="bg-sanctuary-green hover:bg-sanctuary-light-green"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Group
            </Button>
          </div>
        )}
      </div>
      
      {/* Add Group Dialog */}
      <Dialog open={isAddGroupDialogOpen} onOpenChange={setIsAddGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Group</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="group-name" className="text-sm font-medium">
                Group Name
              </label>
              <Input
                id="group-name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="group-description" className="text-sm font-medium">
                Description (Optional)
              </label>
              <Textarea
                id="group-description"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                placeholder="Enter description"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddGroupDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-sanctuary-green hover:bg-sanctuary-light-green"
              onClick={handleAddGroup}
              disabled={!newGroupName.trim()}
            >
              Add Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Group Dialog */}
      <Dialog open={isEditGroupDialogOpen} onOpenChange={setIsEditGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-group-name" className="text-sm font-medium">
                Group Name
              </label>
              <Input
                id="edit-group-name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="edit-group-description" className="text-sm font-medium">
                Description (Optional)
              </label>
              <Textarea
                id="edit-group-description"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                placeholder="Enter description"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditGroupDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-sanctuary-green hover:bg-sanctuary-light-green"
              onClick={handleEditGroup}
              disabled={!newGroupName.trim()}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Group Dialog */}
      <AlertDialog open={isDeleteGroupDialogOpen} onOpenChange={setIsDeleteGroupDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the group "{selectedGroup?.name}" and all its subgroups. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteGroup}
              className="bg-red-500 hover:bg-red-600"
            >
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
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="subgroup-name" className="text-sm font-medium">
                Subgroup Name
              </label>
              <Input
                id="subgroup-name"
                value={newSubgroupName}
                onChange={(e) => setNewSubgroupName(e.target.value)}
                placeholder="Enter subgroup name"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="subgroup-description" className="text-sm font-medium">
                Description (Optional)
              </label>
              <Textarea
                id="subgroup-description"
                value={newSubgroupDescription}
                onChange={(e) => setNewSubgroupDescription(e.target.value)}
                placeholder="Enter description"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSubgroupDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-sanctuary-green hover:bg-sanctuary-light-green"
              onClick={handleAddSubgroup}
              disabled={!newSubgroupName.trim()}
            >
              Add Subgroup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Subgroup Dialog */}
      <Dialog open={isEditSubgroupDialogOpen} onOpenChange={setIsEditSubgroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subgroup</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-subgroup-name" className="text-sm font-medium">
                Subgroup Name
              </label>
              <Input
                id="edit-subgroup-name"
                value={newSubgroupName}
                onChange={(e) => setNewSubgroupName(e.target.value)}
                placeholder="Enter subgroup name"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="edit-subgroup-description" className="text-sm font-medium">
                Description (Optional)
              </label>
              <Textarea
                id="edit-subgroup-description"
                value={newSubgroupDescription}
                onChange={(e) => setNewSubgroupDescription(e.target.value)}
                placeholder="Enter description"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditSubgroupDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-sanctuary-green hover:bg-sanctuary-light-green"
              onClick={handleEditSubgroup}
              disabled={!newSubgroupName.trim()}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Subgroup Dialog */}
      <AlertDialog open={isDeleteSubgroupDialogOpen} onOpenChange={setIsDeleteSubgroupDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subgroup</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the subgroup "{selectedSubgroup?.name}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteSubgroup}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
