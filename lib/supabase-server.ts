import 'server-only'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Server-only admin client (bypasses RLS). Never import this from a Client Component —
// the "server-only" import throws at build time if you accidentally do.
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey)
