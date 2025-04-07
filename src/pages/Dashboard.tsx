
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Camera, 
  ListIcon, 
  PlusCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

type StatCard = {
  title: string;
  value: number;
  description: string;
  icon: React.ComponentType<any>;
}

type ResidentGroup = {
  id: number;
  name: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [totalResidents, setTotalResidents] = useState(0);
  const [residentTypes, setResidentTypes] = useState<{[key: string]: number}>({});
  const [totalGroups, setTotalGroups] = useState(0);
  const [groups, setGroups] = useState<ResidentGroup[]>([]);
  
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
        typesData?.forEach(item => {
          const typeName = item.type?.name;
          if (typeName) {
            typeCounter[typeName] = (typeCounter[typeName] || 0) + 1;
          }
        });
        
        setResidentTypes(typeCounter);
        
        // Get groups data
        const { data: groupsData, count: groupsCount, error: groupsError } = await supabase
          .from('resident_groups')
          .select('*', { count: 'exact' });
          
        if (groupsError) throw groupsError;
        setTotalGroups(groupsCount || 0);
        setGroups(groupsData || []);
        
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
      description: `${Math.round((count / totalResidents) * 100)}% of residents`,
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
          <div 
            key={group.id}
            className="border rounded-lg p-4 mb-3 hover:bg-gray-50 transition-colors flex justify-between items-center"
          >
            <button className="flex items-center gap-2 text-left w-full">
              <span className="font-medium">{group.name}</span>
            </button>
            
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
