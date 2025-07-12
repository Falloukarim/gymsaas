import { createClient } from '@/utils/supabase/server';
import { MemberTable } from '@/components/members/MemberTable';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { SearchBar } from '@/components/search-bar';
import { EnrichedMember } from '@/utils/types/supabase';
export default async function MembersPage({
  searchParams,
}: {
  searchParams: { gym_id?: string; q?: string }
}) {
  const supabase = createClient();

  let query = supabase
    .from('members')
    .select(`
      id,
      full_name,
      email,
      phone,
      qr_code,
      created_at,
      gyms(name),
      member_subscriptions(end_date)
    `)
    .order('created_at', { ascending: false });

  if (searchParams.gym_id) {
    query = query.eq('gym_id', searchParams.gym_id);
  }

  if (searchParams.q) {
    query = query.ilike('full_name', `%${searchParams.q}%`);
  }

  const { data: members } = await query;

  const enrichedMembers: EnrichedMember[] = members?.map((member) => ({
    ...member,
    subscription_status: member.member_subscriptions?.some(
      (sub) => new Date(sub.end_date) > new Date()
    )
      ? 'active'
      : 'inactive',
  })) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Gestion des membres</h1>
        <Button asChild className="bg-[#00c9a7] hover:bg-[#00a58e] text-white">
          <Link
            href={`/members/new${
              searchParams.gym_id ? `?gym_id=${searchParams.gym_id}` : ''
            }`}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un membre
          </Link>
        </Button>
      </div>

      <div>
        <SearchBar placeholder="Rechercher un membre..." />
      </div>

      <div>
        <MemberTable data={enrichedMembers} />
      </div>
    </div>
  );
}
