import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { gymId: string } }
) {
  const supabase = createClient();
  
  // Vérifier les permissions
  const { data: { user } } = await (await supabase).auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Vérifier si l'utilisateur est owner de ce gym
  const { data: gbus, error } = await (await supabase)
    .from('gbus')
    .select('role')
    .eq('gym_id', params.gymId)
    .eq('user_id', user.id)
    .single();

  if (error || !gbus || gbus.role !== 'owner') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Récupérer les utilisateurs du gym
  const { data: users } = await (await supabase)
    .from('gbus')
    .select('*, users(*)')
    .eq('gym_id', params.gymId);

  return NextResponse.json(users);
}

export async function POST(
  request: Request,
  { params }: { params: { gymId: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await (await supabase).auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId, role } = await request.json();

  // Vérifier que l'utilisateur actuel est owner
  const { data: currentUserRole } = await (await supabase)
    .from('gbus')
    .select('role')
    .eq('gym_id', params.gymId)
    .eq('user_id', user.id)
    .single();

  if (currentUserRole?.role !== 'owner') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Mettre à jour ou créer l'association
  const { error } = await (await supabase)
    .from('gbus')
    .upsert({
      gym_id: params.gymId,
      user_id: userId,
      role
    });

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}