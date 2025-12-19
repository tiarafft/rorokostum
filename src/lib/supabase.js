import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wqwlbuheemrcqiajhxuv.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indxd2xidWhlZW1yY3FpYWpoeHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MTI4MDEsImV4cCI6MjA4MTQ4ODgwMX0.rE5NHmjZpdWwGD00aLOJbzM4-0RapbSvGbJDBKMnNrQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
