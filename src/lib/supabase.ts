
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
  
  try {
    // First check if the resident exists
    const { data: checkData, error: checkError } = await supabase
      .from('residents')
      .select('id')
      .eq('id', id)
      .single();
      
    if (checkError) {
      console.error('Error checking if resident exists:', checkError);
      throw new Error(`Error checking resident: ${checkError.message}`);
    }
    
    if (!checkData) {
      console.error(`No resident found with ID: ${id}`);
      throw new Error(`Resident with ID ${id} not found`);
    }
    
    // Then delete the resident - with RPC call to ensure proper deletion
    console.log('Deleting resident using RPC approach');
    
    // Using delete operation with proper headers to ensure deletion works
    const { error } = await supabase
      .from('residents')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting resident:', error);
      throw new Error(`Deletion error: ${error.message}`);
    }
    
    console.log('Resident deletion command completed successfully');
    
    // Give the database a moment to process the deletion
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verify deletion - using count instead of select to be more reliable
    const { count, error: countError } = await supabase
      .from('residents')
      .select('*', { count: 'exact', head: true })
      .eq('id', id);
      
    if (countError) {
      console.error('Error verifying deletion:', countError);
      throw new Error(`Verification error: ${countError.message}`);
    }
    
    if (count && count > 0) {
      console.error(`Deletion verification failed: ${count} records still exist with ID ${id}`);
      throw new Error('Database record still exists after deletion. Please try again.');
    }
    
    console.log('Deletion verified successfully: No records found with that ID');
  } catch (error) {
    console.error('Error in deleteResident function:', error);
    throw error;
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
