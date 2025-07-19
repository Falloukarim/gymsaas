// src/app/api/invitations/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { USER_ROLES } from '@/lib/constants/role';
import { can, hasHigherOrEqualRole } from '@/lib/permissions';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await (await supabase).auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { gymId, email, role } = await request.json();

  // Vérifier que l'utilisateur a le droit d'inviter
  const { data: gbus } = await (await supabase)
    .from('gbus')
    .select('role')
    .eq('gym_id', gymId)
    .eq('user_id', user.id)
    .single();

  if (!gbus || !can(gbus.role, 'inviteUsers')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Vérifier que le rôle attribué est valide
  if (!Object.values(USER_ROLES).includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  // Vérifier que l'utilisateur actuel a le droit d'attribuer ce rôle
  if (!hasHigherOrEqualRole(gbus.role, role)) {
    return NextResponse.json({ error: 'Cannot assign this role' }, { status: 403 });
  }

  try {
    // Créer l'invitation
    const { data, error } = await (await supabase)
      .from('invitations')
      .insert({
        gym_id: gymId,
        email,
        role
      })
      .select()
      .single();

    if (error) throw error;

    // Ici vous devriez envoyer un email avec le lien d'invitation
    // Le lien pourrait être quelque chose comme /api/invitations/accept?token=...

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
}