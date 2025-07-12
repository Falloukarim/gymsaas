import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('member_subscriptions')
    .select(`
      id,
      start_date,
      end_date,
      member:members (
        full_name
      ),
      subscription:subscriptions (
        name,
        price
      )
    `);

  if (error) {
    console.error(error);
    return NextResponse.json([], { status: 500 });
  }

  return NextResponse.json(data);
}
