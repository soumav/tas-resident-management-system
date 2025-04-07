
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ResidentGroup } from '@/lib/supabase';

interface EditResidentFormData {
  name: string;
  description: string;
  image_url: string;
  arrival_date: Date | null;
  group_id: number | null;
  subgroup_id: number | null;
}

interface EditResidentDialogProps {
  open: boolean;
  groups: ResidentGroup[];
  isLoading: boolean;
  formData: EditResidentFormData;
  previewUrl: string | null;
  selectedFile: File | null;
  onClose: () => void;
  onSubmit: () => void;
  onFormChange: (data: Partial<EditResidentFormData>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resetFileInput: () => void;
}

export function EditResidentDialog({
  open,
  groups,
  isLoading,
  formData,
  previewUrl,
  selectedFile,
  onClose,
  onSubmit,
  onFormChange,
  onFileChange,
  resetFileInput
}: EditResidentDialogProps) {
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
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
              value={formData.name} 
              onChange={e => onFormChange({ name: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="resident-description">Description</label>
            <Input 
              id="resident-description" 
              placeholder="Enter description" 
              value={formData.description} 
              onChange={e => onFormChange({ description: e.target.value })}
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
                    !formData.arrival_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.arrival_date ? format(formData.arrival_date, "PPP") : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.arrival_date || undefined}
                  onSelect={(date) => onFormChange({ arrival_date: date })}
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
                    onChange={onFileChange}
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
              value={formData.group_id || ''}
              onChange={(e) => {
                const groupId = e.target.value ? Number(e.target.value) : null;
                onFormChange({
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
          
          {formData.group_id && (
            <div className="grid gap-2">
              <label htmlFor="resident-subgroup">Subgroup</label>
              <select
                id="resident-subgroup"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={formData.subgroup_id || ''}
                onChange={(e) => {
                  const subgroupId = e.target.value ? Number(e.target.value) : null;
                  onFormChange({
                    subgroup_id: subgroupId
                  });
                }}
              >
                <option value="">No Subgroup</option>
                {groups
                  .find(g => g.id === formData.group_id)
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
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onSubmit} disabled={!formData.name.trim() || isLoading}>
            {isLoading ? 'Updating...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
