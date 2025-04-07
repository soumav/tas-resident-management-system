
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Plus } from 'lucide-react';
import { Resident } from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ResidentDisplayProps {
  residents: Resident[];
  groupId?: number;
  subgroupId?: number;
  onEditResident: (resident: Resident) => void;
  onDeleteResident: (resident: Resident) => void;
}

// Function to determine which emoji to use based on resident type
const getResidentEmoji = (residentType: string | undefined) => {
  if (!residentType) return '🍎';
  
  const type = residentType.toLowerCase();
  
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
  
  return '🍎'; // Default icon
};

export function ResidentDisplay({ 
  residents, 
  groupId, 
  subgroupId, 
  onEditResident, 
  onDeleteResident 
}: ResidentDisplayProps) {
  return (
    <div className="resident-grid">
      {residents.map(resident => {
        const emoji = getResidentEmoji(resident.type?.name);
        
        return (
          <div key={resident.id} className="resident-item">
            <div className="resident-image">
              {resident.image_url ? (
                <img src={resident.image_url} alt={resident.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <span className="text-4xl">{emoji}</span>
                </div>
              )}
            </div>
            <div className="p-2 text-center">
              <p className="font-medium truncate">{resident.name}</p>
              <div className="flex justify-center gap-1 mt-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditResident(resident);
                  }}
                >
                  <Edit className="h-3 w-3 text-blue-500" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteResident(resident);
                  }}
                >
                  <Trash2 className="h-3 w-3 text-red-500" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
      
      <Link to={`/residents/new${groupId ? `?group=${groupId}${subgroupId ? `&subgroup=${subgroupId}` : ''}` : ''}`} 
            className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center aspect-square hover:border-gray-400 transition-colors">
        <div className="flex flex-col items-center text-gray-500">
          <Plus className="h-6 w-6" />
          <span className="text-sm">Add Animal</span>
        </div>
      </Link>
    </div>
  );
}
