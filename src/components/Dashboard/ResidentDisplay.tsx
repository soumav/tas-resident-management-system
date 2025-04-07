
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Plus } from 'lucide-react';
import { Resident } from '@/lib/supabase';

interface ResidentDisplayProps {
  residents: Resident[];
  groupId?: number;
  subgroupId?: number;
  onEditResident: (resident: Resident) => void;
  onDeleteResident: (resident: Resident) => void;
}

export function ResidentDisplay({ 
  residents, 
  groupId, 
  subgroupId, 
  onEditResident, 
  onDeleteResident 
}: ResidentDisplayProps) {
  return (
    <div className="resident-grid">
      {residents.map(resident => (
        <div key={resident.id} className="resident-item">
          <div className="resident-image">
            {resident.image_url ? (
              <img src={resident.image_url} alt={resident.name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-gray-400 text-xs">No Image</div>
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
      ))}
      
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
