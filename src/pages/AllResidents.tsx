
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { PlusCircle, Search, Info, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { Resident } from '@/lib/supabase';

export default function AllResidents() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [filteredResidents, setFilteredResidents] = useState<Resident[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [types, setTypes] = useState<{id: number, name: string}[]>([]);
  
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
  
  const handleViewResident = (resident: Resident) => {
    setSelectedResident(resident);
    setIsDialogOpen(true);
  };
  
  const handleEditResident = (resident: Resident) => {
    navigate(`/residents/edit/${resident.id}`);
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
  
  // Group residents by type for display
  const residentsByType: Record<string, Resident[]> = {};
  
  filteredResidents.forEach(resident => {
    const typeName = resident.type?.name || 'Uncategorized';
    if (!residentsByType[typeName]) {
      residentsByType[typeName] = [];
    }
    residentsByType[typeName].push(resident);
  });
  
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
      
      {/* Confirm Delete Dialog */}
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
      
      {/* Resident details dialog */}
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
    </div>
  );
}
