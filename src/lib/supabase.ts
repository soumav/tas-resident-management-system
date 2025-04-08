
import { createClient } from '@supabase/supabase-js';

// Using hardcoded values for demonstration
const supabaseUrl = 'https://ghprqwotcdzowmccsfyc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdocHJxd290Y2R6b3dtY2NzZnljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNjk4MDUsImV4cCI6MjA1OTY0NTgwNX0.1KVYCVO-t97HNEVXeCVbgunU7me6OxEjRd5xMLpt6-U';

// Create a supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Debug function to log supabase operations
export const logSupabaseOperation = async (operation: string, data: any) => {
  console.log(`Supabase ${operation} operation:`, data);
  return data;
};

// Type definitions
export type Tables = {
  users: {
    id: string;
    email: string;
    role: string;
    created_at: string;
  };
  profiles: {
    id: string;
    name: string;
    email: string;
    created_at: string;
  };
  pending_users: {
    id: string;
    name: string;
    email: string;
    password_hash: string;
    requested_role: string;
    created_at: string;
    status: 'pending' | 'approved' | 'rejected';
  };
  residents: {
    id: string;
    name: string;
    type_id: number;
    group_id: number | null;
    subgroup_id: number | null;
    arrival_date: string;
    description: string | null;
    image_url: string | null;
    created_at: string;
    year_arrived: string | null;
  };
  resident_types: {
    id: number;
    name: string;
    category_id: number;
  };
  resident_categories: {
    id: number;
    name: string;
  };
  resident_groups: {
    id: number;
    name: string;
    description: string | null;
  };
  resident_subgroups: {
    id: number;
    name: string;
    description: string | null;
    group_id: number;
  };
  staff: {
    id: string;
    user_id: string;
    name: string;
    email: string;
    role: string;
    created_at: string;
  };
  volunteers: {
    id: string;
    name: string;
    email: string;
    volunteer_type: string;
    created_at: string;
  };
  messages: {
    id: string;
    resident_id: string;
    user_id: string;
    message: string;
    created_at: string;
  };
};

export type Resident = Tables['residents'] & {
  type: {
    name: string;
    category: {
      name: string;
    }
  };
  group?: {
    name: string;
    description?: string;
  };
  subgroup?: {
    name: string;
    description?: string;
  };
};

export type ResidentGroup = Tables['resident_groups'] & {
  subgroups?: ResidentSubgroup[];
};

export type ResidentSubgroup = Tables['resident_subgroups'] & {
  group?: {
    name: string;
  }
};

export type PendingUser = Tables['pending_users'];

// Helper functions for role-based access control
export const canDelete = async (table?: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
    
  // Only admin can delete staff records
  if (table === 'staff') {
    return data?.role === 'admin';
  }
  
  // Both admin and staff can delete other records
  return data?.role === 'admin' || data?.role === 'staff';
};

export const canModify = async (): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
    
  return data?.role === 'admin' || data?.role === 'staff';
};

// New helper function to check if user is an admin
export const isAdmin = async (): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
    
  return data?.role === 'admin';
};
