
import React from 'react';
import { Card } from '@/components/ui/card';
import { Users, ListIcon } from 'lucide-react';
import { Resident, ResidentGroup } from '@/lib/supabase';

interface StatCardsProps {
  residents: Resident[];
  groups: ResidentGroup[];
  residentsByType: Record<string, number>;
}

export function StatCards({ residents, groups, residentsByType }: StatCardsProps) {
  const getGroupsCount = () => {
    if (!groups) return { groups: 0, subgroups: 0 };
    
    return {
      groups: groups.length,
      subgroups: groups.reduce((total, group) => total + (group.subgroups?.length || 0), 0)
    };
  };

  const getTopResidentTypes = () => {
    if (!residentsByType) return [];
    return Object.entries(residentsByType).sort(([, countA], [, countB]) => countB - countA);
  };

  const getResidentTypeEmoji = (typeName: string) => {
    const type = typeName.toLowerCase();
    
    if (type.includes('cat')) return '🐱';
    if (type.includes('dog')) return '🐶';
    if (type.includes('cow')) return '🐮';
    if (type.includes('goat')) return '🐐';
    if (type.includes('sheep')) return '🐑';
    if (type.includes('horse')) return '🐴';
    if (type.includes('pig')) return '🐷';
    if (type.includes('chicken')) return '🐔';
    if (type.includes('duck')) return '🦆';
    if (type.includes('bird')) return '🐦';
    if (type.includes('fish')) return '🐠';
    if (type.includes('rabbit')) return '🐰';
    if (type.includes('turtle')) return '🐢';
    
    return '🐾'; // Default is now a paw emoji
  };

  // Calculate the resident count safely
  const residentCount = residents?.length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="p-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg text-gray-500 font-medium mb-1">Total Residents</h3>
          <p className="text-4xl font-bold">{residentCount}</p>
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
        const emoji = getResidentTypeEmoji(typeName);
        const percentage = residentCount > 0 ? Math.round(count / residentCount * 100) : 0;
        return (
          <Card key={typeName} className="p-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg text-gray-500 font-medium mb-1">{typeName}</h3>
              <p className="text-4xl font-bold">{count}</p>
              <p className="text-sm text-gray-500">{percentage}% of residents</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-2xl">{emoji}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
