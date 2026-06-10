import { createClient } from '@supabase/supabase-js';

// Correct Supabase configuration from provided keys (decoded JWT ref)
const supabaseUrl = 'https://gqvshjyhqbteovfroozh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxdnNoanlocWJ0ZW92ZnJvb3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5OTY1MzIsImV4cCI6MjA5NjU3MjUzMn0.KD3h8IF6pYyNNfaxjdlHdcodymH3nZeLoRaJzNAR3tI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
