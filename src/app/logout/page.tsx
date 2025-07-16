'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function LogoutPage() {
  const supabase = createClient();
  await (await supabase).auth.signOut();
  
  // Redirection directe vers la page d'accueil
  return redirect('/');
}