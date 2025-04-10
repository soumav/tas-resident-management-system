
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

// Function to ensure a user exists in the users table
export const ensureUserExists = async (userId: string, email: string) => {
  // First check if user exists
  let { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (fetchError) {
    console.error("Error checking if user exists:", fetchError);
  }

  // If user doesn't exist, create them with pending role
  if (!existingUser) {
    console.log("User doesn't exist in users table, creating...");
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        { id: userId, email: email, role: 'pending' }
      ])
      .select();

    if (insertError) {
      console.error("Error creating user record:", insertError);
    } else {
      console.log("Created new user record:", newUser);
    }
    
    // Also make sure the profile exists
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        { id: userId, email: email }
      ]);
      
    if (profileError) {
      console.error("Error creating profile:", profileError);
    }

    return { role: 'pending' };
  }

  return existingUser;
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
