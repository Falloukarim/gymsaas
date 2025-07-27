import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { gymId: string } }
) {
  try {
    const supabase = await createClient();
    
    // Vérification des permissions
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // Vérification du rôle owner
    const { data: gbus, error: roleError } = await supabase
      .from('gbus')
      .select('role')
      .eq('gym_id', params.gymId)
      .eq('user_id', user.id)
      .single();

    if (roleError || !gbus || gbus.role !== 'owner') {
      return NextResponse.json(
        { error: 'Forbidden' }, 
        { status: 403 }
      );
    }

    // Récupération des utilisateurs
    const { data: users } = await supabase
      .from('gbus')
      .select('*, users(*)')
      .eq('gym_id', params.gymId);

    return NextResponse.json(
      { status: true, data: users },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      { status: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { gymId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { status: false, error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const { userId, role } = await request.json();

    // Vérification du rôle owner
    const { data: currentUserRole, error: roleError } = await supabase
      .from('gbus')
      .select('role')
      .eq('gym_id', params.gymId)
      .eq('user_id', user.id)
      .single();

    if (roleError || !currentUserRole || currentUserRole.role !== 'owner') {
      return NextResponse.json(
        { status: false, error: 'Forbidden' }, 
        { status: 403 }
      );
    }

    // Mise à jour de l'association
    const { error: upsertError } = await supabase
      .from('gbus')
      .upsert({
        gym_id: params.gymId,
        user_id: userId,
        role
      });

    if (upsertError) {
      return NextResponse.json(
        { status: false, error: upsertError.message }, 
        { status: 400 }
      );
    }

    return NextResponse.json(
      { status: true, success: true },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      { status: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}