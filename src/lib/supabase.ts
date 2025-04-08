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
    
    console.log('Current user:', user);
    
    // First check if the role is in the JWT token
    const jwtRole = (user as any).role;
    if (jwtRole) {
      console.log('Role found in JWT token:', jwtRole);
      return jwtRole;
    }
    
    // If not, try to get it from the users table
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (error) {
      console.error('Error getting user role from database:', error);
      throw error;
    }
    
    console.log('Role from database:', data?.role);
    return data?.role || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

// Force set role for current user (useful for debugging/testing)
export const forceSetUserRole = async (role: 'admin' | 'staff' | 'user'): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    // Update the users table
    const { error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', user.id);
      
    if (error) {
      console.error('Error updating user role:', error);
      return false;
    }
    
    console.log(`User role successfully set to ${role}`);
    
    // Force refresh session to update JWT claims
    await supabase.auth.refreshSession();
    
    return true;
  } catch (error) {
    console.error('Error setting user role:', error);
    return false;
  }
};

// Check RLS policy access (useful for debugging)
export const checkRLSAccess = async (table: string): Promise<boolean> => {
  try {
    // Try a simple select to check RLS
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);
      
    if (error) {
      console.error(`RLS check failed for table ${table}:`, error);
      return false;
    }
    
    console.log(`RLS check passed for table ${table}`);
    return true;
  } catch (error) {
    console.error(`Error checking RLS for table ${table}:`, error);
    return false;
  }
};

// New function: Promote user to admin
export const promoteToAdmin = async (userEmail: string): Promise<{ success: boolean; message: string }> => {
  try {
    // First, find the user by email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();
      
    if (userError) {
      return { success: false, message: `User not found: ${userError.message}` };
    }
    
    if (!userData) {
      return { success: false, message: 'User not found with that email' };
    }
    
    // Update the user's role to admin
    const { error: updateError } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', userData.id);
      
    if (updateError) {
      return { success: false, message: `Failed to update user role: ${updateError.message}` };
    }
    
    return { success: true, message: `User ${userEmail} promoted to admin successfully` };
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
};

// Improved storage bucket creation function with better error handling
export const ensureStorageBucket = async (bucketName: string, forceCreate: boolean = false): Promise<{success: boolean; message: string}> => {
  try {
    // First check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error checking buckets:', listError);
      return { success: false, message: `Failed to check if bucket exists: ${listError.message}` };
    }
    
    // Check if bucket already exists
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    if (bucketExists) {
      console.log(`Bucket ${bucketName} already exists`);
      return { success: true, message: `Bucket ${bucketName} already exists` };
    }

    // Create bucket with service role if available (admin permission bypass)
    try {
      console.log(`Attempting to create bucket '${bucketName}' with service role...`);
      
      // Try using RPC function first which may have more permissions
      const { error: rpcError } = await supabase.rpc('create_bucket_with_security', {
        bucket_name: bucketName,
        public_access: true
      });
      
      if (!rpcError) {
        console.log(`Bucket ${bucketName} created successfully via RPC`);
        return { success: true, message: `Bucket ${bucketName} created successfully` };
      }
      
      console.warn('RPC method failed or not available, falling back to direct creation');
      
      // Direct creation attempt
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true
      });
      
      if (!createError) {
        console.log(`Bucket ${bucketName} created successfully via direct creation`);
        return { success: true, message: `Bucket ${bucketName} created successfully` };
      }
      
      // If we get here, both attempts failed, throw the last error to be caught
      throw createError;
      
    } catch (createError: any) {
      console.error('Error creating bucket:', createError);
      
      // If we failed to create, check if bucket exists again (race condition handling)
      const { data: checkBuckets } = await supabase.storage.listBuckets();
      if (checkBuckets?.some(bucket => bucket.name === bucketName)) {
        return { success: true, message: `Bucket ${bucketName} already exists (created by another process)` };
      }
      
      // If all creation attempts failed, but the app needs to continue working
      if (forceCreate) {
        console.log("Force create enabled - allowing app to continue despite bucket creation failure");
        return { 
          success: false, 
          message: `Bucket creation failed but continuing operation. Error: ${createError.message}`,
        };
      }
      
      return { 
        success: false, 
        message: `Failed to create bucket: ${createError.message}. Contact the administrator to set up storage.` 
      };
    }
    
  } catch (error: any) {
    console.error('Unexpected error in ensureStorageBucket:', error);
    return { success: false, message: `Unexpected error: ${error.message}` };
  }
};

// Authorization check helpers
export const isAdmin = async (): Promise<boolean> => {
  const role = await getUserRole();
  console.log('Checking if user is admin. Role:', role);
  return role === 'admin';
};

export const isStaff = async (): Promise<boolean> => {
  const role = await getUserRole();
  console.log('Checking if user is staff. Role:', role);
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

export type ResidentType = Tables['resident_types'] & {
  category?: {
    name: string;
  }
};
