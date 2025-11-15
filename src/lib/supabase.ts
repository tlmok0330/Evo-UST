import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://hcrazvlneraiamzgqizf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjcmF6dmxuZXJhaWFtemdxaXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNzMzOTYsImV4cCI6MjA3ODc0OTM5Nn0.R124pAcWu5Ayh5Keewuzr6BLtkyd_4Q-QX7wsHGAd9U';

// Create a supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return true;
};

// Edge function configuration
export const EDGE_FUNCTION_URL = 'https://hcrazvlneraiamzgqizf.supabase.co/functions/v1/chat-ai';
export const OPENROUTER_MODEL = 'mistralai/mistral-7b-instruct:free';

// Export the keys for use in API calls
export { supabaseUrl, supabaseAnonKey };