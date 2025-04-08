
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, getUserRole, forceSetUserRole, checkRLSAccess } from '@/lib/supabase';

type RLSDebugPanelProps = {
  onComplete?: () => void;
};

export default function RLSDebugPanel({ onComplete }: RLSDebugPanelProps) {
  const { user } = useAuth();
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<'admin' | 'staff' | 'user'>('admin');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error' | 'warning' | 'info'; text: string} | null>(null);
  const [rlsStatus, setRlsStatus] = useState<Record<string, boolean>>({});

  const tablesToCheck = ['resident_groups', 'resident_subgroups', 'residents', 'users'];

  useEffect(() => {
    const fetchUserRole = async () => {
      const role = await getUserRole();
      setCurrentRole(role);
    };

    fetchUserRole();
  }, [user]);

  const handleSetRole = async () => {
    setLoading(true);
    try {
      const success = await forceSetUserRole(newRole);
      if (success) {
        setMessage({ type: 'success', text: `Role successfully set to ${newRole}. Please refresh the page for changes to take effect.` });
        setCurrentRole(newRole);
        if (onComplete) onComplete();
      } else {
        setMessage({ type: 'error', text: 'Failed to set role. Check console for details.' });
      }
    } catch (error) {
      console.error('Error setting role:', error);
      setMessage({ type: 'error', text: 'An error occurred while setting role.' });
    } finally {
      setLoading(false);
    }
  };

  const checkRLSForTables = async () => {
    setLoading(true);
    try {
      const results: Record<string, boolean> = {};
      
      for (const table of tablesToCheck) {
        results[table] = await checkRLSAccess(table);
      }
      
      setRlsStatus(results);
    } catch (error) {
      console.error('Error checking RLS:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-4">
      <CardHeader>
        <CardTitle>RLS Debug Panel</CardTitle>
        <CardDescription>
          Resolve Row Level Security (RLS) issues with your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="font-medium text-gray-800 mb-2">Current Status</h3>
          <p className="text-gray-600 mb-2">User: {user?.email}</p>
          <p className="text-gray-600 mb-2">Current role: {currentRole || 'Unknown'}</p>
          
          {currentRole !== 'admin' && currentRole !== 'staff' && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Access Problem Detected</AlertTitle>
              <AlertDescription>
                You need admin or staff role to create and manage resources
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <div className="border rounded-lg p-4">
          <h3 className="font-medium text-gray-800 mb-2">Set Role</h3>
          <div className="flex items-center gap-2">
            <Select defaultValue={newRole} onValueChange={(value: any) => setNewRole(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="user">Regular User</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSetRole} disabled={loading}>
              {loading ? 'Setting...' : 'Set Role'}
            </Button>
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <h3 className="font-medium text-gray-800 mb-2">Test RLS Access</h3>
          <Button onClick={checkRLSForTables} disabled={loading} className="mb-4">
            {loading ? 'Checking...' : 'Check RLS Access'}
          </Button>
          
          {Object.keys(rlsStatus).length > 0 && (
            <div className="space-y-2">
              {Object.entries(rlsStatus).map(([table, hasAccess]) => (
                <div key={table} className="flex items-center gap-2">
                  {hasAccess ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span>{table}: {hasAccess ? 'Access Granted' : 'Access Denied'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            {message.type === 'success' && <CheckCircle className="h-4 w-4" />}
            {message.type === 'error' && <AlertCircle className="h-4 w-4" />}
            {message.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
            <AlertTitle>{message.type.charAt(0).toUpperCase() + message.type.slice(1)}</AlertTitle>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
