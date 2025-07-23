'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function signOut() {
  const supabase = createClient();
  const { error } = await (await supabase).auth.signOut();

  if (error) {
    console.error('Error signing out:', error);
    return redirect('/logout?error=true');
  }

  return redirect('/logout');
}