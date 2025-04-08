
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CheckCircle, XCircle, Trash2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type PendingUser = {
  id: string;
  email: string;
  name?: string; 
  requested_role: string;
  created_at: string;
};

export default function AdminApproval() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [activeUsers, setActiveUsers] = useState<PendingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [dialogAction, setDialogAction] = useState<'approve' | 'delete' | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!authLoading && user) {
        const isUserAdmin = await supabase.rpc('is_admin');
        if (!isUserAdmin) {
          toast({
            title: "Access denied",
            description: "Only administrators can access this page",
            variant: "destructive"
          });
          navigate('/');
        }
      }
    };
    
    checkAdminStatus();
  }, [user, authLoading, navigate, toast]);

  // Fetch pending users
  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        // Get users with pending status
        const { data: pendingData, error: pendingError } = await supabase
          .from('users')
          .select('*, profiles!inner(*)')
          .eq('role', 'pending');

        if (pendingError) throw pendingError;
        
        // Format data to include name from profiles
        const formattedPendingUsers = pendingData.map(user => ({
          id: user.id,
          email: user.email,
          name: user.profiles?.name || '',
          requested_role: user.requested_role,
          created_at: user.created_at
        }));
        
        setPendingUsers(formattedPendingUsers);

        // Get active users (staff and regular users)
        const { data: activeData, error: activeError } = await supabase
          .from('users')
          .select('*, profiles!inner(*)')
          .neq('role', 'pending')
          .neq('role', 'admin'); // Don't show admins in the list

        if (activeError) throw activeError;
        
        // Format active users data
        const formattedActiveUsers = activeData.map(user => ({
          id: user.id,
          email: user.email,
          name: user.profiles?.name || '',
          requested_role: user.role,
          created_at: user.created_at
        }));
        
        setActiveUsers(formattedActiveUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: 'Error',
          description: 'Failed to load user requests',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingUsers();
  }, [toast]);

  const handleApproveUser = (user: PendingUser) => {
    setSelectedUser(user);
    setDialogAction('approve');
    setShowDialog(true);
  };

  const handleDeleteUser = (user: PendingUser) => {
    setSelectedUser(user);
    setDialogAction('delete');
    setShowDialog(true);
  };

  const confirmAction = async () => {
    if (!selectedUser) return;
    
    try {
      if (dialogAction === 'approve') {
        // Update user role from pending to requested role
        const { error } = await supabase
          .from('users')
          .update({ role: selectedUser.requested_role })
          .eq('id', selectedUser.id);
          
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: `User ${selectedUser.email} has been approved as ${selectedUser.requested_role}`,
        });
        
        // Update local state
        setPendingUsers(prev => prev.filter(u => u.id !== selectedUser.id));
        setActiveUsers(prev => [...prev, {...selectedUser, requested_role: selectedUser.requested_role}]);
      } else if (dialogAction === 'delete') {
        // Delete from users and auth
        const { error: usersError } = await supabase
          .from('users')
          .delete()
          .eq('id', selectedUser.id);
          
        if (usersError) throw usersError;
        
        // Delete from profiles
        await supabase
          .from('profiles')
          .delete()
          .eq('id', selectedUser.id);
          
        // Also delete from Supabase auth (requires admin privileges)
        await supabase.auth.admin.deleteUser(selectedUser.id);
        
        toast({
          title: 'Success',
          description: `User ${selectedUser.email} has been deleted`,
        });
        
        // Update local state
        setPendingUsers(prev => prev.filter(u => u.id !== selectedUser.id));
        setActiveUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      }
    } catch (error) {
      console.error('Error processing user action:', error);
      toast({
        title: 'Error',
        description: 'Failed to process your request',
        variant: 'destructive',
      });
    } finally {
      setShowDialog(false);
      setSelectedUser(null);
      setDialogAction(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Admin Control Panel</h2>
          <p className="text-gray-600">Manage user and staff accounts</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Pending Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-2">{pendingUsers.length} accounts waiting for approval</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Active Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-2">{activeUsers.length} active users and staff accounts</p>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4">Pending Approval Requests</h3>
        <div className="bg-white rounded-md shadow">
          {isLoading ? (
            <div className="p-8 text-center">Loading pending requests...</div>
          ) : pendingUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No pending requests to display</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Requested Role</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.map((pendingUser) => (
                  <TableRow key={pendingUser.id}>
                    <TableCell>{pendingUser.name}</TableCell>
                    <TableCell>{pendingUser.email}</TableCell>
                    <TableCell className="capitalize">{pendingUser.requested_role}</TableCell>
                    <TableCell>{new Date(pendingUser.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                          onClick={() => handleApproveUser(pendingUser)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                          onClick={() => handleDeleteUser(pendingUser)}
                        >
                          <XCircle className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4">Active Accounts</h3>
        <div className="bg-white rounded-md shadow">
          {isLoading ? (
            <div className="p-8 text-center">Loading active accounts...</div>
          ) : activeUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No active accounts to display</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeUsers.map((activeUser) => (
                  <TableRow key={activeUser.id}>
                    <TableCell>{activeUser.name}</TableCell>
                    <TableCell>{activeUser.email}</TableCell>
                    <TableCell className="capitalize">{activeUser.requested_role}</TableCell>
                    <TableCell>{new Date(activeUser.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                        onClick={() => handleDeleteUser(activeUser)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
      
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogAction === 'approve' ? 'Approve User' : 'Delete User'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogAction === 'approve' 
                ? `Are you sure you want to approve ${selectedUser?.email} as a ${selectedUser?.requested_role}?` 
                : `Are you sure you want to delete ${selectedUser?.email}? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmAction}
              className={dialogAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {dialogAction === 'approve' ? 'Approve' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
