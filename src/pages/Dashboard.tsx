
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Plus, ChevronDown, ChevronUp, Edit, Trash2, ListIcon, Users, Rabbit } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, ResidentGroup, ResidentSubgroup, Resident } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function Dashboard() {
  const {
    user
  } = useAuth();
  const [groups, setGroups] = useState<ResidentGroup[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<number[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [residentsByType, setResidentsByType] = useState<Record<string, number>>({});
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  
  // Group and subgroup state
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
  
  // Resident state
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [isDeleteResidentDialogOpen, setIsDeleteResidentDialogOpen] = useState(false);
  const [isEditResidentDialogOpen, setIsEditResidentDialogOpen] = useState(false);
  const [editResidentData, setEditResidentData] = useState({
    name: '',
    description: ''
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
  
  // Resident actions
  const handleEditResident = (resident: Resident) => {
    navigate(`/residents/edit/${resident.id}`);
  };

  const openEditResidentDialog = (resident: Resident) => {
    setSelectedResident(resident);
    setEditResidentData({
      name: resident.name,
      description: resident.description || ''
    });
    setIsEditResidentDialogOpen(true);
  };

  const handleEditResidentSubmit = async () => {
    if (!selectedResident) return;
    
    try {
      const { error } = await supabase
        .from('residents')
        .update({
          name: editResidentData.name,
          description: editResidentData.description
        })
        .eq('id', selectedResident.id);
      
      if (error) throw error;
      
      toast({
        title: 'Resident updated',
        description: `${editResidentData.name} has been updated successfully`
      });
      
      fetchResidents();
      setIsEditResidentDialogOpen(false);
      
    } catch (error: any) {
      console.error('Error updating resident:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update resident',
        variant: 'destructive'
      });
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

  const getTopResidentTypes = (limit: number = 3) => {
    return Object.entries(residentsByType).sort(([, countA], [, countB]) => countB - countA).slice(0, limit);
  };

  const getResidentTypeIcon = (typeName: string) => {
    return Rabbit;
  };

  const name = user?.email?.split('@')[0] || "User";

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
        
        {getTopResidentTypes(1).map(([typeName, count]) => {
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
                              openEditResidentDialog(resident);
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
                                  openEditResidentDialog(resident);
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
            </CollapsibleContent>
          </Collapsible>
        )) : (
          <div className="text-center p-8 border rounded-lg bg-gray-50">
            <p className="text-gray-500 mb-4">No resident groups found</p>
            <Button onClick={openAddGroupDialog} className="bg-sanctuary-green hover:bg-sanctuary-light-green">
              <Plus className="h-4 w-4 mr-2" />
              Add First Group
            </Button>
          </div>
        )}
      </div>
      
      {/* Group dialog modals */}
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
              <Input id="group-name" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="Enter group name" />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="group-description" className="text-sm font-medium">
                Description (Optional)
              </label>
              <Textarea id="group-description" value={newGroupDescription} onChange={e => setNewGroupDescription(e.target.value)} placeholder="Enter description" rows={3} />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddGroupDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-sanctuary-green hover:bg-sanctuary-light-green" onClick={handleAddGroup} disabled={!newGroupName.trim()}>
              Add Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
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
              <Input id="edit-group-name" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="Enter group name" />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="edit-group-description" className="text-sm font-medium">
                Description (Optional)
              </label>
              <Textarea id="edit-group-description" value={newGroupDescription} onChange={e => setNewGroupDescription(e.target.value)} placeholder="Enter description" rows={3} />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditGroupDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-sanctuary-green hover:bg-sanctuary-light-green" onClick={handleEditGroup} disabled={!newGroupName.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteGroupDialogOpen} onOpenChange={setIsDeleteGroupDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this group? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteGroupDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGroup} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Subgroup dialog modals */}
      <Dialog open={isAddSubgroupDialogOpen} onOpenChange={setIsAddSubgroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Subgroup</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="subgroup-name" className="text-sm font-medium">
                Subgroup Name
              </label>
              <Input id="subgroup-name" value={newSubgroupName} onChange={e => setNewSubgroupName(e.target.value)} placeholder="Enter subgroup name" />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="subgroup-description" className="text-sm font-medium">
                Description (Optional)
              </label>
              <Textarea id="subgroup-description" value={newSubgroupDescription} onChange={e => setNewSubgroupDescription(e.target.value)} placeholder="Enter description" rows={3} />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSubgroupDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-sanctuary-green hover:bg-sanctuary-light-green" onClick={handleAddSubgroup} disabled={!newSubgroupName.trim()}>
              Add Subgroup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
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
              <Input id="edit-subgroup-name" value={newSubgroupName} onChange={e => setNewSubgroupName(e.target.value)} placeholder="Enter subgroup name" />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="edit-subgroup-description" className="text-sm font-medium">
                Description (Optional)
              </label>
              <Textarea id="edit-subgroup-description" value={newSubgroupDescription} onChange={e => setNewSubgroupDescription(e.target.value)} placeholder="Enter description" rows={3} />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditSubgroupDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-sanctuary-green hover:bg-sanctuary-light-green" onClick={handleEditSubgroup} disabled={!newSubgroupName.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteSubgroupDialogOpen} onOpenChange={setIsDeleteSubgroupDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subgroup</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this subgroup? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteSubgroupDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSubgroup} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Resident dialog modals */}
      <Dialog open={isEditResidentDialogOpen} onOpenChange={setIsEditResidentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Resident</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-resident-name" className="text-sm font-medium">
                Name
              </label>
              <Input 
                id="edit-resident-name" 
                value={editResidentData.name} 
                onChange={e => setEditResidentData({...editResidentData, name: e.target.value})} 
                placeholder="Enter resident name" 
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="edit-resident-description" className="text-sm font-medium">
                Description
              </label>
              <Textarea 
                id="edit-resident-description" 
                value={editResidentData.description} 
                onChange={e => setEditResidentData({...editResidentData, description: e.target.value})} 
                placeholder="Enter description" 
                rows={3} 
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                variant="outline"
                onClick={() => selectedResident && handleEditResident(selectedResident)}
              >
                Full Edit
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditResidentDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-sanctuary-green hover:bg-sanctuary-light-green" onClick={handleEditResidentSubmit} disabled={!editResidentData.name.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteResidentDialogOpen} onOpenChange={setIsDeleteResidentDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resident</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedResident?.name} from the system? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteResidentDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteResident} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
