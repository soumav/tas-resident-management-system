
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Resident, ResidentGroup, ResidentSubgroup, ResidentType } from '@/lib/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  resident: Resident;
  residentTypes: ResidentType[];
  groups: ResidentGroup[];
  subgroups: ResidentSubgroup[];
  onSave: (updatedResident: any) => void;
  onOpenChange: (open: boolean) => void;
}

export function EditResidentDialog({
  open,
  resident,
  residentTypes,
  groups,
  subgroups,
  onSave,
  onOpenChange
}: EditResidentDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<EditResidentFormData>({
    name: resident?.name || '',
    description: resident?.description || '',
    image_url: resident?.image_url || '',
    arrival_date: resident?.arrival_date ? new Date(resident.arrival_date) : null,
    group_id: resident?.group_id || null,
    subgroup_id: resident?.subgroup_id || null
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(resident?.image_url || null);
  
  useEffect(() => {
    if (resident) {
      setFormData({
        name: resident.name || '',
        description: resident.description || '',
        image_url: resident.image_url || '',
        arrival_date: resident.arrival_date ? new Date(resident.arrival_date) : null,
        group_id: resident.group_id || null,
        subgroup_id: resident.subgroup_id || null
      });
      setPreviewUrl(resident.image_url || null);
    }
  }, [resident]);
  
  const handleFormChange = (data: Partial<EditResidentFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result as string);
    };
    fileReader.readAsDataURL(file);
  };
  
  const resetFileInput = () => {
    setSelectedFile(null);
    setPreviewUrl(resident?.image_url || null);
  };
  
  const handleSubmit = () => {
    setIsLoading(true);
    // In a real implementation, we would upload the file and update the resident
    // For now, just simulate a delay and call onSave
    setTimeout(() => {
      onSave({
        ...resident,
        ...formData
      });
      setIsLoading(false);
    }, 500);
  };
  
  const selectedGroup = formData.group_id 
    ? groups.find(g => g.id === formData.group_id) 
    : null;
    
  const hasSubgroups = selectedGroup?.subgroups && selectedGroup.subgroups.length > 0;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              onChange={e => handleFormChange({ name: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="resident-description">Description</label>
            <Input 
              id="resident-description" 
              placeholder="Enter description" 
              value={formData.description} 
              onChange={e => handleFormChange({ description: e.target.value })}
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
                  onSelect={(date) => handleFormChange({ arrival_date: date })}
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
                    key={`preview-${new Date().getTime()}`}
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
            <Select
              value={formData.group_id ? formData.group_id.toString() : ""}
              onValueChange={(value) => {
                if (value === "placeholder" || value === "") {
                  handleFormChange({
                    group_id: null,
                    subgroup_id: null
                  });
                } else {
                  const groupId = parseInt(value, 10);
                  handleFormChange({
                    group_id: groupId,
                    subgroup_id: null // Reset subgroup when group changes
                  });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="placeholder" disabled>Select</SelectItem>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id.toString()}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {formData.group_id && hasSubgroups && (
            <div className="grid gap-2">
              <label htmlFor="resident-subgroup">Subgroup (optional)</label>
              <Select
                value={formData.subgroup_id ? formData.subgroup_id.toString() : ""}
                onValueChange={(value) => {
                  if (value === "placeholder" || value === "") {
                    handleFormChange({
                      subgroup_id: null
                    });
                  } else {
                    const subgroupId = parseInt(value, 10);
                    handleFormChange({
                      subgroup_id: subgroupId
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subgroup (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="placeholder">None - Main group only</SelectItem>
                  {selectedGroup?.subgroups?.map((subgroup) => (
                    <SelectItem key={subgroup.id} value={subgroup.id.toString()}>
                      {subgroup.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!formData.name.trim() || isLoading}>
            {isLoading ? 'Updating...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
