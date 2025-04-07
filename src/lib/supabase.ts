
import { createClient } from '@supabase/supabase-js';

// Using hardcoded values for demonstration
const supabaseUrl = 'https://jggvycnqqcpbeaqufvcu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ3Z5Y25xcWNwYmVhcXVmdmN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwMTAwMTIsImV4cCI6MjA1OTU4NjAxMn0.UPkBtnLUwuk4BQ1sLy-e-25aQET3FvreF9B9FhstpDo';

// Create a supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Debug function to log supabase operations
export const logSupabaseOperation = async (operation: string, data: any) => {
  console.log(`Supabase ${operation} operation:`, data);
  return data;
};

// Helper function for deleting residents with proper logging
export const deleteResident = async (id: string): Promise<void> => {
  console.log(`Attempting to delete resident with ID: ${id}`);
  
  // First check if the resident exists
  const { data: checkData, error: checkError } = await supabase
    .from('residents')
    .select('id')
    .eq('id', id)
    .single();
    
  if (checkError) {
    console.error('Error checking if resident exists:', checkError);
    throw checkError;
  }
  
  if (!checkData) {
    console.error(`No resident found with ID: ${id}`);
    throw new Error(`Resident with ID ${id} not found`);
  }
  
  // Then delete the resident
  const { error, data } = await supabase
    .from('residents')
    .delete()
    .eq('id', id)
    .select();
    
  if (error) {
    console.error('Error deleting resident:', error);
    throw error;
  }
  
  console.log('Resident deletion successful:', data);
  
  // Validate deletion
  const { data: verifyData, error: verifyError } = await supabase
    .from('residents')
    .select('id')
    .eq('id', id);
    
  if (verifyError) {
    console.error('Error verifying deletion:', verifyError);
  } else if (verifyData && verifyData.length > 0) {
    console.error('Deletion verification failed: Resident still exists in database');
    throw new Error('Failed to delete resident: Record still exists in database');
  } else {
    console.log('Deletion verification successful: Resident no longer exists in database');
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
