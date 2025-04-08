
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, UserApprovalRequest } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { DashboardHeader } from '@/components/Dashboard/DashboardHeader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function UserApprovals() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for delete confirmation dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<UserApprovalRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'deny' | null>(null);
  
  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);
  
  // Fetch approval requests
  const { data: requests, isLoading } = useQuery({
    queryKey: ['approvalRequests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_approval_requests')
        .select(`
          *,
          user:user_id (
            email,
            role,
            profile:profiles (
              name
            )
          )
        `)
        .order('requested_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching approval requests:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch user approval requests',
          variant: 'destructive'
        });
        return [];
      }
      
      return data as UserApprovalRequest[];
    }
  });
  
  // Approve user mutation
  const approveMutation = useMutation({
    mutationFn: async (requestId: string) => {
      if (!selectedRequest) return;
      
      // 1. Update the user role
      const { error: userError } = await supabase
        .from('users')
        .update({ role: selectedRequest.requested_role })
        .eq('id', selectedRequest.user_id);
        
      if (userError) throw userError;
      
      // 2. Update the approval request status
      const { error: requestError } = await supabase
        .from('user_approval_requests')
        .update({ 
          status: 'approved',
          processed_at: new Date().toISOString(),
          processed_by: user?.id,
          notes: 'Approved by admin'
        })
        .eq('id', requestId);
        
      if (requestError) throw requestError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvalRequests'] });
      toast({
        title: 'User Approved',
        description: 'The user has been approved successfully.',
      });
    },
    onError: (error) => {
      console.error('Error approving user:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve user. Please try again.',
        variant: 'destructive'
      });
    }
  });
  
  // Deny user mutation
  const denyMutation = useMutation({
    mutationFn: async (requestId: string) => {
      if (!selectedRequest) return;
      
      // 1. Update the approval request status
      const { error: requestError } = await supabase
        .from('user_approval_requests')
        .update({ 
          status: 'denied',
          processed_at: new Date().toISOString(),
          processed_by: user?.id,
          notes: 'Denied by admin'
        })
        .eq('id', requestId);
        
      if (requestError) throw requestError;
      
      // 2. Delete the user's profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedRequest.user_id);
        
      if (profileError) throw profileError;
      
      // 3. Delete the user (this will cascade delete the approval request)
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', selectedRequest.user_id);
        
      if (userError) throw userError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvalRequests'] });
      toast({
        title: 'User Denied',
        description: 'The user has been denied and removed from the system.',
      });
    },
    onError: (error) => {
      console.error('Error denying user:', error);
      toast({
        title: 'Error',
        description: 'Failed to deny user. Please try again.',
        variant: 'destructive'
      });
    }
  });
  
  const handleAction = (request: UserApprovalRequest, action: 'approve' | 'deny') => {
    setSelectedRequest(request);
    setActionType(action);
    setOpenDeleteDialog(true);
  };
  
  const handleConfirmAction = () => {
    if (!selectedRequest || !actionType) return;
    
    if (actionType === 'approve') {
      approveMutation.mutate(selectedRequest.id);
    } else {
      denyMutation.mutate(selectedRequest.id);
    }
    
    setOpenDeleteDialog(false);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-amber-500" />
            <span className="text-amber-500">Pending</span>
          </div>
        );
      case 'approved':
        return (
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-green-600">Approved</span>
          </div>
        );
      case 'denied':
        return (
          <div className="flex items-center gap-1.5">
            <XCircle className="h-4 w-4 text-red-600" />
            <span className="text-red-600">Denied</span>
          </div>
        );
      default:
        return <span>{status}</span>;
    }
  };
  
  if (!isAdmin) {
    return null;
  }
  
  return (
    <div>
      <DashboardHeader username={user?.email?.split('@')[0] || 'Admin'} />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">User Approval Management</h1>
        <p className="text-gray-600">Review and manage user signup requests</p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-sanctuary-green" />
        </div>
      ) : requests && requests.length > 0 ? (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Requested Role</TableHead>
                <TableHead>Date Requested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.user?.profile?.name || 'N/A'}</TableCell>
                  <TableCell>{request.user?.email}</TableCell>
                  <TableCell className="capitalize">{request.requested_role}</TableCell>
                  <TableCell>{format(new Date(request.requested_at), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell className="text-right">
                    {request.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAction(request, 'approve')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleAction(request, 'deny')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Deny
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="bg-white border rounded-lg p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Clock className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-1">No pending requests</h3>
          <p className="text-gray-500">There are no user approval requests at the moment.</p>
        </div>
      )}
      
      {/* Confirmation Dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'approve' ? 'Approve User' : 'Deny User'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'approve' 
                ? 'Are you sure you want to approve this user? They will be given access to the system with the requested role.'
                : 'Are you sure you want to deny this user? Their account and profile will be permanently deleted from the system.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmAction}
              className={actionType === 'approve' ? 'bg-sanctuary-green hover:bg-sanctuary-light-green' : ''}
            >
              {actionType === 'approve' ? 'Approve' : 'Deny'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
