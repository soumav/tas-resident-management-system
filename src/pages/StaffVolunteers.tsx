import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: string;
};
type Volunteer = {
  id: string;
  name: string;
  email: string;
  volunteer_type: string;
};
export default function StaffVolunteers() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);
  const [isVolunteerDialogOpen, setIsVolunteerDialogOpen] = useState(false);

  // New staff form state
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('');

  // New volunteer form state
  const [newVolunteerName, setNewVolunteerName] = useState('');
  const [newVolunteerEmail, setNewVolunteerEmail] = useState('');
  const [newVolunteerType, setNewVolunteerType] = useState('');
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuth();
  useEffect(() => {
    const fetchPeople = async () => {
      try {
        // Fetch staff members
        const {
          data: staffData,
          error: staffError
        } = await supabase.from('staff').select('id, name, email, role');
        if (staffError) throw staffError;
        setStaff(staffData || []);

        // Fetch volunteers
        const {
          data: volunteersData,
          error: volunteersError
        } = await supabase.from('volunteers').select('id, name, email, volunteer_type');
        if (volunteersError) throw volunteersError;
        setVolunteers(volunteersData || []);
      } catch (error) {
        console.error('Error fetching people:', error);
        toast({
          title: 'Error',
          description: 'Failed to load staff and volunteers',
          variant: 'destructive'
        });
      }
    };
    fetchPeople();
  }, [toast]);
  const handleAddStaff = async () => {
    try {
      const {
        error
      } = await supabase.from('staff').insert({
        name: newStaffName,
        email: newStaffEmail,
        role: newStaffRole,
        user_id: user?.id || null
      });
      if (error) throw error;
      toast({
        title: 'Success',
        description: 'Staff member added successfully'
      });

      // Reset form and refresh data
      setNewStaffName('');
      setNewStaffEmail('');
      setNewStaffRole('');
      setIsStaffDialogOpen(false);

      // Refresh staff list
      const {
        data,
        error: fetchError
      } = await supabase.from('staff').select('id, name, email, role');
      if (fetchError) throw fetchError;
      setStaff(data || []);
    } catch (error: any) {
      console.error('Error adding staff:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add staff member',
        variant: 'destructive'
      });
    }
  };
  const handleAddVolunteer = async () => {
    try {
      const {
        error
      } = await supabase.from('volunteers').insert({
        name: newVolunteerName,
        email: newVolunteerEmail,
        volunteer_type: newVolunteerType
      });
      if (error) throw error;
      toast({
        title: 'Success',
        description: 'Volunteer added successfully'
      });

      // Reset form and refresh data
      setNewVolunteerName('');
      setNewVolunteerEmail('');
      setNewVolunteerType('');
      setIsVolunteerDialogOpen(false);

      // Refresh volunteers list
      const {
        data,
        error: fetchError
      } = await supabase.from('volunteers').select('id, name, email, volunteer_type');
      if (fetchError) throw fetchError;
      setVolunteers(data || []);
    } catch (error: any) {
      console.error('Error adding volunteer:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add volunteer',
        variant: 'destructive'
      });
    }
  };
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  return <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Staff & Volunteers</h2>
        <p className="text-gray-600">Manage the people who help run the sanctuary</p>
      </div>
      
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-medium">Staff Members</h3>
            <Dialog open={isStaffDialogOpen} onOpenChange={setIsStaffDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-sanctuary-green hover:bg-sanctuary-light-green">
                  <PlusCircle className="h-4 w-4 mr-2" /> Add Staff
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Staff Member</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="staff-name" className="text-sm font-medium">
                      Name
                    </label>
                    <Input id="staff-name" value={newStaffName} onChange={e => setNewStaffName(e.target.value)} placeholder="Enter staff name" />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="staff-email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input id="staff-email" type="email" value={newStaffEmail} onChange={e => setNewStaffEmail(e.target.value)} placeholder="Enter email address" />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="staff-role" className="text-sm font-medium">
                      Role
                    </label>
                    <Select value={newStaffRole} onValueChange={setNewStaffRole}>
                      <SelectTrigger id="staff-role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Administrator">Administrator</SelectItem>
                        <SelectItem value="Veterinarian">Veterinarian</SelectItem>
                        <SelectItem value="Caretaker">Caretaker</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsStaffDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddStaff} className="bg-sanctuary-green hover:bg-sanctuary-light-green">
                    Add Staff Member
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="space-y-4">
            {staff.map(person => <div key={person.id} className="flex items-center p-4 bg-gray-50 rounded-md">
                <div className="flex-shrink-0 w-10 h-10 bg-sanctuary-green text-white rounded-full flex items-center justify-center mr-4">
                  <span>{getInitials(person.name)}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{person.name}</h4>
                  <p className="text-gray-500 text-sm">{person.email}</p>
                </div>
                <div className="bg-gray-100 px-3 py-1 rounded text-sm">
                  {person.role}
                </div>
              </div>)}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-medium">Volunteers</h3>
              <p className="text-sm text-gray-500">People who donate their time to help the sanctuary</p>
            </div>
            <Dialog open={isVolunteerDialogOpen} onOpenChange={setIsVolunteerDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-sanctuary-green hover:bg-sanctuary-light-green">
                  <PlusCircle className="h-4 w-4 mr-2" /> Add Volunteer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Volunteer</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="volunteer-name" className="text-sm font-medium">
                      Name
                    </label>
                    <Input id="volunteer-name" value={newVolunteerName} onChange={e => setNewVolunteerName(e.target.value)} placeholder="Enter volunteer name" />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="volunteer-email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input id="volunteer-email" type="email" value={newVolunteerEmail} onChange={e => setNewVolunteerEmail(e.target.value)} placeholder="Enter email address" />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="volunteer-type" className="text-sm font-medium">
                      Volunteer Type
                    </label>
                    <Select value={newVolunteerType} onValueChange={setNewVolunteerType}>
                      <SelectTrigger id="volunteer-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Weekend Volunteer">Weekend Volunteer</SelectItem>
                        <SelectItem value="Feeding Volunteer">Feeding Volunteer</SelectItem>
                        <SelectItem value="Cleaning Volunteer">Cleaning Volunteer</SelectItem>
                        <SelectItem value="Event Volunteer">Event Volunteer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsVolunteerDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddVolunteer} className="bg-sanctuary-green hover:bg-sanctuary-light-green">
                    Add Volunteer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="space-y-4">
            {volunteers.map(person => <div key={person.id} className="flex items-center p-4 bg-gray-50 rounded-md">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-300 text-gray-700 rounded-full flex items-center justify-center mr-4">
                  <span>{getInitials(person.name)}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{person.name}</h4>
                  <p className="text-gray-500 text-sm">{person.email}</p>
                </div>
                <div className="bg-gray-100 px-3 py-1 rounded text-sm">
                  {person.volunteer_type}
                </div>
              </div>)}
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500">
        
      </div>
    </div>;
}