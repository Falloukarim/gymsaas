// app/auth/redirect/page.tsx
import { createClient } from '@/lib/supabaseClient';
import { redirect } from 'next/navigation';

export default async function RedirectPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Vérifier les invitations d'abord
  const { data: invitations } = await supabase
    .from('invitations')
    .select('id')
    .eq('email', user.email)
    .eq('accepted', false);

  if (invitations && invitations.length > 0) {
    redirect('/gyms/join');
  }

  // Ensuite vérifier les gyms existants
  const { data: gbus } = await supabase
    .from('gbus')
    .select('gym_id')
    .eq('user_id', user.id);

  if (gbus && gbus.length > 0) {
    redirect(`/gyms/${gbus[0].gym_id}/dashboard`);
  }

  // Sinon rediriger vers la sélection
  redirect('/gyms/select');
}