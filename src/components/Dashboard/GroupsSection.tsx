
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ChevronUp, ChevronDown, Edit, Trash2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { ResidentGroup, ResidentSubgroup, Resident } from '@/lib/supabase';
import { ResidentDisplay } from './ResidentDisplay';

interface GroupsSectionProps {
  groups: ResidentGroup[];
  expandedGroups: number[];
  showSubgroupInput: number | null;
  residents: Resident[];
  newSubgroupName: string;
  onToggleGroupExpand: (groupId: number) => void;
  onEditGroup: (group: ResidentGroup) => void;
  onDeleteGroup: (group: ResidentGroup) => void;
  onToggleSubgroupInput: (groupId: number) => void;
  onNewSubgroupNameChange: (name: string) => void;
  onQuickAddSubgroup: () => void;
  onEditSubgroup: (subgroup: ResidentSubgroup) => void;
  onDeleteSubgroup: (subgroup: ResidentSubgroup) => void;
  onEditResident: (resident: Resident) => void;
  onDeleteResident: (resident: Resident) => void;
  getResidentsByGroup: (groupId: number) => Resident[];
  getResidentsBySubgroup: (subgroupId: number) => Resident[];
}

export function GroupsSection({ 
  groups, 
  expandedGroups, 
  showSubgroupInput,
  residents,
  newSubgroupName,
  onToggleGroupExpand,
  onEditGroup,
  onDeleteGroup,
  onToggleSubgroupInput,
  onNewSubgroupNameChange,
  onQuickAddSubgroup,
  onEditSubgroup,
  onDeleteSubgroup,
  onEditResident,
  onDeleteResident,
  getResidentsByGroup,
  getResidentsBySubgroup
}: GroupsSectionProps) {
  
  console.log('GroupsSection rendering with groups:', groups);
  
  return (
    <div className="space-y-4 mb-8">
      {groups && groups.length > 0 ? groups.map(group => (
        <Collapsible 
          key={group.id} 
          open={expandedGroups.includes(group.id)} 
          onOpenChange={() => onToggleGroupExpand(group.id)} 
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
                onClick={e => {
                  e.stopPropagation();
                  onEditGroup(group);
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
                  onDeleteGroup(group);
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
                <ResidentDisplay 
                  residents={getResidentsByGroup(group.id)}
                  groupId={group.id}
                  onEditResident={onEditResident}
                  onDeleteResident={onDeleteResident}
                />
                
                {group.subgroups && group.subgroups.length > 0 && group.subgroups.map(subgroup => (
                  <div key={subgroup.id} className="mt-6">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-gray-700 flex items-center">
                        <div className="w-1 h-6 bg-sanctuary-green mr-2"></div>
                        {subgroup.name}
                        {subgroup.description && <span className="text-sm text-gray-500 ml-2">- {subgroup.description}</span>}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onEditSubgroup(subgroup)} 
                          className="h-7 w-7 text-gray-500"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onDeleteSubgroup(subgroup)} 
                          className="h-7 w-7 text-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    
                    <ResidentDisplay 
                      residents={getResidentsBySubgroup(subgroup.id)}
                      groupId={group.id}
                      subgroupId={subgroup.id}
                      onEditResident={onEditResident}
                      onDeleteResident={onDeleteResident}
                    />
                  </div>
                ))}
                
                {showSubgroupInput === group.id ? (
                  <div className="mt-6 subgroup-input flex items-center gap-2">
                    <Input 
                      placeholder="Subgroup name" 
                      value={newSubgroupName} 
                      onChange={e => onNewSubgroupNameChange(e.target.value)} 
                      className="max-w-xs" 
                    />
                    <Button 
                      onClick={onQuickAddSubgroup} 
                      disabled={!newSubgroupName.trim()}
                      className="bg-sanctuary-green hover:bg-sanctuary-light-green"
                    >
                      Add
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => onToggleSubgroupInput(group.id)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => onToggleSubgroupInput(group.id)} 
                      className="flex items-center gap-2"
                    >
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
          <Button 
            onClick={() => onEditGroup({} as ResidentGroup)} 
            className="flex items-center gap-2 bg-sanctuary-green hover:bg-sanctuary-light-green"
          >
            <Plus className="h-4 w-4" />
            <span>Create your first group</span>
          </Button>
        </div>
      )}
    </div>
  );
}
