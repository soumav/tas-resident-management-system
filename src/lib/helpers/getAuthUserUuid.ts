
import { supabase } from '../supabase';

/**
 * Helper function to get UUID of a Supabase Auth user by email
 * This requires admin privileges and only works in server-side environments
 * with admin keys
 */
export async function getAuthUserUuid(email: string): Promise<string | null> {
  try {
    // This requires admin privileges and should only be used in secure environments
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error fetching auth users:', error);
      return null;
    }
    
    const user = data.users.find(user => user.email === email);
    return user?.id || null;
  } catch (error) {
    console.error('Error in getAuthUserUuid:', error);
    return null;
  }
}
