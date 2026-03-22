import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://wtfhqzrrppqkeabnvtij.supabase.co"
const supabaseKey = "sb_publishable_Kn2kV-lBHyvV05MEXz4BYg_syZcGWpm"

export const supabase = createClient(supabaseUrl, supabaseKey)