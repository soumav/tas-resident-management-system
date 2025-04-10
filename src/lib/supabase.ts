
import { createClient } from '@supabase/supabase-js';

// Using hardcoded values for demonstration
const supabaseUrl = 'https://eyoygtykeioadmtfyeff.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5b3lndHlrZWlvYWRtdGZ5ZWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMDA0OTcsImV4cCI6MjA1OTg3NjQ5N30.ve2uaX6fofnbLtwlxlQHUM2JkAJV3HqCxIu8nUvxvHY';

// Create a supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Debug function to log supabase operations
export const logSupabaseOperation = async (operation: string, data: any) => {
  console.log(`Supabase ${operation} operation:`, data);
  return data;
};

// Special function to handle operations with RLS policies
export const bypassRLS = async <T>(
  operation: () => any,
  fallbackData: T | null = null,
  operationName: string = 'unknown'
): Promise<{ data: T | null; error: any | null }> => {
  try {
    console.log(`Attempting operation: ${operationName}`);
    const result = await operation();
    const { data, error, count } = result;
    
    if (error) {
      console.error(`Error in operation ${operationName}:`, error);
      return { data: fallbackData, error };
    }
    
    // Handle count property for queries with count option
    if (count !== undefined) {
      console.log(`Operation ${operationName} succeeded with count:`, count);
      return { data: { count } as unknown as T, error: null };
    }
    
    console.log(`Operation ${operationName} succeeded:`, data);
    return { data, error: null };
  } catch (err) {
    console.error(`Exception in operation ${operationName}:`, err);
    return { data: fallbackData, error: err };
  }
};

// Cache for user data to prevent repeated queries
const userCache: Record<string, any> = {};

// Function to ensure a user exists in the users table
export const ensureUserExists = async (userId: string, email: string) => {
  // Check the cache first to prevent redundant database calls
  if (userCache[userId]) {
    console.log("Using cached user data for:", userId);
    return userCache[userId];
  }

  // Check if this is an admin email
  const isAdminEmail = email === 'soumav91@gmail.com';
  const defaultRole = isAdminEmail ? 'admin' : 'pending';
  
  try {
    console.log("Checking if user exists:", userId, email);
    
    // First check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error("Error checking if user exists:", fetchError);
      const defaultUser = { id: userId, email: email, role: defaultRole };
      userCache[userId] = defaultUser;
      return defaultUser;
    }

    // If user exists, return it
    if (existingUser) {
      console.log("Found existing user:", existingUser);
      userCache[userId] = existingUser;
      return existingUser;
    }

    // If we're here, it means the user doesn't exist
    console.log("User doesn't exist in users table, creating...");
    
    try {
      // Try to create the user
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([
          { id: userId, email: email, role: defaultRole }
        ])
        .select();

      if (insertError) {
        console.error("Error creating user record:", insertError);
        const defaultUser = { id: userId, email: email, role: defaultRole };
        userCache[userId] = defaultUser;
        return defaultUser;
      }

      console.log("Created new user record:", newUser);
      
      // Also make sure the profile exists
      try {
        await supabase
          .from('profiles')
          .insert([
            { id: userId, email: email }
          ])
          .select();
      } catch (profileErr) {
        console.error("Profile creation error:", profileErr);
        // Don't throw here, still allow login to proceed
      }

      const returnUser = newUser?.[0] || { id: userId, email: email, role: defaultRole };
      userCache[userId] = returnUser;
      return returnUser;
    } catch (insertErr) {
      console.error("Insert operation failed:", insertErr);
      // Return a default user so authentication can continue
      const defaultUser = { id: userId, email: email, role: defaultRole };
      userCache[userId] = defaultUser;
      return defaultUser;
    }
  } catch (error) {
    console.error("Error in ensureUserExists:", error);
    // Return a default user so authentication can continue
    const defaultUser = { id: userId, email: email, role: defaultRole };
    userCache[userId] = defaultUser;
    return defaultUser;
  }
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
  user_approval_requests: {
    id: string;
    user_id: string;
    requested_role: string;
    status: string;
    requested_at: string;
    processed_at: string | null;
    processed_by: string | null;
    notes: string | null;
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

export type UserApprovalRequest = Tables['user_approval_requests'] & {
  user: {
    email: string;
    role: string;
    profile?: {
      name: string;
    }
  };
};
