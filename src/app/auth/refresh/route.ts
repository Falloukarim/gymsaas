import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  
  // Force un refresh de la session
  await (await supabase).auth.getUser()
  
  return NextResponse.json({ success: true })
}