
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

// Enhanced delete resident function to ensure deletion works
export const deleteResident = async (id: string) => {
  try {
    console.log('Attempting to delete resident with ID:', id);
    
    // First, verify the resident exists
    const { data: checkData, error: checkError } = await supabase
      .from('residents')
      .select('id')
      .eq('id', id)
      .single();
      
    if (checkError) {
      console.error('Error checking if resident exists:', checkError);
      throw new Error(`Cannot delete: ${checkError.message}`);
    }
    
    if (!checkData) {
      console.log('Resident not found, nothing to delete');
      return { success: true, message: 'Resident not found' };
    }
    
    // Clear any relationships or dependencies first
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('resident_id', id);
      
    if (messagesError) {
      console.warn('Could not delete related messages:', messagesError);
      // Continue with deletion anyway
    }
    
    // Perform the actual deletion
    const { error: deleteError } = await supabase
      .from('residents')
      .delete()
      .eq('id', id);
      
    if (deleteError) {
      console.error('Error during deletion:', deleteError);
      
      // Check if the error is related to permissions
      if (deleteError.message.includes('permission') || deleteError.code === '42501') {
        throw new Error('Permission denied. You do not have access to delete this resident.');
      }
      
      throw new Error(`Failed to delete: ${deleteError.message}`);
    }
    
    // Verify the deletion was successful
    const { data: verifyData } = await supabase
      .from('residents')
      .select('id')
      .eq('id', id);
      
    if (verifyData && verifyData.length > 0) {
      console.error('Deletion verification failed - record still exists');
      throw new Error('Deletion failed: Record still exists in the database');
    }
    
    console.log('Resident successfully deleted');
    return { success: true, message: 'Resident successfully deleted' };
    
  } catch (error: any) {
    console.error('Delete resident operation failed:', error);
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
