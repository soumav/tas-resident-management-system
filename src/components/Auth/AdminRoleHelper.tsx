
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, forceSetUserRole, getUserRole } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

export default function AdminRoleHelper() {
  const { user } = useAuth();
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const checkCurrentRole = async () => {
    setLoading(true);
    try {
      const role = await getUserRole();
      setCurrentRole(role);
    } catch (error) {
      console.error('Error checking role:', error);
    } finally {
      setLoading(false);
    }
  };

  const makeAdmin = async () => {
    setLoading(true);
    try {
      const success = await forceSetUserRole('admin');
      if (success) {
        setSuccess(true);
        setCurrentRole('admin');
        toast({
          title: "Success",
          description: "You are now an admin. You may need to refresh the page.",
        });
        
        // Refresh the session to update JWT claims
        await supabase.auth.refreshSession();
      } else {
        toast({
          title: "Error",
          description: "Failed to set admin role",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error setting admin role:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Admin Role Helper</CardTitle>
        <CardDescription>
          Fix authentication issues by setting your role to admin
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentRole ? (
          <Alert variant={currentRole === 'admin' ? "default" : "destructive"} className="mb-4">
            {currentRole === 'admin' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>Current Role: {currentRole}</AlertTitle>
            <AlertDescription>
              {currentRole === 'admin' 
                ? "You have admin privileges. You should have full access to all features." 
                : "You don't have admin privileges. This might cause permission issues."}
            </AlertDescription>
          </Alert>
        ) : (
          <Button onClick={checkCurrentRole} disabled={loading}>
            {loading ? "Checking..." : "Check Current Role"}
          </Button>
        )}

        {currentRole && currentRole !== 'admin' && (
          <Button onClick={makeAdmin} disabled={loading || success} className="bg-green-600 hover:bg-green-700">
            {loading ? "Setting..." : success ? "Role Set to Admin" : "Set Role to Admin"}
          </Button>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Role has been set to admin. Please refresh the page for changes to take full effect.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
