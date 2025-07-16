import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default async function MembersPage({ params }: { params: { id: string } }) {
  const gymId = params.id;
  const supabase = createClient();

  // Récupérer la liste des membres du gym
  const { data: members, error } = await (await supabase)
    .from('members')
    .select('*')
    .eq('gym_id', gymId)
    .order('full_name', { ascending: true });

  if (error) {
    console.error(error);
    return notFound();
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Liste des membres</h1>

      {members && members.length > 0 ? (
        <ul className="space-y-4">
          {members.map((member: any) => (
            <li key={member.id} className="border rounded p-4 flex justify-between items-center">
              <div>
                <Link
                  href={`/gyms/${gymId}/members/${member.id}`}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  {member.full_name}
                </Link>
                <p className="text-sm text-muted-foreground">{member.email || '—'}</p>
              </div>
              <Button size="sm" asChild>
                <Link href={`/gyms/${gymId}/members/${member.id}`}>Voir</Link>
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-muted-foreground">Aucun membre trouvé pour cette salle.</p>
      )}
    </div>
  );
}
