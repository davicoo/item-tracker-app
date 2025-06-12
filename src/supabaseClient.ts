import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ielukqallxtceqmobmvpv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllbHVrcWFsbHh0Y2VxbW9ibXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4MzA2NzIsImV4cCI6MjA2NDQwNjY3Mn0.-e-JULBAaIdzCkDBQaZiTBdWqsHkHYWpxrsrKktPfyQ';

export const supabase = createClient(supabaseUrl, supabaseKey);
