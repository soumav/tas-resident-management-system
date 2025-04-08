
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Layout/Footer';
import { PiggyBank, Clock, LogOut } from 'lucide-react';

export default function PendingApproval() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to login if no user
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex flex-col items-center justify-center w-full flex-grow p-4 py-8">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 bg-amber-500 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-sanctuary-green">The Alice Sanctuary</h1>
            <p className="text-gray-600 mt-1">Resident Management System</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-8 border border-gray-100">
            <h2 className="text-2xl font-semibold mb-2">Account Pending Approval</h2>
            <p className="text-gray-500 mb-6">
              Thank you for signing up! Your account is currently pending approval by an administrator.
            </p>
            
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-md mb-6">
              <div className="flex gap-3">
                <Clock className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">Waiting for approval</p>
                  <p className="text-sm text-amber-700 mt-1">
                    You'll receive an email notification once your account has been approved or denied.
                    Please contact the administrator if you have any questions.
                  </p>
                </div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => signOut()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
