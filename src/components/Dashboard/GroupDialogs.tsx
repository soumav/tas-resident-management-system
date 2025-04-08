
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface GroupDialogsProps {
  isAddOpen: boolean;
  isEditOpen: boolean;
  isDeleteOpen: boolean;
  isAddSubgroupOpen: boolean;
  isEditSubgroupOpen: boolean;
  isDeleteSubgroupOpen: boolean;
  groupName: string;
  groupDescription: string;
  subgroupName: string;
  subgroupDescription: string;
  selectedGroupName: string;
  selectedSubgroupName: string;
  onAddGroupClose: () => void;
  onEditGroupClose: () => void;
  onDeleteGroupClose: () => void;
  onAddSubgroupClose: () => void;
  onEditSubgroupClose: () => void;
  onDeleteSubgroupClose: () => void;
  onGroupNameChange: (value: string) => void;
  onGroupDescriptionChange: (value: string) => void;
  onSubgroupNameChange: (value: string) => void;
  onSubgroupDescriptionChange: (value: string) => void;
  onAddGroup: () => void;
  onEditGroup: () => void;
  onDeleteGroup: () => void;
  onAddSubgroup: () => void;
  onEditSubgroup: () => void;
  onDeleteSubgroup: () => void;
}

export function GroupDialogs({
  isAddOpen,
  isEditOpen,
  isDeleteOpen,
  isAddSubgroupOpen,
  isEditSubgroupOpen,
  isDeleteSubgroupOpen,
  groupName,
  groupDescription,
  subgroupName,
  subgroupDescription,
  selectedGroupName,
  selectedSubgroupName,
  onAddGroupClose,
  onEditGroupClose,
  onDeleteGroupClose,
  onAddSubgroupClose,
  onEditSubgroupClose,
  onDeleteSubgroupClose,
  onGroupNameChange,
  onGroupDescriptionChange,
  onSubgroupNameChange,
  onSubgroupDescriptionChange,
  onAddGroup,
  onEditGroup,
  onDeleteGroup,
  onAddSubgroup,
  onEditSubgroup,
  onDeleteSubgroup
}: GroupDialogsProps) {
  return (
    <>
      {/* Add Group Dialog */}
      <Dialog open={isAddOpen} onOpenChange={onAddGroupClose}>
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
              <Input 
                id="name" 
                placeholder="Enter group name" 
                value={groupName} 
                onChange={e => onGroupNameChange(e.target.value)} 
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="description">Description (Optional)</label>
              <Input 
                id="description" 
                placeholder="Enter description" 
                value={groupDescription} 
                onChange={e => onGroupDescriptionChange(e.target.value)} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onAddGroupClose}>Cancel</Button>
            <Button onClick={onAddGroup} disabled={!groupName.trim()}>Create Group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog open={isEditOpen} onOpenChange={onEditGroupClose}>
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
              <Input 
                id="edit-name" 
                placeholder="Enter group name" 
                value={groupName} 
                onChange={e => onGroupNameChange(e.target.value)} 
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-description">Description (Optional)</label>
              <Input 
                id="edit-description" 
                placeholder="Enter description" 
                value={groupDescription} 
                onChange={e => onGroupDescriptionChange(e.target.value)} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onEditGroupClose}>Cancel</Button>
            <Button onClick={onEditGroup} disabled={!groupName.trim()}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Group Dialog */}
      {isDeleteOpen && (
        <AlertDialog open={isDeleteOpen} onOpenChange={onDeleteGroupClose}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Group</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the group "{selectedGroupName}"? This will also delete all subgroups within this group. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDeleteGroup} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Add Subgroup Dialog */}
      {isAddSubgroupOpen && (
        <Dialog open={isAddSubgroupOpen} onOpenChange={onAddSubgroupClose}>
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
                <Input 
                  id="subgroup-name" 
                  placeholder="Enter subgroup name" 
                  value={subgroupName} 
                  onChange={e => onSubgroupNameChange(e.target.value)} 
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="subgroup-description">Description (Optional)</label>
                <Input 
                  id="subgroup-description" 
                  placeholder="Enter description" 
                  value={subgroupDescription} 
                  onChange={e => onSubgroupDescriptionChange(e.target.value)} 
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onAddSubgroupClose}>Cancel</Button>
              <Button onClick={onAddSubgroup} disabled={!subgroupName.trim()}>Create Subgroup</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Subgroup Dialog */}
      <Dialog open={isEditSubgroupOpen} onOpenChange={onEditSubgroupClose}>
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
              <Input 
                id="edit-subgroup-name" 
                placeholder="Enter subgroup name" 
                value={subgroupName} 
                onChange={e => onSubgroupNameChange(e.target.value)} 
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-subgroup-description">Description (Optional)</label>
              <Input 
                id="edit-subgroup-description" 
                placeholder="Enter description" 
                value={subgroupDescription} 
                onChange={e => onSubgroupDescriptionChange(e.target.value)} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onEditSubgroupClose}>Cancel</Button>
            <Button onClick={onEditSubgroup} disabled={!subgroupName.trim()}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Subgroup Dialog */}
      {isDeleteSubgroupOpen && (
        <AlertDialog open={isDeleteSubgroupOpen} onOpenChange={onDeleteSubgroupClose}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Subgroup</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the subgroup "{selectedSubgroupName}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDeleteSubgroup} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
