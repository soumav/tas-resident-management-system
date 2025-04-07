
import React from 'react';
import { Card } from '@/components/ui/card';
import { Users, ListIcon, Cat, Dog, Fish, Bird, Apple, Cow } from 'lucide-react';
import { Resident, ResidentGroup } from '@/lib/supabase';

interface StatCardsProps {
  residents: Resident[];
  groups: ResidentGroup[];
  residentsByType: Record<string, number>;
}

export function StatCards({ residents, groups, residentsByType }: StatCardsProps) {
  const getGroupsCount = () => {
    return {
      groups: groups.length,
      subgroups: groups.reduce((total, group) => total + (group.subgroups?.length || 0), 0)
    };
  };

  const getTopResidentTypes = () => {
    return Object.entries(residentsByType).sort(([, countA], [, countB]) => countB - countA);
  };

  const getResidentTypeIcon = (typeName: string) => {
    const type = typeName.toLowerCase();
    
    if (type.includes('cat')) return Cat;
    if (type.includes('dog')) return Dog;
    if (type.includes('cow')) return Cow;
    if (type.includes('fish')) return Fish;
    if (type.includes('bird') || type.includes('chicken') || type.includes('duck')) return Bird;
    
    return Apple; // Default icon
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="p-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg text-gray-500 font-medium mb-1">Total Residents</h3>
          <p className="text-4xl font-bold">{residents.length}</p>
          <p className="text-sm text-gray-500">Animals in the sanctuary</p>
        </div>
        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
          <Users className="h-6 w-6 text-gray-600" />
        </div>
      </Card>
      
      <Card className="p-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg text-gray-500 font-medium mb-1">Groups</h3>
          <p className="text-4xl font-bold">{getGroupsCount().groups}</p>
          <p className="text-sm text-gray-500">{getGroupsCount().subgroups} subgroups</p>
        </div>
        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
          <ListIcon className="h-6 w-6 text-gray-600" />
        </div>
      </Card>
      
      {getTopResidentTypes().map(([typeName, count]) => {
        const TypeIcon = getResidentTypeIcon(typeName);
        const percentage = residents.length > 0 ? Math.round(count / residents.length * 100) : 0;
        return (
          <Card key={typeName} className="p-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg text-gray-500 font-medium mb-1">{typeName}</h3>
              <p className="text-4xl font-bold">{count}</p>
              <p className="text-sm text-gray-500">{percentage}% of residents</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
              <TypeIcon className="h-6 w-6 text-gray-600" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
