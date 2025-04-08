
import { useEffect, useState } from "react";
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";
import { UserCheck, UserX, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PendingUser {
  id: string;
  name: string;
  email: string;
  requested_role: string;
  created_at: string;
}

export default function AdminApproval() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleSelections, setRoleSelections] = useState<Record<string, string>>({});
  const [processingUser, setProcessingUser] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is admin, if not redirect
  useEffect(() => {
    if (user) {
      const checkAdminRole = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error || data?.role !== 'admin') {
          toast({
            title: "Access Denied",
            description: "You do not have permission to access this page.",
            variant: "destructive"
          });
          navigate("/");
        }
      };

      checkAdminRole();
    }
  }, [user, navigate, toast]);

  // Fetch pending users
  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('pending_users')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setPendingUsers(data || []);
        
        // Initialize role selections with requested roles
        const initialSelections: Record<string, string> = {};
        data?.forEach(user => {
          initialSelections[user.id] = user.requested_role;
        });
        setRoleSelections(initialSelections);
      } catch (error) {
        console.error('Error fetching pending users:', error);
        toast({
          title: "Error",
          description: "Failed to load pending user requests.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPendingUsers();
  }, [toast]);

  const handleRoleChange = (userId: string, role: string) => {
    setRoleSelections(prev => ({
      ...prev,
      [userId]: role
    }));
  };

  const handleApproveUser = async (pendingUser: PendingUser) => {
    setProcessingUser(pendingUser.id);
    try {
      // 1. Create auth user via Supabase admin functions
      // This would typically be handled by a secure server-side function
      // For this demo, we'll simulate the flow but note that in production
      // you would NOT handle password_hash directly in the frontend
      
      // 2. Create profile entry with the selected role
      const { error: profileError } = await supabase.from('profiles').insert({
        id: pendingUser.id, // This would be the UUID from auth.users in production
        name: pendingUser.name,
        email: pendingUser.email,
        role: roleSelections[pendingUser.id]
      });
      
      if (profileError) throw profileError;
      
      // 3. Delete from pending_users table
      const { error: deleteError } = await supabase
        .from('pending_users')
        .delete()
        .eq('id', pendingUser.id);
        
      if (deleteError) throw deleteError;
      
      // 4. Update UI
      setPendingUsers(prev => prev.filter(user => user.id !== pendingUser.id));
      
      toast({
        title: "User Approved",
        description: `${pendingUser.name} has been approved as ${roleSelections[pendingUser.id]}.`,
      });
      
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        title: "Approval Failed",
        description: "There was an error approving this user.",
        variant: "destructive"
      });
    } finally {
      setProcessingUser(null);
    }
  };

  const handleRejectUser = async (userId: string) => {
    setProcessingUser(userId);
    try {
      // Delete from pending_users table
      const { error } = await supabase
        .from('pending_users')
        .delete()
        .eq('id', userId);
        
      if (error) throw error;
      
      // Update UI
      setPendingUsers(prev => prev.filter(user => user.id !== userId));
      
      toast({
        title: "User Rejected",
        description: "The user request has been rejected.",
      });
      
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast({
        title: "Rejection Failed",
        description: "There was an error rejecting this user.",
        variant: "destructive"
      });
    } finally {
      setProcessingUser(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-sanctuary-green" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Pending User Approvals</h1>
      
      {pendingUsers.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No pending user approvals at this time.</p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Requested Role</TableHead>
                <TableHead>Assign Role</TableHead>
                <TableHead>Requested On</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingUsers.map((pendingUser) => (
                <TableRow key={pendingUser.id}>
                  <TableCell className="font-medium">{pendingUser.name}</TableCell>
                  <TableCell>{pendingUser.email}</TableCell>
                  <TableCell>{pendingUser.requested_role}</TableCell>
                  <TableCell>
                    <Select 
                      value={roleSelections[pendingUser.id]} 
                      onValueChange={(value) => handleRoleChange(pendingUser.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {new Date(pendingUser.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                        onClick={() => handleApproveUser(pendingUser)}
                        disabled={processingUser === pendingUser.id}
                      >
                        {processingUser === pendingUser.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserCheck className="h-4 w-4" />
                        )}
                        Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                        onClick={() => handleRejectUser(pendingUser.id)}
                        disabled={processingUser === pendingUser.id}
                      >
                        {processingUser === pendingUser.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserX className="h-4 w-4" />
                        )}
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
