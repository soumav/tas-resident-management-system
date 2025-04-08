
import { createClient } from '@supabase/supabase-js';

// Using hardcoded values for demonstration
const supabaseUrl = 'https://ekzddxvbiemcrzjsiwmk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVremRkeHZiaWVtY3J6anNpd21rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNzY1ODQsImV4cCI6MjA1OTY1MjU4NH0.BdPG3i68RkvyEVIwvEeMeshzXmjHhJ2jKTkAyQHzuVc';

// Create a supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Debug function to log supabase operations
export const logSupabaseOperation = async (operation: string, data: any) => {
  console.log(`Supabase ${operation} operation:`, data);
  return data;
};

// Role-based authentication helpers
export const getUserRole = async (): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (error) throw error;
    return data?.role || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

// Authorization check helpers
export const isAdmin = async (): Promise<boolean> => {
  const role = await getUserRole();
  return role === 'admin';
};

export const isStaff = async (): Promise<boolean> => {
  const role = await getUserRole();
  return role === 'staff' || role === 'admin';
};

export const isPendingUser = async (): Promise<boolean> => {
  const role = await getUserRole();
  return role === 'pending';
};

export const canDelete = async (tableName: string, id: string): Promise<boolean> => {
  const role = await getUserRole();
  
  // Only admins can delete staff
  if (tableName === 'staff' && role !== 'admin') {
    return false;
  }
  
  // Staff and admins can delete other resources
  return role === 'staff' || role === 'admin';
};

// Type definitions
export type Tables = {
  users: {
    id: string;
    email: string;
    role: string;
    requested_role?: string;
    created_at: string;
  };
  profiles: {
    id: string;
    name: string;
    email: string;
    created_at?: string;
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
