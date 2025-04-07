import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { PlusCircle, Search, Info, Edit, Trash2, CalendarIcon, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { Resident } from '@/lib/supabase';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";

export default function AllResidents() {
  
  const [residents, setResidents] = useState<Resident[]>([]);
  const [filteredResidents, setFilteredResidents] = useState<Resident[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [types, setTypes] = useState<{id: number, name: string}[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const fetchResidents = async () => {
    try {
      const { data, error } = await supabase
        .from('residents')
        .select(`
          *,
          type:resident_types (
            id, 
            name,
            category:resident_categories (
              id,
              name
            )
          ),
          group:resident_groups (id, name, description),
          subgroup:resident_subgroups (id, name, description)
        `);
        
      if (error) throw error;
      
      setResidents(data || []);
      setFilteredResidents(data || []);
      
    } catch (error) {
      console.error('Error fetching residents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load residents data',
        variant: 'destructive',
      });
    }
  };
  
  const fetchTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('resident_types')
        .select('id, name');
        
      if (error) throw error;
      setTypes(data || []);
      
    } catch (error) {
      console.error('Error fetching types:', error);
    }
  };
  
  useEffect(() => {
    fetchResidents();
    fetchTypes();
  }, [toast]);
  
  useEffect(() => {
    let filtered = [...residents];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(resident => 
        resident.name.toLowerCase().includes(query)
      );
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(resident => 
        resident.type?.name === typeFilter
      );
    }
    
    setFilteredResidents(filtered);
  }, [searchQuery, typeFilter, residents]);
  
  const [editResidentData, setEditResidentData] = useState({
    name: '',
    description: '',
    image_url: '',
    arrival_date: null as Date | null,
    group_id: null as number | null,
    subgroup_id: null as number | null
  });
  
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
  
  const handleViewResident = (resident: Resident) => {
    setSelectedResident(resident);
    setIsDialogOpen(true);
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
      
      // Handle file upload if a new file is selected
      if (selectedFile) {
        try {
          // Check if bucket exists and create it if it doesn't
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
          
          // Upload the file
          const fileExt = selectedFile.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('resident-images')
            .upload(filePath, selectedFile);
            
          if (uploadError) throw uploadError;
          
          // Get the public URL
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
      
      console.log('Updating resident with data:', residentData);
      
      const { error, data: updatedResident } = await supabase
        .from('residents')
        .update(residentData)
        .eq('id', selectedResident.id)
        .select();
      
      if (error) {
        console.error('Update error:', error);
        throw error;
      }
      
      console.log('Update successful, response:', updatedResident);
      
      toast({
        title: 'Resident updated',
        description: `${editResidentData.name} has been updated successfully`
      });
      
      fetchResidents();
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
  
  const handleDeleteResident = async (id: string) => {
    try {
      const { error } = await supabase
        .from('residents')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: 'Resident deleted',
        description: 'The resident has been removed from the system',
      });
      
      setIsDialogOpen(false);
      setIsDeleteConfirmOpen(false);
      fetchResidents(); // Refresh data
      
    } catch (error: any) {
      console.error('Error deleting resident:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete resident',
        variant: 'destructive',
      });
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const residentsByType: Record<string, Resident[]> = {};
  
  filteredResidents.forEach(resident => {
    const typeName = resident.type?.name || 'Uncategorized';
    if (!residentsByType[typeName]) {
      residentsByType[typeName] = [];
    }
    residentsByType[typeName].push(resident);
  });
  
  const [isEditResidentDialogOpen, setIsEditResidentDialogOpen] = useState(false);

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">All Residents</h2>
          <p className="text-gray-600">Manage and view all sanctuary residents</p>
        </div>
        
        <Link to="/residents/new">
          <Button className="bg-sanctuary-green hover:bg-sanctuary-light-green">
            <PlusCircle className="h-4 w-4 mr-2" /> Add New Resident
          </Button>
        </Link>
      </div>
      
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search residents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {types.map(type => (
              <SelectItem key={type.id} value={type.name}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {Object.entries(residentsByType).length > 0 ? (
        Object.entries(residentsByType).map(([typeName, typeResidents]) => (
          <div key={typeName} className="mb-8">
            <h3 className="text-xl font-medium mb-4">{typeName}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {typeResidents.map((resident) => (
                <Card key={resident.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div 
                    className="h-40 bg-gray-200 flex items-center justify-center"
                    style={resident.image_url ? { backgroundImage: `url(${resident.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                  >
                    {!resident.image_url && (
                      <div className="text-gray-400 flex flex-col items-center">
                        <Info className="h-8 w-8 mb-2" />
                        <span>No Image</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-lg">{resident.name}</h4>
                        <p className="text-sm text-gray-500">
                          {resident.type?.name}
                          {resident.group && ` • ${resident.group.name}`}
                          {resident.subgroup && ` > ${resident.subgroup.name}`}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewResident(resident)}
                        >
                          <Info className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditResident(resident)}
                        >
                          <Edit className="h-5 w-5 text-blue-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedResident(resident);
                            setIsDeleteConfirmOpen(true);
                          }}
                        >
                          <Trash2 className="h-5 w-5 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="mb-4 text-gray-400">
            <Info className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-xl font-medium mb-2">No residents found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || typeFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Start by adding a resident to your sanctuary'}
          </p>
          
          <Link to="/residents/new">
            <Button className="bg-sanctuary-green hover:bg-sanctuary-light-green">
              <PlusCircle className="h-4 w-4 mr-2" /> Add New Resident
            </Button>
          </Link>
        </div>
      )}
      
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Resident</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedResident?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedResident && handleDeleteResident(selectedResident.id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedResident && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {selectedResident.name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div 
                    className="aspect-square bg-gray-200 rounded-md flex items-center justify-center mb-4"
                    style={selectedResident.image_url ? { backgroundImage: `url(${selectedResident.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                  >
                    {!selectedResident.image_url && (
                      <div className="text-gray-400 flex flex-col items-center">
                        <Info className="h-8 w-8 mb-2" />
                        <span>No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <Button variant="outline" className="mr-2" onClick={() => handleEditResident(selectedResident)}>
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-500 border-red-200 hover:bg-red-50"
                      onClick={() => setIsDeleteConfirmOpen(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                  </div>
                </div>
                
                <div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-500">Name</h4>
                      <p>{selectedResident.name}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-500">Type of Resident</h4>
                      <p>{selectedResident.type?.name}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-500">Group</h4>
                      <p>{selectedResident.group?.name || 'No group assigned'}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-500">Subgroup</h4>
                      <p>{selectedResident.subgroup?.name || 'No subgroup assigned'}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-500">Description</h4>
                      <p>{selectedResident.description || 'No description available.'}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-500">Date Added</h4>
                      <p>{formatDate(selectedResident.created_at)}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-500">Date Arrived at TAS</h4>
                      <p>{selectedResident.arrival_date ? formatDate(selectedResident.arrival_date) : 'Unknown'}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-500">Messages</h4>
                      <p className="text-gray-400 italic">No messages yet.</p>
                      
                      <div className="mt-2 flex">
                        <Input placeholder="Add a message..." className="flex-1 mr-2" />
                        <Button size="sm" className="bg-sanctuary-green hover:bg-sanctuary-light-green">
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditResidentDialogOpen} onOpenChange={setIsEditResidentDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Resident</DialogTitle>
            <DialogDescription>
              Make changes to {selectedResident?.name}'s information
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="resident-name" className="text-sm font-medium">
                Name
              </label>
              <Input 
                id="resident-name" 
                value={editResidentData.name} 
                onChange={e => setEditResidentData({...editResidentData, name: e.target.value})}
                placeholder="Enter resident name" 
              />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Image
              </label>
              <div className="flex flex-col space-y-3">
                {previewUrl && (
                  <div className="relative w-full h-40 bg-gray-100 rounded-md overflow-hidden">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                )}
                <div className="flex items-center">
                  <label 
                    htmlFor="image-upload" 
                    className={`flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer bg-white text-sm ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {selectedFile ? 'Change Image' : 'Upload Image'}
                    <Input 
                      id="image-upload"
                      type="file" 
                      accept="image/*" 
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={isLoading}
                    />
                  </label>
                  {selectedFile && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="ml-2"
                      onClick={resetFileInput}
                      disabled={isLoading}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="resident-description" className="text-sm font-medium">
                Description (Optional)
              </label>
              <Textarea 
                id="resident-description" 
                value={editResidentData.description} 
                onChange={e => setEditResidentData({...editResidentData, description: e.target.value})}
                placeholder="Enter description" 
                rows={3} 
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="resident-arrival" className="text-sm font-medium">
                Arrival Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !editResidentData.arrival_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editResidentData.arrival_date ? format(editResidentData.arrival_date, "PPP") : <span>Pick a date</span>}
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
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditResidentDialogOpen(false);
              resetFileInput();
            }} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              className="bg-sanctuary-green hover:bg-sanctuary-light-green" 
              onClick={handleEditResidentSubmit} 
              disabled={!editResidentData.name.trim() || isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
