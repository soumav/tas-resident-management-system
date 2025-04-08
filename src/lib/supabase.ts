
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

// Create a storage bucket if it doesn't exist
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

    // If force create is true, we'll attempt direct bucket creation without checking admin status
    if (forceCreate) {
      try {
        // Try direct creation as a fallback
        console.log("Force creating bucket directly");
        const { error: directCreateError } = await supabase.storage.createBucket(bucketName, {
          public: true
        });
        
        if (directCreateError) {
          console.error('Error in direct bucket creation:', directCreateError);
          return { success: false, message: `Failed to create bucket directly: ${directCreateError.message}` };
        }
        
        console.log(`Bucket ${bucketName} created successfully via direct creation`);
        return { success: true, message: `Bucket ${bucketName} created successfully` };
      } catch (directError: any) {
        console.error('Error in direct bucket creation:', directError);
        return { success: false, message: `Direct bucket creation failed: ${directError.message}` };
      }
    }

    // If we're not forcing creation, check admin status first
    const userIsAdmin = await isAdmin();
    if (!userIsAdmin) {
      console.error('Only admins can create storage buckets');
      return { success: false, message: 'Only admins can create storage buckets' };
    }

    // Try using the stored procedure first
    try {
      console.log("Attempting to create bucket via stored procedure");
      const { error: createError } = await supabase.rpc('create_storage_bucket', { 
        bucket_id: bucketName,
        bucket_public: true 
      });
      
      if (createError) {
        console.error('Error creating bucket via stored procedure:', createError);
        // If the stored procedure fails, try direct creation
        const { error: directCreateError } = await supabase.storage.createBucket(bucketName, {
          public: true
        });
        
        if (directCreateError) {
          console.error('Error in direct bucket creation:', directCreateError);
          return { success: false, message: `Failed to create bucket: ${directCreateError.message}` };
        }
      }
      
      console.log(`Bucket ${bucketName} created successfully`);
      return { success: true, message: `Bucket ${bucketName} created successfully` };
    } catch (error: any) {
      console.error('Error in bucket creation:', error);
      return { success: false, message: `Bucket creation failed: ${error.message}` };
    }
    
  } catch (error: any) {
    console.error('Error in ensureStorageBucket:', error);
    return { success: false, message: `Unexpected error: ${error.message}` };
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
