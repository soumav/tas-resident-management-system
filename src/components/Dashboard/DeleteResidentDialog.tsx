
import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { deleteResident } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface DeleteResidentDialogProps {
  open: boolean;
  residentName: string;
  residentId: string;
  onClose: () => void;
  onDelete: () => void;
}

export function DeleteResidentDialog({
  open,
  residentName,
  residentId,
  onClose,
  onDelete
}: DeleteResidentDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!residentId) {
      toast({
        title: "Error",
        description: "No resident ID provided for deletion",
        variant: "destructive"
      });
      return;
    }

    setIsDeleting(true);
    try {
      await deleteResident(residentId);
      toast({
        title: "Success",
        description: `${residentName} has been deleted successfully`,
      });
      onDelete();
    } catch (error: any) {
      console.error('Error deleting resident:', error);
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete resident. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Resident</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the resident "{residentName}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            className="bg-red-600 hover:bg-red-700"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
