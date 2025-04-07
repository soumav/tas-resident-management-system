
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Camera, 
  ListIcon, 
  PlusCircle,
  ChevronDown,
  ChevronUp,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

type StatCard = {
  title: string;
  value: number;
  description: string;
  icon: React.ComponentType<any>;
}

type ResidentGroup = {
  id: number;
  name: string;
  description?: string;
  subgroups?: ResidentSubgroup[];
}

type ResidentSubgroup = {
  id: number;
  name: string;
  description?: string;
  group_id: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [totalResidents, setTotalResidents] = useState(0);
  const [residentTypes, setResidentTypes] = useState<{[key: string]: number}>({});
  const [totalGroups, setTotalGroups] = useState(0);
  const [groups, setGroups] = useState<ResidentGroup[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<number[]>([]);
  
  // Dialog states
  const [isAddSubgroupDialogOpen, setIsAddSubgroupDialogOpen] = useState(false);
  const [newSubgroupName, setNewSubgroupName] = useState('');
  const [newSubgroupDescription, setNewSubgroupDescription] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get total residents count
        const { count: residentsCount, error: residentsError } = await supabase
          .from('residents')
          .select('*', { count: 'exact', head: true });
        
        if (residentsError) throw residentsError;
        setTotalResidents(residentsCount || 0);
        
        // Get resident types with count
        const { data: typesData, error: typesError } = await supabase
          .from('residents')
          .select(`
            type:resident_types (
              id,
              name
            )
          `);
          
        if (typesError) throw typesError;
        
        // Count occurrences of each type
        const typeCounter: {[key: string]: number} = {};
        typesData?.forEach((item: any) => {
          // Ensure we check if type exists and has a name property
          const typeName = item.type?.name;
          if (typeName) {
            typeCounter[typeName] = (typeCounter[typeName] || 0) + 1;
          }
        });
        
        setResidentTypes(typeCounter);
        
        // Get groups data with subgroups
        const { data: groupsData, count: groupsCount, error: groupsError } = await supabase
          .from('resident_groups')
          .select('*', { count: 'exact' });
          
        if (groupsError) throw groupsError;
        setTotalGroups(groupsCount || 0);
        
        // Get subgroups data
        const { data: subgroupsData, error: subgroupsError } = await supabase
          .from('resident_subgroups')
          .select('*');
          
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
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Prepare stat cards
  const statCards: StatCard[] = [
    {
      title: 'Total Residents',
      value: totalResidents,
      description: 'Animals in the sanctuary',
      icon: Camera
    }
  ];
  
  // Add type-specific cards
  Object.entries(residentTypes).forEach(([type, count]) => {
    statCards.push({
      title: type,
      value: count,
      description: `${Math.round((count / (totalResidents || 1)) * 100)}% of residents`,
      icon: Camera
    });
  });
  
  // Add groups card
  statCards.push({
    title: 'Groups',
    value: totalGroups,
    description: 'Groups of residents',
    icon: ListIcon
  });
  
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
  
  // Open dialog to add a subgroup
  const openAddSubgroupDialog = (groupId: number) => {
    setSelectedGroupId(groupId);
    setNewSubgroupName('');
    setNewSubgroupDescription('');
    setIsAddSubgroupDialogOpen(true);
  };
  
  // Handle add subgroup form submission
  const handleAddSubgroup = async () => {
    if (!selectedGroupId || !newSubgroupName.trim()) return;
    
    try {
      const { data, error } = await supabase.from('resident_subgroups').insert({
        name: newSubgroupName.trim(),
        description: newSubgroupDescription.trim() || null,
        group_id: selectedGroupId
      }).select();
      
      if (error) throw error;
      
      // Update the UI
      setGroups(prevGroups => {
        return prevGroups.map(group => {
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
        });
      });
      
      // Close dialog and show success message
      setIsAddSubgroupDialogOpen(false);
      toast({
        title: 'Subgroup added',
        description: `"${newSubgroupName}" has been added successfully.`
      });
      
    } catch (error) {
      console.error('Error adding subgroup:', error);
      toast({
        title: 'Error',
        description: 'Failed to add subgroup.',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2 text-gray-800">Welcome, {user?.email?.split('@')[0]}!</h2>
          <p className="text-gray-600">Manage your sanctuary residents and groups</p>
        </div>
        
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 border-sanctuary-green text-sanctuary-green"
            asChild
          >
            <Link to="/resident-types">
              <Camera className="h-4 w-4" />
              <span>Manage Types of Residents</span>
            </Link>
          </Button>
          
          <Button 
            className="flex items-center gap-2 bg-sanctuary-green hover:bg-sanctuary-light-green"
            asChild
          >
            <Link to="/residents/new">
              <PlusCircle className="h-4 w-4" />
              <span>Add New Resident</span>
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {statCards.map((card, index) => (
          <Card key={index} className="shadow-sm">
            <CardContent className="p-6 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-700">{card.title}</h3>
                <div className="mt-2 flex items-baseline">
                  <p className="text-4xl font-semibold text-gray-900">{card.value}</p>
                </div>
                <p className="mt-1 text-sm text-gray-500">{card.description}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-full">
                <card.icon className="h-6 w-6 text-sanctuary-green" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Resident Groups</h3>
        
        {groups.map((group) => (
          <div key={group.id} className="mb-4">
            <div
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors flex justify-between items-center cursor-pointer"
              onClick={() => toggleGroupExpand(group.id)}
            >
              <div className="flex items-center gap-2 text-left w-full">
                {expandedGroups.includes(group.id) ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
                <span className="font-medium">{group.name}</span>
                {group.description && (
                  <span className="text-sm text-gray-500">- {group.description}</span>
                )}
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-gray-500"
                onClick={(e) => {
                  e.stopPropagation();
                  openAddSubgroupDialog(group.id);
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Subgroups display when expanded */}
            {expandedGroups.includes(group.id) && (
              <div className="pl-8 mt-2 space-y-2">
                {group.subgroups && group.subgroups.length > 0 ? (
                  group.subgroups.map((subgroup) => (
                    <div 
                      key={subgroup.id}
                      className="border-l-2 border-gray-200 pl-4 py-2 flex justify-between items-center"
                    >
                      <div>
                        <span className="font-medium">{subgroup.name}</span>
                        {subgroup.description && (
                          <span className="text-sm text-gray-500 ml-2">- {subgroup.description}</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 italic pl-4 py-2">
                    No subgroups yet. Add one using the + button.
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
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
    </div>
  );
}
