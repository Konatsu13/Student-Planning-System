import { createClient } from '@supabase/supabase-js'

// Mengambil URL dan KEY dari file .env.local yang kamu buat tadi
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

// Membuat "Client" untuk digunakan di seluruh aplikasi
export const supabase = createClient(supabaseUrl, supabaseKey)