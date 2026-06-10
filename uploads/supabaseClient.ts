import { createClient } from '@supabase/supabase-js';

// استبدل الروابط أدناه ببيانات مشروعك من Supabase
const supabaseUrl = 'sb_publishable_eBEcubwqGku8WIV6UvGhWg_ZoVGGVxl'; 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxdnNoanlocWJ0ZW92ZnJvb3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5OTY1MzIsImV4cCI6MjA5NjU3MjUzMn0.KD3h8IF6pYyNNfaxjdlHdcodymH3nZeLoRaJzNAR3tI'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);