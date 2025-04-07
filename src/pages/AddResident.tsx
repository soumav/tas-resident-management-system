
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

// Update the type definition to correctly represent the data structure
type ResidentType = {
  id: number;
  name: string;
  category_id: number;
  category_name?: string;
  resident_categories?: {
    name: string;
  };
};

type ResidentGroup = {
  id: number;
  name: string;
};

type ResidentSubgroup = {
  id: number;
  name: string;
  group_id: number;
};

export default function AddResident() {
  const [name, setName] = useState('');
  const [typeId, setTypeId] = useState<string>('');
  const [groupId, setGroupId] = useState<string>('');
  const [subgroupId, setSubgroupId] = useState<string>('');
  const [arrivalDate, setArrivalDate] = useState<Date | undefined>(new Date());
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [types, setTypes] = useState<ResidentType[]>([]);
  const [groups, setGroups] = useState<ResidentGroup[]>([]);
  const [subgroups, setSubgroups] = useState<ResidentSubgroup[]>([]);
  const [availableSubgroups, setAvailableSubgroups] = useState<ResidentSubgroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Fetch resident types
        const { data: typesData, error: typesError } = await supabase
          .from('resident_types')
          .select(`
            id,
            name,
            category_id,
            resident_categories (name)
          `);
          
        if (typesError) throw typesError;
        
        // Transform the data to match our ResidentType interface
        const formattedTypes: ResidentType[] = (typesData || []).map((type: any) => ({
          id: type.id,
          name: type.name,
          category_id: type.category_id,
          category_name: type.resident_categories?.name,
          resident_categories: type.resident_categories
        }));
        
        setTypes(formattedTypes);
        
        // Fetch resident groups
        const { data: groupsData, error: groupsError } = await supabase
          .from('resident_groups')
          .select('id, name');
          
        if (groupsError) throw groupsError;
        
        // Fetch resident subgroups
        const { data: subgroupsData, error: subgroupsError } = await supabase
          .from('resident_subgroups')
          .select('id, name, group_id');
          
        if (subgroupsError) throw subgroupsError;
        
        // Properly type the data before setting state
        const typedGroupsData = (groupsData || []) as ResidentGroup[];
        const typedSubgroupsData = (subgroupsData || []) as ResidentSubgroup[];
        
        setGroups(typedGroupsData);
        setSubgroups(typedSubgroupsData);
        
      } catch (error) {
        console.error('Error fetching options:', error);
        toast({
          title: 'Error',
          description: 'Failed to load form options',
          variant: 'destructive',
        });
      }
    };
    
    fetchOptions();
  }, [toast]);
  
  // Update available subgroups when group changes
  useEffect(() => {
    if (groupId) {
      const filteredSubgroups = subgroups.filter(subgroup => 
        subgroup.group_id === parseInt(groupId)
      );
      setAvailableSubgroups(filteredSubgroups);
      
      // Reset subgroup selection if the current selection is not in the new group
      if (subgroupId && !filteredSubgroups.some(sg => sg.id.toString() === subgroupId)) {
        setSubgroupId('');
      }
    } else {
      setAvailableSubgroups([]);
      setSubgroupId('');
    }
  }, [groupId, subgroups, subgroupId]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Upload image if present
      let imageUrl = null;
      
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `resident-images/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('resident-images')
          .upload(filePath, image);
          
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data } = supabase.storage
          .from('resident-images')
          .getPublicUrl(filePath);
          
        imageUrl = data.publicUrl;
      }
      
      // Save resident data
      const { error } = await supabase.from('residents').insert({
        name,
        type_id: parseInt(typeId),
        group_id: groupId ? parseInt(groupId) : null,
        subgroup_id: subgroupId ? parseInt(subgroupId) : null,
        arrival_date: arrivalDate?.toISOString(),
        description,
        image_url: imageUrl,
      });
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'New resident has been added',
      });
      
      navigate('/residents');
      
    } catch (error: any) {
      console.error('Error adding resident:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add resident',
        variant: 'destructive',
      });
    }
    
    setIsLoading(false);
  };
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Add New Resident</h2>
        <p className="text-gray-600">Register a new animal to the sanctuary</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Resident Information</h3>
          <p className="text-gray-600 text-sm">Fill in the details about the new sanctuary resident</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                placeholder="Enter resident name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Type of Resident <span className="text-red-500">*</span>
              </label>
              <Select 
                value={typeId} 
                onValueChange={setTypeId}
                required
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label htmlFor="arrival-date" className="block text-sm font-medium text-gray-700 mb-1">
                Date arrived at TAS <span className="text-red-500">*</span>
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="arrival-date"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {arrivalDate ? format(arrivalDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={arrivalDate}
                    onSelect={setArrivalDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label htmlFor="group" className="block text-sm font-medium text-gray-700 mb-1">
                Group
              </label>
              <Select 
                value={groupId} 
                onValueChange={setGroupId}
              >
                <SelectTrigger id="group">
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {groupId && (
              <div>
                <label htmlFor="subgroup" className="block text-sm font-medium text-gray-700 mb-1">
                  Subgroup
                </label>
                <Select 
                  value={subgroupId} 
                  onValueChange={setSubgroupId}
                  disabled={availableSubgroups.length === 0}
                >
                  <SelectTrigger id="subgroup">
                    <SelectValue placeholder={availableSubgroups.length > 0 ? "Select a subgroup" : "No subgroups available"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubgroups.map((subgroup) => (
                      <SelectItem key={subgroup.id} value={subgroup.id.toString()}>
                        {subgroup.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="Enter details about this resident"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
          </div>
          
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="flex flex-col items-center">
                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-gray-600 mb-2">Drag & drop an image here, or click to browse</p>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image')?.click()}
                >
                  Choose File
                </Button>
                {image && (
                  <p className="mt-2 text-sm text-gray-600">Selected: {image.name}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-sanctuary-green hover:bg-sanctuary-light-green"
              disabled={isLoading}
            >
              {isLoading ? 'Adding Resident...' : 'Add Resident'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
