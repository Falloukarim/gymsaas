// src/app/auth/callback/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const cookieStore = cookies();

  if (code) {
    const supabase = createClient(cookieStore);
    await (await supabase).auth.exchangeCodeForSession(code);
  }

  // Rediriger vers la page de sélection de gym
  return NextResponse.redirect(requestUrl.origin + '/gyms/select');
}