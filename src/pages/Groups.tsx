
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Plus, ChevronDown, ChevronUp, Edit, Trash2 } from 'lucide-react';
import { supabase, ResidentGroup } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function Groups() {
  const [groups, setGroups] = useState<ResidentGroup[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<number[]>([]);
  const { toast } = useToast();
  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false);
  const [isEditGroupDialogOpen, setIsEditGroupDialogOpen] = useState(false);
  const [isDeleteGroupDialogOpen, setIsDeleteGroupDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<ResidentGroup | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

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
        const groupSubgroups = (subgroupsData || []).filter((subgroup) => subgroup.group_id === group.id);
        return {
          ...group,
          subgroups: groupSubgroups
        };
      });
      setGroups(groupsWithSubgroups);
    } catch (error) {
      console.error('Error fetching groups data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load groups',
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

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Resident Groups</h2>
            <p className="text-gray-600">Manage animal housing groups in the sanctuary</p>
          </div>
          
          <Button className="flex items-center gap-2 bg-sanctuary-green hover:bg-sanctuary-light-green" onClick={openAddGroupDialog}>
            <Plus className="h-4 w-4" />
            <span>Add New Group</span>
          </Button>
        </div>
      </div>
      
      <div className="space-y-4 mb-8">
        {groups.length > 0 ? groups.map(group => (
          <Collapsible 
            key={group.id} 
            open={expandedGroups.includes(group.id)} 
            onOpenChange={() => toggleGroupExpand(group.id)} 
            className="border rounded-lg overflow-hidden"
          >
            <div className="flex justify-between items-center p-4 bg-white">
              <CollapsibleTrigger className="flex items-center gap-2 text-left w-full">
                {expandedGroups.includes(group.id) ? 
                  <ChevronUp className="h-4 w-4 text-gray-500" /> : 
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                }
                <span className="font-medium text-lg">{group.name}</span>
                {group.description && <span className="text-sm text-gray-500 ml-2">- {group.description}</span>}
              </CollapsibleTrigger>
              
              <div className="flex items-center">
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
              <div className="p-6 bg-white border-t">
                <p className="text-gray-700">
                  {group.description || "No description provided."}
                </p>
                
                {group.subgroups && group.subgroups.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700 mb-2">Subgroups:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {group.subgroups.map(subgroup => (
                        <li key={subgroup.id}>{subgroup.name}</li>
                      ))}
                    </ul>
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
                onChange={e => setNewGroupName(e.target.value)} 
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
                onChange={e => setNewGroupDescription(e.target.value)} 
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
                onChange={e => setNewGroupName(e.target.value)} 
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
                onChange={e => setNewGroupDescription(e.target.value)} 
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
            <AlertDialogAction onClick={handleDeleteGroup} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
