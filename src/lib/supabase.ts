import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type EditHistoryItem = {
  id: string;
  user_id: string;
  original_url: string;
  transformed_url: string;
  prompt: string;
  operations: string;
  file_name: string;
  created_at: string;
};

// Check if Supabase is configured
function isSupabaseConfigured(): boolean {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('supabase.co') ?? false;
}

// Supabase functions for edit history
export async function getEditHistory(userId: string): Promise<EditHistoryItem[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('edit_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching history:', error);
    return [];
  }

  return data || [];
}

export async function addToHistoryDB(
  userId: string,
  item: {
    original_url: string;
    transformed_url: string;
    prompt: string;
    operations: string;
    file_name: string;
  }
): Promise<EditHistoryItem | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data, error } = await supabase
    .from('edit_history')
    .insert({
      user_id: userId,
      ...item,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding to history:', error);
    return null;
  }

  return data;
}

export async function removeFromHistoryDB(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  const { error } = await supabase
    .from('edit_history')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error removing from history:', error);
    return false;
  }

  return true;
}

export async function clearHistoryDB(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  const { error } = await supabase
    .from('edit_history')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('Error clearing history:', error);
    return false;
  }

  return true;
}
