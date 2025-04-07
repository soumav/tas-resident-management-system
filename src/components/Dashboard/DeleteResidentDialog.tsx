
import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface DeleteResidentDialogProps {
  open: boolean;
  residentName: string;
  onClose: () => void;
  onDelete: () => Promise<void>;
  isDeleting?: boolean;
}

export function DeleteResidentDialog({
  open,
  residentName,
  onClose,
  onDelete,
  isDeleting = false
}: DeleteResidentDialogProps) {
  const { toast } = useToast();
  
  const handleDelete = async () => {
    try {
      // Call the parent component's delete handler and await it
      await onDelete();
      // Success will be handled by the parent component
    } catch (error: any) {
      console.error('Error in DeleteResidentDialog delete handler:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete resident',
        variant: 'destructive',
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen && !isDeleting) {
        onClose();
      }
    }}>
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
            className="bg-red-600 hover:bg-red-700 text-white" 
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
